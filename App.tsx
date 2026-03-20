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

import { useCallback, useEffect, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import "./App.css";
import { GeminiAPIProvider, useGeminiAPIContext } from "./gemini/contexts/GeminiAPIContext";
import GeminiDebug from "./gemini/components/GeminiDebug";
import { Content, FunctionCall } from '@google/genai';
import {
  Ingredient,
  KitchenAction,
  TimelineEntry,
  CombinationResult,
  Order,
  VerificationResult,
  RecipeStep,
  Achievement,
  ACHIEVEMENTS,
  COOKING_ACTIONS,
  STARTING_INGREDIENTS,
  PRESELECTED_INGREDIENTS,
  EXAMPLE_ORDERS,
  COMBINATION_SYSTEM_INSTRUCTION,
  COMBINATION_RESPONSE_SCHEMA,
  VERIFICATION_SYSTEM_INSTRUCTION,
  VERIFICATION_RESPONSE_SCHEMA,
  STEPS_SYSTEM_INSTRUCTION,
  STEPS_RESPONSE_SCHEMA,
  generateCookingTools,
  buildCookingAgentSystemInstruction,
} from './constants';

// ============================================================================
// Ingredient Normalization Helper
// ============================================================================

/**
 * Normalizes ingredient names for case/spacing/symbol insensitive comparison.
 * Removes all non-alphanumeric characters and converts to lowercase.
 */
function normalizeIngredientName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds an ingredient in the inventory using normalized name comparison.
 * Returns the actual inventory item if found, null otherwise.
 */
function findIngredientInInventory(name: string, inventory: Ingredient[]): Ingredient | null {
  const normalizedSearch = normalizeIngredientName(name);
  return inventory.find(ing => normalizeIngredientName(ing.name) === normalizedSearch) || null;
}

/**
 * Checks if an ingredient already exists in the inventory using normalized comparison.
 */
function isDuplicateIngredient(name: string, inventory: Ingredient[]): boolean {
  return findIngredientInInventory(name, inventory) !== null;
}

// ============================================================================
// Ingredient Tile Component
// ============================================================================

interface IngredientTileProps {
  ingredient: Ingredient;
  isSelected: boolean;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function IngredientTile({ ingredient, isSelected, isActive, isDisabled, onClick }: IngredientTileProps) {
  return (
    <button
      className={`ingredient-tile ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={isSelected ? `Click to deselect ${ingredient.name}` : `Click to select ${ingredient.name}`}
      data-ingredient={ingredient.name}
      disabled={isDisabled}
    >
      <span className="emoji">{ingredient.emoji}</span>
      <span className="name">{ingredient.name}</span>
    </button>
  );
}

// ============================================================================
// Action Tile Component
// ============================================================================

interface ActionTileProps {
  action: KitchenAction;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function ActionTile({ action, isActive, isDisabled, onClick }: ActionTileProps) {
  return (
    <button
      className={`action-tile ${isActive ? 'active' : ''}`}
      onClick={onClick}
      disabled={isDisabled}
      title={isDisabled ? "Select ingredients first to use this tool" : `Click to ${action.name} selected ingredients`}
      data-action={action.name}
    >
      <span className="emoji">{action.emoji}</span>
      <span className="name">{action.name}()</span>
    </button>
  );
}

// ============================================================================
// Timeline Item Component
// ============================================================================

interface TimelineItemProps {
  entry: TimelineEntry;
}

function TimelineItem({ entry }: TimelineItemProps) {
  const hasAction = entry.action && entry.ingredients;
  const hasText = entry.text;
  const isLoading = hasAction && entry.result === null;

  // Text-only entry
  if (hasText && !hasAction) {
    return (
      <div className="timeline-item timeline-text-only">
        <div className="timeline-text-content">
          {entry.text}
        </div>
      </div>
    );
  }

  // Action entry (possibly with text)
  return (
    <div className={`timeline-item ${isLoading ? 'loading' : ''}`}>
      {hasText && (
        <div className="timeline-text-content">
          {entry.text}
        </div>
      )}
      {hasAction && (
        <>
          <div className="timeline-action">
            <span className="action-name">{entry.action}(</span>
            <span className="action-args">{entry.ingredients?.join(', ')}</span>
            <span className="action-name">)</span>
          </div>
          <div className="timeline-result">
            <span className="timeline-result-arrow">↳</span>
            {isLoading ? (
              <span className="spinner">⏳</span>
            ) : (
              <>
                <span className="result-emoji">{entry.result!.emoji}</span>
                <span className="result-name">{entry.result!.name}</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Order Card Component
// ============================================================================

interface OrderCardProps {
  order: Order;
  isDisabled: boolean;
  onPickUp: (orderId: string) => void;
  onCookWithGemini: (orderName: string) => void;
  onOpenVerificationAgent?: () => void;
}

function OrderCard({ order, isDisabled, onPickUp, onCookWithGemini, onOpenVerificationAgent }: OrderCardProps) {
  const statusClass = order.status === 'completed' ? 'completed' :
    order.status === 'failed' ? 'failed' :
      order.status === 'in_progress' ? 'in-progress' : 'not-started';

  const difficultyClass = order.difficulty ? `difficulty-${order.difficulty}` : '';

  return (
    <div className={`order-card ${statusClass} ${isDisabled ? 'disabled' : ''}`}>
      {order.difficulty && (
        <div className={`order-difficulty ${difficultyClass}`}>
          {order.difficulty}
        </div>
      )}
      <div className="order-emoji">{order.emoji}</div>
      <div className="order-name">{order.name}</div>
      {order.status === 'in_progress' && (
        <div className="order-current-badge">CURRENT</div>
      )}
      <div className="order-status">
        {order.status === 'completed' && '✅ Completed'}
        {order.status === 'failed' && `❌ ${order.servedDish}`}
        {order.status === 'in_progress' && '🔄 Started'}
        {order.status === 'not_started' && 'Not started'}
      </div>
      {order.status === 'not_started' && (
        <button
          className="order-button"
          onClick={() => onPickUp(order.id)}
          disabled={isDisabled}
        >
          Start
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Add Order Card Component
// ============================================================================

interface AddOrderCardProps {
  onAddOrder: (orderName: string) => void;
  isDisabled?: boolean;
}

function AddOrderCard({ onAddOrder, isDisabled }: AddOrderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [orderName, setOrderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (orderName.trim()) {
      onAddOrder(orderName.trim());
      setOrderName('');
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setOrderName('');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div
        className={`order-card add-order-card ${isDisabled ? 'disabled' : ''}`}
        onClick={() => !isDisabled && setIsEditing(true)}
      >
        <div className="order-emoji">📋</div>
        <div className="order-name">Add New Order</div>
        <div className="order-status">{isDisabled ? 'Click to add' : 'Click to add'}</div>
      </div>
    );
  }

  return (
    <div className="order-card add-order-card editing">
      <div className="order-emoji">📋</div>
      <input
        ref={inputRef}
        type="text"
        className="order-input"
        placeholder="Enter dish name..."
        value={orderName}
        onChange={(e) => setOrderName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!orderName.trim()) {
            setIsEditing(false);
          }
        }}
      />
      <button className="cook-button" onClick={handleSubmit} disabled={!orderName.trim()}>
        ➕ Add Order
      </button>
    </div>
  );
}

// ============================================================================
// Achievement Components
// ============================================================================

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="achievement-toast">
      <div className="achievement-toast-icon">{achievement.emoji}</div>
      <div className="achievement-toast-content">
        <div className="achievement-toast-title">Achievement Unlocked!</div>
        <div className="achievement-toast-name">{achievement.name}</div>
      </div>
      <button className="achievement-toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

interface AchievementItemProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

function AchievementItem({ achievement, isUnlocked }: AchievementItemProps) {
  return (
    <div className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'} ${achievement.isSecret && !isUnlocked ? 'secret' : ''}`}>
      <div className="achievement-icon">
        {achievement.isSecret && !isUnlocked ? '🔒' : achievement.emoji}
      </div>
      <div className="achievement-info">
        <div className="achievement-name">
          {achievement.isSecret && !isUnlocked ? '???' : achievement.name}
        </div>
        <div className="achievement-description">
          {achievement.isSecret && !isUnlocked ? 'A secret achievement...' : achievement.description}
        </div>
      </div>
      {isUnlocked && <div className="achievement-badge">✓</div>}
    </div>
  );
}

// ============================================================================
// Recipe Steps Component
// ============================================================================

interface RecipeStepsDisplayProps {
  steps: RecipeStep[];
  onClose: () => void;
  isLoading: boolean;
  orderName: string;
}

function RecipeStepsDisplay({ steps, onClose, isLoading, orderName }: RecipeStepsDisplayProps) {
  return (
    <div className="recipe-steps-overlay">
      <div className="recipe-steps-modal">
        <div className="recipe-steps-header">
          <div className="recipe-steps-header-text">
            <h3 className="recipe-steps-title">Cooking Guide: {orderName}</h3>
            <p className="recipe-steps-subtitle">Follow these steps using the tools and ingredients below</p>
          </div>
          <button onClick={onClose} className="recipe-steps-close">✕</button>
        </div>
        <div className="recipe-steps-body">
          {isLoading ? (
            <div className="recipe-steps-loading">
              <span className="spinner">⏳</span>
              <p>Consulting the master chef...</p>
            </div>
          ) : steps.length === 0 ? (
            <div className="recipe-steps-empty">
              <p>No steps found for this dish. Try being more specific!</p>
            </div>
          ) : (
            <div className="recipe-steps-list">
              {steps.map((step, index) => (
                <div key={index} className="recipe-step-item">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <div className="step-formula">
                      <div className="step-ingredients">
                        {step.ingredients.map((ing, i) => (
                          <span key={i} className="step-ingredient-tag">{ing}</span>
                        ))}
                      </div>
                      <span className="step-arrow">→</span>
                      <span className="step-tool">{step.tool}()</span>
                      <span className="step-arrow">→</span>
                      <span className="step-result">{step.result}</span>
                    </div>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              ))}
              <div className="recipe-step-item final-step">
                <div className="step-number">✓</div>
                <div className="step-content">
                  <div className="step-formula">
                    <span className="step-ingredient-tag">{steps[steps.length - 1].result}</span>
                    <span className="step-arrow">→</span>
                    <span className="step-tool">serve()</span>
                  </div>
                  <p className="step-description">Serve your masterpiece to complete the order!</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="recipe-steps-footer">
          <button onClick={onClose} className="recipe-steps-done">Got it!</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Combination Agent Component (Layer 1)
// ============================================================================

interface CombinationAgentProps {
  inventory: Ingredient[];
  setInventory: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  timeline: TimelineEntry[];
  setTimeline: React.Dispatch<React.SetStateAction<TimelineEntry[]>>;
  selectedIngredients: Set<string>;
  setSelectedIngredients: React.Dispatch<React.SetStateAction<Set<string>>>;
  activeAction: string | null;
  setActiveAction: React.Dispatch<React.SetStateAction<string | null>>;
  actionTriggerCount: number;
  onExecuteActionRef: React.MutableRefObject<((action: KitchenAction, ingredients: string[]) => Promise<Ingredient | null>) | null>;
  orders: Order[];
  onCookWithGemini: (orderName: string) => void;
  onPickUp: (orderId: string) => void;
  onAddOrder: (orderName: string) => void;
  onServe: (servedDishName: string) => void;
  onOpenCombinationAgent: () => void;
  onOpenCookingAgent: () => void;
  onOpenVerificationAgent: () => void;
  activeIngredients: Set<string>;
  setActiveIngredients: React.Dispatch<React.SetStateAction<Set<string>>>;
  isCooking: boolean;
  isCookingAgentOpen: boolean;
  isAlchemyAgentOpen: boolean;
  isJudgeAgentOpen: boolean;
  onGetSteps: (orderName: string) => void;
  setActionTriggerCount: React.Dispatch<React.SetStateAction<number>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  unlockedAchievements: string[];
  setUnlockedAchievements: React.Dispatch<React.SetStateAction<string[]>>;
  stats: any;
  setStats: React.Dispatch<React.SetStateAction<any>>;
  recentAchievement: Achievement | null;
  setRecentAchievement: React.Dispatch<React.SetStateAction<Achievement | null>>;
  isAchievementsExpanded: boolean;
  setIsAchievementsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

function CombinationAgent({
  inventory,
  setInventory,
  timeline,
  setTimeline,
  selectedIngredients,
  setSelectedIngredients,
  activeAction,
  setActiveAction,
  actionTriggerCount,
  onExecuteActionRef,
  orders,
  onCookWithGemini,
  onPickUp,
  onAddOrder,
  onServe,
  onOpenCombinationAgent,
  onOpenCookingAgent,
  onOpenVerificationAgent,
  activeIngredients,
  setActiveIngredients,
  isCooking,
  isCookingAgentOpen,
  isAlchemyAgentOpen,
  isJudgeAgentOpen,
  onGetSteps,
  setActionTriggerCount,
  setOrders,
  unlockedAchievements,
  setUnlockedAchievements,
  stats,
  setStats,
  recentAchievement,
  setRecentAchievement,
  isAchievementsExpanded,
  setIsAchievementsExpanded,
}: CombinationAgentProps) {
  const { generateContent, setConfig, client, model } = useGeminiAPIContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [toolsSearchTerm, setToolsSearchTerm] = useState('');
  const [isLogExpanded, setIsLogExpanded] = useState(true);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [skipPassword, setSkipPassword] = useState('');
  const [skipAmount, setSkipAmount] = useState('1');
  const [skipCompleteOrder, setSkipCompleteOrder] = useState(false);
  const [skipError, setSkipError] = useState('');
  const [adminIngredientName, setAdminIngredientName] = useState('');
  const [adminIngredientEmoji, setAdminIngredientEmoji] = useState('🍎');

  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([]);
  const [isFetchingSteps, setIsFetchingSteps] = useState(false);
  const [showRecipeSteps, setShowRecipeSteps] = useState(false);

  // Refs for auto-scroll
  const ingredientsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const prevInventoryLengthRef = useRef(inventory.length);

  // Set config on mount
  useEffect(() => {
    setConfig({
      systemInstruction: COMBINATION_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: COMBINATION_RESPONSE_SCHEMA,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    });
  }, [setConfig]);

  // Toggle ingredient selection
  const toggleIngredient = useCallback((name: string) => {
    setSelectedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, [setSelectedIngredients]);

  // Core execution logic - shared with Cooking Agent
  const executeCombination = useCallback(async (
    action: KitchenAction,
    ingredientNames: string[]
  ): Promise<Ingredient | null> => {
    try {
      const prompt = `Action: ${action.displayName}\nIngredients: ${ingredientNames.join(', ')}\n\nWhat is the result of this cooking action?`;

      const contents: Content[] = [
        { role: 'user', parts: [{ text: prompt }] }
      ];

      const response = await generateContent(contents);
      const text = response?.text || '{}';
      const result: CombinationResult = JSON.parse(text);

      return {
        name: result.result_name,
        emoji: result.emoji,
      };
    } catch (error) {
      console.error('Error in combination:', error);
      return null;
    }
  }, [generateContent]);

  // Expose the execution function to Cooking Agent via ref
  useEffect(() => {
    onExecuteActionRef.current = executeCombination;
    return () => {
      onExecuteActionRef.current = null;
    };
  }, [executeCombination, onExecuteActionRef]);

  const fetchRecipeSteps = async (orderName: string) => {
    setIsFetchingSteps(true);
    setShowRecipeSteps(true);
    setRecipeSteps([]);
    try {
      const prompt = `Provide steps to cook ${orderName} in the game.`;
      const response = await client.generateContent(model, [{ role: 'user', parts: [{ text: prompt }] }], {
        systemInstruction: STEPS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: STEPS_RESPONSE_SCHEMA,
      });
      const text = response?.text || '{}';
      const result = JSON.parse(text);
      if (result.steps) {
        setRecipeSteps(result.steps);
      }
    } catch (error) {
      console.error('Error fetching steps:', error);
    } finally {
      setIsFetchingSteps(false);
    }
  };

  const handleSkipSteps = () => {
    if (skipPassword === 'Iloveroby') {
      if (skipCompleteOrder) {
        const currentOrder = orders.find(o => o.status === 'in_progress');
        if (currentOrder) {
          setOrders(prev => prev.map(o => 
            o.id === currentOrder.id ? { ...o, status: 'completed' as const } : o
          ));
          setTimeline(prev => [...prev, {
            id: `skip-complete-${Date.now()}`,
            timestamp: new Date(),
            text: `✨ Order "${currentOrder.name}" completed directly (Admin Override)`,
          }]);
        } else {
          setSkipError('No order in progress to complete');
          return;
        }
      } else {
        const amount = parseInt(skipAmount, 10);
        if (!isNaN(amount) && amount > 0) {
          setActionTriggerCount(prev => prev + amount);
          setTimeline(prev => [...prev, {
            id: `skip-${Date.now()}`,
            timestamp: new Date(),
            text: `⏩ Skipped ${amount} steps (Admin Override)`,
          }]);
        } else {
          setSkipError('Invalid amount');
          return;
        }
      }
      
      setShowSkipModal(false);
      setSkipPassword('');
      setSkipAmount('1');
      setSkipCompleteOrder(false);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminAddIngredient = () => {
    if (skipPassword === 'Iloveroby') {
      if (adminIngredientName.trim()) {
        const newIng = { name: adminIngredientName.trim(), emoji: adminIngredientEmoji };
        if (!isDuplicateIngredient(newIng.name, inventory)) {
          setInventory(prev => [newIng, ...prev]);
          setTimeline(prev => [...prev, {
            id: `admin-add-${Date.now()}`,
            timestamp: new Date(),
            text: `🛠️ Admin added: ${newIng.emoji} ${newIng.name}`,
          }]);
          setAdminIngredientName('');
          setSkipError('');
        } else {
          setSkipError('Ingredient already exists');
        }
      } else {
        setSkipError('Name is required');
      }
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminClearInventory = () => {
    if (skipPassword === 'Iloveroby') {
      setInventory(STARTING_INGREDIENTS);
      setTimeline(prev => [...prev, {
        id: `admin-clear-${Date.now()}`,
        timestamp: new Date(),
        text: `🧹 Inventory reset to starting items (Admin Override)`,
      }]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminUnlockAchievements = () => {
    if (skipPassword === 'Iloveroby') {
      setUnlockedAchievements(ACHIEVEMENTS.map(a => a.id));
      setTimeline(prev => [...prev, {
        id: `admin-unlock-${Date.now()}`,
        timestamp: new Date(),
        text: `🏆 All achievements unlocked (Admin Override)`,
      }]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminClearOrders = () => {
    if (skipPassword === 'Iloveroby') {
      setOrders([]);
      setTimeline(prev => [...prev, {
        id: `admin-clear-orders-${Date.now()}`,
        timestamp: new Date(),
        text: `🧹 All orders cleared (Admin Override)`,
      }]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminGenerateOrder = () => {
    if (skipPassword === 'Iloveroby') {
      const randomDishes = ['Pizza', 'Burger', 'Sushi', 'Tacos', 'Pasta', 'Salad', 'Steak', 'Soup', 'Ramen', 'Curry'];
      const randomDish = randomDishes[Math.floor(Math.random() * randomDishes.length)];
      onAddOrder(randomDish);
      setTimeline(prev => [...prev, {
        id: `admin-gen-order-${Date.now()}`,
        timestamp: new Date(),
        text: `📝 Admin generated order: ${randomDish}`,
      }]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminAddMoney = () => {
    if (skipPassword === 'Iloveroby') {
      setStats((prev: any) => ({ ...prev, money: (prev.money || 0) + 100 }));
      setTimeline(prev => [...prev, {
        id: `admin-add-money-${Date.now()}`,
        timestamp: new Date(),
        text: `💰 Admin added $100`,
      }]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminToggleDebug = () => {
    if (skipPassword === 'Iloveroby') {
      setDebugMode(!debugMode);
      setTimeline(prev => [...prev, {
        id: `admin-debug-${Date.now()}`,
        timestamp: new Date(),
        text: `🛠️ Debug Mode ${!debugMode ? 'Enabled' : 'Disabled'} (Admin Override)`,
      }]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminResetAll = () => {
    if (skipPassword === 'Iloveroby') {
      setInventory(STARTING_INGREDIENTS);
      setUnlockedAchievements([]);
      setStats({
        completedOrders: 0,
        money: 0,
        discoveredIngredients: 0,
        usedTools: [],
        usedToolsCount: 0,
        totalActions: 0,
        maxIngredientsUsed: 0,
        maxConfidence: 0,
        completedDishes: []
      });
      setTimeline([{
        id: `admin-reset-${Date.now()}`,
        timestamp: new Date(),
        text: `🔄 Game fully reset (Admin Override)`,
      }]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  // Manual execution (UI click)
  const executeAction = useCallback(async (action: KitchenAction) => {
    if (selectedIngredients.size === 0) return;

    const ingredientNames = Array.from(selectedIngredients);

    // Clear selection immediately
    setSelectedIngredients(new Set());

    // Handle serve action specially - only triggers verification, no combination
    if (action.name === 'serve') {
      // Serve takes only the first selected ingredient as the dish name
      const dishName = ingredientNames[0];

      // Add serve to timeline
      setTimeline(prev => [...prev, {
        id: `serve-${Date.now()}`,
        type: 'text' as const,
        action: '',
        ingredients: [],
        result: null,
        text: `🍽️ Served: ${dishName}`,
        timestamp: new Date(),
      }]);

      // Trigger verification agent
      onServe(dishName);
      return;
    }

    // Regular cooking actions - use combination agent
    const timelineId = `${Date.now()}`;

    // Add loading placeholder to timeline
    const loadingEntry: TimelineEntry = {
      id: timelineId,
      timestamp: new Date(),
      action: action.name,
      ingredients: ingredientNames,
      result: null,
    };
    setTimeline(prev => [...prev, loadingEntry]);
    setActiveAction(action.name);

    const newIngredient = await executeCombination(action, ingredientNames);

    // Update total actions stat
    setStats((prev: any) => ({
      ...prev,
      totalActions: (prev.totalActions || 0) + 1
    }));

    if (newIngredient) {
      // Update timeline with result
      setTimeline(prev => prev.map(entry =>
        entry.id === timelineId
          ? { ...entry, result: newIngredient }
          : entry
      ));

      // Update stats for discovered ingredients
      if (!isDuplicateIngredient(newIngredient.name, inventory)) {
        setStats((prev: any) => ({
          ...prev,
          discoveredIngredients: prev.discoveredIngredients + 1
        }));
      }

      // Update stats for used tools
      if (!stats.usedTools.includes(action.name)) {
        setStats((prev: any) => ({
          ...prev,
          usedTools: [...prev.usedTools, action.name],
          usedToolsCount: prev.usedToolsCount + 1
        }));
      }

      // Update stats for max ingredients used
      if (ingredientNames.length > (stats.maxIngredientsUsed || 0)) {
        setStats((prev: any) => ({
          ...prev,
          maxIngredientsUsed: ingredientNames.length
        }));
      }

      // Add to inventory (at the beginning for recently used items at top)
      // But skip if this ingredient already exists (duplicate check)
      setInventory(prev => {
        if (isDuplicateIngredient(newIngredient.name, prev)) {
          console.log(`Skipping duplicate ingredient: ${newIngredient.name}`);
          return prev;
        }
        return [newIngredient, ...prev];
      });
    } else {
      // Update timeline with error
      setTimeline(prev => prev.map(entry =>
        entry.id === timelineId
          ? { ...entry, result: { name: 'error', emoji: '❌' } }
          : entry
      ));
    }

    setActiveAction(null);
  }, [selectedIngredients, executeCombination, setTimeline, setActiveAction, setSelectedIngredients, setInventory, onServe]);

  // Auto-scroll timeline when new item added
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = timelineRef.current.scrollWidth;
    }
  }, [timeline.length]);

  // Auto-scroll ingredients and tools sections on first load to show length
  useEffect(() => {
    if (hasScrolledRef.current) return;
    hasScrolledRef.current = true;

    // Small delay to ensure elements are rendered
    const timer = setTimeout(() => {
      if (ingredientsRef.current) {
        ingredientsRef.current.scrollTo({
          top: ingredientsRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
      if (actionsRef.current) {
        actionsRef.current.scrollTo({
          top: actionsRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Scroll new ingredient into view when added
  useEffect(() => {
    if (inventory.length > prevInventoryLengthRef.current && ingredientsRef.current) {
      // New ingredient was added at the beginning - scroll to top
      ingredientsRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    prevInventoryLengthRef.current = inventory.length;
  }, [inventory.length]);

  // Scroll active tool into view when action is triggered (container-only scroll)
  useEffect(() => {
    // Only run when trigger count changes (indicates a new action)
    if (actionTriggerCount === 0) return;

    requestAnimationFrame(() => {
      const container = actionsRef.current;
      if (!container || !activeAction) return;
      const actionElement = container.querySelector(`[data-action="${activeAction}"]`) as HTMLElement;
      if (actionElement) {
        // Calculate scroll position within container only
        const containerRect = container.getBoundingClientRect();
        const elementRect = actionElement.getBoundingClientRect();
        const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - containerRect.height / 2 + elementRect.height / 2;
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionTriggerCount, activeAction]);





  const hasSelection = selectedIngredients.size > 0;

  // Get the current in-progress order name
  const currentOrder = orders.find(o => o.status === 'in_progress');

  return (
    <div className="kitchen-app">
      {/* Page Title */}
      <div className="kitchen-header">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div>
            <h1 className="kitchen-title">Function Calling Kitchen</h1>
            <p className="kitchen-subtitle">Challenge Gemini 3 Flash's function calling capabilities:</p>
          </div>
          {stats.money > 0 && (
            <div className="money-display">
              <span className="money-icon">💰</span>
              <span className="money-amount">${stats.money}</span>
            </div>
          )}
        </div>
      </div>

      {/* Challenge Banner */}
      <div className="challenge-banner">
        <div className="challenge-title">🧑‍🍳 ULTIMATE FUNCTION CALLING CHALLENGE! 🧑‍🍳</div>
        <div className="challenge-subtitle">Sequence tasks from 100 tools and 100 ingredients to prepare a meal</div>
        
        <div className="how-to-play">
          <div className="how-to-step"><span>1</span> Start an order</div>
          <div className="how-to-arrow">→</div>
          <div className="how-to-step"><span>2</span> Select ingredients</div>
          <div className="how-to-arrow">→</div>
          <div className="how-to-step"><span>3</span> Use a tool</div>
          <div className="how-to-arrow">→</div>
          <div className="how-to-step"><span>4</span> Serve the result!</div>
        </div>
      </div>

      {/* Achievements Top Bar */}
      <div className="achievements-top-bar">
        <button 
          className={`view-achievements-btn ${isAchievementsExpanded ? 'active' : ''}`}
          onClick={() => setIsAchievementsExpanded(!isAchievementsExpanded)}
        >
          <span className="emoji">🏆</span>
          <span>{isAchievementsExpanded ? 'Hide Achievements' : 'View Achievements'}</span>
          <span className="count-badge">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
        </button>
      </div>

      {/* Achievements Section (Conditional Render) */}
      {isAchievementsExpanded && (
        <section className="kitchen-section achievements-section expanded">
          <div className="section-header">
            <div className="section-header-text">
              <h2 className="section-title">Achievements</h2>
              <p className="section-subtitle">Unlock badges by cooking and discovering ingredients</p>
            </div>
            <button className="close-achievements" onClick={() => setIsAchievementsExpanded(false)}>✕</button>
          </div>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map(achievement => (
              <AchievementItem 
                key={achievement.id} 
                achievement={achievement} 
                isUnlocked={unlockedAchievements.includes(achievement.id)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Orders Section */}
      <section className="kitchen-section orders-section">
        <div className="section-header">
          <div className="section-header-text">
            <h2 className="section-title">Orders</h2>
            <p className="section-subtitle">Customer orders to fulfill with function calling</p>
          </div>
          {currentOrder && (
            <button
              className="hint-button"
              onClick={() => fetchRecipeSteps(currentOrder.name)}
              title={`Get steps for ${currentOrder.name}`}
              disabled={isCooking || isFetchingSteps}
            >
              <Lightbulb size={18} />
              <span>{isFetchingSteps ? 'Thinking...' : 'Get Steps'}</span>
            </button>
          )}
        </div>
        <div className="orders-grid">
          {(() => {
            const hasInProgressOrder = orders.some(o => o.status === 'in_progress');
            return (
              <>
                {orders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isDisabled={hasInProgressOrder && order.status === 'not_started'}
                    onPickUp={onPickUp}
                    onCookWithGemini={onCookWithGemini}
                    onOpenVerificationAgent={onOpenVerificationAgent}
                  />
                ))}
                <AddOrderCard onAddOrder={onAddOrder} isDisabled={hasInProgressOrder} />
              </>
            );
          })()}
        </div>
      </section>

      {/* Skip Steps Modal */}
      {showSkipModal && (
        <div className="skip-modal-overlay">
          <div className="skip-modal">
            <h3 className="skip-modal-title">Admin Panel {debugMode && <span className="debug-badge">DEBUG</span>}</h3>
            <div className="skip-modal-body">
              <div className="skip-input-group">
                <label>Admin Password</label>
                <input 
                  type="password" 
                  value={skipPassword} 
                  onChange={(e) => setSkipPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="skip-input"
                />
              </div>

              <div className="admin-section">
                <h4>Skip & Orders</h4>
                <div className="skip-input-group">
                  <label>Steps to skip</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={skipAmount} 
                      onChange={(e) => setSkipAmount(e.target.value)}
                      min="1"
                      className="skip-input flex-1"
                      disabled={skipCompleteOrder}
                    />
                    <button className="admin-action-btn" onClick={handleSkipSteps}>Execute Skip</button>
                  </div>
                </div>
                <div className="skip-checkbox-group">
                  <input 
                    type="checkbox" 
                    id="complete-order-checkbox"
                    checked={skipCompleteOrder}
                    onChange={(e) => setSkipCompleteOrder(e.target.checked)}
                    className="skip-checkbox"
                  />
                  <label htmlFor="complete-order-checkbox">Complete current order directly</label>
                </div>
              </div>

              <div className="admin-section">
                <h4>Inventory Management</h4>
                <div className="skip-input-group">
                  <label>Add Custom Ingredient</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={adminIngredientEmoji} 
                      onChange={(e) => setAdminIngredientEmoji(e.target.value)}
                      placeholder="Emoji"
                      className="skip-input w-16"
                    />
                    <input 
                      type="text" 
                      value={adminIngredientName} 
                      onChange={(e) => setAdminIngredientName(e.target.value)}
                      placeholder="Name"
                      className="skip-input flex-1"
                    />
                    <button className="admin-action-btn" onClick={handleAdminAddIngredient}>Add</button>
                  </div>
                </div>
                <button className="admin-danger-btn" onClick={handleAdminClearInventory}>Reset Inventory</button>
              </div>

              <div className="admin-section">
                <h4>Achievements & Stats</h4>
                <div className="flex gap-2 mb-2">
                  <button className="admin-action-btn flex-1" onClick={handleAdminUnlockAchievements}>Unlock All</button>
                  <button className="admin-action-btn flex-1" onClick={handleAdminAddMoney}>Add $100</button>
                </div>
                <button className="admin-danger-btn w-full" onClick={handleAdminResetAll}>Full Reset</button>
              </div>

              <div className="admin-section">
                <h4>Order Management</h4>
                <div className="flex gap-2">
                  <button className="admin-action-btn flex-1" onClick={handleAdminGenerateOrder}>Random Order</button>
                  <button className="admin-danger-btn flex-1" onClick={handleAdminClearOrders}>Clear All</button>
                </div>
              </div>

              <div className="admin-section">
                <h4>System</h4>
                <button 
                  className={`admin-action-btn w-full ${debugMode ? 'active' : ''}`} 
                  onClick={handleAdminToggleDebug}
                >
                  {debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode'}
                </button>
              </div>

              {skipError && <p className="skip-error">{skipError}</p>}
            </div>
            <div className="skip-modal-footer">
              <button className="skip-cancel-btn" onClick={() => setShowSkipModal(false)}>Close Panel</button>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients and Tools Side by Side */}
      <div className="skip-steps-container">
        <button className="skip-steps-btn" onClick={() => setShowSkipModal(true)}>
          Admin Panel
        </button>
      </div>

      <div className="ingredients-tools-row">
        {/* Ingredients Section */}
        <section className="kitchen-section ingredients-section">
          <div className="section-header">
            <div className="section-header-text">
              <h2 className="section-title">Ingredients</h2>
              <p className="section-subtitle">Select ingredients to use as function arguments</p>
            </div>
            <span className="section-count">count: {inventory.length}</span>
          </div>
          <div className="ingredients-search-container">
            <input
              type="text"
              className="ingredients-search-input"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="search-clear-button" 
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <div className="ingredients-grid" ref={ingredientsRef}>
            {inventory.length === 0 ? (
              <div className="empty-state-hint">No ingredients in inventory.</div>
            ) : inventory.filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
              <div className="empty-state-hint">No ingredients match your search.</div>
            ) : (
              inventory
                .filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((ingredient, index) => (
                  <IngredientTile
                    key={`${ingredient.name}-${index}-${actionTriggerCount}`}
                    ingredient={ingredient}
                    isSelected={selectedIngredients.has(ingredient.name)}
                    isActive={false}
                    isDisabled={!currentOrder}
                    onClick={() => toggleIngredient(ingredient.name)}
                  />
                ))
            )}
          </div>
        </section>

        {/* Tools Section */}
        <section className="kitchen-section actions-section">
          <div className="section-header">
            <div className="section-header-text">
              <h2 className="section-title">Tools</h2>
              <p className="section-subtitle">Use function calls to combine ingredients</p>
            </div>
            <div className="section-header-right">
              {hasSelection && (
                <button 
                  className="clear-selection-button" 
                  onClick={() => setSelectedIngredients(new Set())}
                  title="Clear all selected ingredients"
                >
                  Clear ({selectedIngredients.size})
                </button>
              )}
              <span className="section-count">count: {COOKING_ACTIONS.length}</span>
            </div>
          </div>
          
          <div className="ingredients-search-container">
            <input
              type="text"
              className="ingredients-search-input"
              placeholder="Search tools..."
              value={toolsSearchTerm}
              onChange={(e) => setToolsSearchTerm(e.target.value)}
            />
            {toolsSearchTerm && (
              <button 
                className="search-clear-button" 
                onClick={() => setToolsSearchTerm('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          {hasSelection && (
            <div className="selection-summary">
              <span className="selection-label">Selected:</span>
              <div className="selection-chips">
                {Array.from(selectedIngredients).map(name => {
                  const ing = findIngredientInInventory(name, inventory);
                  return (
                    <span key={name} className="selection-chip" onClick={() => toggleIngredient(name)}>
                      {ing?.emoji} {name} ✕
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="actions-grid" ref={actionsRef}>
            {!hasSelection && !isCooking && (
              <div className="empty-state-hint tools-hint">
                💡 Select ingredients on the left to enable tools
              </div>
            )}
            {COOKING_ACTIONS
              .filter(action => action.displayName.toLowerCase().includes(toolsSearchTerm.toLowerCase()))
              .map(action => {
                // Serve requires exactly one ingredient selected
              const isServeDisabled = action.name === 'serve' && selectedIngredients.size !== 1;
              // Don't disable tools while cooking agent is running
              const isDisabled = isCooking ? false : (!hasSelection || activeAction !== null || isServeDisabled);

              return (
                <ActionTile
                  key={`${action.name}-${actionTriggerCount}`}
                  action={action}
                  isActive={false}
                  isDisabled={isDisabled}
                  onClick={() => executeAction(action)}
                />
              );
            })}
          </div>
        </section>
      </div>

      {/* Agents Section */}
      <section className="kitchen-section agents-section">
        <div className="section-header">
          <div className="section-header-text">
            <h2 className="section-title">Agents</h2>
            <p className="section-subtitle">Three specialized Gemini 3 Flash agents</p>
          </div>
        </div>
        <div className="agents-grid">
          {/* Cooking Agent - Double Width */}
          <div className="agent-card agent-card-wide">
            <div className="agent-card-header">
              <span className="agent-emoji">🧑‍🍳</span>
              <span className="agent-name">Cooking Agent</span>
            </div>
            <p className="agent-description">Orchestrates cooking using available tools and ingredients</p>
            <div className="agent-actions">
              <button
                className="agent-cook-button"
                onClick={() => currentOrder && onCookWithGemini(currentOrder.name)}
                disabled={!currentOrder || isCooking}
              >
                {isCooking ? 'Cooking...' : currentOrder ? `Start cooking '${currentOrder.name}'` : 'Start an order'}
              </button>
              <button
                className="agent-view-button"
                onClick={onOpenCookingAgent}
                disabled={isCookingAgentOpen}
              >
                <span className="material-symbols-outlined">search</span>
                Open
              </button>
            </div>
          </div>

          {/* Alchemy Agent */}
          <div className="agent-card">
            <div className="agent-card-header">
              <span className="agent-emoji">🧑‍🔬</span>
              <span className="agent-name">Alchemy Agent</span>
            </div>
            <p className="agent-description">Determines results of cooking actions</p>
            <div className="agent-actions">
              <button
                className="agent-view-button"
                onClick={onOpenCombinationAgent}
                disabled={isAlchemyAgentOpen}
              >
                <span className="material-symbols-outlined">search</span>
                Open
              </button>
            </div>
          </div>

          {/* Judge Agent */}
          <div className="agent-card">
            <div className="agent-card-header">
              <span className="agent-emoji">🧑‍⚖️</span>
              <span className="agent-name">Judge Agent</span>
            </div>
            <p className="agent-description">Verifies if served dishes match orders</p>
            <div className="agent-actions">
              <button
                className="agent-view-button"
                onClick={onOpenVerificationAgent}
                disabled={isJudgeAgentOpen}
              >
                <span className="material-symbols-outlined">search</span>
                Open
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="kitchen-section timeline-section">
        <div 
          className="section-header cursor-pointer select-none hover:bg-gray-50 transition-colors" 
          onClick={() => setIsLogExpanded(!isLogExpanded)}
        >
          <div className="section-header-text">
            <h2 className="section-title flex items-center gap-2">
              Kitchen Log
              <span className={`material-symbols-outlined transition-transform duration-200 ${isLogExpanded ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </h2>
            <p className="section-subtitle">Chat history showing all cooking actions and results</p>
          </div>
        </div>
        {isLogExpanded && (
          <div className="timeline-container" ref={timelineRef}>
            {debugMode && (
              <div className="debug-stats-panel">
                <h4>Debug Stats</h4>
                <pre>{JSON.stringify(stats, null, 2)}</pre>
              </div>
            )}
            {timeline.length === 0 ? (
              <div className="timeline-empty">
                Select ingredients and click an action to start cooking
              </div>
            ) : (
              timeline.map(entry => (
                <TimelineItem key={entry.id} entry={entry} />
              ))
            )}
          </div>
        )}
      </section>

      {/* Achievement Toast */}
      {recentAchievement && (
        <AchievementToast
          achievement={recentAchievement}
          onClose={() => setRecentAchievement(null)}
        />
      )}

      {/* Recipe Steps Modal */}
      {showRecipeSteps && currentOrder && (
        <RecipeStepsDisplay 
          steps={recipeSteps} 
          onClose={() => setShowRecipeSteps(false)} 
          isLoading={isFetchingSteps}
          orderName={currentOrder.name}
        />
      )}
    </div>
  );
}

// ============================================================================
// Cooking Agent Component (Layer 2)
// ============================================================================

interface CookingAgentProps {
  inventory: Ingredient[];
  setInventory: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  setTimeline: React.Dispatch<React.SetStateAction<TimelineEntry[]>>;
  setActiveAction: React.Dispatch<React.SetStateAction<string | null>>;
  setActionTriggerCount: React.Dispatch<React.SetStateAction<number>>;
  setActiveIngredients: React.Dispatch<React.SetStateAction<Set<string>>>;
  executeCombinationRef: React.MutableRefObject<((action: KitchenAction, ingredients: string[]) => Promise<Ingredient | null>) | null>;
  sendMessageRef: React.MutableRefObject<((message: string) => void) | null>;
  onServe: (servedDishName: string) => Promise<boolean>;
  onPass: () => void;
  stats: any;
  setStats: React.Dispatch<React.SetStateAction<any>>;
}

function CookingAgent({
  inventory,
  setInventory,
  setTimeline,
  setActiveAction,
  setActionTriggerCount,
  setActiveIngredients,
  executeCombinationRef,
  sendMessageRef,
  onServe,
  onPass,
  stats,
  setStats,
}: CookingAgentProps) {
  const { client, setConfig, sendMessage } = useGeminiAPIContext();

  // Update config when inventory changes - enable thinking for cooking agent
  useEffect(() => {
    setConfig({
      systemInstruction: buildCookingAgentSystemInstruction(inventory),
      tools: generateCookingTools(),
      // No thinkingBudget - enable thinking for cooking agent
    });
  }, [setConfig, inventory]);

  // Store pending text from model response to merge with function call
  const pendingTextRef = useRef<string | null>(null);

  // Watch for model responses and store text for merging
  useEffect(() => {
    const handleLog = (log: any) => {
      // Only process incoming send-message responses
      if (log.type !== 'send-message' || log.direction !== 'receive') return;

      const response = log.message;
      if (!response) return;

      // Extract text from response
      const text = response.text;
      if (text && text.trim()) {
        // Check if this response also has function calls
        const hasFunctionCalls = response.candidates?.[0]?.content?.parts?.some(
          (part: any) => part.functionCall
        ) || response.functionCalls?.length > 0;

        if (hasFunctionCalls) {
          // Store text to merge with function call entry
          pendingTextRef.current = text;
        } else {
        // Text-only response, add as standalone entry
          setTimeline(prev => {
          // Check if we already have this text (avoid duplicates)
            const hasText = prev.some(e => e.text === text && !e.action);
            if (hasText) return prev;

            return [...prev, {
              id: `text-${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
              text: text,
            }];
          });
        }
      }
    };

    // Listen for log events
    (client as any).on('log', handleLog);
    return () => {
      (client as any).off('log', handleLog);
    };
  }, [client, setTimeline]);

  // Handle approved function calls from the Cooking Agent
  useEffect(() => {
    const handleApprovedFunctionCalls = async (functionCalls: FunctionCall[]) => {
      if (functionCalls.length === 0) return;

      // Process only the first function call (enforce one at a time)
      const fc = functionCalls[0];
      if (functionCalls.length > 1) {
        console.warn('Cooking Agent returned multiple function calls, only processing the first one');
      }

      const actionName = fc.name || '';
      const args = fc.args as { ingredients?: string[]; dish?: string } || {};

      // Handle serve action
      if (actionName === 'serve') {
        const dishName = args.dish || 'dish';
        console.log(`🍽️ Serving: ${dishName}`);

        // Add serve to timeline
        setTimeline(prev => [...prev, {
          id: `serve-${Date.now()}`,
          timestamp: new Date(),
          text: `🍽️ Served: ${dishName}`,
        }]);

        // Update total actions stat
        setStats((prev: any) => ({
          ...prev,
          totalActions: (prev.totalActions || 0) + 1
        }));

        // Trigger verification agent and wait for result
        const verificationSuccess = await onServe(dishName);

        // Send function response based on verification result
        await sendMessage([{
          functionResponse: {
            name: 'serve',
            response: verificationSuccess
              ? { success: true, message: `${dishName} has been served and verified!` }
              : { success: false, error: `${dishName} did not match any pending order. Please try again.` }
          }
        }]);
        return;
      }

      // Handle pass action - give up on current order
      if (actionName === 'pass') {
        console.log('🏳️ Passing on current order');

        // Notify parent to mark the current order as failed
        onPass();

        // Add pass to timeline
        setTimeline(prev => [...prev, {
          id: `pass-${Date.now()}`,
          timestamp: new Date(),
          text: '🏳️ Called pass on the order',
        }]);

        // Update total actions stat
        setStats((prev: any) => ({
          ...prev,
          totalActions: (prev.totalActions || 0) + 1
        }));

        // Send function response confirming the pass
        await sendMessage([{
          functionResponse: {
            name: 'pass',
            response: { success: true, message: 'Order has been abandoned.' }
          }
        }]);
        return;
      }

      // Handle cooking actions
      const requestedIngredients = args.ingredients || [];
      const timelineId = `cooking-${Date.now()}`;

      // Find the action
      const action = COOKING_ACTIONS.find(a => a.name === actionName);
      if (!action) {
        console.error(`Unknown action: ${actionName}`);
        await sendMessage([{
          functionResponse: {
            name: actionName,
            response: { success: false, error: `Unknown action: ${actionName}` }
          }
        }]);
        return;
      }

      // Validate all requested ingredients exist in inventory (case/spacing/symbol insensitive)
      const validatedIngredients: string[] = [];
      const missingIngredients: string[] = [];
      for (const requestedName of requestedIngredients) {
        const found = findIngredientInInventory(requestedName, inventory);
        if (found) {
          // Use the actual inventory name (normalized match found)
          // Avoid adding duplicates to the validated list
          const normalizedFound = normalizeIngredientName(found.name);
          if (!validatedIngredients.some(v => normalizeIngredientName(v) === normalizedFound)) {
            validatedIngredients.push(found.name);
          }
        } else {
          missingIngredients.push(requestedName);
        }
      }

      // If any ingredients are missing, send an error response
      if (missingIngredients.length > 0) {
        console.error(`Ingredients not found in inventory: ${missingIngredients.join(', ')}`);
        await sendMessage([{
          functionResponse: {
            name: actionName,
            response: {
              success: false,
              error: `Ingredients not found in inventory: ${missingIngredients.join(', ')}. Please only use ingredients that exist in the current inventory.`
            }
          }
        }]);
        return;
      }

      // Use validated ingredients (with actual inventory names) going forward
      const ingredients = validatedIngredients;

      // Add loading placeholder (include any pending text from model response)
      const pendingText = pendingTextRef.current;
      pendingTextRef.current = null; // Clear pending text

      const loadingEntry: TimelineEntry = {
        id: timelineId,
        timestamp: new Date(),
        text: pendingText || undefined,
        action: actionName,
        ingredients: ingredients,
        result: null,
      };
      setTimeline(prev => [...prev, loadingEntry]);
      setActiveAction(actionName);
      setActionTriggerCount(prev => prev + 1);
      setActiveIngredients(new Set(ingredients));

      try {
        // Call the Combination Agent via the shared ref
        let newIngredient: Ingredient | null = null;

        if (executeCombinationRef.current) {
          newIngredient = await executeCombinationRef.current(action, ingredients);
        }

        if (!newIngredient) {
          // Fallback if combination agent unavailable
          newIngredient = {
            name: `${action.displayName}ed ${ingredients.join(' & ')}`,
            emoji: action.emoji,
          };
        }

        // Update total actions stat
        setStats((prev: any) => ({
          ...prev,
          totalActions: (prev.totalActions || 0) + 1,
          maxIngredientsUsed: Math.max(prev.maxIngredientsUsed || 0, ingredients.length)
        }));

        // Update timeline
        setTimeline(prev => prev.map(entry =>
          entry.id === timelineId
            ? { ...entry, result: newIngredient }
            : entry
        ));

        // Add to inventory (at the beginning for recently used items at top)
        // But skip if this ingredient already exists (duplicate check)
        // Update stats for discovered ingredients
        if (!isDuplicateIngredient(newIngredient.name, inventory)) {
          setStats((prev: any) => ({
            ...prev,
            discoveredIngredients: prev.discoveredIngredients + 1
          }));
        }

        // Update stats for used tools
        if (!stats.usedTools.includes(action.name)) {
          setStats((prev: any) => ({
            ...prev,
            usedTools: [...prev.usedTools, action.name],
            usedToolsCount: prev.usedToolsCount + 1
          }));
        }

        setInventory(prev => {
          if (isDuplicateIngredient(newIngredient!.name, prev)) {
            console.log(`Skipping duplicate ingredient: ${newIngredient!.name}`);
            return prev;
          }
          return [newIngredient!, ...prev];
        });

        // Send function response back to Cooking Agent
        await sendMessage([{
          functionResponse: {
            name: actionName,
            response: {
              success: true,
              result: newIngredient.name,
              emoji: newIngredient.emoji,
              inventory_updated: true
            }
          }
        }]);

      } catch (error) {
        console.error('Error handling cooking action:', error);
        setTimeline(prev => prev.map(entry =>
          entry.id === timelineId
            ? { ...entry, result: { name: 'error', emoji: '❌' } }
            : entry
        ));

        // Send error response
        await sendMessage([{
          functionResponse: {
            name: actionName,
            response: { success: false, error: String(error) }
          }
        }]);
      } finally {
        setActiveAction(null);
        setActiveIngredients(new Set());
      }
    };

    // Subscribe to function call events
    (client as any).on('approvedfunctioncalls', handleApprovedFunctionCalls);
    return () => {
      (client as any).off('approvedfunctioncalls', handleApprovedFunctionCalls);
    };
  }, [client, sendMessage, setTimeline, setActiveAction, setActionTriggerCount, setActiveIngredients, setInventory, executeCombinationRef, onServe, onPass, inventory]);

  // Expose sendMessage function via ref for external triggering
  useEffect(() => {
    sendMessageRef.current = async (message: string) => {
      await sendMessage([{ text: message }]);
    };
    return () => {
      sendMessageRef.current = null;
    };
  }, [sendMessage, sendMessageRef]);

  // This component doesn't render anything - it just handles the Cooking Agent logic
  return null;
}

// ============================================================================
// Verification Agent Component (Layer 3)
// ============================================================================

interface VerificationAgentProps {
  orders: Order[];
  inventory: Ingredient[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setTimeline: React.Dispatch<React.SetStateAction<TimelineEntry[]>>;
  verifyServedDishRef: React.MutableRefObject<((servedDishName: string) => Promise<boolean>) | null>;
  stats: any;
  setStats: React.Dispatch<React.SetStateAction<any>>;
}

function VerificationAgent({
  orders,
  inventory,
  setOrders,
  setTimeline,
  verifyServedDishRef,
  stats,
  setStats,
}: VerificationAgentProps) {
  const { generateContent, setConfig } = useGeminiAPIContext();

  // Use refs to always access the current values (avoids stale closure)
  const ordersRef = useRef(orders);
  const inventoryRef = useRef(inventory);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);
  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  // Set config on mount
  useEffect(() => {
    setConfig({
      systemInstruction: VERIFICATION_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: VERIFICATION_RESPONSE_SCHEMA,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    });
  }, [setConfig]);

  // Expose verification function via ref
  useEffect(() => {
    verifyServedDishRef.current = async (servedDishName: string) => {
      // Use ref to get current orders (avoids stale closure)
      const currentOrders = ordersRef.current;

      // Find in_progress orders to check against
      const inProgressOrders = currentOrders.filter(o => o.status === 'in_progress');

      if (inProgressOrders.length === 0) {
        // No active order - return success without running verification
        setTimeline(prev => [...prev, {
          id: `verify-noorder-${Date.now()}`,
          type: 'text' as const,
          action: '',
          ingredients: [],
          result: null,
          text: `✅ Served "${servedDishName}" (no active order)`,
          timestamp: new Date(),
        }]);
        return true; // Success, but no order to verify against
      }

      // Check each pending order for a match
      for (const order of inProgressOrders) {
        try {
          const prompt = `Order: "${order.name}"\nServed dish: "${servedDishName}"\n\nDoes this served dish match the order?`;

          const contents: Content[] = [
            { role: 'user', parts: [{ text: prompt }] }
          ];

          const response = await generateContent(contents);
          const text = response?.text || '{}';
          const result: VerificationResult = JSON.parse(text);

          if (result.matches && result.confidence > 0.7) {
            // Look up the emoji from inventory for the served dish
            const servedIngredient = findIngredientInInventory(servedDishName, inventoryRef.current);
            const servedEmoji = servedIngredient?.emoji || '✅';

            // Match found! Update order to completed with the served dish's emoji
            // Update stats for completed orders and max confidence
            setStats((prev: any) => ({
              ...prev,
              completedOrders: prev.completedOrders + 1,
              money: (prev.money || 0) + 50,
              maxConfidence: Math.max(prev.maxConfidence || 0, result.confidence),
              completedDishes: prev.completedDishes?.includes(order.name) 
                ? prev.completedDishes 
                : [...(prev.completedDishes || []), order.name]
            }));

            setOrders(prev => prev.map(o =>
              o.id === order.id
                ? { ...o, status: 'completed' as const, emoji: servedEmoji }
                : o
            ));

            // Add success to timeline
            setTimeline(prev => [...prev, {
              id: `verify-${Date.now()}`,
              type: 'text' as const,
              action: '',
              ingredients: [],
              result: null,
              text: `✅ Correct!`,
              timestamp: new Date(),
            }]);

            return true; // Found a match, return success
          }
        } catch (error) {
          console.error('Error verifying order:', error);
        }
      }

      // No match found - keep order in_progress so model can try again
      // Add failure to timeline
      setTimeline(prev => [...prev, {
        id: `verify-fail-${Date.now()}`,
        type: 'text' as const,
        action: '',
        ingredients: [],
        result: null,
        text: `❌ Incorrect: "${servedDishName}" doesn't match "${inProgressOrders[0].name}"`,
        timestamp: new Date(),
      }]);

      return false; // No match found, but order stays active
    };

    return () => {
      verifyServedDishRef.current = null;
    };
  }, [generateContent, setOrders, setTimeline, verifyServedDishRef]);

  // This component doesn't render anything
  return null;
}

// ============================================================================
// Kitchen App Container (Shared State)
// ============================================================================

function KitchenAppContainer() {
  // Shared state lifted up to be accessible by both agents
  const [inventory, setInventory] = useState<Ingredient[]>(STARTING_INGREDIENTS);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set(PRESELECTED_INGREDIENTS)
  );
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionTriggerCount, setActionTriggerCount] = useState(0);
  const [activeIngredients, setActiveIngredients] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<Order[]>(EXAMPLE_ORDERS);

  // Overlay open states - start closed
  const [combinationAgentOpen, setCombinationAgentOpen] = useState(false);
  const [cookingAgentOpen, setCookingAgentOpen] = useState(false);
  const [verificationAgentOpen, setVerificationAgentOpen] = useState(false);

  // Cooking state - track if the cooking agent is actively working
  const [isCooking, setIsCooking] = useState(false);

  // Ref to share the Combination Agent's execute function
  const executeCombinationRef = useRef<((action: KitchenAction, ingredients: string[]) => Promise<Ingredient | null>) | null>(null);

  // Ref to trigger cooking agent from order buttons
  const sendCookingMessageRef = useRef<((message: string) => void) | null>(null);

  // Ref to trigger verification agent
  const verifyServedDishRef = useRef<((servedDishName: string) => Promise<boolean>) | null>(null);

  // Achievement State
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlockedAchievements');
    return saved ? JSON.parse(saved) : [];
  });
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('kitchenStats');
    return saved ? JSON.parse(saved) : {
      completedOrders: 0,
      money: 0,
      discoveredIngredients: STARTING_INGREDIENTS.length,
      usedToolsCount: 0,
      usedTools: [] as string[],
      maxConfidence: 0,
      maxIngredientsUsed: 0,
      completedDishes: [] as string[],
      totalActions: 0
    };
  });
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);

  // Persistence for achievements and stats
  useEffect(() => {
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  useEffect(() => {
    localStorage.setItem('kitchenStats', JSON.stringify(stats));
  }, [stats]);

  // Check for new achievements
  useEffect(() => {
    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        setRecentAchievement(achievement);
      }
    });
  }, [stats, unlockedAchievements]);

  // Callback for "Cook with Gemini" button - also opens Cooking Agent overlay (except on mobile)
  const handleCookWithGemini = useCallback((orderName: string) => {
    setIsCooking(true); // Set cooking state immediately
    // Open Cooking Agent and close others (only one agent window at a time)
    // Skip auto-opening on mobile to avoid obscuring the main UI
    const isMobile = window.innerWidth < 600;
    if (!isMobile) {
      setCookingAgentOpen(true);
      setCombinationAgentOpen(false);
      setVerificationAgentOpen(false);
    }
    if (sendCookingMessageRef.current) {
      sendCookingMessageRef.current(`Please prepare: ${orderName}`);
    }
  }, []);

  // Verification callback - called when serve() is invoked, returns success/failure
  const handleVerifyServedDish = useCallback(async (servedDishName: string): Promise<boolean> => {
    if (verifyServedDishRef.current) {
      const result = await verifyServedDishRef.current(servedDishName);
      setIsCooking(false); // Clear cooking state after verification
      return result;
    }
    setIsCooking(false);
    return false;
  }, []);

  // Callback for adding a new custom order
  const handleAddOrder = useCallback((orderName: string) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      name: orderName,
      emoji: '📋', // Empty notepad emoji for new orders
      difficulty: 'easy', // Default difficulty for custom orders
      status: 'not_started',
    };
    // Deselect any in_progress or failed orders, then add the new one
    setOrders(prev => [
      ...prev.map(order =>
        order.status === 'in_progress' || order.status === 'failed'
          ? { ...order, status: order.status === 'in_progress' ? 'not_started' as const : order.status }
          : order
      ),
      newOrder
    ]);
  }, []);

  // Callback for picking up an order (changes to in_progress)
  const handlePickUp = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => {
      // The order being picked up becomes in_progress
      if (order.id === orderId) {
        return { ...order, status: 'in_progress' as const };
      }
      // Any other in_progress order gets reset to not_started
      if (order.status === 'in_progress') {
        return { ...order, status: 'not_started' as const };
      }
      return order;
    }));
  }, []);

  // Callback for passing on an order (marks it as failed)
  const handlePass = useCallback(() => {
    setOrders(prev => prev.map(order =>
      order.status === 'in_progress'
        ? { ...order, status: 'failed' as const, servedDish: 'Gave up' }
        : order
    ));
  }, []);

  return (
    <div className="app-container">
      {/* Combination Agent (Layer 1) - for manual cooking */}
      <GeminiAPIProvider>
        <CombinationAgent
          inventory={inventory}
          setInventory={setInventory}
          timeline={timeline}
          setTimeline={setTimeline}
          selectedIngredients={selectedIngredients}
          setSelectedIngredients={setSelectedIngredients}
          activeAction={activeAction}
          setActiveAction={setActiveAction}
          actionTriggerCount={actionTriggerCount}
          setActionTriggerCount={setActionTriggerCount}
          setOrders={setOrders}
          activeIngredients={activeIngredients}
          setActiveIngredients={setActiveIngredients}
          onExecuteActionRef={executeCombinationRef}
          orders={orders}
          onCookWithGemini={handleCookWithGemini}
          onPickUp={handlePickUp}
          onAddOrder={handleAddOrder}
          onServe={handleVerifyServedDish}
          onOpenCombinationAgent={() => {
            setCombinationAgentOpen(true);
            setCookingAgentOpen(false);
            setVerificationAgentOpen(false);
          }}
          onOpenCookingAgent={() => {
            setCookingAgentOpen(true);
            setCombinationAgentOpen(false);
            setVerificationAgentOpen(false);
          }}
          onOpenVerificationAgent={() => {
            setVerificationAgentOpen(true);
            setCombinationAgentOpen(false);
            setCookingAgentOpen(false);
          }}
          onGetSteps={(orderName) => {
            if (sendCookingMessageRef.current) {
              sendCookingMessageRef.current(`Tell me the steps to cook ${orderName}. Don't start cooking yet, just list the steps.`);
              // Open cooking agent to see the response
              setCookingAgentOpen(true);
            }
          }}
          isCooking={isCooking}
          isCookingAgentOpen={cookingAgentOpen}
          isAlchemyAgentOpen={combinationAgentOpen}
          isJudgeAgentOpen={verificationAgentOpen}
          unlockedAchievements={unlockedAchievements}
          setUnlockedAchievements={setUnlockedAchievements}
          stats={stats}
          setStats={setStats}
          recentAchievement={recentAchievement}
          setRecentAchievement={setRecentAchievement}
          isAchievementsExpanded={isAchievementsExpanded}
          setIsAchievementsExpanded={setIsAchievementsExpanded}
        />
        <GeminiDebug
          agentName="Alchemy Agent"
          isOpen={combinationAgentOpen}
          onClose={() => setCombinationAgentOpen(false)}
          welcomeMessage="I determine the result of cooking actions. I can't see the open orders, so I don't always return what you expect! Select an ingredient + tool to see me work!"
          placeholder="Ask about ingredient combinations..."
          showApprovalSelector={false}
        />
      </GeminiAPIProvider>

      {/* Cooking Agent (Layer 2) - for automated cooking via debug console */}
      <GeminiAPIProvider>
        <CookingAgent
          inventory={inventory}
          setInventory={setInventory}
          setTimeline={setTimeline}
          setActiveAction={setActiveAction}
          setActionTriggerCount={setActionTriggerCount}
          setActiveIngredients={setActiveIngredients}
          executeCombinationRef={executeCombinationRef}
          sendMessageRef={sendCookingMessageRef}
          onServe={handleVerifyServedDish}
          onPass={handlePass}
          stats={stats}
          setStats={setStats}
        />
        <GeminiDebug
          agentName="Cooking Agent"
          isOpen={cookingAgentOpen}
          onClose={() => setCookingAgentOpen(false)}
          welcomeMessage="I cook with function calls. Click 'Start cooking' to start an order, or type a dish!"
          placeholder="Type a dish to cook..."
          initialAutoApprove={true}
          showApprovalSelector={true}
        />
      </GeminiAPIProvider>

      {/* Verification Agent (Layer 3) - for checking served dishes */}
      <GeminiAPIProvider>
        <VerificationAgent
          orders={orders}
          inventory={inventory}
          setOrders={setOrders}
          setTimeline={setTimeline}
          verifyServedDishRef={verifyServedDishRef}
          stats={stats}
          setStats={setStats}
        />
        <GeminiDebug
          agentName="Judge Agent"
          isOpen={verificationAgentOpen}
          onClose={() => setVerificationAgentOpen(false)}
          welcomeMessage="I verify if served dishes match pending orders. I'm triggered automatically when a dish is served."
          placeholder="Ask about order verification..."
          showApprovalSelector={false}
        />
      </GeminiAPIProvider>

      {/* Attribution Footer */}
      <footer className="attribution-footer">
        Ideas/feedback:{' '}
        <a href="https://x.com/cobley_ben" target="_blank" rel="noopener noreferrer">
          cobley_ben@
        </a>
      </footer>
    </div>
  );
}

// ============================================================================
// App Component
// ============================================================================

function App() {
  return <KitchenAppContainer />;
}

export default App;
