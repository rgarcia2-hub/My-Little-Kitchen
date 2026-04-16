/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GoogleGenAI, Part, Chat, Content, GenerateContentConfig, GenerateContentParameters, GenerateContentResponse, SendMessageParameters, CreateChatParameters, FunctionCall } from "@google/genai";
import { GeminiClientOptions, GeminiLogEvent, GeminiLogEventType, SharedAppLogEventType, LogDirection } from "../../types";
import { EventEmitter } from "eventemitter3";



export interface GeminiClientEventTypes {
  // Emitted for logging events
  log: (log: GeminiLogEvent) => void;
  // Emitted when a function call is received. Use directly when approval is not required.
  functioncalls: (functionCalls: (FunctionCall & { id: string })[]) => void;
  // Emitted when a function call should be reviewed
  reviewfunctioncalls: (functionCalls: (FunctionCall & { id: string })[]) => void;
  // Emitted when a function call should be executed
  approvedfunctioncalls: (functionCalls: (FunctionCall & { id: string })[]) => void;
  // Emitted when a function call should be rejected
  rejectedfunctioncalls: (functionCalls: (FunctionCall & { id: string })[]) => void;
}

export class GenAIGeminiClient extends EventEmitter<GeminiClientEventTypes> {
  private readonly genAI: GoogleGenAI | null = null;
  private readonly useProxy: boolean = false;

  private chat: Chat | null = null;
  private proxyHistory: Content[] = [];
  private currentModel: string = "";

  constructor(options: GeminiClientOptions) {
    super();
    if (options.apiKey) {
      this.genAI = new GoogleGenAI({ apiKey: options.apiKey });
    } else {
      console.warn("No Gemini API key provided to client. Falling back to server-side proxy.");
      this.useProxy = true;
    }
    this.sendMessage = this.sendMessage.bind(this);
    this.sendMessageStream = this.sendMessageStream.bind(this);
    this.startChat = this.startChat.bind(this);
    this.getHistory = this.getHistory.bind(this);
  }

  protected log(params: {
    type: GeminiLogEventType | SharedAppLogEventType;
    direction: LogDirection;
    message: any;
  }) {
    const logEvent: GeminiLogEvent = {
      date: new Date(),
      direction: params.direction,
      type: params.type,
      message: params.message,
    };
    // Type assertion needed for AI Studio compatibility - its CDN-based environment
    // doesn't properly resolve eventemitter3 types inherited by the client class
    (this as any).emit("log", logEvent);
  }

  emitAnyFunctionCalls(response: GenerateContentResponse) {
    const functionCalls = response.functionCalls;
    if (!functionCalls || functionCalls.length === 0) {
      return;
    }

    // Use response.responseId as the id for each function call
    // If responseId is undefined, use the response object's timestamp as fallback
    const id = response.responseId || `${Date.now()}`;
    const functionCallsWithIds = functionCalls.map((fc) => {
      return { ...fc, id };
    });

    // Uncomment to log the function calls to the logger
    // We handle logging in approve/reject logic in the hook instead
    // this.log("console.functioncalls", { functionCalls: functionCallsWithIds });

    (this as any).emit("functioncalls", functionCallsWithIds);
  }


  async generateContent(model: string, contents: Content[], config?: GenerateContentConfig): Promise<GenerateContentResponse> {
    const generateContentParameters: GenerateContentParameters = { model, contents, config: config };
    console.log("client.generateContent", generateContentParameters);
    this.log({ type: 'generate-content', direction: 'send', message: generateContentParameters });
    
    if (this.useProxy) {
      try {
        const response = await fetch("/api/gemini/generateContent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, contents, config })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Proxy failed");
        }
        
        const result = await response.json();
        this.log({ type: 'generate-content', direction: 'receive', message: result });
        this.emitAnyFunctionCalls(result);
        return result;
      } catch (error) {
        console.error("Gemini Proxy generateContent error:", error);
        this.log({ type: 'generate-content', direction: 'receive', message: { error: error instanceof Error ? error.message : String(error) } });
        throw error;
      }
    }

    if (!this.genAI) throw new Error("GenAI not initialized and proxy failed");

