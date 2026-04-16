import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin for server-side updates
// Note: This requires FIREBASE_SERVICE_ACCOUNT_KEY in environment
let db: any = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ko-fi webhook sends data as form-encoded (multipart/form-data or x-www-form-urlencoded)
  // but usually it's a POST with a JSON string in a 'data' field or just raw JSON.
  // According to Ko-fi docs, it's a POST with a JSON body.
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Gemini Proxy (to handle manifestation/combinations on custom domains)
  app.post("/api/gemini/generateContent", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY not configured on server");
        return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
      }

      const { model, contents, config } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      const genAI = new GoogleGenAI({ apiKey });
      
      console.log(`[Proxy] Calling Gemini (${model})...`);
      const result = await genAI.models.generateContent({ 
        model, 
        contents, 
        config 
      });
      
      console.log(`[Proxy] Gemini returned success. Text length: ${result.text?.length || 0}`);
      res.json(result);
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to call Gemini API",
        details: error.toString()
      });
    }
  });

  // API Route: Ko-fi Webhook
  app.post("/api/kofi-webhook", async (req, res) => {
    try {
      // Ko-fi sends the data in a 'data' field as a JSON string
      const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
      
      console.log("Ko-fi Webhook received:", data);

      const verificationToken = process.env.KOFI_VERIFICATION_TOKEN;
      if (verificationToken && data.verification_token !== verificationToken) {
        console.warn("Invalid Ko-fi verification token");
        return res.status(401).send("Unauthorized");
      }

      // Extract User ID from the message or shop items
      // We'll tell users to put their User ID in the message
      const message = data.message || "";
      const userIdMatch = message.match(/[a-zA-Z0-9]{20,}/); // Firebase UIDs are usually 28 chars
      const userId = userIdMatch ? userIdMatch[0] : null;

      if (userId && db) {
        const isGodTier = data.tier_name === "God of Creation";
        console.log(`Unlocking ${isGodTier ? 'God Tier' : 'Pro Plan'} for user: ${userId}`);
        const userRef = db.collection('game_states').doc(userId);
        
        const updateData: any = {
          "stats.proPlan": true,
          "lastUpdated": new Date()
        };
        
        if (isGodTier) {
          updateData["stats.godTier"] = true;
        }

        await userRef.update(updateData);
        console.log("User unlocked successfully");
      } else {
        console.warn("No User ID found in Ko-fi message or Firebase Admin not initialized");
      }

      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Ko-fi webhook error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
