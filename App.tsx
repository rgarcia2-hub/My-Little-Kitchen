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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Lightbulb, LogOut, Coffee, Copy, CheckCircle2 } from "lucide-react";
import "./App.css";
import { GeminiAPIProvider, useGeminiAPIContext } from "./gemini/contexts/GeminiAPIContext";
import GeminiDebug from "./gemini/components/GeminiDebug";
import { Content, FunctionCall } from '@google/genai';
import {
  Ingredient,
  KitchenAction,
  CombinationResult,
  Order,
  VerificationResult,
  RecipeStep,
  Achievement,
  ACHIEVEMENTS,
  Upgrade,
  UPGRADES,
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
  getRandomDifficulty,
  CompletedRecipe,
} from './constants';

import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, getDocFromServer, Timestamp } from "firebase/firestore";
import { auth, db } from "./src/firebase";
import AuthScreen from "./src/components/AuthScreen";
import { handleFirestoreError, OperationType } from "./src/lib/firestore-errors";

// ============================================================================
// Error Boundary Component
// ============================================================================

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops! Something went wrong.</h2>
          <p>The kitchen encountered a technical issue. Don't worry, your progress should be safe!</p>
          <div className="error-details">
            {this.state.error?.message || "Unknown error"}
          </div>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Reload Kitchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
// Tutorial Overlay Component
// ============================================================================

interface TutorialStep {
  id: number;
  text: string;
  highlightId?: string; // ID of the element to highlight
  targetType?: 'order' | 'ingredient' | 'action';
  targetName?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    text: "¡Bienvenido a My Little Kitchen! Vamos a aprender a cocinar. Primero, acepta un pedido. Haz clic en 'Start' en el pedido de 'Fried Eggs'.",
    highlightId: 'order-1',
    targetType: 'order',
    targetName: 'Fried Eggs'
  },
  {
    id: 2,
    text: "¡Genial! Ahora selecciona un ingrediente. Vamos a cocinar unos huevos. Selecciona 'eggs'.",
    highlightId: 'eggs',
    targetType: 'ingredient',
    targetName: 'eggs'
  },
  {
    id: 3,
    text: "Ahora usa una herramienta para cocinarlos. Haz clic en 'fry'.",
    highlightId: 'fry',
    targetType: 'action',
    targetName: 'fry'
  },
  {
    id: 4,
    text: "¡Perfecto! Has cocinado 'Fried Eggs'. Ahora selecciónalos en tu inventario.",
    highlightId: 'Fried Eggs',
    targetType: 'ingredient',
    targetName: 'Fried Eggs'
  },
  {
    id: 5,
    text: "Finalmente, haz clic en 'serve' para completar el pedido y entregárselo al cliente.",
    highlightId: 'serve',
    targetType: 'action',
    targetName: 'serve'
  }
];

interface TutorialOverlayProps {
  step: TutorialStep;
  onClose: () => void;
}