    try {
      const result = await this.genAI.models.generateContent(generateContentParameters);
      // This logs the result, including function calls, but doesn't actually call them
      this.log({ type: 'generate-content', direction: 'receive', message: result });
      // This emits an event for the called functions to be processed
      this.emitAnyFunctionCalls(result);
      return result;
    } catch (error) {
      console.error("Gemini API generateContent error:", error);
      this.log({ type: 'generate-content', direction: 'receive', message: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }
  async generateContentStream(
    onUpdate: (text: string) => void,
    model: string,
    contents: Content[],
    config?: GenerateContentConfig,
  ): Promise<void> {
    const generateContentParameters: GenerateContentParameters = { model, contents, config: config };
    this.log({ type: 'generate-content-stream', direction: 'send', message: generateContentParameters });
    const result = await this.genAI.models.generateContentStream(generateContentParameters);
    let text = "";
    let lastChunk: GenerateContentResponse | null = null;
    for await (const chunk of result) {
      this.log({ type: 'generate-content-stream', direction: 'receive', message: chunk });
      const chunkText = chunk.text;
      if (chunkText) {
        text += chunkText;
        onUpdate(text);
        console.log("chunkText", chunkText);
      }
      lastChunk = chunk;
    }
    // Trigger function calls after streaming is complete
    if (lastChunk) {
      this.emitAnyFunctionCalls(lastChunk);
    }
  }

  startChat(model: string, config?: GenerateContentConfig, history?: Content[]): void {
    this.currentModel = model;
    if (this.useProxy) {
      this.proxyHistory = history || [];
      this.chat = {
        sendMessage: async () => { throw new Error("Use proxySendMessage instead"); },
        sendMessageStream: async () => { throw new Error("Use proxySendMessageStream instead"); },
        getHistory: () => this.proxyHistory
      } as any;
      return;
    }
    if (!this.genAI) return;
    const createChatParameters: CreateChatParameters = { model, config, history };
    this.chat = this.genAI.chats.create(createChatParameters);
  }

  async sendMessage(message: Part[], config?: GenerateContentConfig): Promise<GenerateContentResponse> {
    if (!this.chat) {
      throw new Error("Chat not started.");
    }
    
    if (this.useProxy) {
      const contents: Content[] = [...this.proxyHistory, { role: 'user', parts: message }];
      const result = await this.generateContent(this.currentModel, contents, config);
      // Update history
      this.proxyHistory = [...contents, { role: 'model', parts: result.candidates[0].content.parts }];
      return result;
    }

    const sendMessageParameters: SendMessageParameters = { message, config: config }
    this.log({ type: 'send-message', direction: 'send', message: sendMessageParameters });
    const result = await this.chat.sendMessage(sendMessageParameters);

    // This logs the result, including function calls, but doesn't actually call them
    this.log({ type: 'send-message', direction: 'receive', message: result });

    // This emits an event for the called functions to be processed
    this.emitAnyFunctionCalls(result);
    return result;
  }

  async sendMessageStream(onUpdate: (text: string) => void, message: Part[], config?: GenerateContentConfig): Promise<void> {
    if (!this.chat) {
      throw new Error("Chat not started. Call startChat() first.");
    }

    if (this.useProxy) {
      const contents: Content[] = [...this.proxyHistory, { role: 'user', parts: message }];
      // Streams are harder to proxy without a specialized endpoint, 
      // so we fallback to non-streaming via the proxy for now.
      const result = await this.generateContent(this.currentModel, contents, config);
      const text = result.text || "";
      onUpdate(text);
      this.proxyHistory = [...contents, { role: 'model', parts: result.candidates[0].content.parts }];
      return;
    }

    const sendMessageParameters: SendMessageParameters = { message, config: config }
    this.log({ type: 'send-message-stream', direction: 'send', message: sendMessageParameters });
    const stream = await this.chat.sendMessageStream(sendMessageParameters);
    let text = "";
    let lastChunk: GenerateContentResponse | null = null;
    for await (const chunk of stream) {
      this.log({ type: 'send-message-stream', direction: 'receive', message: chunk });
      console.log("server.sendMessageStream", chunk);
      const chunkText = chunk.text;
      if (chunkText) {
        text += chunkText;
        onUpdate(text);
      }
      lastChunk = chunk;
    }
    // Trigger function calls after streaming is complete
    if (lastChunk) {
      this.emitAnyFunctionCalls(lastChunk);
    }
  }

  getHistory(): Content[] {
    if (!this.chat) {
      throw new Error("Chat not started. Call startChat() first.");
    }
    if (this.useProxy) {
      return this.proxyHistory;
    }
    const history = this.chat.getHistory();
    return history;
  }
}