function TutorialOverlay({ step, onClose }: TutorialOverlayProps) {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-content">
        <div className="tutorial-header">
          <span className="tutorial-badge">TUTORIAL</span>
          <button className="tutorial-close" onClick={onClose}>✕</button>
        </div>
        <p className="tutorial-text">{step.text}</p>
        <div className="tutorial-footer">
          <span className="tutorial-step-indicator">Paso {step.id} de {TUTORIAL_STEPS.length}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Ingredient Tile Component
// ============================================================================

interface IngredientTileProps {
  ingredient: Ingredient;
  isSelected: boolean;
  isActive: boolean;
  isDisabled: boolean;
  isHighlighted?: boolean;
  onClick: () => void;
}

function IngredientTile({ ingredient, isSelected, isActive, isDisabled, isHighlighted, onClick }: IngredientTileProps) {
  return (
    <button
      className={`ingredient-tile ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''} ${isHighlighted ? 'tutorial-highlight' : ''}`}
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
  isHighlighted?: boolean;
  onClick: () => void;
}

function ActionTile({ action, isActive, isDisabled, isHighlighted, onClick }: ActionTileProps) {
  return (
    <button
      className={`action-tile ${isActive ? 'active' : ''} ${isHighlighted ? 'tutorial-highlight' : ''}`}
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
// Order Card Component
// ============================================================================

interface OrderCardProps {
  order: Order;
  isDisabled: boolean;
  isHighlighted?: boolean;
  onPickUp: (orderId: string) => void;
  onCookWithGemini: (orderName: string) => void;
  onOpenVerificationAgent?: () => void;
}

function OrderCard({ order, isDisabled, isHighlighted, onPickUp, onCookWithGemini, onOpenVerificationAgent }: OrderCardProps) {
  const statusClass = order.status === 'completed' ? 'completed' :
    order.status === 'failed' ? 'failed' :
      order.status === 'in_progress' ? 'in-progress' : 'not-started';

  const difficultyClass = order.difficulty ? `difficulty-${order.difficulty}` : '';

  return (
    <div className={`order-card ${statusClass} ${isDisabled ? 'disabled' : ''} ${isHighlighted ? 'tutorial-highlight' : ''}`}>
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
  difficulty?: string;
  isPinned: boolean;
  onPinToggle: () => void;
}

function RecipeStepsDisplay({ steps, onClose, isLoading, orderName, difficulty, isPinned, onPinToggle }: RecipeStepsDisplayProps) {
  const canPin = difficulty !== 'difficult' && difficulty !== 'nightmare';

  return (
    <div className={`recipe-steps-overlay ${isPinned ? 'pinned' : ''}`}>
      <div className="recipe-steps-modal">
        <div className="recipe-steps-header">
          <div className="recipe-steps-header-text">
            <h3 className="recipe-steps-title">Cooking Guide: {orderName}</h3>
            <p className="recipe-steps-subtitle">Follow these steps using the tools and ingredients below</p>
          </div>
          <div className="recipe-steps-header-actions">
            {canPin && (
              <button 
                onClick={onPinToggle} 
                className={`recipe-steps-pin ${isPinned ? 'active' : ''}`}
                title={isPinned ? "Unpin recipe" : "Pin recipe to screen"}
              >
                <span className="material-symbols-outlined">{isPinned ? 'keep_off' : 'keep'}</span>
              </button>
            )}
            <button onClick={onClose} className="recipe-steps-close">✕</button>
          </div>
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
        {!isPinned && (
          <div className="recipe-steps-footer">
            <button onClick={onClose} className="recipe-steps-done">Got it!</button>
          </div>
        )}
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
  isUpgradesExpanded: boolean;
  setIsUpgradesExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  onBuyUpgrade: (upgrade: Upgrade) => void;
  tutorialStep: number;
  setTutorialStep: React.Dispatch<React.SetStateAction<number>>;
  isRecipeBookExpanded: boolean;
  setIsRecipeBookExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  completedRecipes: CompletedRecipe[];
  setCompletedRecipes: React.Dispatch<React.SetStateAction<CompletedRecipe[]>>;
  setCurrentOrderSteps: React.Dispatch<React.SetStateAction<{tool: string, ingredients: string[], result: string}[]>>;
  user: User;
}

function UpgradeItem({ upgrade, isPurchased, canAfford, onBuy }: { 
  upgrade: Upgrade; 
  isPurchased: boolean; 
  canAfford: boolean;
  onBuy: () => void;
}) {
  return (
    <div className={`upgrade-item ${isPurchased ? 'purchased' : canAfford ? 'affordable' : 'expensive'}`}>
      <div className="upgrade-icon">{upgrade.emoji}</div>
      <div className="upgrade-info">
        <div className="upgrade-name">{upgrade.name}</div>
        <div className="upgrade-description">{upgrade.description}</div>
        <div className="upgrade-cost">
          {isPurchased ? 'PURCHASED' : `Cost: $${upgrade.cost}`}
        </div>
      </div>
      {!isPurchased && (
        <button 
          className="buy-upgrade-btn" 
          onClick={onBuy}
          disabled={!canAfford}
        >
          Buy
        </button>
      )}
    </div>
  );
}

function CombinationAgent({
  inventory,
  setInventory,
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
  isUpgradesExpanded,
  setIsUpgradesExpanded,
  onBuyUpgrade,
  tutorialStep,
  setTutorialStep,
  isRecipeBookExpanded,
  setIsRecipeBookExpanded,
  completedRecipes,
  setCompletedRecipes,
  setCurrentOrderSteps,
  user,
}: CombinationAgentProps) {
  const { generateContent, setConfig, client, model } = useGeminiAPIContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [toolsSearchTerm, setToolsSearchTerm] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [skipAmount, setSkipAmount] = useState('1');
  const [skipCompleteOrder, setSkipCompleteOrder] = useState(false);
  const [skipError, setSkipError] = useState('');
  const [adminIngredientName, setAdminIngredientName] = useState('');
  const [adminIngredientEmoji, setAdminIngredientEmoji] = useState('🍎');

  const isAdminUser = user.email === 'robert.garcia.alsina2012@gmail.com';

  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([]);
  const [isFetchingSteps, setIsFetchingSteps] = useState(false);
  const [showRecipeSteps, setShowRecipeSteps] = useState(false);
  const [isRecipePinned, setIsRecipePinned] = useState(false);

  // Refs for auto-scroll
  const ingredientsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
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

  // Load Ko-fi Widget
  useEffect(() => {
    if (stats.proPlan) return;
    
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.kofiwidget2) {
        try {
          // @ts-ignore
          window.kofiwidget2.init('Unlock it on ko-fi', '#f57373', 'X8X51WOFNJ');
          // @ts-ignore
          const widget = window.kofiwidget2.getHTML();
          const container = document.getElementById('kofi-widget-container');
          if (container) {
            container.innerHTML = widget;
          }
        } catch (e) {
          console.error("Ko-fi widget error:", e);
        }
      }
    };
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, [stats.proPlan]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.uid);
    alert("ID copied! Paste it in the Ko-fi message.");
  };

  // Toggle ingredient selection
  const toggleIngredient = useCallback((name: string) => {
    if (tutorialStep === 2 && name === 'eggs') {
      setTutorialStep(3);
    } else if (tutorialStep === 4 && name === 'Fried Eggs') {
      setTutorialStep(5);
    }

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
    // Apply safety_boost upgrade logic for "Kitchen Fire"
    if (stats.purchasedUpgrades?.includes('fusion_reactor')) {
      // Fusion Reactor eliminates fire risk
    } else {
      // Base 12% chance as requested by user
      let fireChance = 0.12; 
      
      // Upgrades reduce the risk
      if (stats.purchasedUpgrades?.includes('master_tools')) {
        fireChance *= 0.5; 
      }
      if (stats.purchasedUpgrades?.includes('cryo_freezer')) {
        fireChance *= 0.5;
      }

      if (Math.random() < fireChance) {
        return {
          name: 'Kitchen Fire',
          emoji: '🔥'
        };
      }
    }

    try {
      const currentOrder = orders.find(o => o.status === 'in_progress');
      
      // Build a context string from the current recipe steps if they exist
      let recipeContext = "";
      if (recipeSteps.length > 0) {
        recipeContext = "\n\nCURRENT RECIPE GUIDE STEPS:\n" + 
          recipeSteps.map((s, i) => `Step ${i+1}: ${s.ingredients.join(' + ')} using ${s.tool} -> ${s.result}`).join('\n') +
          "\n\nCRITICAL: If the current action and ingredients match one of the steps above, you MUST return the EXACT 'result' name specified in that step.";
      }

      const prompt = `Action: ${action.displayName}\nIngredients: ${ingredientNames.join(', ')}\n\nWhat is the result of this cooking action?${currentOrder ? ` The player is currently trying to cook: ${currentOrder.name}.` : ''}${recipeContext}`;

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
  }, [generateContent, recipeSteps, orders]);

  // Expose the execution function to Cooking Agent via ref
  useEffect(() => {
    onExecuteActionRef.current = executeCombination;
    return () => {
      onExecuteActionRef.current = null;
    };
  }, [executeCombination, onExecuteActionRef]);

  const fetchRecipeSteps = async (orderName: string, difficulty: string = 'easy') => {
    setIsFetchingSteps(true);
    setShowRecipeSteps(true);
    setRecipeSteps([]);
    try {
      const prompt = `Provide steps to cook ${orderName} in the game. The difficulty is ${difficulty}.`;
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
    if (isAdminUser) {
      if (skipCompleteOrder) {
        const currentOrder = orders.find(o => o.status === 'in_progress');
        if (currentOrder) {
          // Reward based on difficulty (Admin gets full reward)
          let baseReward = 50;
          if (currentOrder.difficulty === 'intermediate') baseReward = 100;
          else if (currentOrder.difficulty === 'difficult') baseReward = 250;
          else if (currentOrder.difficulty === 'nightmare') baseReward = 1000;

          setStats((prev: any) => ({
            ...prev,
            completedOrders: prev.completedOrders + 1,
            completedNightmareOrders: currentOrder.difficulty === 'nightmare' 
              ? (prev.completedNightmareOrders || 0) + 1 
              : (prev.completedNightmareOrders || 0),
            money: (prev.money || 0) + baseReward,
          }));

          // Add to Recipe Book
          setCompletedRecipes(prev => {
            if (prev.some(r => r.orderName === currentOrder.name)) return prev;
            
            const newRecipe: CompletedRecipe = {
              id: `recipe-${Date.now()}`,
              orderName: currentOrder.name,
              dishName: currentOrder.name, // Admin skip uses order name as dish name
              emoji: '⭐', // Admin star
              timestamp: new Date().toISOString(),
              steps: [{ tool: 'Admin Panel', ingredients: ['Magic'], result: currentOrder.name }]
            };
            return [newRecipe, ...prev];
          });

          // Clear steps
          setCurrentOrderSteps([]);

          setOrders(prev => {
            const updatedOrders = prev.map(o => 
              o.id === currentOrder.id ? { ...o, status: 'completed' as const } : o
            );

            // Add a new random order (same logic as VerificationAgent)
            const difficulty = getRandomDifficulty();
            const pool = EXAMPLE_ORDERS.filter(o => o.difficulty === difficulty);
            const randomTemplate = pool[Math.floor(Math.random() * pool.length)];
            
            const newOrder: Order = {
              ...randomTemplate,
              id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              status: 'not_started'
            };

            return [...updatedOrders, newOrder];
          });
        } else {
          setSkipError('No order in progress to complete');
          return;
        }
      } else {
        const amount = parseInt(skipAmount, 10);
        if (!isNaN(amount) && amount > 0) {
          setActionTriggerCount(prev => prev + amount);
        } else {
          setSkipError('Invalid amount');
          return;
        }
      }
      
      setShowSkipModal(false);
      setSkipAmount('1');
      setSkipCompleteOrder(false);
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminAddIngredient = () => {
    if (isAdminUser) {
      if (adminIngredientName.trim()) {
        const newIng = { name: adminIngredientName.trim(), emoji: adminIngredientEmoji };
        if (!isDuplicateIngredient(newIng.name, inventory)) {
          setInventory(prev => [newIng, ...prev]);
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
    if (isAdminUser) {
      setInventory(STARTING_INGREDIENTS);
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminUnlockAchievements = () => {
    if (isAdminUser) {
      setUnlockedAchievements(ACHIEVEMENTS.map(a => a.id));
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminClearOrders = () => {
    if (isAdminUser) {
      setOrders([]);
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminGenerateOrder = () => {
    if (isAdminUser) {
      const difficulty = getRandomDifficulty();
      const pool = EXAMPLE_ORDERS.filter(o => o.difficulty === difficulty);
      const randomTemplate = pool[Math.floor(Math.random() * pool.length)];
      
      const newOrder: Order = {
        ...randomTemplate,
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'not_started'
      };

      setOrders(prev => [...prev, newOrder]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const handleAdminAddMoney = () => {
    if (isAdminUser) {
      setStats((prev: any) => ({ ...prev, money: (prev.money || 0) + 100 }));
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminToggleDebug = () => {
    if (isAdminUser) {
      setDebugMode(!debugMode);
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminResetAll = () => {
    if (isAdminUser) {
      setInventory(STARTING_INGREDIENTS);
      setUnlockedAchievements([]);
      setStats({
        completedOrders: 0,
        money: 0,
        discoveredIngredients: STARTING_INGREDIENTS.length,
        usedTools: [],
        usedToolsCount: 0,
        totalActions: 0,
        maxIngredientsUsed: 0,
        maxConfidence: 0,
        completedDishes: []
      });
      setCompletedRecipes([]);
      setSkipError('');
    } else {
      setSkipError('Incorrect password');
    }
  };

  const restartTutorial = () => {
    setTutorialStep(1);
    localStorage.removeItem('tutorialCompleted');
    // Also clear some state to make it feel fresh
    setInventory(STARTING_INGREDIENTS);
    setSelectedIngredients(new Set());
  };

  // Manual execution (UI click)
  const executeAction = useCallback(async (action: KitchenAction) => {
    if (selectedIngredients.size === 0) return;

    const ingredientNames = Array.from(selectedIngredients);

    // Clear selection immediately
    setSelectedIngredients(new Set());

    // Handle serve action specially - only triggers verification, no combination
    if (action.name === 'serve') {
      if (tutorialStep === 5 && ingredientNames[0] === 'Fried Eggs') {
        setTutorialStep(0);
        localStorage.setItem('tutorialCompleted', 'true');
      }

      // Serve takes only the first selected ingredient as the dish name
      const dishName = ingredientNames[0];

      // Trigger verification agent
      onServe(dishName);
      return;
    }

    setActiveAction(action.name);

    if (tutorialStep === 3 && action.name === 'fry' && ingredientNames.includes('eggs')) {
      setTutorialStep(4);
    }

    const newIngredient = await executeCombination(action, ingredientNames);

    // Update total actions stat
    setStats((prev: any) => ({
      ...prev,
      totalActions: (prev.totalActions || 0) + 1
    }));

    if (newIngredient) {
      // Add to current order steps
      setCurrentOrderSteps(prev => [...prev, {
        tool: action.displayName,
        ingredients: ingredientNames,
        result: newIngredient.name
      }]);

      // Update stats for discovered ingredients
      if (!isDuplicateIngredient(newIngredient.name, inventory)) {
        setStats((prev: any) => ({
          ...prev,
          discoveredIngredients: prev.discoveredIngredients + 1
        }));
      }

      // Update stats for used tools
      if (!(stats.usedTools || []).includes(action.name)) {
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
    }

    setActiveAction(null);
  }, [selectedIngredients, executeCombination, setActiveAction, setSelectedIngredients, setInventory, onServe]);

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
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto relative">
          <div>
            <h1 className="kitchen-title">My little Kitchen</h1>
          </div>
          
          <div className="settings-container">
            <button 
              className="user-profile-btn-top"
              onClick={() => {
                setShowSkipModal(true);
              }}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="user-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">
                  {user.displayName?.[0] || user.email?.[0] || '?'}
                </div>
              )}
              <span className="user-name-text">{user.displayName || 'Chef'}</span>
              <span className="emoji">⚙️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Challenge Banner */}
      <div className="challenge-banner-brutalist">
        <div className="challenge-header-rail">
          <span className="rail-text">KITCHEN PROTOCOL v1.0</span>
          <span className="rail-text">SYSTEM READY</span>
          <span className="rail-text">EST. 2024</span>
        </div>
        
        <div className="challenge-content-grid">
          <div className="challenge-main-info">
            <div className="challenge-badge">TUTORIAL PHASE</div>
            <h1 className="challenge-title-massive">KITCHEN<br/>TUTORIAL</h1>
            <p className="challenge-subtitle-refined">
              Sequence tasks from 100 tools and 100 ingredients to prepare a meal.
              Master the workflow to unlock advanced culinary agents.
            </p>
          </div>
          
          <div className="challenge-steps-container">
            <div className="how-to-step-brutalist">
              <span className="step-number">01</span>
              <div className="step-info">
                <span className="step-label">INITIATE</span>
                <span className="step-text">Start an order</span>
              </div>
            </div>
            <div className="how-to-step-brutalist">
              <span className="step-number">02</span>
              <div className="step-info">
                <span className="step-label">RESOURCES</span>
                <span className="step-text">Select ingredients</span>
              </div>
            </div>
            <div className="how-to-step-brutalist">
              <span className="step-number">03</span>
              <div className="step-info">
                <span className="step-label">PROCESS</span>
                <span className="step-text">Use a tool</span>
              </div>
            </div>
            <div className="how-to-step-brutalist">
              <span className="step-number">04</span>
              <div className="step-info">
                <span className="step-label">EXECUTE</span>
                <span className="step-text">Serve the result!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Top Bar */}
      <div className="achievements-top-bar">
        <div className="flex flex-wrap w-full items-center justify-between">
          <div className="flex gap-4 flex-wrap items-center">
            <button 
              className={`view-achievements-btn ${isAchievementsExpanded ? 'active' : ''}`}
              onClick={() => {
                setIsAchievementsExpanded(!isAchievementsExpanded);
                if (!isAchievementsExpanded) setIsUpgradesExpanded(false);
              }}
            >
              <span className="emoji">🏆</span>
              <span>{isAchievementsExpanded ? 'Hide Achievements' : 'View Achievements'}</span>
              <span className="count-badge">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
            </button>
            <button 
              className={`view-achievements-btn ${isUpgradesExpanded ? 'active' : ''}`}
              onClick={() => {
                setIsUpgradesExpanded(!isUpgradesExpanded);
                if (!isUpgradesExpanded) {
                  setIsAchievementsExpanded(false);
                  setIsRecipeBookExpanded(false);
                }
              }}
            >
              <span className="emoji">🚀</span>
              <span>{isUpgradesExpanded ? 'Hide Upgrades' : 'View Upgrades'}</span>
              <span className="count-badge">{(stats.purchasedUpgrades || []).length}/{UPGRADES.length}</span>
            </button>
            <button 
              className={`view-achievements-btn ${isRecipeBookExpanded ? 'active' : ''}`}
              onClick={() => {
                setIsRecipeBookExpanded(!isRecipeBookExpanded);
                if (!isRecipeBookExpanded) {
                  setIsAchievementsExpanded(false);
                  setIsUpgradesExpanded(false);
                }
              }}
            >
              <span className="emoji">📖</span>
              <span>{isRecipeBookExpanded ? 'Hide Recipes' : 'Recipe Book'}</span>
              <span className="count-badge">{completedRecipes.length}</span>
            </button>
          </div>

          {stats.money > 0 && (
            <div className="money-display-bar">
              <span className="money-icon">💰</span>
              <span className="money-amount">Dinero: ${stats.money}</span>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Book Section (Conditional Render) */}
      {isRecipeBookExpanded && (
        <section className="kitchen-section achievements-section expanded recipe-book-section">
          <div className="section-header">
            <div className="section-header-text">
              <h2 className="section-title">Recipe Book</h2>
              <p className="section-subtitle">A collection of your successful culinary creations</p>
            </div>
            <button className="close-achievements" onClick={() => setIsRecipeBookExpanded(false)}>✕</button>
          </div>
          <div className="recipes-grid">
            {completedRecipes.length === 0 ? (
              <div className="empty-recipes">
                <p>You haven't completed any orders yet. Cook and serve dishes to fill your recipe book!</p>
              </div>
            ) : (
              completedRecipes.map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-emoji">{recipe.emoji}</div>
                  <div className="recipe-info">
                    <h3 className="recipe-name">{recipe.orderName}</h3>
                    <p className="recipe-dish">Served as: {recipe.dishName}</p>
                    {recipe.steps && recipe.steps.length > 0 && (
                      <div className="recipe-steps-mini">
                        {recipe.steps.map((step, idx) => (
                          <div key={idx} className="recipe-step-mini">
                            <span className="step-tool">{step.tool}</span>
                            <span className="step-ingredients">({step.ingredients.join(', ')})</span>
                            <span className="step-arrow">→</span>
                            <span className="step-result">{step.result}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="recipe-date">{new Date(recipe.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Upgrades Section (Conditional Render) */}
      {isUpgradesExpanded && (
        <section className="kitchen-section achievements-section expanded upgrades-section">
          <div className="section-header">
            <div className="section-header-text">
              <h2 className="section-title">Kitchen Upgrades</h2>
              <p className="section-subtitle">Invest your earnings to improve your kitchen's efficiency</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="money-display small">
                <span className="money-icon">💰</span>
                <span className="money-amount">${stats.money}</span>
              </div>
              <button className="close-achievements" onClick={() => setIsUpgradesExpanded(false)}>✕</button>
            </div>
          </div>
          <div className="upgrades-grid">
            {UPGRADES.map(upgrade => (
              <UpgradeItem 
                key={upgrade.id} 
                upgrade={upgrade} 
                isPurchased={(stats.purchasedUpgrades || []).includes(upgrade.id)}
                canAfford={(stats.money || 0) >= upgrade.cost}
                onBuy={() => onBuyUpgrade(upgrade)}
              />
            ))}
          </div>
        </section>
      )}

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
                isUnlocked={(unlockedAchievements || []).includes(achievement.id)} 
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
              onClick={() => fetchRecipeSteps(currentOrder.name, currentOrder.difficulty)}
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
                    isHighlighted={tutorialStep === 1 && order.name === 'Fried Eggs'}
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

      {/* Settings & Account Modal */}
      {showSkipModal && (
        <div className="skip-modal-overlay">
          <div className="skip-modal">
            <h3 className="skip-modal-title">Settings & Account {debugMode && <span className="debug-badge">DEBUG</span>}</h3>
            <div className="skip-modal-body">
              
              <div className="admin-section">
                <h4>Account</h4>
                <div className="account-info-card">
                  <div className="account-header">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="account-avatar-large" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-xl">
                        {user.displayName?.[0] || user.email?.[0] || '?'}
                      </div>
                    )}
                    <div className="account-details">
                      <h5>{user.displayName || 'Chef'}</h5>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="account-stats-grid">
                    <div className="account-stat-item">
                      <span className="stat-label">Balance</span>
                      <span className="stat-value">${stats.money}</span>
                    </div>
                    <div className="account-stat-item">
                      <span className="stat-label">Achievements</span>
                      <span className="stat-value">{unlockedAchievements.length}</span>
                    </div>
                  </div>

                  <button className="logout-btn-brutalist" onClick={() => signOut(auth)}>
                    <LogOut size={18} />
                    <span>Terminate Session</span>
                  </button>
                </div>
              </div>

              <div className="admin-section">
                <h4>Tutorial</h4>
                <button 
                  className="admin-action-btn w-full"
                  onClick={() => {
                    setTutorialStep(1);
                    localStorage.removeItem('tutorialCompleted');
                    setShowSkipModal(false);
                  }}
                >
                  <span className="emoji">🎓</span>
                  <span>Restart Tutorial</span>
                </button>
              </div>

              {isAdminUser && (
                <>
                  <div className="admin-section">
                    <h4>Admin: Skip & Orders</h4>
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
                    <h4>Admin: Inventory Management</h4>
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
                    <h4>Admin: Achievements & Stats</h4>
                    <div className="flex gap-2 mb-2">
                      <button className="admin-action-btn flex-1" onClick={handleAdminUnlockAchievements}>Unlock All</button>
                      <button className="admin-action-btn flex-1" onClick={handleAdminAddMoney}>Add $100</button>
                    </div>
                    <button className="admin-danger-btn w-full" onClick={handleAdminResetAll}>Full Reset</button>
                  </div>

                  <div className="admin-section">
                    <h4>Admin: Order Management</h4>
                    <div className="flex gap-2">
                      <button className="admin-action-btn flex-1" onClick={handleAdminGenerateOrder}>Random Order</button>
                      <button className="admin-danger-btn flex-1" onClick={handleAdminClearOrders}>Clear All</button>
                    </div>
                  </div>

                  <div className="admin-section">
                    <h4>Admin: System</h4>
                    <button 
                      className={`admin-action-btn w-full ${debugMode ? 'active' : ''}`} 
                      onClick={handleAdminToggleDebug}
                    >
                      {debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode'}
                    </button>
                  </div>
                </>
              )}

              {skipError && <p className="skip-error">{skipError}</p>}
            </div>
            <div className="skip-modal-footer">
              <button className="skip-cancel-btn" onClick={() => setShowSkipModal(false)}>Close Panel</button>
            </div>
          </div>
        </div>
      )}

      <div className="ingredients-tools-row">
        {/* Ingredients Section */}
        <section className="kitchen-section ingredients-section">
          <div className="section-header">
            <div className="section-header-text">
              <h2 className="section-title">Ingredients</h2>
              <p className="section-subtitle">Select ingredients to use as function arguments</p>
            </div>
            <div className="section-header-right">
              <button 
                className="reset-basics-button" 
                onClick={() => {
                  if (window.confirm("Restore the 100 starting ingredients? Your discovered items will be kept.")) {
                    setInventory(prev => {
                      const merged = [...STARTING_INGREDIENTS];
                      prev.forEach(ing => {
                        if (!merged.some(m => m.name.toLowerCase() === ing.name.toLowerCase())) {
                          merged.push(ing);
                        }
                      });
                      return merged;
                    });
                  }
                }}
                title="Restore the 100 starting ingredients"
              >
                Reset to Basics
              </button>
              <span className="section-count">count: {inventory.length}</span>
            </div>
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
                    isHighlighted={
                      (tutorialStep === 2 && ingredient.name === 'eggs') ||
                      (tutorialStep === 4 && ingredient.name === 'Fried Eggs')
                    }
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
                  isHighlighted={
                    (tutorialStep === 3 && action.name === 'fry') ||
                    (tutorialStep === 5 && action.name === 'serve')
                  }
                  onClick={() => executeAction(action)}
                />
              );
            })}
          </div>
        </section>
      </div>

      {/* Agents Section */}
      <section className="agents-section-os">
        <div className="os-header">
          <div className="os-title-group">
            <span className="os-badge">System Module</span>
            <h2 className="os-title">Culinary Agents</h2>
          </div>
          <div className="os-status">
            <div className="status-dot"></div>
            <span>SYSTEM_ACTIVE</span>
          </div>
        </div>

        {!stats.proPlan && (
          <div className="os-paywall">
            <div className="os-paywall-grid" />
            <div className="os-paywall-scanline" />
            
            <div className="os-lock-icon">🔒</div>
            <h3 className="os-paywall-title">Clearance Required</h3>
            <p className="os-paywall-text">
              Advanced AI Agents are restricted to PRO users. 
              Initialize Kitchen OS v1.0 to bypass security.
            </p>
            
            <div className="os-kofi-container">
              <div className="flex flex-col items-center gap-3 w-full">
                <span className="text-[9px] text-[#00ff00] animate-pulse uppercase font-bold">
                  ⚠️ COPY AUTH_ID BELOW BEFORE PAYING ⚠️
                </span>
                <div id="kofi-widget-container" className="flex justify-center">
                  {/* Widget will be injected here */}
                  <a 
                    href="https://ko-fi.com/X8X51WOFNJ" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-[#f57373] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Coffee size={18} />
                    Unlock it on ko-fi
                  </a>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCopyId}
              className="os-copy-id"
            >
              [ COPY AUTH_ID: {user.uid.substring(0, 8)}... ]
            </button>
          </div>
        )}

        <div className="agents-grid-os">
          {/* Cooking Agent - Double Width */}
          <div className="agent-card-os wide">
            <div className="os-card-header">
              <span className="os-agent-emoji">🧑‍🍳</span>
              <span className="os-agent-name">Cooking Agent</span>
            </div>
            <p className="os-agent-desc">Orchestrates cooking using available tools and ingredients</p>
            <div className="os-agent-actions">
              <button
                className="os-btn os-btn-primary"
                onClick={() => currentOrder && onCookWithGemini(currentOrder.name)}
                disabled={!currentOrder || isCooking}
              >
                {isCooking ? 'Cooking...' : currentOrder ? `Start cooking '${currentOrder.name}'` : 'Start an order'}
              </button>
              <button
                className="os-btn"
                onClick={onOpenCookingAgent}
                disabled={isCookingAgentOpen}
              >
                <span className="material-symbols-outlined">search</span>
                Open
              </button>
            </div>
          </div>

          {/* Alchemy Agent */}
          <div className="agent-card-os">
            <div className="os-card-header">
              <span className="os-agent-emoji">🧑‍🔬</span>
              <span className="os-agent-name">Alchemy Agent</span>
            </div>
            <p className="os-agent-desc">Determines results of cooking actions</p>
            <div className="os-agent-actions">
              <button
                className="os-btn"
                onClick={onOpenCombinationAgent}
                disabled={isAlchemyAgentOpen}
              >
                <span className="material-symbols-outlined">search</span>
                Open
              </button>
            </div>
          </div>

          {/* Judge Agent */}
          <div className="agent-card-os">
            <div className="os-card-header">
              <span className="os-agent-emoji">🧑‍⚖️</span>
              <span className="os-agent-name">Judge Agent</span>
            </div>
            <p className="os-agent-desc">Verifies if served dishes match orders</p>
            <div className="os-agent-actions">
              <button
                className="os-btn"
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
          onClose={() => {
            setShowRecipeSteps(false);
            setIsRecipePinned(false);
          }} 
          isLoading={isFetchingSteps}
          orderName={currentOrder.name}
          difficulty={currentOrder.difficulty}
          isPinned={isRecipePinned}
          onPinToggle={() => setIsRecipePinned(!isRecipePinned)}
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
        }
      }
    };

    // Listen for log events
    (client as any).on('log', handleLog);
    return () => {
      (client as any).off('log', handleLog);
    };
  }, [client]);

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

      setActiveAction(actionName);
      setActionTriggerCount(prev => prev + 1);
      setActiveIngredients(new Set(ingredients));

      try {
        // Apply faster_ai and time_dilation upgrade delay
        const baseDelay = 1500;
        let speedMultiplier = stats.purchasedUpgrades?.includes('faster_ai') ? 0.5 : 1;
        if (stats.purchasedUpgrades?.includes('time_dilation')) {
          speedMultiplier *= 0.75; // Additional 25% reduction
        }
        await new Promise(resolve => setTimeout(resolve, baseDelay * speedMultiplier));

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
        if (!(stats.usedTools || []).includes(action.name)) {
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
  }, [client, sendMessage, setActiveAction, setActionTriggerCount, setActiveIngredients, setInventory, executeCombinationRef, onServe, onPass, inventory]);

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
  verifyServedDishRef: React.MutableRefObject<((servedDishName: string) => Promise<boolean>) | null>;
  stats: any;
  setStats: React.Dispatch<React.SetStateAction<any>>;
  currentOrderSteps: {tool: string, ingredients: string[], result: string}[];
  setCompletedRecipes: React.Dispatch<React.SetStateAction<CompletedRecipe[]>>;
  setCurrentOrderSteps: React.Dispatch<React.SetStateAction<{tool: string, ingredients: string[], result: string}[]>>;
}

function VerificationAgent({
  orders,
  inventory,
  setOrders,
  verifyServedDishRef,
  stats,
  setStats,
  currentOrderSteps,
  setCompletedRecipes,
  setCurrentOrderSteps,
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
        return true; // Success, but no order to verify against
      }

      // Check each pending order for a match
      for (const order of inProgressOrders) {
        try {
          const prompt = `Order: "${order.name}"\nServed dish: "${servedDishName}"\n\nDoes this served dish match the order? Be lenient and use semantic matching. If it's a very similar dish or a common variation, it should match.`;

          const contents: Content[] = [
            { role: 'user', parts: [{ text: prompt }] }
          ];

          const response = await generateContent(contents);
          const text = response?.text || '{}';
          const result: VerificationResult = JSON.parse(text);

          // Apply confidence_boost upgrade
          let confidenceBonus = stats.purchasedUpgrades?.includes('confidence_boost') ? 0.1 : 0;
          if (stats.purchasedUpgrades?.includes('molecular_kit')) {
            confidenceBonus += 0.2;
          }
          const totalConfidence = result.confidence + confidenceBonus;

          if (result.matches && totalConfidence > 0.7) {
            // Apply auto_plating bonus: if confidence is high, treat as perfect
            const finalConfidence = (stats.purchasedUpgrades?.includes('auto_plating') && totalConfidence > 0.85) 
              ? 1.0 
              : totalConfidence;

            // Look up the emoji from inventory for the served dish
            const servedIngredient = findIngredientInInventory(servedDishName, inventoryRef.current);
            const servedEmoji = servedIngredient?.emoji || '✅';

            // Match found! Update order to completed with the served dish's emoji
            // Update stats for completed orders and max confidence
            // Apply better_prices upgrade
            let priceMultiplier = stats.purchasedUpgrades?.includes('better_prices') ? 1.5 : 1;
            if (stats.purchasedUpgrades?.includes('golden_whisk')) {
              priceMultiplier *= 2;
            }

            // Reward based on difficulty
            let baseReward = 50;
            if (order.difficulty === 'intermediate') baseReward = 100;
            else if (order.difficulty === 'difficult') baseReward = 250;
            else if (order.difficulty === 'nightmare') baseReward = 1000;

            const reward = Math.round(baseReward * priceMultiplier);

            // Save recipe
            setCompletedRecipes(prev => {
              // Avoid duplicates for the same order name
              if (prev.some(r => r.orderName === order.name)) return prev;
              
              const newRecipe: CompletedRecipe = {
                id: `recipe-${Date.now()}`,
                orderName: order.name,
                dishName: servedDishName,
                emoji: servedEmoji,
                timestamp: new Date().toISOString(),
                steps: [...currentOrderSteps]
              };
              return [newRecipe, ...prev];
            });

            // Clear steps for next order
            setCurrentOrderSteps([]);

            setStats((prev: any) => ({
              ...prev,
              completedOrders: prev.completedOrders + 1,
              completedNightmareOrders: order.difficulty === 'nightmare' 
                ? (prev.completedNightmareOrders || 0) + 1 
                : (prev.completedNightmareOrders || 0),
              money: (prev.money || 0) + reward,
              maxConfidence: Math.max(prev.maxConfidence || 0, finalConfidence),
              completedDishes: prev.completedDishes?.includes(order.name) 
                ? prev.completedDishes 
                : [...(prev.completedDishes || []), order.name]
            }));

            setOrders(prev => {
              const updatedOrders = prev.map(o =>
                o.id === order.id
                  ? { ...o, status: 'completed' as const, emoji: servedEmoji }
                  : o
              );

              // Add a new random order
              const difficulty = getRandomDifficulty();
              const pool = EXAMPLE_ORDERS.filter(o => o.difficulty === difficulty);
              // Pick a random one from the pool
              const randomTemplate = pool[Math.floor(Math.random() * pool.length)];
              
              const newOrder: Order = {
                ...randomTemplate,
                id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                status: 'not_started'
              };

              return [...updatedOrders, newOrder];
            });

            return true; // Found a match, return success
          }
        } catch (error) {
          console.error('Error verifying order:', error);
        }
      }

      // No match found - keep order in_progress so model can try again
      return false; // No match found, but order stays active
    };

    return () => {
      verifyServedDishRef.current = null;
    };
  }, [generateContent, setOrders, verifyServedDishRef]);

  // This component doesn't render anything
  return null;
}

// ============================================================================
// Kitchen App Container (Shared State)
// ============================================================================

function KitchenAppContainer({ user }: { user: User }) {
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Shared state lifted up to be accessible by both agents
  const [inventory, setInventory] = useState<Ingredient[]>(STARTING_INGREDIENTS);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set(PRESELECTED_INGREDIENTS)
  );
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionTriggerCount, setActionTriggerCount] = useState(0);
  const [activeIngredients, setActiveIngredients] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<Order[]>(() => {
    // Start with only easy orders
    return EXAMPLE_ORDERS.filter(o => o.difficulty === 'easy');
  });

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
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [stats, setStats] = useState({
    completedOrders: 0,
    money: 0,
    discoveredIngredients: STARTING_INGREDIENTS.length,
    usedToolsCount: 0,
    usedTools: [] as string[],
    maxConfidence: 0,
    maxIngredientsUsed: 0,
    completedDishes: [] as string[],
    completedNightmareOrders: 0,
    totalActions: 0,
    purchasedUpgrades: [] as string[],
    proPlan: false
  });
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);
  const [isUpgradesExpanded, setIsUpgradesExpanded] = useState(false);
  const [isRecipeBookExpanded, setIsRecipeBookExpanded] = useState(false);
  const [completedRecipes, setCompletedRecipes] = useState<CompletedRecipe[]>([]);
  const [currentOrderSteps, setCurrentOrderSteps] = useState<{tool: string, ingredients: string[], result: string}[]>([]);

  // 1. Load data from Firestore on mount
  useEffect(() => {
    if (!user) return;

    const gameStateRef = doc(db, 'game_states', user.uid);
    
    // Initial load
    const loadInitialData = async () => {
      try {
        // Test connection
        await getDocFromServer(doc(db, 'test', 'connection')).catch((err) => {
          console.warn("Connection test failed (expected if rules deny):", err.message);
        });
        
        const docSnap = await getDoc(gameStateRef).catch(err => handleFirestoreError(err, OperationType.GET, `game_states/${user.uid}`));
        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          const loadedStats = data.stats || stats;
          
          // Force Pro Plan for admin email
          if (user.email === 'robert.garcia.alsina2012@gmail.com') {
            setStats({ ...loadedStats, proPlan: true });
          } else {
            setStats(loadedStats);
          }
          
          setUnlockedAchievements(data.unlockedAchievements || []);
          setCompletedRecipes(data.completedRecipes || []);
          setTutorialStep(data.tutorialStep ?? 1);
          
          // Ensure STARTING_INGREDIENTS are always available, plus any discovered ones
          if (data.inventory) {
            const merged = [...STARTING_INGREDIENTS];
            data.inventory.forEach((ing: any) => {
              if (!merged.some(m => m.name.toLowerCase() === ing.name.toLowerCase())) {
                merged.push(ing);
              }
            });
            setInventory(merged);
          } else {
            setInventory(STARTING_INGREDIENTS);
          }
        } else {
          // Initialize new game state in Firestore
          await setDoc(gameStateRef, {
            uid: user.uid,
            money: 0,
            inventory: STARTING_INGREDIENTS,
            completedRecipes: [],
            unlockedAchievements: [],
            purchasedUpgrades: [],
            stats: user.email === 'robert.garcia.alsina2012@gmail.com' ? { ...stats, proPlan: true } : stats,
            tutorialStep: 1,
            lastUpdated: Timestamp.now()
          }).catch(err => handleFirestoreError(err, OperationType.WRITE, `game_states/${user.uid}`));
        }
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error loading game state:", error);
        setIsDataLoaded(true); // Proceed anyway to avoid getting stuck
      }
    };

    loadInitialData();

    // 2. Real-time sync (optional, but good for multi-device)
    const unsubscribe = onSnapshot(gameStateRef, (doc) => {
      if (doc.exists() && !isCooking) { // Avoid overwriting while cooking
        const data = doc.data();
        // We only sync stats and achievements from remote to local if they changed significantly
        // This is a simple implementation; a more robust one would use a version counter
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `game_states/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // 3. Save data to Firestore when it changes
  useEffect(() => {
    if (!user || !isDataLoaded) return;

    const saveTimeout = setTimeout(async () => {
      try {
        const gameStateRef = doc(db, 'game_states', user.uid);
        await setDoc(gameStateRef, {
          uid: user.uid,
          money: stats.money,
          inventory: inventory,
          completedRecipes: completedRecipes,
          unlockedAchievements: unlockedAchievements,
          purchasedUpgrades: stats.purchasedUpgrades,
          stats: stats,
          tutorialStep: tutorialStep,
          lastUpdated: Timestamp.now()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `game_states/${user.uid}`));
      } catch (error) {
        console.error("Error saving game state:", error);
      }
    }, 2000); // Debounce saves

    return () => clearTimeout(saveTimeout);
  }, [stats, unlockedAchievements, completedRecipes, tutorialStep, inventory, user.uid, isDataLoaded]);

  // Check for new achievements
  useEffect(() => {
    ACHIEVEMENTS.forEach(achievement => {
      if (!(unlockedAchievements || []).includes(achievement.id) && achievement.condition(stats)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        setRecentAchievement(achievement);
      }
    });
  }, [stats, unlockedAchievements]);

  // Upgrade Logic
  const buyUpgrade = useCallback((upgrade: Upgrade) => {
    if ((stats.money || 0) >= upgrade.cost && !(stats.purchasedUpgrades || []).includes(upgrade.id)) {
      setStats((prev: any) => ({
        ...prev,
        money: prev.money - upgrade.cost,
        purchasedUpgrades: [...(prev.purchasedUpgrades || []), upgrade.id]
      }));
    }
  }, [stats.money, stats.purchasedUpgrades]);

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
    // Clear steps when picking up a new order
    setCurrentOrderSteps([]);

    if (tutorialStep === 1) {
      const order = orders.find(o => o.id === orderId);
      if (order?.name === 'Fried Eggs') {
        setTutorialStep(2);
      }
    }

    setOrders(prev => {
      const inProgressOrders = prev.filter(o => o.status === 'in_progress');
      const maxSlots = stats.purchasedUpgrades?.includes('extra_slots') ? 5 : 1;
      
      let newOrders = [...prev];
      
      // If we're at the limit, reset the oldest in_progress order
      if (inProgressOrders.length >= maxSlots) {
        const oldestInProgress = inProgressOrders[0];
        newOrders = newOrders.map(o => 
          o.id === oldestInProgress.id ? { ...o, status: 'not_started' as const } : o
        );
      }

      // Set the selected order to in_progress
      return newOrders.map(order => 
        order.id === orderId ? { ...order, status: 'in_progress' as const } : order
      );
    });
  }, [stats.purchasedUpgrades]);

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
      {/* Tutorial Overlay */}
      {tutorialStep > 0 && tutorialStep <= TUTORIAL_STEPS.length && (
        <TutorialOverlay 
          step={TUTORIAL_STEPS[tutorialStep - 1]} 
          onClose={() => {
            setTutorialStep(0);
            localStorage.setItem('tutorialCompleted', 'true');
          }} 
        />
      )}

      {/* Combination Agent (Layer 1) - for manual cooking */}
      <GeminiAPIProvider>
        <CombinationAgent
          inventory={inventory}
          setInventory={setInventory}
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
          isUpgradesExpanded={isUpgradesExpanded}
          setIsUpgradesExpanded={setIsUpgradesExpanded}
          onBuyUpgrade={buyUpgrade}
          tutorialStep={tutorialStep}
          setTutorialStep={setTutorialStep}
          isRecipeBookExpanded={isRecipeBookExpanded}
          setIsRecipeBookExpanded={setIsRecipeBookExpanded}
          completedRecipes={completedRecipes}
          setCompletedRecipes={setCompletedRecipes}
          setCurrentOrderSteps={setCurrentOrderSteps}
          user={user}
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
          verifyServedDishRef={verifyServedDishRef}
          stats={stats}
          setStats={setStats}
          currentOrderSteps={currentOrderSteps}
          setCompletedRecipes={setCompletedRecipes}
          setCurrentOrderSteps={setCurrentOrderSteps}
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
        <a href="https://x.com/SoyCookie010" target="_blank" rel="noopener noreferrer">
          ItsCookie@
        </a>
      </footer>
    </div>
  );
}

// ============================================================================
// App Component
// ============================================================================

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1f94ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-[#1a1a1a] uppercase tracking-widest">Loading Kitchen...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {!user ? (
        <AuthScreen onAuthSuccess={(u) => setUser(u)} />
      ) : (
        <KitchenAppContainer user={user} />
      )}
    </ErrorBoundary>
  );
}

export default App;
