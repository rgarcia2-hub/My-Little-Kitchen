/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { MusicPlayer } from './src/components/MusicPlayer';

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
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, LogOut, Coffee, Heart, Copy, CheckCircle2, Camera, Upload, Trash2, Edit3, Palette, Target, TrendingUp, Coins, Award, Zap, Activity, Info, Database, RotateCcw, ShoppingBag, Bot, Cpu, Search, Lock } from "lucide-react";
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
  TITLES,
  XP_PER_DIFFICULTY,
  getLevelFromXP,
  getXPForLevel,
  FAME_LEVELS,
  SHOP_ITEMS,
  getCurrentFameLevel,
  ShopItem,
  FameLevel,
  OSTheme,
  OS_THEMES,
  SKILL_CHIPS,
  PERSONALITIES,
  GLOBAL_PROTOCOLS,
  GlobalProtocol,
  SousChefPersonality,
  MarketplaceOffer,
} from './constants';
import { soundService } from './src/services/soundService';

import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, getDocFromServer, Timestamp, query, orderBy, limit, getDocs, collection } from "firebase/firestore";
import { auth, db } from "./src/firebase";
import AuthScreen from "./src/components/AuthScreen";
import { AntigravityBackground } from "./src/components/AntigravityBackground";

const COSMETICS_LIST = [
  {
    id: 'banner_discord',
    type: 'banner',
    name: 'Clásico Culinario',
    price: 0,
    desc: 'El color azul representativo de nuestra propia cocina.',
    style: { bg: '#2563eb' }
  },
  {
    id: 'banner_neon',
    type: 'banner',
    name: 'Luces de Neón',
    price: 80,
    desc: 'Un gradiente cibernético animado con destellos.',
    style: { bg: 'linear-gradient(135deg, #ff007f, #7f00ff, #00f0ff)' }
  },
  {
    id: 'banner_sakura',
    type: 'banner',
    name: 'Pétalos de Sakura',
    price: 100,
    desc: 'Suaves tonos pastel rosados estilo cerezo en flor.',
    style: { bg: 'linear-gradient(120deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' }
  },
  {
    id: 'banner_cosmic',
    type: 'banner',
    name: 'Nebulosa Cósmica',
    price: 150,
    desc: 'Fondo espacial profundo con estrellas brillantes.',
    style: { bg: 'linear-gradient(220deg, #0d1b2a, #1b263b, #415a77)' }
  },
  {
    id: 'banner_gold',
    type: 'banner',
    name: 'Resplandor Dorado',
    price: 200,
    desc: 'Prestigio dorado de lujo para chefs consolidados.',
    style: { bg: 'linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7)' }
  },
  {
    id: 'banner_matrix',
    type: 'banner',
    name: 'Código Hacker Matrix',
    price: 180,
    desc: 'Líneas cayendo en cascada en tu terminal de cocina.',
    style: { bg: 'linear-gradient(180deg, #0f0c20, #001a00, #050d05)' }
  },
  {
    id: 'border_none',
    type: 'border',
    name: 'Sin Decoración',
    price: 0,
    desc: 'Borde limpio, estilo clásico.',
    className: ''
  },
  {
    id: 'border_gaming',
    type: 'border',
    name: 'Chroma Gamer RGB',
    price: 120,
    desc: 'Un aro con luces RGB rotatorias súper fluidas.',
    className: 'border-gaming-chroma'
  },
  {
    id: 'border_cute',
    type: 'border',
    name: 'Orejas de Gato Pink',
    price: 100,
    desc: 'Adorables orejitas de gato rosadas colocadas sobre tu avatar.',
    className: 'border-cute-cat'
  },
  {
    id: 'border_fire',
    type: 'border',
    name: 'Corona de Fuego Brutal',
    price: 150,
    desc: 'Aro envuelto en llamas intensas animadas.',
    className: 'border-fire-ring'
  },
  {
    id: 'border_frost',
    type: 'border',
    name: 'Cristal de Escarcha',
    price: 150,
    desc: 'Un helado marco de hielo ártico resplandeciente.',
    className: 'border-frost-crystals'
  },
  {
    id: 'border_gold',
    type: 'border',
    name: 'Corona Real de Oro',
    price: 220,
    desc: 'Borde áureo enjoyado con la máxima suntuosidad.',
    className: 'border-gold-crown'
  },
  {
    id: 'border_early',
    type: 'border',
    name: 'Gorra de Cocinero',
    price: 80,
    desc: 'Una preciosa gorrita de cocinero decorativa.',
    className: 'border-chef-hat'
  },
  {
    id: 'badge_nitro',
    type: 'badge',
    name: 'Chef Booster VIP',
    price: 100,
    desc: 'La codiciada insignia del rayo rosa por tu pasión en la cocina (suscripción ficticia para tu perfil).',
    className: ''
  }
];
import { handleFirestoreError, OperationType } from "./src/lib/firestore-errors";
import { StripeCheckoutModal } from "./src/components/StripeCheckoutModal";

const VERIFIED_BADGE_URL = "/verified.png?v=3.0";
const ADMIN_EMAILS = ['robert.garcia.alsina2012@gmail.com', 'gianlucaperalta555@gmail.com'];

// ============================================================================
// AdSense Component
// ============================================================================

interface AdSenseProps {
  client: string;
  slot: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
}

const AdSenseUnit: React.FC<AdSenseProps> = ({ client, slot, format = 'auto', responsive = 'true', style }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="adsense-container" style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

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
  targetType?: 'order' | 'ingredient' | 'action' | 'other';
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
    text: "¡Genial! Tienes un pedido en curso. La IA conoce todas las recetas, pulsa sobre 'Get Steps' (el icono con la bombilla) para ver las instrucciones.",
    highlightId: 'get-steps',
    targetType: 'other',
    targetName: 'get-steps'
  },
  {
    id: 3,
    text: "La IA te ha dado los pasos. Busca los ingredientes en tu inventario y combínalos utilizando la acción que te haya indicado.",
    highlightId: 'inventory',
    targetType: 'other',
    targetName: 'inventory'
  },
  {
    id: 4,
    text: "Una vez completado el plato de 'Fried Eggs', selecciónalo en tu inventario y pulsa la tecla 'serve' para completar la comanda.",
    highlightId: 'serve',
    targetType: 'action',
    targetName: 'serve'
  },
  {
    id: 5,
    text: "¡Perfecto! Para progresar, usa 'KITCHEN_OS_SYSTEM_CONTROL // MODULE_SELECTOR'. En LOGIC_CORE cambias a la IA, en SKILL_CHIPS mejoras, en PROTOCOLS activas retos y en MARKETPLACE comercias con ingredientes. Puedes cerrar este tutorial.",
    highlightId: 'system-control',
    targetType: 'other',
    targetName: 'system-control'
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
// Daily Challenge Components
// ============================================================================

function DailyChallenges({ 
  challenges, 
  onClaim, 
  isExpanded = false, 
  onToggle 
}: { 
  challenges: any[], 
  onClaim: (id: string, reward: number) => void,
  isExpanded?: boolean,
  onToggle?: () => void
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'orders': return <Target size={14} className="text-blue-400" />;
      case 'discovery': return <Zap size={14} className="text-yellow-400" />;
      case 'money': return <Coins size={14} className="text-green-400" />;
      default: return <Activity size={14} />;
    }
  };

  return (
    <div className={`daily-challenges-widget ${isExpanded ? 'expanded-overlay' : ''}`}>
      <div className="challenges-header">
        <div className="header-left">
          <Award size={18} className="text-[#1a1a1a]" />
          <h3 className="header-title">DAILY_PROTOCOLS</h3>
        </div>
        <div className="header-actions">
          <div className="header-status mr-4">
            <span className="live-dot"></span>
            ACTIVE_SESSION
          </div>
          <button 
            className="os-btn-mini" 
            onClick={onToggle}
            title={isExpanded ? "Collapse" : "Expand to full screen"}
          >
            {isExpanded ? 'COLLAPSE' : 'FULL_SCREEN'}
          </button>
        </div>
      </div>
      
      <div className="status-marquee-container">
        <div className="status-marquee">
          <span>SYSTEM_STABLE // NO_LEAKS_DETECTED // MONITORING_CHEF_OUTPUT // FEEDBACK_LOOP_ACTIVE // ERROR_CHECK_OK // </span>
          <span>SYSTEM_STABLE // NO_LEAKS_DETECTED // MONITORING_CHEF_OUTPUT // FEEDBACK_LOOP_ACTIVE // ERROR_CHECK_OK // </span>
        </div>
      </div>

      <div className="challenges-list">
        <AnimatePresence mode="popLayout">
          {challenges.map((challenge, index) => {
            const progress = Math.min(100, (challenge.current / challenge.target) * 100);
            const isReady = challenge.current >= challenge.target && !challenge.completed;
            
            return (
              <motion.div 
                key={challenge.id} 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`challenge-row ${challenge.completed ? 'completed' : ''} ${isReady ? 'ready-to-claim' : ''}`}
              >
                <div className="challenge-index">{(index + 1).toString().padStart(2, '0')}</div>
                <div className="challenge-main">
                  <div className="challenge-name-row">
                    <div className="challenge-label">
                      {getIcon(challenge.type)}
                      <span className="challenge-title">{challenge.title}</span>
                    </div>
                    
                    {challenge.completed ? (
                      <span className="status-badge completed">
                        <CheckCircle2 size={10} />
                        SYNC_SUCCESS
                      </span>
                    ) : isReady ? (
                      <span className="status-badge ready">
                        <TrendingUp size={10} />
                        READY_FOR_EXTRACTION
                      </span>
                    ) : (
                      <span className="status-badge pending">
                        PROCESSING_{Math.floor(progress)}%
                      </span>
                    )}
                  </div>
                  
                  <div className="challenge-desc">
                    {challenge.description}
                  </div>

                  <div className="challenge-progress-stack">
                    <div className="challenge-progress-container">
                      <motion.div 
                        className={`challenge-progress-fill ${isReady ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-400'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        <div className="scanline"></div>
                      </motion.div>
                    </div>
                    <div className="progress-metrics">
                      <span className="progress-digits">{challenge.current} <span className="text-white/30">/</span> {challenge.target}</span>
                      <span className="reward-tag">
                        <Coins size={10} />
                        ${challenge.reward}
                      </span>
                    </div>
                  </div>

                  {isReady && (
                    <motion.button 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="claim-challenge-btn-improved"
                      onClick={() => onClaim(challenge.id, challenge.reward)}
                    >
                      <Zap size={14} className="mr-2" />
                      <span>INITIALIZE_REWARD_TRANSFER</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="challenges-footer-detail">
        <Info size={10} />
        <span>RESETS_EVERY_24H_UTC // PERFECTION_REQUIRED</span>
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

interface GlitchedTitleProps {
  title: string;
  className?: string;
}

function GlitchedTitle({ title, className = "" }: GlitchedTitleProps) {
  return (
    <div className={`glitched-title-container ${className}`}>
      <div className="glitched-title-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" style={{ '--i': i } as any}></div>
        ))}
      </div>
      <span className="glitched-title-text" data-text={title}>
        {title}
      </span>
    </div>
  );
}

function getChefBadges(chefStats: any, chefEmail: string | null) {
  const list: { id: string; name: string; emoji: string; category: string; desc: string; isDifficult?: boolean }[] = [];
  
  if (ADMIN_EMAILS.includes(chefEmail || '') || chefStats?.godTier) {
    list.push({
      id: 'badge_dev_staff',
      name: 'Early Chef Dev',
      emoji: '🛠️',
      category: 'staff',
      desc: 'Desarrollador / Early Contributor de este sistema culinario.'
    });
  }
  
  if ((chefStats?.discoveredIngredients || 0) >= 25) {
    list.push({
      id: 'badge_combo_god',
      name: 'Master Combinador',
      emoji: '🌀',
      category: 'achievement',
      desc: '¡Logro Súper Difícil! Encontraste +25 ingredientes diferentes.',
      isDifficult: true
    });
  }
  
  if ((chefStats?.completedNightmareOrders || 0) >= 3) {
    list.push({
      id: 'badge_nightmare',
      name: 'Pesadilla Dominada',
      emoji: '💀',
      category: 'achievement',
      desc: '¡Logro Súper Difícil! Completaste 3 o más órdenes en dificultad Pesadilla.',
      isDifficult: true
    });
  }
  
  if ((chefStats?.money || 0) >= 3000) {
    list.push({
      id: 'badge_millionaire',
      name: 'Chef Millonario',
      emoji: '💎',
      category: 'achievement',
      desc: '¡Logro Súper Difícil! Acumulaste un saldo superior a $3,000 cash.',
      isDifficult: true
    });
  }
  
  if ((chefStats?.purchasedCosmetics || []).includes('badge_nitro')) {
    list.push({
      id: 'badge_nitro_active',
      name: 'Chef Booster VIP',
      emoji: '⚡',
      category: 'subscription',
      desc: 'Insignia de Suscriptor Booster de My Little Kitchen. ¡Gracias por el apoyo!'
    });
  }
  
  if ((chefStats?.completedOrders || 0) >= 15) {
    list.push({
      id: 'badge_active_cook',
      name: 'Cocinero Activo',
      emoji: '🔥',
      category: 'game',
      desc: 'Completaste más de 15 comandas culinarias con éxito.'
    });
  }
  
  if (chefStats?.equippedHypeSquad === 'hype_bravery') {
    list.push({
      id: 'badge_hype_bravery',
      name: 'Gremio del Fuego',
      emoji: '🔥',
      category: 'hypesquad',
      desc: 'Miembro honorable del Gremio del Fuego de My Little Kitchen.'
    });
  } else if (chefStats?.equippedHypeSquad === 'hype_brilliance') {
    list.push({
      id: 'badge_hype_brilliance',
      name: 'Gremio Dulce',
      emoji: '🔮',
      category: 'hypesquad',
      desc: 'Miembro honorable del Gremio Dulce de My Little Kitchen.'
    });
  } else if (chefStats?.equippedHypeSquad === 'hype_balance') {
    list.push({
      id: 'badge_hype_balance',
      name: 'Gremio Umami',
      emoji: '⚖️',
      category: 'hypesquad',
      desc: 'Miembro honorable del Gremio Umami de My Little Kitchen.'
    });
  }
  
  if ((chefStats?.fameDonated || 0) >= 500) {
    list.push({
      id: 'badge_fame_titan',
      name: 'Titán de la Fama',
      emoji: '✨',
      category: 'game',
      desc: 'Donaste más de $500 en la terminal de Fama.'
    });
  }
  
  return list;
}

interface LeaderboardProps {
  data: any[];
  isLoading: boolean;
  onClose: () => void;
}

function Leaderboard({ data, isLoading, onClose }: LeaderboardProps) {
  return (
    <div className="os-modal-overlay" onClick={onClose}>
      <div className="os-leaderboard-card" onClick={e => e.stopPropagation()}>
        <div className="os-modal-header-green-alt">
          <div className="header-left-group">
            <span className="os-modal-icon">📊</span>
            <span className="os-modal-title">GLOBAL_RANKINGS_v2.4</span>
          </div>
          <button className="os-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="os-leaderboard-body">
          {isLoading ? (
            <div className="os-loading-state">
              <div className="os-spinner"></div>
              <span>FETCHING_DATA...</span>
            </div>
          ) : (
            <div className="os-table-container">
              <div className="os-table-header">
                <span className="col-rank">#</span>
                <span className="col-chef">CHEF_ID</span>
                <span className="col-money">CAPITAL</span>
                <span className="col-level">LVL</span>
              </div>
              <div className="os-table-rows">
                {data.length === 0 ? (
                  <div className="os-empty-state">NO_ACTIVE_CHEFS_FOUND</div>
                ) : (
                  data.map((entry, index) => (
                    <div key={entry.uid} className="os-table-row">
                      <span className="col-rank">{index + 1}</span>
                      <div className="col-chef os-chef-cell">
                        <div className="os-avatar-mini">
                          {entry.photoURL ? (
                            <img src={entry.photoURL} alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="os-avatar-placeholder">{entry.displayName[0]}</div>
                          )}
                        </div>
                        <div className="os-chef-info">
                          <div className="flex items-center gap-1">
                            <span className="os-chef-name">
                              {entry.displayName}
                            </span>
                            {(ADMIN_EMAILS.includes(entry.email || '') || (entry.displayName === 'VERIFIEDROBY' && entry.money > 1000000)) && (
                              <img 
                                src={VERIFIED_BADGE_URL} 
                                alt="Verified" 
                                style={{ width: '14px', height: '14px' }}
                                className="flex-shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          <span className="os-chef-title">{entry.customTitle || entry.title}</span>
                        </div>
                      </div>
                      <span className="col-money">${entry.money.toLocaleString()}</span>
                      <span className="col-level">[{entry.level}]</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="os-leaderboard-footer">
          <div className="footer-status">SYSTEM_STATUS: ONLINE</div>
          <div className="footer-timestamp">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}

interface IngredientTileProps {
  ingredient: Ingredient;
  isSelected: boolean;
  isActive: boolean;
  isDisabled: boolean;
  isHighlighted?: boolean;
  onClick: () => void;
  onEdit?: () => void;
}

function IngredientTile({ ingredient, isSelected, isActive, isDisabled, isHighlighted, onClick, onEdit }: IngredientTileProps) {
  const rarityClass = ingredient.rarity ? `rarity-${ingredient.rarity}` : 'rarity-common';
  const isCrumble = ingredient.name.toLowerCase() === 'crumble cookie';
  
  return (
    <button
      className={`ingredient-tile ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''} ${isHighlighted ? 'tutorial-highlight' : ''} ${rarityClass}`}
      onClick={onClick}
      title={isSelected ? `Click to deselect ${ingredient.name} (${ingredient.rarity || 'common'})` : `Click to select ${ingredient.name} (${ingredient.rarity || 'common'})`}
      data-ingredient={ingredient.name}
      disabled={isDisabled}
    >
      <div className="rarity-indicator"></div>
      {ingredient.trait && <div className="ingredient-trait-tag">{ingredient.trait}</div>}
      {ingredient.price !== undefined && <div className="ingredient-price-tag">${ingredient.price}</div>}
      
      {isCrumble && (
        <div 
          className="edit-cookie-trigger" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          title="Customize your Crumble Cookie"
        >
          <Edit3 size={12} />
        </div>
      )}
      <div className="hover-tooltip">{ingredient.name}</div>
      <span className="emoji">{ingredient.emoji}</span>
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
  isDisabled?: boolean;
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

  const rarityClass = order.rarity ? `rarity-${order.rarity}` : '';

  return (
    <div className={`order-card ${statusClass} ${isDisabled ? 'disabled' : ''} ${isHighlighted ? 'tutorial-highlight' : ''} ${rarityClass}`}>
      {order.difficulty && (
        <div className={`order-difficulty ${difficultyClass}`}>
          {order.difficulty === 'chromatic' || order.rarity === 'chromatic' ? 'Chromatic' : order.difficulty}
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

interface ManifestationToastProps {
  result: { name: string, emoji: string, isDuplicate: boolean };
  onClose: () => void;
}

function ManifestationToast({ result, onClose }: ManifestationToastProps) {
  const isError = result.name === "Failed to Manifest";
  
  return (
    <div className={`manifestation-toast ${result.isDuplicate ? 'duplicate' : ''} ${isError ? 'error' : ''}`}>
      <div className="manifestation-emoji">{result.emoji}</div>
      <div className="manifestation-content">
        <span className="manifestation-label">{isError ? 'System Error' : 'Manifestation Successful'}</span>
        <span className="manifestation-name">{result.name}</span>
        <div className="manifestation-status">
          {isError ? 'RETRY_REQUIRED' : result.isDuplicate ? 'ALREADY_IN_INVENTORY' : 'NEW_DISCOVERY'}
        </div>
      </div>
      <button className="achievement-toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

// ============================================================================
// Crumble Cookie Customizer Component
// ============================================================================

interface ChromaticMinigameProps {
  order: Order;
  onSuccess: () => void;
  onFail: () => void;
}

function ChromaticMinigame({ order, onSuccess, onFail }: ChromaticMinigameProps) {
  const [phase, setPhase] = useState<'preview' | 'playing' | 'result'>('preview');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('Stabilize the Chromatic Singularity');
  
  const colors = [
    { id: 0, name: 'Cyan', color: '#00ffff', pulse: 'shadow-[0_0_20px_rgba(0,255,255,0.8)]' },
    { id: 1, name: 'Magenta', color: '#ff00ff', pulse: 'shadow-[0_0_20px_rgba(255,0,255,0.8)]' },
    { id: 2, name: 'Yellow', color: '#ffff00', pulse: 'shadow-[0_0_20px_rgba(255,255,0,0.8)]' },
    { id: 3, name: 'Lime', color: '#00ff00', pulse: 'shadow-[0_0_20px_rgba(0,255,0,0.8)]' },
  ];

  const startLevel = useCallback(() => {
    const newSequence = Array.from({ length: 5 }, () => Math.floor(Math.random() * 4));
    setSequence(newSequence);
    setPlayerSequence([]);
    setPhase('preview');
    
    // Play sequence
    let i = 0;
    const interval = setInterval(() => {
      if (i >= newSequence.length) {
        clearInterval(interval);
        setFlashIndex(null);
        setPhase('playing');
        setMessage('YOUR TURN: REPEAT PROTOCOL');
        return;
      }
      setFlashIndex(newSequence[i]);
      soundService.playType();
      
      setTimeout(() => {
        setFlashIndex(null);
      }, 400);
      
      i++;
    }, 700);
  }, []);

  useEffect(() => {
    setTimeout(startLevel, 1000);
  }, [startLevel]);

  const handleColorClick = (id: number) => {
    if (phase !== 'playing') return;
    
    const newPlayerSeq = [...playerSequence, id];
    setPlayerSequence(newPlayerSeq);
    setFlashIndex(id);
    soundService.playClick();
    
    setTimeout(() => {
      setFlashIndex(null);
    }, 200);

    // Check if correct
    if (id !== sequence[newPlayerSeq.length - 1]) {
      setPhase('result');
      setMessage('FREQUENCY_MISMATCH: STABILIZATION_FAILED');
      soundService.playError();
      setTimeout(onFail, 2000);
      return;
    }

    // Check if won
    if (newPlayerSeq.length === sequence.length) {
      setPhase('result');
      setMessage('HARMONY_ACHIEVED: SINGULARITY_STABLE');
      soundService.playSuccess();
      setTimeout(onSuccess, 1500);
    }
  };

  return (
    <div className="os-modal-overlay z-[11000]" onClick={(e) => e.stopPropagation()}>
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="os-modal-card bg-[#050505] border-4 border-white p-0 overflow-hidden max-w-md w-full shadow-[0_0_100px_rgba(255,255,255,0.1)]"
      >
        <div className="bg-white text-black p-4 flex justify-between items-center font-black tracking-widest text-[10px]">
          <span>CHROMATIC_STABILIZER_V1.0</span>
          <span className="animate-pulse">● LIVE_FREQ</span>
        </div>

        <div className="p-10 flex flex-col items-center relative">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">
              Spectral <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-white to-gray-400">Harmonizer</span>
            </h2>
            <div className="flex bg-[#111] px-3 py-1 rounded-full border border-[#222] items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{order.name}_PROTOCOL_042</p>
            </div>
          </div>

          <div className="relative mb-10 p-8">
             {/* Target Emoji in center */}
             <motion.div 
               animate={phase === 'playing' ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] } : {}}
               transition={{ duration: 2, repeat: Infinity }}
               className="relative z-20 text-7xl drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
             >
               {order.emoji}
             </motion.div>

             {/* Circular scanner effect around emoji */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/5 rounded-full"></div>
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-t-2 border-cyan-500/30 rounded-full"
             ></motion.div>
             <motion.div 
               animate={{ rotate: -360 }} 
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border-b-2 border-magenta-500/30 rounded-full"
             ></motion.div>

             {/* Interaction Nodes */}
             {colors.map((c, i) => {
               // Position around the circle
               const angle = (i * 90) - 45;
               const radius = 85;
               const x = Math.cos(angle * Math.PI / 180) * radius;
               const y = Math.sin(angle * Math.PI / 180) * radius;

               return (
                 <motion.button
                   key={c.id}
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => handleColorClick(c.id)}
                   className={`absolute w-12 h-12 rounded-full transition-all duration-200 border-2 z-30 flex items-center justify-center ${
                     flashIndex === c.id ? 'border-white bg-white scale-125 ' + c.pulse : 'border-current opacity-60 hover:opacity-100 hover:scale-110'
                   }`}
                   style={{ 
                     color: c.color, 
                     left: `calc(50% + ${x}px)`, 
                     top: `calc(50% + ${y}px)`,
                     transform: 'translate(-50%, -50%)',
                     boxShadow: flashIndex === c.id ? `0 0 30px ${c.color}` : 'none'
                   }}
                 >
                   <div className="w-4 h-4 rounded-full border border-current opacity-50"></div>
                 </motion.button>
               );
             })}
          </div>

          <div className="w-full bg-black/50 backdrop-blur-sm p-4 border border-white/10 rounded-sm font-mono text-center">
            <p className={`text-[10px] font-bold tracking-[0.2em] uppercase ${phase === 'result' ? (message.includes('FAILED') ? 'text-red-500' : 'text-[#00ff00]') : 'text-gray-400'}`}>
              <span className="opacity-50">&gt;&gt;</span> {message}
            </p>
            {phase === 'playing' && (
              <div className="mt-3 flex justify-center gap-2">
                {sequence.map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={false}
                    animate={{ 
                      backgroundColor: i < playerSequence.length ? '#fff' : '#222',
                      scale: i === playerSequence.length ? 1.2 : 1
                    }}
                    className="h-1.5 w-6 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-magenta-500 to-yellow-500"></div>
      </motion.div>
    </div>
  );
}

interface CrumbleCookieCustomizerProps {
  onClose: () => void;
  onSave: (customization: any) => void;
}

function CrumbleCookieCustomizer({ onClose, onSave }: CrumbleCookieCustomizerProps) {
  const [glazing, setGlazing] = useState('none');
  const [toppings, setToppings] = useState<string[]>([]);
  const [flavor, setFlavor] = useState('classic');

  const flavors = [
    { id: 'classic', name: 'Classic Vanilla', emoji: '🍪' },
    { id: 'choco', name: 'Double Chocolate', emoji: '🍩' },
    { id: 'velvet', name: 'Red Velvet', emoji: '🔴' },
    { id: 'chromatic', name: 'Chromatic Chaos', emoji: '🌈' },
  ];

  const glazings = [
    { id: 'none', name: 'None' },
    { id: 'cream', name: 'Buttercream', color: '#fffbfa' },
    { id: 'choco', name: 'Chocolate Ganache', color: '#3e2723' },
    { id: 'strawberry', name: 'Strawberry Drizzle', color: '#ff80ab' },
    { id: 'chromatic', name: 'Chromatic Frosting', color: 'rainbow' },
  ];

  const possibleToppings = [
    { id: 'chips', name: 'Choco Chips', emoji: '🍫' },
    { id: 'sprinkles', name: 'Rainbow Sprinkles', emoji: '✨' },
    { id: 'walnuts', name: 'Walnuts', emoji: '🌰' },
    { id: 'strawberry', name: 'Fresh Strawberry', emoji: '🍓' },
  ];

  const toggleTopping = (id: string) => {
    setToppings(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <div className="customizer-overlay" onClick={onClose}>
      <div className="customizer-card" onClick={e => e.stopPropagation()}>
        <div className="customizer-header">
          <h2 className="customizer-title">Crumble Design Studio</h2>
          <button onClick={onClose} className="recipe-steps-close">✕</button>
        </div>
        <div className="customizer-body">
          <div className="cookie-preview-section">
            <div className={`cookie-visual ${flavor === 'chromatic' || glazing === 'chromatic' ? 'rarity-chromatic' : ''}`}>
              {flavors.find(f => f.id === flavor)?.emoji}
            </div>
            {glazing !== 'none' && (
               <div 
                 className="cookie-decoration" 
                 style={{ 
                   color: glazings.find(g => g.id === glazing)?.color === 'rainbow' ? 'transparent' : glazings.find(g => g.id === glazing)?.color,
                   top: '40%',
                   fontSize: '120px',
                   opacity: 0.7,
                   WebkitTextStroke: glazing === 'chromatic' ? '0' : '2px #1a1a1a'
                 } as any}
               >
                 {glazing === 'chromatic' ? '✨' : '💧'}
               </div>
            )}
            <div className="toppings-container">
               {toppings.map((t, i) => (
                 <span key={t} className="cookie-decoration" style={{ transform: `rotate(${i * 45}deg) translate(80px)` }}>
                   {possibleToppings.find(pt => pt.id === t)?.emoji}
                 </span>
               ))}
            </div>
          </div>
          <div className="customizer-options">
            <div className="option-group">
              <h4>Select Base Flavor</h4>
              <div className="option-buttons">
                {flavors.map(f => (
                  <button 
                    key={f.id} 
                    className={`option-btn ${flavor === f.id ? 'active' : ''}`}
                    onClick={() => setFlavor(f.id)}
                  >
                    {f.emoji} {f.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="option-group">
              <h4>Frosting / Glazing</h4>
              <div className="option-buttons">
                {glazings.map(g => (
                  <button 
                    key={g.id} 
                    className={`option-btn ${glazing === g.id ? 'active' : ''}`}
                    onClick={() => setGlazing(g.id)}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="option-group">
              <h4>Add Toppings</h4>
              <div className="option-buttons">
                {possibleToppings.map(t => (
                  <button 
                    key={t.id} 
                    className={`option-btn ${toppings.includes(t.id) ? 'active' : ''}`}
                    onClick={() => toggleTopping(t.id)}
                  >
                    {t.emoji} {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="customizer-footer">
          <button className="cancel-cookie-btn" onClick={onClose}>Cancel</button>
          <button className="save-cookie-btn" onClick={() => onSave({ flavor, glazing, toppings })}>
            Finalize Chromatic Creation
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Recipe Steps Component
// ============================================================================

interface RecipeStepsDisplayProps {
  steps: RecipeStep[];
  onClose: () => void;
  onRetry: () => void;
  isLoading: boolean;
  orderName: string;
  difficulty?: string;
  adsDisabled?: boolean;
  proPlan?: boolean;
  godTier?: boolean;
}

function RecipeStepsDisplay({ 
  steps, 
  onClose, 
  onRetry, 
  isLoading, 
  orderName, 
  difficulty, 
  adsDisabled,
  proPlan,
  godTier
}: RecipeStepsDisplayProps) {
  const isProtected = difficulty === 'difficult' || difficulty === 'nightmare';
  const [isBlackedOut, setIsBlackedOut] = useState(false);

  useEffect(() => {
    if (!isProtected) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsBlackedOut(true);
      }
    };

    const handleBlur = () => {
      setIsBlackedOut(true);
    };

    const handleFocus = () => {
      // Small delay before revealing to discourage quick switching
      setTimeout(() => setIsBlackedOut(false), 500);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isProtected]);

  return (
    <div className={`recipe-steps-overlay ${isProtected ? 'protected-mode' : ''}`}>
      <div className={`recipe-steps-modal ${isBlackedOut ? 'blacked-out' : ''}`}>
        {isBlackedOut && isProtected && (
          <div className="blackout-shield">
            <div className="blackout-content">
              <Camera size={48} className="blackout-icon" />
              <h3>CAPTURA BLOQUEADA</h3>
              <p>Los chefs legendarios guardan sus secretos.</p>
              <p className="blackout-sub">Vuelve a la pestaña para ver la receta.</p>
            </div>
          </div>
        )}
        <div className="recipe-steps-header">
          <div className="recipe-steps-header-text">
            <h3 className="recipe-steps-title">Cooking Guide: {orderName}</h3>
            <p className="recipe-steps-subtitle">Follow these steps using the tools and ingredients below</p>
          </div>
          <div className="recipe-steps-header-actions">
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
              <p>The master chef is stumped by this dish!</p>
              <button 
                className="os-btn os-btn-primary mt-4"
                onClick={onRetry}
              >
                Ask again
              </button>
            </div>
          ) : (
            <div className={`recipe-steps-list ${isProtected ? 'select-none' : ''}`}>
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
        
        {/* Ad Slot: Recipe Footer */}
        {!adsDisabled && !proPlan && !godTier && (
          <div className="recipe-ad-footer">
             <div className="ad-label-small">ADSENSE_DATA_FLOW</div>
             <AdSenseUnit 
               client="ca-pub-7391663215396578" 
               slot="YOUR_SLOT_ID_2" 
               style={{ minHeight: '50px' }}
             />
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
  terminalLogs: string[];
  setTerminalLogs: React.Dispatch<React.SetStateAction<string[]>>;
  addTerminalLog: (msg: string) => void;
  showFameLevelError: boolean;
  setShowFameLevelError: React.Dispatch<React.SetStateAction<boolean>>;
  showFameRankUp: {tier: string, stage: number, emoji: string} | null;
  setShowFameRankUp: React.Dispatch<React.SetStateAction<{tier: string, stage: number, emoji: string} | null>>;
  tutorialStep: number;
  setTutorialStep: React.Dispatch<React.SetStateAction<number>>;
  isRecipeBookExpanded: boolean;
  setIsRecipeBookExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  completedRecipes: CompletedRecipe[];
  setCompletedRecipes: React.Dispatch<React.SetStateAction<CompletedRecipe[]>>;
  setCurrentOrderSteps: React.Dispatch<React.SetStateAction<{tool: string, ingredients: string[], result: string}[]>>;
  user: User;
  onTogglePin?: (order: Order) => void;
  getPinCost?: (order: Order) => number;
  manifestationName: string;
  setManifestationName: React.Dispatch<React.SetStateAction<string>>;
  manifestationEmoji: string;
  setManifestationEmoji: React.Dispatch<React.SetStateAction<string>>;
  customToolName: string;
  setCustomToolName: React.Dispatch<React.SetStateAction<string>>;
  customToolEmoji: string;
  setCustomToolEmoji: React.Dispatch<React.SetStateAction<string>>;
  customTools: KitchenAction[];
  setCustomTools: React.Dispatch<React.SetStateAction<KitchenAction[]>>;
  adminCustomTitle: string;
  setAdminCustomTitle: React.Dispatch<React.SetStateAction<string>>;
  fetchLeaderboard: () => Promise<void>;
  setIsLeaderboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLevelError: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLeaderboardOptIn: React.Dispatch<React.SetStateAction<boolean>>;
  onEditIngredient: (ingredient: Ingredient) => void;
  manifestationResult: { name: string, emoji: string, isDuplicate: boolean } | null;
  setManifestationResult: React.Dispatch<React.SetStateAction<{ name: string, emoji: string, isDuplicate: boolean } | null>>;
  currentFame: FameLevel | null;
  onPurchasePlan?: (planType: 'proPlan' | 'godTier' | 'musicPass') => void;
}

function GlobalProtocolBanner({ protocol, countdown }: { protocol: GlobalProtocol, countdown: number }) {
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="protocol-banner" style={{ borderColor: protocol.color }}>
      <div className="protocol-status-light animate-pulse" style={{ background: protocol.color }}></div>
      <div className="protocol-content">
        <span className="protocol-icon">{protocol.icon}</span>
        <span className="protocol-name">{protocol.name}</span>
        <span className="protocol-desc">[{protocol.description}]</span>
      </div>
      <div className="protocol-timer">
        ROTATION_IN: {formatTime(countdown)}
      </div>
    </div>
  );
}

function CookingWires() {
  return (
    <div className="cooking-table-wires">
      <svg className="wire-svg" viewBox="0 0 400 400">
        <path className="wire-path" d="M 0 100 Q 100 150 200 100 T 400 150" />
        <path className="wire-path" d="M 0 250 Q 150 200 250 300 T 400 250" style={{ animationDelay: '-1s' }} />
        <path className="wire-path" d="M 100 0 Q 150 150 100 250 T 150 400" style={{ animationDelay: '-2s' }} />
        <path className="wire-path" d="M 300 0 Q 250 150 300 250 T 250 400" style={{ animationDelay: '-3s' }} />
      </svg>
    </div>
  );
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
  terminalLogs,
  setTerminalLogs,
  addTerminalLog,
  showFameLevelError,
  setShowFameLevelError,
  showFameRankUp,
  setShowFameRankUp,
  tutorialStep,
  setTutorialStep,
  isRecipeBookExpanded,
  setIsRecipeBookExpanded,
  completedRecipes,
  setCompletedRecipes,
  setCurrentOrderSteps,
  user,
  onTogglePin,
  getPinCost,
  manifestationName,
  setManifestationName,
  manifestationEmoji,
  setManifestationEmoji,
  customToolName,
  setCustomToolName,
  customToolEmoji,
  setCustomToolEmoji,
  customTools,
  setCustomTools,
  adminCustomTitle,
  setAdminCustomTitle,
  fetchLeaderboard,
  setIsLeaderboardOpen,
  setShowLevelError,
  setShowLeaderboardOptIn,
  onEditIngredient,
  manifestationResult,
  setManifestationResult,
  currentFame,
  onPurchasePlan,
}: CombinationAgentProps) {
  const { generateContent, setConfig, client, model } = useGeminiAPIContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [toolsSearchTerm, setToolsSearchTerm] = useState('');
  
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'discord' | 'system'>('discord');
  const [activeDiscordTab, setActiveDiscordTab] = useState<'customize' | 'shop'>('customize');
  const [debugMode, setDebugMode] = useState(false);
  const [skipAmount, setSkipAmount] = useState('1');
  const [skipCompleteOrder, setSkipCompleteOrder] = useState(false);
  const [skipError, setSkipError] = useState('');
  const [adminIngredientName, setAdminIngredientName] = useState('');
  const [adminIngredientEmoji, setAdminIngredientEmoji] = useState('🍎');

  const isSuperAdmin = ADMIN_EMAILS.includes(user.email || '');
  const isAdminUser = isSuperAdmin;

  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([]);
  const [recipeCache, setRecipeCache] = useState<Record<string, RecipeStep[]>>({});
  const [isFetchingSteps, setIsFetchingSteps] = useState(false);
  const [showRecipeSteps, setShowRecipeSteps] = useState(false);
  const [isRecipePinned, setIsRecipePinned] = useState(false);
  const [isShopExpanded, setIsShopExpanded] = useState(false);
  const [isFameTerminalOpen, setIsFameTerminalOpen] = useState(false);
  
  const [showAnnoucement, setShowAnnouncement] = useState(false);
  const [showNewsFeed, setShowNewsFeed] = useState(false);
  const [activeNewsId, setActiveNewsId] = useState<string | null>(null);
  const [fameDonationAmount, setFameDonationAmount] = useState('1000');
  const [selectedAdminOrderName, setSelectedAdminOrderName] = useState(EXAMPLE_ORDERS[0]?.name || '');

  const getPlayerBadges = () => {
    return getChefBadges(stats, user.email);
  };

  const handleBuyCosmetic = (itemId: string, cost: number) => {
    soundService.playClick();
    if ((stats.purchasedCosmetics || []).includes(itemId)) {
      const item = COSMETICS_LIST.find(c => c.id === itemId);
      if (!item) return;
      
      setStats((prev: any) => {
        if (item.type === 'banner') {
          return { ...prev, discordBanner: itemId };
        } else if (item.type === 'border') {
          return { ...prev, discordBorder: itemId };
        }
        return prev;
      });
      addTerminalLog(`[DISCORD] Equipado cosmético: ${item.name}`);
      return;
    }
    
    const currentCredits = stats.credits ?? 150;
    if (currentCredits < cost) {
      soundService.playError();
      addTerminalLog(`[ERROR] Créditos insuficientes para comprar este cosmético (${cost} CRED requeridos)`);
      return;
    }
    
    setStats((prev: any) => {
      const owned = [...(prev.purchasedCosmetics || ['banner_discord', 'border_none'])];
      if (!owned.includes(itemId)) {
        owned.push(itemId);
      }
      
      let updatedStats = {
        ...prev,
        credits: currentCredits - cost,
        purchasedCosmetics: owned
      };
      
      const item = COSMETICS_LIST.find(c => c.id === itemId);
      if (item) {
        if (item.type === 'banner') {
          updatedStats.discordBanner = itemId;
        } else if (item.type === 'border') {
          updatedStats.discordBorder = itemId;
        }
      }
      
      return updatedStats;
    });
    
    soundService.playSuccess();
    const item = COSMETICS_LIST.find(c => c.id === itemId);
    addTerminalLog(`[DISCORD] ¡Compra exitosa! Adquirido: ${item?.name || itemId} por ${cost} créditos.`);
  };

  // New OS States
  const getProtocolInfo = useCallback(() => {
    const cycleDuration = 3600; // 1 hour in seconds
    const nowSeconds = Math.floor(Date.now() / 1000);
    const index = Math.floor(nowSeconds / cycleDuration) % GLOBAL_PROTOCOLS.length;
    const remaining = cycleDuration - (nowSeconds % cycleDuration);
    return { protocol: GLOBAL_PROTOCOLS[index], remaining };
  }, []);

  const [activeProtocol, setActiveProtocol] = useState<GlobalProtocol>(() => getProtocolInfo().protocol);
  const [protocolCountdown, setProtocolCountdown] = useState(() => getProtocolInfo().remaining);
  const [selectedPersonality, setSelectedPersonality] = useState<SousChefPersonality>(PERSONALITIES[0]);
  const [installedChips, setInstalledChips] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'chips' | 'protocols' | 'market'>('ai');
  const [marketplaceOffers, setMarketplaceOffers] = useState<MarketplaceOffer[]>([]);

  // Refs for auto-scrolling and state tracking
  const ingredientsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const prevInventoryLengthRef = useRef(inventory.length);

  const [isChallengesExpanded, setIsChallengesExpanded] = useState(false);

  const [isChallengesVisible, setIsChallengesVisible] = useState(true);

  const handleDonateToFame = () => {
    const amount = parseInt(fameDonationAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    if (stats.money >= amount) {
      soundService.playSuccess();
      const nextDonated = (stats.fameDonated || 0) + amount;
      const oldFame = getCurrentFameLevel(stats.fameDonated || 0);
      const newFame = getCurrentFameLevel(nextDonated);
      
      addTerminalLog(`[INJECTION] +$${amount} Fame Credits processed.`);
      
      setStats((prev: any) => ({
        ...prev,
        money: prev.money - amount,
        fameDonated: nextDonated
      }));

      // Find if we crossed a new threshold
        if (newFame && (!oldFame || oldFame.tier !== newFame.tier || oldFame.stage !== newFame.stage)) {
          soundService.playLevelUp();
          setShowFameRankUp({ tier: newFame.tier, stage: newFame.stage, emoji: newFame.emoji });
          addTerminalLog(`[SUCCESS] FAME_PROTOCOL: Standing elevated to ${newFame.tier} Stage ${newFame.stage}.`);
        }
    } else {
      soundService.playError();
      alert("ERROR: Insufficient credits for this fame addition.");
    }
  };

  // Marketplace Logic: Generate random offers
  const refreshMarketplace = useCallback(() => {
    const newOffers: MarketplaceOffer[] = [];
    const pool = [...inventory, ...STARTING_INGREDIENTS];
    
    for (let i = 0; i < 6; i++) {
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const randomIng = pool[Math.floor(Math.random() * pool.length)];
      
      newOffers.push({
        id: `offer_${Date.now()}_${i}`,
        type,
        ingredientName: randomIng.name,
        ingredientEmoji: randomIng.emoji,
        price: Math.floor((randomIng.price || 5) * (0.8 + Math.random() * 0.4)),
        traitRequirement: Math.random() > 0.7 ? (randomIng.trait || 'stable') : undefined
      });
    }
    setMarketplaceOffers(newOffers);
  }, [inventory]);

  // Handle Trade
  const handleTrade = (offer: MarketplaceOffer) => {
    if (offer.type === 'buy') {
      // System buys from player
      const playerIng = inventory.find(ing => ing.name === offer.ingredientName);
      if (!playerIng) {
        alert(`You don't have enough ${offer.ingredientName}`);
        return;
      }
      
      setStats((prev: any) => ({ ...prev, money: prev.money + offer.price }));
      setInventory(prev => {
        const index = prev.findIndex(ing => ing.name === offer.ingredientName);
        const next = [...prev];
        next.splice(index, 1);
        return next;
      });
      soundService.playSuccess();
    } else {
      // Player buys from system
      if (stats.money < offer.price) {
        alert("INSUFFICIENT_FUNDS_FOR_TRADE");
        return;
      }
      
      setStats((prev: any) => ({ ...prev, money: prev.money - offer.price }));
      setInventory(prev => [...prev, { name: offer.ingredientName, emoji: offer.ingredientEmoji, price: offer.price, trait: offer.traitRequirement }]);
      soundService.playSuccess();
    }
    
    // Remove offer after trade
    setMarketplaceOffers(prev => prev.filter(o => o.id !== offer.id));
  };

  // Effect for protocol rotation
  useEffect(() => {
    const interval = setInterval(() => {
      const info = getProtocolInfo();
      setActiveProtocol(info.protocol);
      setProtocolCountdown(info.remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [getProtocolInfo]);

  // Effect for marketplace refresh
  useEffect(() => {
    refreshMarketplace();
    const interval = setInterval(refreshMarketplace, 10 * 60 * 1000); // 10 mins
    return () => clearInterval(interval);
  }, [refreshMarketplace]);

  // News Items Data
  const NEWS_ITEMS = [
    {
      id: 'announcement_v1',
      title: 'SYSTEM_MAINTENANCE_UPDATE',
      content: 'Keeping Kitchen OS online consumes massive computational heat. Advertising protocols will be integrated to prevent total system shutdown.',
      date: '2026-04-22',
      badge: 'URGENT',
      icon: '⚠️'
    },
    {
      id: 'sounds_v1',
      title: 'AUDIO_ENGINE_INITIALIZED',
      content: 'High-fidelity 8-bit sound engine is now operational. Experience the crunch of every ingredient.',
      date: '2026-04-23',
      badge: 'UPDATE',
      icon: '🔊'
    }
  ];

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

  // Announcement Widget
  useEffect(() => {
    // Check if announcement was already acknowledged
    const acknowledged = localStorage.getItem('announcementAck_v1');
    if (!acknowledged) {
      setTimeout(() => setShowAnnouncement(true), 1500);
    }
  }, []);


  const handleBuyShopItem = (item: ShopItem) => {
    if (stats.money >= item.price) {
      soundService.playSuccess();
      if ((stats.purchasedShopItems || []).includes(item.id)) {
        alert("You already own this item!");
        return;
      }
      setStats((prev: any) => ({
        ...prev,
        money: prev.money - item.price,
        purchasedShopItems: [...(prev.purchasedShopItems || []), item.id]
      }));
      alert(`Successfully purchased ${item.name}! Check your settings to apply it.`);
    } else {
      soundService.playError();
      alert("Insufficient funds for this item.");
    }
  };

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
    // 1. Apply Multipliers from chips and personality
    let moneyMult = 1.0;
    let fireReductNum = 1.0;
    let speedMult = 1.0;
    
    installedChips.forEach(chipId => {
      const chip = SKILL_CHIPS.find(c => c.id === chipId);
      if (!chip) return;
      if (chip.effectType === 'money') moneyMult *= chip.multiplier;
      if (chip.effectType === 'safety') fireReductNum *= chip.multiplier;
      if (chip.effectType === 'speed') speedMult *= chip.multiplier;
    });

    if (selectedPersonality.id === 'gordon') {
      moneyMult *= 1.2;
      fireReductNum *= 1.1; // Increases risk
    } else if (selectedPersonality.id === 'zen') {
      fireReductNum *= 0.8;
      speedMult *= 0.85;
    }

    // Configure dynamic AI Personality and Protocol context
    const personalityInstruction = selectedPersonality.systemInstruction;
    const currentProtocolContext = `ACTIVE_SYSTEM_PROTOCOL: ${activeProtocol.name}. Context: ${activeProtocol.description}`;

    setConfig({
      systemInstruction: `${COMBINATION_SYSTEM_INSTRUCTION}\n\nAI_SUBPROCESSOR: ${personalityInstruction}\n\n${currentProtocolContext}`,
      responseMimeType: 'application/json',
      responseSchema: COMBINATION_RESPONSE_SCHEMA,
    });

    // Apply safety_boost upgrade logic for "Kitchen Fire"
    if (stats.purchasedUpgrades?.includes('fusion_reactor') || stats.godTier) {
      // Fusion Reactor or God Tier eliminates fire risk
    } else {
      // Base 12% chance as requested by user
      let fireChance = 0.12 * fireReductNum; 
      
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
          emoji: '🔥',
          rarity: 'common'
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

      let resultName = result.result_name;
      const isCrumble = resultName.toLowerCase() === 'crumble cookie';
      
      // Make Crumble Cookie extremely rare (e.g. 5% chance if LLM suggests it, unless in God Tier)
      if (isCrumble && Math.random() > 0.05 && !stats.godTier) {
        resultName = 'Unfinished Cookie';
      }

      return {
        name: resultName,
        emoji: isCrumble && resultName === 'Unfinished Cookie' ? '🍪' : result.emoji,
        rarity: (resultName.toLowerCase() === 'crumble cookie') ? 'chromatic' : ((currentOrder?.difficulty === 'nightmare') ? 'nightmare' : result.rarity)
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
    if (tutorialStep === 2) {
      setTutorialStep(3);
    }
    // Check cache first to save API quota
    if (recipeCache[orderName]) {
      setRecipeSteps(recipeCache[orderName]);
      setShowRecipeSteps(true);
      return;
    }

    setIsFetchingSteps(true);
    setShowRecipeSteps(true);
    setRecipeSteps([]);
    try {
      // Use the current model from context to ensure compatibility with the provided API Key
      const recipeModel = model || "gemini-3-flash-preview"; 
      const prompt = `Dish: "${orderName}"
Difficulty: ${difficulty}

Please provide the logical steps to create this dish using the available tools and ingredients. 
Even if the dish is complex, break it down into simple combinations. 
If the dish is very unusual, use your best judgment to create a plausible recipe.
Do not say you cannot do it; always provide a recipe.`;

      const response = await client.generateContent(recipeModel, [{ role: 'user', parts: [{ text: prompt }] }], {
        systemInstruction: STEPS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: STEPS_RESPONSE_SCHEMA,
      });

      const text = response?.text || '{}';
      
      if (!text || text === '{}') {
        throw new Error('Empty response from AI');
      }

      try {
        // Robust cleaning of the response text to extract the JSON object
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
          throw new Error('No valid JSON object found in response');
        }

        const cleanedJson = text.substring(firstBrace, lastBrace + 1);
        const result: { steps: RecipeStep[] } = JSON.parse(cleanedJson);
        if (result.steps && Array.isArray(result.steps)) {
          setRecipeSteps(result.steps);
          // Save to cache
          setRecipeCache(prev => ({ ...prev, [orderName]: result.steps }));
        } else {
          console.error('Recipe steps not found in result:', result);
          setRecipeSteps([]);
        }
      } catch (parseError) {
        console.error('Error parsing recipe steps JSON:', parseError, 'Raw text:', text);
        // Fallback for when JSON is not perfect but contains steps
        if (text.includes('"steps"') || text.includes('steps')) {
           alert("The recipe was partially generated but has formatting issues. Try again!");
        }
        setRecipeSteps([]);
      }
    } catch (error: any) {
      console.error('Error fetching steps:', error);
      let errorMsg = error.message || 'Verification error';
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = "API Quota exceeded. Please wait about 1-2 minutes for the cooldown or upgrade your plan in Google Cloud Console.";
      }
      alert(`Could not get recipe steps: ${errorMsg}`);
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

          setStats((prev: any) => {
            const gainedXP = XP_PER_DIFFICULTY[currentOrder.difficulty] || 20;
            const newXP = (prev.xp || 0) + gainedXP;
            const newLevel = getLevelFromXP(newXP);
            const leveledUp = newLevel > (prev.level || 1);
            
            let newMoney = (prev.money || 0) + baseReward;
            let newPurchasedUpgrades = [...(prev.purchasedUpgrades || [])];
            let newTitle = prev.title || 'Kitchen Hand';

            const difficultyToCredits: { [key: string]: number } = {
              easy: 20,
              intermediate: 35,
              difficult: 60,
              nightmare: 150
            };
            const orderCredits = difficultyToCredits[currentOrder.difficulty] || 20;
            const lvlUpCredits = leveledUp ? (newLevel * 25) : 0;
            const newCredits = (prev.credits || 0) + orderCredits + lvlUpCredits;

            if (leveledUp) {
              newMoney += newLevel * 100;
              const applicableTitle = [...TITLES].reverse().find(t => newLevel >= t.level);
              if (applicableTitle) newTitle = applicableTitle.name;
            }

            return {
              ...prev,
              completedOrders: prev.completedOrders + 1,
              completedNightmareOrders: currentOrder.difficulty === 'nightmare' 
                ? (prev.completedNightmareOrders || 0) + 1 
                : (prev.completedNightmareOrders || 0),
              money: newMoney,
              xp: newXP,
              level: newLevel,
              title: newTitle,
              purchasedUpgrades: newPurchasedUpgrades,
              credits: newCredits
            };
          });

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
        const newIng: Ingredient = { name: adminIngredientName.trim(), emoji: adminIngredientEmoji, rarity: 'common' };
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

  const handleAdminAddSpecificOrder = () => {
    if (isAdminUser) {
      const template = EXAMPLE_ORDERS.find(o => o.name === selectedAdminOrderName);
      if (template) {
        const newOrder: Order = {
          ...template,
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'not_started'
        };
        setOrders(prev => [...prev, newOrder]);
        setSkipError('');
      }
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleManifestIngredient = () => {
    if (!manifestationName.trim()) return;
    const newIng: Ingredient = {
      name: manifestationName.trim(),
      emoji: manifestationEmoji || '✨'
    };
    setInventory(prev => {
      if (prev.some(ing => ing.name.toLowerCase() === newIng.name.toLowerCase())) return prev;
      return [newIng, ...prev];
    });
    setManifestationName('');
    setManifestationEmoji('✨');
  };

  const handleCreateCustomTool = () => {
    if (!customToolName.trim()) return;
    const newTool: KitchenAction = {
      name: customToolName.trim().toLowerCase().replace(/\s+/g, '_'),
      displayName: customToolName.trim(),
      emoji: customToolEmoji || '🛠️'
    };
    setCustomTools(prev => {
      if (prev.some(t => t.name === newTool.name)) return prev;
      return [...prev, newTool];
    });
    setCustomToolName('');
    setCustomToolEmoji('🛠️');
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

  const handleAdminToggleProPlan = () => {
    if (isAdminUser) {
      setStats((prev: any) => ({ ...prev, proPlan: !prev.proPlan }));
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminToggleGodTier = () => {
    if (isAdminUser) {
      setStats((prev: any) => ({ ...prev, godTier: !prev.godTier }));
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminToggleMusicPass = () => {
    if (isAdminUser) {
      setStats((prev: any) => ({ ...prev, musicPass: !prev.musicPass }));
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminToggleAds = () => {
    if (isAdminUser) {
      setStats((prev: any) => ({ ...prev, adsDisabled: !prev.adsDisabled }));
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminSetCustomTitle = () => {
    if (isAdminUser) {
      const title = adminCustomTitle.trim();
      const forbiddenWords = ['admin', 'owner', 'moderator', 'staff', 'system'];
      
      // Super admins (Robert) can use any title including 'Owner'
      const isForbidden = !isSuperAdmin && forbiddenWords.some(word => title.toLowerCase().includes(word));

      if (isForbidden) {
        setSkipError('Advanced permissions required for this title');
        return;
      }

      setStats((prev: any) => ({ ...prev, customTitle: title || null }));
      setSkipError('');
    } else {
      setSkipError('Unauthorized');
    }
  };

  const handleAdminAddXP = (amount: number) => {
    if (isAdminUser) {
      setStats((prev: any) => {
        const newXP = (prev.xp || 0) + amount;
        const newLevel = getLevelFromXP(newXP);
        const leveledUp = newLevel > (prev.level || 1);
        
        let newMoney = prev.money;
        let newTitle = prev.title || 'Kitchen Hand';

        if (leveledUp) {
          newMoney += newLevel * 100;
          const applicableTitle = [...TITLES].reverse().find(t => newLevel >= t.level);
          if (applicableTitle) newTitle = applicableTitle.name;
        }

        return {
          ...prev,
          xp: newXP,
          level: newLevel,
          title: newTitle,
          money: newMoney
        };
      });
      setSkipError('');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit for base64 in Firestore
        setSkipError('Image too large (max 500KB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStats((prev: any) => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
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
    soundService.playClick();
    if (selectedIngredients.size === 0) return;

    const ingredientNames = Array.from(selectedIngredients);

    // Clear selection immediately
    setSelectedIngredients(new Set());

    // Handle serve action specially - only triggers verification, no combination
    if (action.name === 'serve') {
      if (tutorialStep === 4 && ingredientNames[0]?.toLowerCase().includes('fried egg')) {
        setTutorialStep(5);
      }

      // Serve takes only the first selected ingredient as the dish name
      const dishName = ingredientNames[0];

      // Trigger verification agent
      await onServe(dishName);
      return;
    }

    setActiveAction(action.name);

    const newIngredient = await executeCombination(action, ingredientNames);

    if (tutorialStep === 3 && newIngredient && newIngredient.name.toLowerCase().includes('fried egg')) {
      setTutorialStep(4);
    }

    // Update total actions stat
    setStats((prev: any) => ({
      ...prev,
      totalActions: (prev.totalActions || 0) + 1
    }));

    if (newIngredient) {
      const isDuplicate = isDuplicateIngredient(newIngredient.name, inventory);
      
      // Show manifestation result
      setManifestationResult({
        name: newIngredient.name,
        emoji: newIngredient.emoji,
        isDuplicate
      });

      // Clear manifestation result after a delay
      setTimeout(() => setManifestationResult(null), 3000);

      // Add to current order steps
      setCurrentOrderSteps(prev => [...prev, {
        tool: action.displayName,
        ingredients: ingredientNames,
        result: newIngredient.name
      }]);

      // Update stats for discovered ingredients
      if (!isDuplicate) {
        soundService.playDiscover();
        setStats((prev: any) => ({
          ...prev,
          discoveredIngredients: prev.discoveredIngredients + 1,
          dailyChallenges: (prev.dailyChallenges || []).map((c: any) => 
            c.type === 'discovery' ? { ...c, current: c.current + 1 } : c
          )
        }));
      } else {
        soundService.playSuccess();
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
      setInventory(prev => {
        if (isDuplicate) {
          // If duplicate, move it to the top instead of skipping
          const filtered = prev.filter(ing => normalizeIngredientName(ing.name) !== normalizeIngredientName(newIngredient.name));
          return [newIngredient, ...filtered];
        }
        return [newIngredient, ...prev];
      });
    } else {
      // Show error if combination failed
      soundService.playError();
      setManifestationResult({
        name: "Failed to Manifest",
        emoji: "❌",
        isDuplicate: false
      });
      setTimeout(() => setManifestationResult(null), 3000);
    }

    setActiveAction(null);
  }, [selectedIngredients, executeCombination, setActiveAction, setSelectedIngredients, setInventory, onServe, inventory, stats.usedTools, stats.maxIngredientsUsed, setCurrentOrderSteps, setStats]);

  // Global Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't fire shortcuts if the user is currently typing in an input or textarea
      const activeElement = document.activeElement;
      if (activeElement) {
        const tagName = activeElement.tagName;
        const isContentEditable = (activeElement as HTMLElement).isContentEditable;
        if (
          tagName === 'INPUT' || 
          tagName === 'TEXTAREA' || 
          tagName === 'SELECT' || 
          isContentEditable
        ) {
          return;
        }
      }

      const key = event.key.toLowerCase();

      // 'c' to clear selection
      if (key === 'c') {
        event.preventDefault();
        if (selectedIngredients.size > 0) {
          setSelectedIngredients(new Set());
          soundService.playClick();
          addTerminalLog("[SYSTEM] Key [C] detected: Selected ingredients cleared.");
        }
      }

      // 's' to serve dish
      if (key === 's') {
        event.preventDefault();
        const serveAction = [...COOKING_ACTIONS, ...customTools].find(a => a.name === 'serve');
        if (serveAction) {
          if (selectedIngredients.size === 1) {
            executeAction(serveAction);
            addTerminalLog(`[SYSTEM] Key [S] detected: Attempting to serve dish "${Array.from(selectedIngredients)[0]}".`);
          } else if (selectedIngredients.size === 0) {
            soundService.playError();
            addTerminalLog("[ERROR] Keyboard [S] failed: No dish selected to serve. Select 1 item from your inventory first.");
          } else {
            soundService.playError();
            addTerminalLog("[ERROR] Keyboard [S] failed: Multiple ingredients selected. Select exactly 1 dish to serve.");
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIngredients, executeAction, customTools, addTerminalLog, setSelectedIngredients]);

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

  const currentLevelXP = getXPForLevel(stats.level || 1);
  const nextLevelXP = getXPForLevel((stats.level || 1) + 1);
  const xpProgress = Math.min(100, Math.max(0, (((stats.xp || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));

  // currentFame is defined above in the component body

  return (
    <div className="kitchen-app">
      {/* Page Title */}
      <div className="kitchen-header">
        <div className="header-content-wrapper max-w-7xl mx-auto px-4">
          <div className="header-left">
            <h1 className="kitchen-title">My little Kitchen</h1>
            {currentFame && (
              <div className="fame-badge-header" title={`${currentFame.tier} Fame Stage ${currentFame.stage}`}>
                <span className="fame-emoji">{currentFame.emoji}</span>
                <span className="fame-stage-num">{currentFame.stage}</span>
              </div>
            )}
          </div>
          
          <div className="header-center">
            <div className="stats-group">
              <div className="money-display-bar" title="In-game cash">
                <span className="money-icon">💰</span>
                <span className="money-amount">${stats.money}</span>
              </div>
              
              <div className="level-status-card">
                <div className="level-badge-mini">
                  <span className="level-mini-label">LVL</span>
                  <span className="level-val">{stats.level || 1}</span>
                </div>
                <div className="status-details">
                  <div className="title-row">
                    {stats.customTitle ? (
                      <GlitchedTitle title={stats.customTitle} className="mini" />
                    ) : (stats.purchasedShopItems || []).includes('title_legend') ? (
                      <GlitchedTitle title="GOD OF FOOD" className="mini" />
                    ) : (
                      <span className="standard-title">{stats.title || 'Kitchen Hand'}</span>
                    )}
                  </div>
                  <div className="xp-bar-wrapper" title={`${Math.floor(stats.xp || 0)} / ${nextLevelXP} XP`}>
                    <div className="xp-bar-fill-new" style={{ width: `${xpProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="header-right">
            <button 
              className="leaderboard-btn-header"
              onClick={() => {
                const currentLevel = stats.level || 1;
                if (currentLevel < 5) {
                  setShowLevelError(true);
                } else if (!stats.leaderboardOptIn) {
                  setShowLeaderboardOptIn(true);
                } else {
                  fetchLeaderboard();
                  setIsLeaderboardOpen(true);
                }
              }}
              title="View Leaderboard"
            >
              🏆
            </button>

            <button 
              className={`leaderboard-btn-header fame-btn ${(stats.level >= 80 || (stats.fameDonated || 0) > 0) ? 'fame-unlocked' : 'fame-locked'}`}
              onClick={() => {
                if (stats.level < 80 && (stats.fameDonated || 0) <= 0) {
                  soundService.playError();
                  setShowFameLevelError(true);
                } else {
                  soundService.playClick();
                  setIsFameTerminalOpen(true);
                  // Initialize boot sequence
                  setTerminalLogs([]);
                  const bootLogs = [
                    "> INITIALIZING FAME_PROTOCOL_V2...",
                    "> VERIFYING CULINARY_CERTIFICATE...",
                    "> SYNCING WITH BLOCKCHAIN_LEDGER...",
                    "> HANDSHAKE_SUCCESSFUL.",
                    "> WELCOME, MASTER CHEF."
                  ];
                  bootLogs.forEach((log, i) => {
                    setTimeout(() => {
                      setTerminalLogs(prev => [...prev, log]);
                      soundService.playType();
                    }, (i + 1) * 400);
                  });
                }
              }}
              title={(stats.level >= 80 || (stats.fameDonated || 0) > 0) ? "Fame Terminal" : "Level 80 Required"}
            >
              ✨
            </button>

            <button 
              className="leaderboard-btn-header news-btn-archive"
              onClick={() => setShowNewsFeed(true)}
              title="System News"
            >
              📡
            </button>

            <button 
              className="user-profile-btn-top"
              onClick={() => {
                setShowSkipModal(true);
              }}
            >
              <div className="profile-btn-content">
                {stats.profileImage || user.photoURL ? (
                  <img src={stats.profileImage || user.photoURL} alt="Profile" className="user-avatar object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.[0] || user.email?.[0] || '?'}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="user-name-text">{user.displayName || 'Chef'}</span>
                  {ADMIN_EMAILS.includes(user.email || '') && (
                    <img 
                      src={VERIFIED_BADGE_URL} 
                      alt="Verified" 
                      style={{ width: '14px', height: '14px' }}
                      className="flex-shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {currentFame && (
                    <span className="fame-badge-mini" title={`${currentFame.tier} Fame`}>
                      {currentFame.emoji}
                    </span>
                  )}
                </div>
                <span className="settings-gear">⚙️</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Challenge Banner */}
      {isChallengesVisible && (
        <div className={`challenge-banner-brutalist ${isChallengesExpanded ? 'challenges-fullscreen' : ''}`}>
          <div className="challenge-header-rail">
            <span className="rail-text">KITCHEN PROTOCOL v1.0</span>
            <div className="flex gap-4">
              <span className="rail-text cursor-pointer hover:text-red-500" onClick={() => setIsChallengesVisible(false)}>CLOSE [X]</span>
              <span className="rail-text">SYSTEM READY</span>
            </div>
          </div>
          
          <div className="challenge-content-grid">
            <div className="challenge-main-info" style={isChallengesExpanded ? { padding: '40px', borderRight: 'none', background: '#fff' } : { background: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <h1 className="challenge-title-massive">KITCHEN<br/>PROTOCOL</h1>
              <p className="challenge-subtitle-refined">
                Welcome to the lab environment. Use the protocols on the right to master the production cycle. 
                Efficiency is mandatory.
              </p>
            </div>
            
            {!isChallengesExpanded && (
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
            )}
          </div>
        </div>
      )}
      
          {/* Commented out daily missions as requested
          {!isChallengesVisible && (
            <button 
              className="os-btn-mini mb-6"
              onClick={() => setIsChallengesVisible(true)}
            >
              SHOW DAILY MISSIONS
            </button>
          )} */}

      {/* Achievements Top Bar */}
      <div className="achievements-top-bar">
        <div className="flex flex-wrap w-full items-center justify-between">
          <div className="flex gap-4 flex-wrap items-center">
            <button 
              className={`view-achievements-btn ${isAchievementsExpanded ? 'active' : ''}`}
              onClick={() => {
                soundService.playClick();
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
                soundService.playClick();
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
                soundService.playClick();
                setIsRecipeBookExpanded(!isRecipeBookExpanded);
                if (!isRecipeBookExpanded) {
                  setIsAchievementsExpanded(false);
                  setIsUpgradesExpanded(false);
                  setIsShopExpanded(false);
                }
              }}
            >
              <span className="emoji">📖</span>
              <span>{isRecipeBookExpanded ? 'Hide Recipes' : 'Recipe Book'}</span>
              <span className="count-badge">{completedRecipes.length}</span>
            </button>
            <button 
              className={`view-achievements-btn store-btn ${isShopExpanded ? 'active' : ''}`}
              onClick={() => {
                soundService.playClick();
                setIsShopExpanded(!isShopExpanded);
                if (!isShopExpanded) {
                  setIsAchievementsExpanded(false);
                  setIsUpgradesExpanded(false);
                  setIsRecipeBookExpanded(false);
                }
              }}
            >
              <span className="emoji">🛒</span>
              <span>Visual Shop</span>
              {currentFame && <span className="fame-badge-mini ml-2">{currentFame.emoji}</span>}
            </button>
          </div>
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

      {/* Visual Shop Section (Conditional Render) */}
      {isShopExpanded && (
        <section className="kitchen-section achievements-section expanded shop-section">
          <div className="section-header">
            <div className="section-header-text">
              <h2 className="section-title">Visual Shop & Fame</h2>
              <p className="section-subtitle">Donate to reach universal fame or buy cosmetic upgrades</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="money-display small">
                <span className="money-icon">💰</span>
                <span className="money-amount">${stats.money}</span>
              </div>
              <button className="close-achievements" onClick={() => setIsShopExpanded(false)}>✕</button>
            </div>
          </div>

          <div className="shop-content-wrapper">
            {/* Shop Grid */}
            <div className="shop-items-grid">
              {SHOP_ITEMS.map(item => (
                <div key={item.id} className={`shop-item-card ${stats.purchasedShopItems?.includes(item.id) ? 'owned' : ''}`}>
                  <div className="item-emoji">{item.emoji}</div>
                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-desc">{item.description}</p>
                    <button 
                      className="buy-item-btn"
                      onClick={() => handleBuyShopItem(item)}
                      disabled={stats.money < item.price || stats.purchasedShopItems?.includes(item.id)}
                    >
                      {stats.purchasedShopItems?.includes(item.id) ? 'OWNED' : `BUY ($${item.price})`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              id="get-steps"
              className={`hint-button ${tutorialStep === 2 ? 'tutorial-highlight' : ''}`}
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
            <div className="skip-modal-header">
              <h3>⚙️ Ajustes y Cuenta</h3>
              <button className="skip-close-btn" onClick={() => setShowSkipModal(false)}>✕</button>
            </div>

            {/* TAB 1: CHEF PROFILE CUSTOMIZER & SHOP (REMOVED) */}
            {false && (
              <div className="p-4 bg-[#18181b]/40 border border-[#1a1a1a] rounded-lg">
                <div className="discord-customizer-grid">
                  
                  {/* Left Column: Live Card Preview */}
                  <div className="discord-profile-preview-card">
                    {/* Banner Preview */}
                    <div 
                      className={`discord-banner-preview ${
                        stats.discordBanner === 'banner_neon' ? 'preview-banner-neon' :
                        stats.discordBanner === 'banner_sakura' ? 'preview-banner-sakura' :
                        stats.discordBanner === 'banner_cosmic' ? 'preview-banner-cosmic' :
                        stats.discordBanner === 'banner_gold' ? 'preview-banner-gold' :
                        stats.discordBanner === 'banner_matrix' ? 'preview-banner-matrix' : ''
                      }`}
                      style={stats.discordBanner === 'banner_discord' ? { backgroundColor: '#2563eb' } : {}}
                    />
                    
                    {/* Avatar and status dot */}
                    <div className="discord-avatar-container">
                      <div className={`discord-avatar-inner ${
                        stats.discordBorder === 'border_gaming' ? 'border-gaming-chroma' :
                        stats.discordBorder === 'border_cute' ? 'border-cute-cat' :
                        stats.discordBorder === 'border_fire' ? 'border-fire-ring' :
                        stats.discordBorder === 'border_frost' ? 'border-frost-crystals' :
                        stats.discordBorder === 'border_gold' ? 'border-gold-crown' :
                        stats.discordBorder === 'border_early' ? 'border-chef-hat' : ''
                      }`}>
                        {stats.profileImage || user.photoURL ? (
                          <img 
                            src={stats.profileImage || user.photoURL} 
                            alt="Profile" 
                            className="discord-avatar-img"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#313338] text-white flex items-center justify-center font-bold text-2xl uppercase">
                            {user.displayName?.[0] || user.email?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className={`discord-status-dot-badge ${
                        stats.discordStatus === 'online' ? 'status-online' :
                        stats.discordStatus === 'idle' ? 'status-idle' :
                        stats.discordStatus === 'dnd' ? 'status-dnd' : 'status-offline'
                      }`} />
                    </div>
                    
                    {/* Details */}
                    <div className="discord-profile-details">
                      <div className="discord-card-username">
                        <span>{user.displayName || 'Chef'}</span>
                        {isSuperAdmin && (
                          <img 
                            src={VERIFIED_BADGE_URL} 
                            alt="Verified" 
                            style={{ width: '16px', height: '16px' }}
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {stats.proPlan && (
                          <span className="text-[9px] bg-[#f97316] text-white px-1.5 py-0.5 font-extrabold uppercase rounded-sm leading-none">Pro Plan</span>
                        )}
                      </div>
                      
                      {stats.discordStatusText && (
                        <div className="discord-card-custom-status">
                          <span>{stats.discordStatusEmoji || '💭'}</span>
                          <span>{stats.discordStatusText}</span>
                        </div>
                      )}
                      
                      {/* Badges container */}
                      <div className="discord-user-badge-container">
                        {getPlayerBadges().length > 0 ? (
                          getPlayerBadges().map((badge) => (
                            <div 
                              key={badge.id} 
                              className={`discord-profile-badge ${badge.isDifficult ? 'badge-difficult' : ''}`}
                            >
                              <span>{badge.emoji}</span>
                              <div className="badge-tooltip">
                                <p className="font-bold border-b border-white/20 pb-1 mb-1">{badge.name}</p>
                                <p>{badge.desc}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic px-1">Sin insignias equipo</span>
                        )}
                      </div>
                      
                      <div className="discord-card-separator" />
                      
                      <div className="discord-card-section-title">Sobre Mí</div>
                      <p className="discord-card-bio mb-4 text-[12px]">{stats.discordBio || 'Este chef no ha escrito una biografía todavía. ¡Presiona Personalizar para agregar una!'}</p>
                      
                      {/* Active Activity Frame */}
                      <div className="discord-activity-card">
                        <div className="discord-activity-header">Cocinando en Vivo</div>
                        <div className="discord-activity-body">
                          <div className="discord-activity-game-icon">🍳</div>
                          <div className="discord-activity-details">
                            <p className="discord-activity-game-name">My Little Kitchen</p>
                            <p className="discord-activity-game-stats">Rango: {stats.title || 'Kitchen Hand'}</p>
                            <p className="discord-activity-game-stats">Nivel: {stats.level || 1} • XP: {Math.floor(stats.xp || 0)}</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { soundService.playClick(); setShowSkipModal(false); }}
                          className="discord-activity-action-btn"
                        >
                          Continuar Cocinando
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column: Customizer inputs & shop sub-tabs */}
                  <div>
                    <div className="discord-subtabs-nav">
                      <button 
                        type="button"
                        className={`discord-subtab-btn ${activeDiscordTab === 'customize' ? 'active' : ''}`}
                        onClick={() => { soundService.playClick(); setActiveDiscordTab('customize'); }}
                      >
                        ✏️ Personalizar Perfil
                      </button>
                      <button 
                        type="button"
                        className={`discord-subtab-btn ${activeDiscordTab === 'shop' ? 'active' : ''}`}
                        onClick={() => { soundService.playClick(); setActiveDiscordTab('shop'); }}
                      >
                        🪙 Tienda de Cosméticos
                      </button>
                    </div>
                    
                    {/* Tab 1.1: Customize Form */}
                    {activeDiscordTab === 'customize' && (
                      <div className="discord-form-panel">
                        <div className="discord-form-group">
                          <label>Nombre de Usuario (Apodo de Cocina)</label>
                          <input 
                            type="text"
                            className="discord-input-fancy"
                            value={user.displayName || 'Chef'}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setStats((prev: any) => ({ ...prev, displayName: newName }));
                            }}
                            placeholder="Tu alias culinario..."
                          />
                        </div>
                        
                        <div className="discord-form-group">
                          <label>Actividad del Cocinero</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'online', name: 'Activo', color: 'bg-[#10b981]' },
                              { id: 'idle', name: 'Reposo', color: 'bg-[#f59e0b]' },
                              { id: 'dnd', name: 'Fuego lento', color: 'bg-[#ef4444]' },
                              { id: 'offline', name: 'Fuera de servicio', color: 'bg-[#6b7280]' },
                            ].map(st => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  soundService.playClick();
                                  setStats((prev: any) => ({ ...prev, discordStatus: st.id }));
                                }}
                                className={`flex items-center gap-1.5 justify-center p-2 text-[10px] font-bold border-2 rounded-md ${
                                  stats.discordStatus === st.id ? 'border-[#f97316] bg-[#f97316]/10' : 'border-[#1a1a1a] bg-[#18181b]'
                                }`}
                                style={{ color: '#fff' }}
                              >
                                <div className={`w-2 h-2 rounded-full ${st.color}`} />
                                <span>{st.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-2 discord-form-group">
                          <div className="col-span-4 flex flex-col gap-1">
                            <label>Emoji del Plato</label>
                            <select 
                              className="discord-input-fancy text-center p-1"
                              value={stats.discordStatusEmoji || '💭'}
                              onChange={(e) => setStats((prev: any) => ({ ...prev, discordStatusEmoji: e.target.value }))}
                            >
                              {['💭', '🍳', '🔥', '🔪', '🍔', '🍕', '🍰', '🍣', '💀', '👽', '🎮', '👑', '💸', '✨', '⭐', '🌈', '⚡', '☕'].map(em => (
                                <option key={em} value={em}>{em}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-8 flex flex-col gap-1">
                            <label>Estado de la Comanda</label>
                            <input 
                              type="text"
                              className="discord-input-fancy"
                              value={stats.discordStatusText || ''}
                              onChange={(e) => setStats((prev: any) => ({ ...prev, discordStatusText: e.target.value }))}
                              placeholder="¿Qué estás tramando?"
                            />
                          </div>
                        </div>

                        <div className="discord-form-group">
                          <label>Biografía Culinaria (Sobre Mí)</label>
                          <textarea 
                            className="discord-input-fancy h-16 resize-none"
                            value={stats.discordBio || ''}
                            onChange={(e) => setStats((prev: any) => ({ ...prev, discordBio: e.target.value }))}
                            placeholder="Cuéntale a todos sobre tus mejores descubrimientos culinarios..."
                          />
                        </div>

                        <div className="discord-form-group">
                          <label>Gremio del Sabor (¡Gratis!)</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: null, name: 'Ninguno', emoji: '❌' },
                              { id: 'hype_bravery', name: 'Gremio del Fuego', emoji: '🔥' },
                              { id: 'hype_brilliance', name: 'Gremio Dulce', emoji: '🔮' },
                              { id: 'hype_balance', name: 'Gremio Umami', emoji: '⚖️' }
                            ].map(hs => (
                              <button
                                key={hs.id || 'none'}
                                type="button"
                                onClick={() => {
                                  soundService.playClick();
                                  setStats((prev: any) => ({ ...prev, equippedHypeSquad: hs.id }));
                                }}
                                className={`flex flex-col items-center justify-center p-1.5 border-2 rounded-md transition-all ${
                                  stats.equippedHypeSquad === hs.id ? 'border-[#f97316] bg-[#f97316]/10 scale-[1.03]' : 'border-[#1a1a1a] bg-[#1e1f22]'
                                }`}
                                style={{ color: '#fff' }}
                              >
                                <span className="text-lg">{hs.emoji}</span>
                                <span className="text-[9px] font-extrabold mt-1 text-center">{hs.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button 
                            type="button"
                            className="settings-tab-btn flex items-center justify-center gap-1 text-[11px]"
                            onClick={() => {
                              fileInputRef.current?.click();
                            }}
                          >
                            <Camera size={14} /> Foto de Avatar
                          </button>
                          
                          {stats.profileImage && (
                            <button 
                              type="button"
                              className="settings-tab-btn"
                              onClick={() => {
                                soundService.playClick();
                                setStats((prev: any) => ({ ...prev, profileImage: null }));
                              }}
                              style={{ fontSize: '11px', background: '#fee2e2', color: '#ef4444', borderColor: '#ef4444' }}
                            >
                              Eliminar Foto
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Tab 1.2: Cosmetic Credits Shop */}
                    {activeDiscordTab === 'shop' && (
                      <div>
                        <div className="discord-cosmetics-balance-row">
                          <span className="text-xs font-bold text-gray-300">Créditos Culinarios:</span>
                          <div className="credits-highlight-amount">
                            <span>🪙</span>
                            <span>{stats.credits ?? 150} CRED</span>
                          </div>
                        </div>
                        
                        <div className="discord-shop-showcase-grid custom-scrollbar">
                          {COSMETICS_LIST.map((item) => {
                            const isOwned = (stats.purchasedCosmetics || []).includes(item.id);
                            const isEquipped = item.type === 'banner' 
                              ? stats.discordBanner === item.id 
                              : item.type === 'border' 
                              ? stats.discordBorder === item.id 
                              : false;
                            
                            const canAfford = (stats.credits ?? 150) >= item.price;
                            
                            let btnClass = "buy-unacquired";
                            let btnText = `Comprar (${item.price} 🪙)`;
                            
                            if (isOwned) {
                              if (item.type === 'badge') {
                                btnClass = "buy-equipped";
                                btnText = "✓ COMPRADO";
                              } else if (isEquipped) {
                                btnClass = "buy-equipped";
                                btnText = "✓ EQUIPADO";
                              } else {
                                btnClass = "buy-unequipped";
                                btnText = "EQUIPAR";
                              }
                            } else if (!canAfford) {
                              btnClass = "buy-locked";
                              btnText = "BLOQUEADO";
                            }
                            
                            return (
                              <div key={item.id} className="discord-shop-item-card">
                                <div>
                                  <div className="discord-shop-item-name">
                                    <span className="text-xs font-bold">{item.name}</span>
                                    {item.price > 0 && <span className="discord-shop-item-price">🪙 {item.price}</span>}
                                  </div>
                                  <p className="discord-shop-item-desc text-[10px]">{item.desc}</p>
                                </div>
                                <button
                                  type="button"
                                  className={`discord-shop-buy-btn ${btnClass}`}
                                  disabled={item.price > 0 && !isOwned && !canAfford}
                                  onClick={() => handleBuyCosmetic(item.id, item.price)}
                                >
                                  {btnText}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
            <div className="skip-modal-body">
              
              <div className="admin-section">
                <h4>Account</h4>
                <div className="account-info-card">
                  <div className="account-header-improved">
                    <div className="profile-image-container">
                      <div className={`relative group profile-avatar-wrapper ${
                        (stats.purchasedShopItems || []).includes('border_gold') ? 'profile-border-gold' : 
                        (stats.purchasedShopItems || []).includes('border_neon') ? 'profile-border-neon' : ''
                      }`}>
                        {stats.profileImage || user.photoURL ? (
                          <img 
                            src={stats.profileImage || user.photoURL} 
                            alt="Profile" 
                            className="account-avatar-xl object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="account-avatar-xl bg-black text-white flex items-center justify-center font-bold text-3xl">
                            {user.displayName?.[0] || user.email?.[0] || '?'}
                          </div>
                        )}
                        <button 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-none border-none cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera size={24} />
                          <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Change</span>
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleProfileImageUpload} 
                        />
                      </div>
                      
                      {stats.profileImage && (
                        <button 
                          className="remove-profile-btn"
                          onClick={() => setStats((prev: any) => ({ ...prev, profileImage: null }))}
                          title="Remove custom photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="account-details">
                      <div className="flex items-center gap-1">
                        <h5 className="chef-name">{user.displayName || 'Chef'}</h5>
                        {ADMIN_EMAILS.includes(user.email || '') && (
                          <img 
                            src={VERIFIED_BADGE_URL} 
                            alt="Verified" 
                            style={{ width: '18px', height: '18px' }}
                            className="flex-shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {currentFame && (
                          <span className="fame-badge-mini ml-1" title={`${currentFame.tier} Fame - Stage ${currentFame.stage}`}>
                            {currentFame.emoji}
                          </span>
                        )}
                      </div>
                      <p className="chef-email">{user.email}</p>
                      <div className="profile-status-badge">
                        {stats.profileImage ? 'CUSTOM_AVATAR_ACTIVE' : 'DEFAULT_AVATAR'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="account-stats-grid">
                    <div className="account-stat-item">
                      <span className="stat-label">Level</span>
                      <span className="stat-value">{stats.level || 1}</span>
                    </div>
                    <div className="account-stat-item">
                      <span className="stat-label">Title</span>
                      <span className="stat-value">{stats.title || 'Kitchen Hand'}</span>
                    </div>
                    <div className="account-stat-item">
                      <span className="stat-label">Balance</span>
                      <span className="stat-value">${stats.money}</span>
                    </div>
                    <div className="account-stat-item">
                      <span className="stat-label">Achievements</span>
                      <span className="stat-value">{unlockedAchievements.length}</span>
                    </div>
                  </div>

                  <div className="themes-section mt-6">
                    <h4>SYSTEM_THEME</h4>
                    <div className="themes-grid">
                      <button 
                        className={`theme-selector-btn theme-green ${stats.currentTheme === 'green' ? 'active' : ''}`}
                        onClick={() => {
                          soundService.playClick();
                          setStats((prev: any) => ({ ...prev, currentTheme: 'green' }));
                        }}
                        title="Classic Kitchen (Green)"
                      >
                        <div className="theme-preview bg-[#00ff00]"></div>
                        <span>CLASSIC</span>
                      </button>
                      
                      {Object.values(OS_THEMES).map(theme => {
                        const isPurchased = (stats.purchasedShopItems || []).includes(`theme_${theme.id}`);
                        if (!isPurchased || theme.id === 'green') return null;
                        
                        return (
                          <button 
                            key={theme.id}
                            className={`theme-selector-btn theme-${theme.id} ${stats.currentTheme === theme.id ? 'active' : ''}`}
                            onClick={() => {
                              soundService.playClick();
                              setStats((prev: any) => ({ ...prev, currentTheme: theme.id }));
                            }}
                            title={theme.name}
                          >
                            <div className="theme-preview" style={{ background: theme.colors.primary }}></div>
                            <span>{theme.name.split(' ')[0].toUpperCase()}</span>
                          </button>
                        );
                      })}

                      <a 
                        href="#shop" 
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSkipModal(false);
                          setIsShopExpanded(true);
                          soundService.playClick();
                        }}
                        className="theme-shop-link"
                      >
                        Buy more in Shop &gt;
                      </a>
                    </div>
                  </div>

                  <button className="logout-btn-brutalist" onClick={() => {
                    signOut(auth).catch(() => {});
                    window.location.reload();
                  }}>
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

                  {isSuperAdmin && (
                    <>
                      <div className="admin-section">
                        <h4>Admin: Experience & Levels</h4>
                        <div className="flex gap-2">
                          <button className="admin-action-btn flex-1" onClick={() => handleAdminAddXP(100)}>+100 XP</button>
                          <button className="admin-action-btn flex-1" onClick={() => handleAdminAddXP(1000)}>+1000 XP</button>
                          <button className="admin-action-btn flex-1" onClick={() => handleAdminAddXP(5000)}>+5000 XP</button>
                        </div>
                      </div>

                      <div className="admin-section">
                        <h4>Admin: Achievements & Stats</h4>
                        <div className="flex gap-2 mb-2">
                          <button className="admin-action-btn flex-1" onClick={handleAdminUnlockAchievements}>Unlock All</button>
                          <button className="admin-action-btn flex-1" onClick={handleAdminAddMoney}>Add $100</button>
                        </div>
                        <button className="admin-danger-btn w-full" onClick={handleAdminResetAll}>Full Reset</button>
                      </div>
                    </>
                  )}

                  <div className="admin-section">
                    <h4>Admin: Order Management</h4>
                    <div className="flex gap-2">
                      <button className="admin-action-btn flex-1" onClick={handleAdminGenerateOrder}>Random Order</button>
                      <button className="admin-danger-btn flex-1" onClick={handleAdminClearOrders}>Clear All</button>
                    </div>
                  </div>

                  <div className="admin-section">
                    <h4>Admin: Specific Order</h4>
                    <div className="flex gap-2">
                      <select 
                        className="skip-input flex-1"
                        style={{ background: 'white', color: 'black' }}
                        value={selectedAdminOrderName}
                        onChange={(e) => setSelectedAdminOrderName(e.target.value)}
                      >
                        {EXAMPLE_ORDERS.map(order => (
                          <option key={order.id} value={order.name}>
                            {order.emoji} {order.name} ({order.difficulty})
                          </option>
                        ))}
                      </select>
                      <button className="admin-action-btn" onClick={handleAdminAddSpecificOrder}>Manifest</button>
                    </div>
                  </div>

                  <div className="admin-section">
                    <h4>Admin: Subscriptions & Plans</h4>
                    <div className="flex gap-2 mb-2">
                      <button 
                        className={`admin-action-btn flex-1 ${stats.proPlan ? 'active' : ''}`} 
                        onClick={handleAdminToggleProPlan}
                      >
                        {stats.proPlan ? 'Revoke PRO Plan' : 'Grant PRO Plan'}
                      </button>
                      <button 
                        className={`admin-action-btn flex-1 ${stats.godTier ? 'active' : ''}`} 
                        onClick={handleAdminToggleGodTier}
                      >
                        {stats.godTier ? 'Revoke God Tier' : 'Grant God Tier'}
                      </button>
                      <button 
                        className={`admin-action-btn flex-1 ${stats.musicPass ? 'active' : ''}`} 
                        onClick={handleAdminToggleMusicPass}
                      >
                        {stats.musicPass ? 'Revoke Music Pass' : 'Grant Music Pass'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        className={`admin-action-btn flex-1 ${stats.adsDisabled ? 'active' : ''}`} 
                        onClick={handleAdminToggleAds}
                      >
                        {stats.adsDisabled ? 'Enable Ads' : 'Disable Ads'}
                      </button>
                    </div>
                  </div>

                  <div className="admin-section">
                    <h4>Admin: Custom Title (Neon/Glitch)</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="admin-input flex-1" 
                        placeholder="Custom Title..." 
                        value={adminCustomTitle}
                        onChange={(e) => setAdminCustomTitle(e.target.value)}
                      />
                      <button className="admin-action-btn" onClick={handleAdminSetCustomTitle}>Set</button>
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

      {/* Manifestation Toast */}
      {manifestationResult && (
        <ManifestationToast 
          result={manifestationResult} 
          onClose={() => setManifestationResult(null)} 
        />
      )}

      {/* Global Protocol Emergency Banner */}
      <GlobalProtocolBanner protocol={activeProtocol} countdown={protocolCountdown} />

      <div className="ingredients-tools-row-lab">
        {/* Left Column: Data Source / Inventory (Always Visible) */}
        <div id="inventory" className={`lab-column inventory-column ${tutorialStep === 3 ? 'tutorial-highlight' : ''}`}>
          <div className="column-technical-header">
            <div className="flex justify-between items-center w-full">
              <span className="tech-badge">DATA_SOURCE_01 // INVENTORY</span>
              <span className="tech-badge opacity-50">{inventory.length} ENTITIES</span>
            </div>
          </div>

          <div className="px-3 pt-3 bg-white border-b-2 border-[#1a1a1a]">
            <div className="lab-search-container">
              <Search size={14} className="lab-search-icon" />
              <input 
                type="text" 
                placeholder="SCAN_POOL..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="lab-search-input"
              />
              {stats.godTier && (
                <div className="god-manifest-mini">
                  <input 
                    type="text" 
                    placeholder="Manifest..." 
                    className="god-manifest-input"
                    value={manifestationName}
                    onChange={(e) => setManifestationName(e.target.value)}
                  />
                  <button onClick={handleManifestIngredient} className="god-btn-mini">M</button>
                </div>
              )}
            </div>
          </div>

          <div className="lab-module-content">
            <div className="lab-ingredients-grid" ref={ingredientsRef}>
              <AnimatePresence mode="popLayout">
                {inventory
                  .filter(ing => 
                    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (ing.trait && ing.trait.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((ingredient, index) => (
                    <IngredientTile
                      key={`${ingredient.name}-${index}-${actionTriggerCount}`}
                      ingredient={ingredient}
                      isSelected={selectedIngredients.has(ingredient.name)}
                      isActive={false}
                      isDisabled={!currentOrder}
                      isHighlighted={
                        (tutorialStep === 4 && ingredient.name.toLowerCase().includes('fried egg'))
                      }
                      onClick={() => toggleIngredient(ingredient.name)}
                      onEdit={() => onEditIngredient(ingredient)}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="lab-column-footer">
            <span className="label">SELECTED:</span>
            <span className="value">{selectedIngredients.size}</span>
          </div>
        </div>

        {/* Center Column: Operation Table */}
        <div className="lab-column operation-column">
          <div className="column-technical-header">
            <div className="flex justify-between items-center w-full">
              <span className="tech-badge">OPERATIONAL_TABLE</span>
              <div className="flex gap-2">
                {currentOrder && (
                  <button 
                    className={`os-btn-mini ${isCooking ? 'loading' : ''}`}
                    onClick={() => onCookWithGemini(currentOrder.name)}
                    disabled={isCooking}
                  >
                    {isCooking ? 'COOKING...' : `START: ${currentOrder.name.toUpperCase()}`}
                  </button>
                )}
                {hasSelection && (
                  <button 
                    className="clear-lab-btn" 
                    onClick={() => setSelectedIngredients(new Set())}
                    title="Press 'C' key to clear selection"
                  >
                    CLEAR <kbd className="ml-1 px-1 py-0.5 text-[9px] font-mono border border-black/20 rounded bg-white/90 text-black shadow-sm select-none">C</kbd>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="operation-table-surface">
            <CookingWires />
            
            <AnimatePresence mode="wait">
              {activeAction ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="processing-overlay"
                >
                  <div className="processing-scanline"></div>
                  <div className="processing-text">PROCESSING_{activeAction.toUpperCase()}...</div>
                </motion.div>
              ) : manifestationResult ? (
                <motion.div 
                  key="manifest"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className={`lab-manifest ${manifestationResult.isDuplicate ? 'duplicate' : 'new'}`}
                >
                  <div className="manifest-ring"></div>
                  <div className="manifest-box">
                    <span className="text-4xl">{manifestationResult.emoji}</span>
                  </div>
                  <div className="manifest-info">
                    <div className="manifest-rarity">ENTITY_MANIFESTED</div>
                    <div className="manifest-name">{manifestationResult.name}</div>
                  </div>
                </motion.div>
              ) : (
                <div className="operation-idle">
                  <div className="operation-grid-pattern"></div>
                  <div className="idle-content">
                    {selectedIngredients.size > 0 ? (
                      <div className="selection-preview-grid">
                        <AnimatePresence mode="popLayout">
                          {Array.from(selectedIngredients).map((ingName) => {
                            const ing = inventory.find(i => i.name === ingName);
                            return (
                              <motion.div 
                                key={ingName}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="preview-item"
                              >
                                <span className="preview-emoji">{ing?.emoji || '❓'}</span>
                                <span className="preview-name">{ingName.toUpperCase()}</span>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <>
                        <div className="idle-cross"></div>
                        <div className="idle-label">AWAITING_INPUT</div>
                        <div className="selected-manifest-dots">
                          {Array.from(selectedIngredients).slice(0, 5).map((_, i) => (
                            <div key={i} className="dot animate-pulse"></div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="lab-tools-container" ref={actionsRef}>
            {[...COOKING_ACTIONS, ...customTools]
              .filter(action => action.displayName.toLowerCase().includes(toolsSearchTerm.toLowerCase()))
              .map(action => {
                const isServeDisabled = action.name === 'serve' && selectedIngredients.size !== 1;
                const isDisabled = isCooking ? false : (!hasSelection || activeAction !== null || isServeDisabled);
                const isServeAction = action.name === 'serve';
                return (
                  <button
                    key={action.name}
                    id={action.name === 'serve' ? 'serve' : undefined}
                    data-action={action.name}
                    className={`lab-action-btn ${activeAction === action.name ? 'active' : ''} ${isDisabled ? 'disabled' : ''} ${tutorialStep === 4 && action.name === 'serve' ? 'tutorial-highlight' : ''}`}
                    onClick={() => !isDisabled && executeAction(action)}
                    disabled={isDisabled}
                    title={isServeAction ? "Press 'S' key to serve the selected dish" : undefined}
                  >
                    <span className="btn-emoji">{action.emoji}</span>
                    <span className="btn-label">
                      {action.displayName.toUpperCase()}
                      {isServeAction && (
                        <kbd className="ml-1 px-1 py-0.5 text-[9px] font-mono border border-black/20 rounded bg-white text-black shadow-sm select-none">S</kbd>
                      )}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* New OS System Console Section */}
      <section id="system-control" className={`lab-system-console ${tutorialStep === 5 ? 'tutorial-highlight' : ''}`}>
        <div className="console-header">
          <div className="console-title flex items-center gap-2">
            <Zap size={14} className="text-[#1a1a1a]" />
            <span>KITCHEN_OS_SYSTEM_CONTROL // MODULE_SELECTOR</span>
          </div>
          <div className="console-tabs">
            <button 
              className={`console-tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <Bot size={12} />
              <span>LOGIC_CORE</span>
            </button>
            <button 
              className={`console-tab ${activeTab === 'chips' ? 'active' : ''}`}
              onClick={() => setActiveTab('chips')}
            >
              <Cpu size={12} />
              <span>SKILL_CHIPS</span>
            </button>
            <button 
              className={`console-tab ${activeTab === 'protocols' ? 'active' : ''}`}
              onClick={() => setActiveTab('protocols')}
            >
              <Zap size={12} />
              <span>PROTOCOLS</span>
            </button>
            <button 
              className={`console-tab ${activeTab === 'market' ? 'active' : ''}`}
              onClick={() => setActiveTab('market')}
            >
              <ShoppingBag size={12} />
              <span>MARKETPLACE</span>
            </button>
          </div>
        </div>

        <div className="console-content">
          <AnimatePresence mode="wait">
            {activeTab === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="modules-grid"
              >
                {PERSONALITIES.map(pers => (
                  <div 
                    key={pers.id} 
                    className={`module-card ${selectedPersonality.id === pers.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPersonality(pers)}
                  >
                    <div className="module-info">
                      <div className="module-icon">{pers.modifierEmoji}</div>
                      <div className="module-text">
                        <div className="module-name">{pers.name}</div>
                        <div className="module-desc">{pers.description}</div>
                        <div className="module-benefit">{pers.benefit}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'chips' && (
              <motion.div 
                key="chips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="modules-grid"
              >
                {SKILL_CHIPS.map(chip => (
                  <div 
                    key={chip.id} 
                    className={`module-card ${installedChips.includes(chip.id) ? 'selected' : ''}`}
                    onClick={() => {
                      if (installedChips.includes(chip.id)) {
                        setInstalledChips(prev => prev.filter(id => id !== chip.id));
                      } else if (stats.money >= chip.cost) {
                        setStats((prev: any) => ({ ...prev, money: prev.money - chip.cost }));
                        setInstalledChips(prev => [...prev, chip.id]);
                        soundService.playSuccess();
                      } else {
                        soundService.playError();
                        alert("INSUFFICIENT_FUNDS");
                      }
                    }}
                  >
                    <div className="module-info">
                      <div className="module-icon">{chip.emoji}</div>
                      <div className="module-text">
                        <div className="module-name">
                          <span>{chip.name}</span>
                          {!installedChips.includes(chip.id) && <span className="module-cost text-amber-400 font-bold ml-auto">${chip.cost}</span>}
                        </div>
                        <div className="module-desc">{chip.description}</div>
                        {installedChips.includes(chip.id) && <div className="module-benefit">::INSTALLED</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'protocols' && (
              <motion.div 
                key="protocols"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="modules-grid"
              >
                {GLOBAL_PROTOCOLS.map(proto => (
                  <div 
                    key={proto.id} 
                    className={`module-card protocol-card ${activeProtocol.id === proto.id ? 'active' : ''}`}
                    onClick={() => setActiveProtocol(proto)}
                  >
                    <div className="module-info">
                      <div className="module-icon"><Zap size={20} className={activeProtocol.id === proto.id ? 'text-[#00ff00]' : 'text-zinc-600'} /></div>
                      <div className="module-text">
                        <div className="module-name">{proto.name}</div>
                        <div className="module-desc">{proto.description}</div>
                        <div className="protocol-status">
                          {activeProtocol.id === proto.id ? '::ACTIVE' : '::STANDBY'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'market' && (
              <motion.div 
                key="market"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="modules-grid market"
              >
                <div className="market-header">
                  <span>GLOBAL_MARKETPLACE_FEED</span>
                  <button onClick={refreshMarketplace} className="market-refresh-btn"><RotateCcw size={10} /></button>
                </div>
                {marketplaceOffers.length === 0 ? (
                  <div className="empty-market">NO_ACTIVE_OFFERS</div>
                ) : marketplaceOffers.map(offer => (
                  <div key={offer.id} className={`module-card market-card ${offer.type}`}>
                    <div className="module-info">
                      <div className="module-icon">{offer.ingredientEmoji}</div>
                      <div className="module-text">
                        <div className="module-name">
                          {offer.type === 'buy' ? 'WANTED: ' : 'FOR SALE: '} {offer.ingredientName.toUpperCase()}
                        </div>
                        <div className="module-desc">
                          {offer.type === 'buy' ? 'Trade your entity for Credits' : 'Purchase entity from local pool'}
                        </div>
                        <div className="market-footer">
                          <span className="price">${offer.price}</span>
                          <button 
                            className={`trade-btn ${offer.type}`}
                            onClick={() => handleTrade(offer)}
                          >
                            {offer.type === 'buy' ? 'SELL' : 'BUY'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

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
                  ⚠️ SECURE IN-GAME PURCHASE AVAILABLE ⚠️
                </span>
                <div className="flex justify-center flex-col gap-4 w-full px-4">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        window.open(`https://buy.stripe.com/14A28sfbn3kQ7yVeHVf3a01?client_reference_id=${user.uid}`, '_blank');
                    }}
                    className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 text-black px-6 py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all uppercase tracking-widest shadow-[0_4px_15px_rgba(16,185,129,0.3)] group border border-emerald-300 z-10"
                  >
                    <div className="absolute inset-0 bg-white/30 w-full translate-x-[-150%] skew-x-[-20deg] group-hover:transition-all group-hover:duration-700 group-hover:translate-x-[150%] ease-in-out -z-10" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-md transition-opacity duration-300" />
                    <span className="relative z-20 flex items-center gap-2 drop-shadow-md">
                      <Lock size={18} className="group-hover:animate-bounce" />
                      Unlock PRO Plan ($5.00)
                    </span>
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(168, 85, 247, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        window.open(`https://buy.stripe.com/9B66oIe7jbRmdXj7ftf3a02?client_reference_id=${user.uid}`, '_blank');
                    }}
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 px-6 py-4 rounded-xl font-black flex items-center justify-center transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.4)] group border border-purple-400/50 z-10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] translate-x-[-100%] skew-x-[-20deg] group-hover:transition-all group-hover:duration-1000 group-hover:translate-x-[50%] ease-in-out -z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent rounded-b-xl -z-10" />
                    <div className="relative z-20 flex items-center gap-2 drop-shadow-lg text-white">
                      <Coffee size={18} className="group-hover:animate-pulse text-yellow-300" />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                        Unlock GOD Tier ($15.00)
                      </span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
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
          onRetry={() => fetchRecipeSteps(currentOrder.name, currentOrder.difficulty)}
          isLoading={isFetchingSteps}
          orderName={currentOrder.name}
          difficulty={currentOrder.difficulty}
          adsDisabled={stats.adsDisabled}
          proPlan={stats.proPlan}
          godTier={stats.godTier}
        />
      )}

      {/* Fame Level Requirement Error Modal - Extreme Glitch Edition */}
      {showFameLevelError && (
        <div className="os-modal-overlay" onClick={() => setShowFameLevelError(false)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: [0, -2, 2, -1, 1, 0] }}
            transition={{ duration: 0.2 }}
            className="os-modal-card border-4 border-[#ff4b2b] bg-[#0a0a0a] max-w-[450px] shadow-[0_0_50px_rgba(255,75,43,0.3)] relative overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            {/* Glitch Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay bg-[url('https://media.giphy.com/media/oEI9uWUicst3i/giphy.gif')]"></div>
            
            {/* Top Bar */}
            <div className="bg-[#ff4b2b] p-3 flex justify-between items-center text-white font-mono text-[9px] font-black tracking-widest">
              <div className="flex items-center gap-2">
                <span className="animate-pulse">●</span>
                <span>SYSTEM_LOCKDOWN // GATEKEEPER_V3</span>
              </div>
              <span>SECURITY_STATE: CRITICAL</span>
            </div>

            <div className="p-10 flex flex-col items-center relative z-10">
              <motion.div 
                animate={{ 
                  textShadow: [
                    "2px 0 red, -2px 0 blue",
                    "-2px 0 red, 2px 0 blue",
                    "0px 0 red, 0px 0 blue"
                  ]
                }}
                transition={{ duration: 0.1, repeat: Infinity, repeatType: "mirror" }}
                className="relative mb-12"
              >
                <div className="text-[100px] leading-none select-none opacity-10 absolute -top-10 left-1/2 -translate-x-1/2 font-black text-[#ff4b2b] italic">403</div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-[#ff4b2b] rounded-full flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(255,75,43,1)] border-4 border-white animate-bounce">
                    🚫
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter text-center uppercase leading-[0.8] mb-2">
                    Access<br/><span className="text-[#ff4b2b]">Rejected</span>
                  </h2>
                  <div className="h-1 w-12 bg-[#ff4b2b] mb-1"></div>
                </div>
              </motion.div>

              <div className="w-full grid grid-cols-2 gap-px bg-[#333] border border-[#333] mb-8 overflow-hidden rounded-sm">
                <div className="bg-[#0f0f0f] p-6 text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Required</p>
                  <p className="text-5xl font-black text-white">80</p>
                  <p className="text-[9px] text-[#ff4b2b] mt-1 font-mono">LEVEL_MIN</p>
                </div>
                <div className="bg-[#0f0f0f] p-6 text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Current</p>
                  <p className="text-5xl font-black text-white">{stats.level || 1}</p>
                  <p className="text-[9px] text-gray-400 mt-1 font-mono">LEVEL_AUTH</p>
                </div>
              </div>

              <div className="w-full font-mono text-[11px] text-[#ff4b2b] mb-10 p-5 border-2 border-[#ff4b2b55] bg-[#ff4b2b11] shadow-[inset_0_0_20px_rgba(255,75,43,0.1)]">
                <div className="flex justify-between border-b border-[#ff4b2b33] mb-3 pb-1 font-black opacity-80">
                  <span>ERROR_CODE:</span>
                  <span>LVL_INSUFFICIENT</span>
                </div>
                <div className="space-y-1 opacity-90 italic">
                  <p className="flex items-center gap-2"><span className="text-white">»</span> Unauthorized access to terminal...</p>
                  <p className="flex items-center gap-2"><span className="text-white">»</span> Credentials verification: FAILED</p>
                  <p className="flex items-center gap-2"><span className="text-white">»</span> Mandatory Delta: {80 - (stats.level || 1)} levels</p>
                </div>
              </div>

              <button 
                className="group relative w-full overflow-hidden"
                onClick={() => {
                  soundService.playClick();
                  setShowFameLevelError(false);
                }}
              >
                <div className="absolute inset-0 bg-[#ff4b2b] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative py-5 border-2 border-white bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-4">
                  <span>Acknowledge Error</span>
                  <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fame Rank Up Announcement Modal */}
      <AnimatePresence>
        {showFameRankUp && (
          <div className="os-modal-overlay z-[10000]" onClick={() => setShowFameRankUp(null)}>
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -100, opacity: 0, scale: 1.5 }}
              className="os-modal-card bg-white p-12 text-center rounded-none border-[12px] border-black shadow-[30px_30px_0px_rgba(0,0,0,0.2)] max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-8">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-[120px] leading-none mb-6"
                >
                  {showFameRankUp.emoji}
                </motion.div>
                <h2 className="text-6xl font-black text-black tracking-tighter uppercase mb-2">RANK UP</h2>
                <div className="h-2 w-32 bg-black mx-auto mb-6"></div>
              </div>

              <div className="bg-black text-white p-8 mb-8 inline-block rotate-[-2deg] shadow-xl">
                <p className="text-sm font-bold opacity-60 mb-1 uppercase tracking-widest">New Fame Standing</p>
                <p className="text-4xl font-black tracking-tighter">
                  {showFameRankUp.tier.toUpperCase()} <span className="text-[#00ff00]">STAGE_{showFameRankUp.stage}</span>
                </p>
              </div>

              <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">
                Your culinary frequency has resonated with the universe. 
                New digital horizons are now authorized for exploration.
              </p>

              <button 
                className="w-full py-5 bg-black text-white font-black uppercase tracking-[0.4em] text-xs hover:bg-[#00ff00] hover:text-black transition-all active:scale-95"
                onClick={() => {
                  soundService.playSuccess();
                  setShowFameRankUp(null);
                }}
              >
                EMBRACE DESTINY
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exclusive Fame Terminal (Kitchen OS Dark) */}
      {isFameTerminalOpen && (
        <div className="fame-os-overlay overflow-hidden" onClick={() => setIsFameTerminalOpen(false)}>
          <AntigravityBackground 
            count={25} 
            emojis={['✨', '⭐', '💎', '💰', '💸', '🏆', currentFame?.emoji || '🍳']} 
            opacityRange={[0.08, 0.2]}
            zIndex={1}
          />
          <div className="fame-terminal-window" onClick={e => e.stopPropagation()}>
            <div className="terminal-scanline"></div>
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="terminal-title">KITCHEN_OS FAME_PROTOCOL v2.4</div>
              <button className="terminal-close" onClick={() => setIsFameTerminalOpen(false)}>TERMINATE_SESSION</button>
            </div>

            <div className="terminal-content">
              <div className="terminal-fame-display">
                <div className="fame-identity-section">
                  <div className="fame-portal-badge" style={{ 
                    background: currentFame ? (currentFame.color.startsWith('linear') ? currentFame.color : currentFame.color) : '#1a1a1a',
                    boxShadow: currentFame ? `0 0 30px ${currentFame.color.startsWith('linear') ? '#00ff00' : currentFame.color}` : 'none',
                    border: '2px solid rgba(255,255,255,0.1)'
                  }}>
                    {currentFame ? currentFame.emoji : '💀'}
                  </div>
                  <div className="fame-identity-info">
                    <div className="flex justify-between items-end mb-1">
                      <h2 className="terminal-h2">{currentFame ? currentFame.tier.toUpperCase() : 'INITIATE'}</h2>
                      <span className="text-[9px] font-mono text-[#00ff00] opacity-70">
                        {currentFame ? `STAGE_${currentFame.stage}` : 'UNRANKED'}
                      </span>
                    </div>
                    
                    {/* Progress to next level */}
                    {(() => {
                      const nextLevel = FAME_LEVELS.find(l => l.threshold > (stats.fameDonated || 0));
                      const lastTierThreshold = FAME_LEVELS.filter(l => l.threshold <= (stats.fameDonated || 0)).pop()?.threshold || 0;
                      
                      if (!nextLevel) return (
                        <div className="mt-2">
                          <div className="terminal-progress-container h-2">
                            <div className="terminal-progress-fill w-full" />
                          </div>
                          <p className="text-[9px] text-[#00ff00] mt-1 uppercase font-bold text-center">MAX_FAME_ACHIEVED</p>
                        </div>
                      );

                      const progress = ((stats.fameDonated || 0) - lastTierThreshold) / (nextLevel.threshold - lastTierThreshold) * 100;
                      
                      return (
                        <div className="mt-2">
                          <div className="flex justify-between text-[8px] text-gray-500 mb-1 font-mono uppercase">
                            <span>{lastTierThreshold}cr</span>
                            <span>{nextLevel.threshold}cr</span>
                          </div>
                          <div className="terminal-progress-container h-2">
                            <div className="terminal-progress-fill" style={{ width: `${progress}%` }} />
                          </div>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase">Next: {nextLevel.tier} St_{nextLevel.stage}</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="terminal-stats-grid grid grid-cols-2 gap-4 mb-6">
                  <div className="t-stat border border-[#222] bg-[#0c0c0c] p-4 rounded-sm">
                    <span className="t-label text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Donated Credits</span>
                    <span className="t-value text-2xl font-black text-[#00ff00] tabular-nums">${stats.fameDonated || 0}</span>
                  </div>
                  <div className="t-stat border border-[#222] bg-[#0c0c0c] p-4 rounded-sm">
                    <span className="t-label text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Available Funds</span>
                    <span className="t-value text-2xl font-black text-[#00ff00] tabular-nums">${stats.money}</span>
                  </div>
                </div>

                <div className="terminal-action-zone bg-[#0f0f0f] border-2 border-[#1a1a1a] p-6 rounded-sm mb-6">
                  <h3 className="terminal-h3 text-xs text-gray-400 uppercase tracking-[0.2em] mb-4">Transfer Protocol</h3>
                  <div className="flex gap-2">
                    <div className="terminal-input-group flex-1 flex items-center bg-black border border-[#333] px-3 gap-2">
                      <span className="terminal-prompt text-[#00ff00] font-mono">$</span>
                      <input 
                        type="number" 
                        value={fameDonationAmount}
                        onChange={(e) => setFameDonationAmount(e.target.value)}
                        className="terminal-input bg-transparent border-none text-white font-mono text-sm w-full py-3 focus:outline-none"
                        placeholder="Amount..."
                      />
                    </div>
                    <button 
                      className="terminal-execute-btn flex-[0.8] bg-transparent border-2 border-[#00ff00] text-[#00ff00] font-black uppercase text-[10px] tracking-widest hover:bg-[#00ff00] hover:text-black transition-all disabled:opacity-30 disabled:grayscale"
                      onClick={handleDonateToFame}
                      disabled={stats.money < parseInt(fameDonationAmount, 10) || parseInt(fameDonationAmount, 10) <= 0}
                    >
                      Process_Injection
                    </button>
                  </div>
                </div>

                <div className="terminal-log bg-[#000] p-4 border border-[#333] font-mono text-[9px] text-[#00ff00] h-40 overflow-y-auto custom-scrollbar shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="mb-1 flex gap-3 items-start border-l border-[#00ff0022] pl-2">
                      <span className="text-[#004400] opacity-40 select-none shrink-0">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>{log}</motion.span>
                    </div>
                  ))}
                  <div className="animate-pulse bg-[#00ff00] w-1.5 h-3 inline-block align-middle ml-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Feed Archive Modal */}
      {showNewsFeed && (
        <div className="os-modal-overlay system-news-overlay" onClick={() => setShowNewsFeed(false)}>
          <div className="os-modal-card news-archive-card" onClick={e => e.stopPropagation()}>
            <div className="os-modal-header news-header">
              <span className="os-modal-icon">📡</span>
              <span className="os-modal-title">SYSTEM_BROADCAST_ARCHIVE</span>
              <button className="terminal-close ml-auto" onClick={() => setShowNewsFeed(false)}>X</button>
            </div>
            <div className="os-modal-body news-archive-body">
            {activeNewsId ? (
              <div className="active-news-detail">
                <div className="flex items-center gap-2 mb-4">
                  <button className="os-button-mini" onClick={() => setActiveNewsId(null)}>&lt; BACK</button>
                  <h3 className="news-detail-title">{NEWS_ITEMS.find(n => n.id === activeNewsId)?.title}</h3>
                </div>
                <div className="news-detail-content">
                  <p>{NEWS_ITEMS.find(n => n.id === activeNewsId)?.content}</p>
                </div>
              </div>
            ) : (
              <div className="news-list">
                {NEWS_ITEMS.map(item => (
                  <div 
                    key={item.id} 
                    className="news-item-row"
                    onClick={() => {
                      soundService.playClick();
                      setActiveNewsId(item.id);
                    }}
                  >
                    <div className="news-item-status">
                      <span className="status-dot pulsed"></span>
                    </div>
                    <div className="news-item-main">
                      <div className="news-item-header">
                        <span className="news-item-badge">{item.badge}</span>
                        <span className="news-item-date">{item.date}</span>
                      </div>
                      <div className="news-item-title">{item.title}</div>
                    </div>
                    <div className="news-item-arrow">
                      &gt;
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Emotional System Announcement (Kitchen OS Terminal Style) */}
      {showAnnoucement && (
        <div className="fame-os-overlay announcement-os-overlay">
          <div className="fame-terminal-window announcement-terminal" onClick={e => e.stopPropagation()}>
            <div className="terminal-scanline"></div>
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="terminal-title">KITCHEN_OS SYSTEM_ANNOUNCEMENT v1.0.4</div>
              <div style={{ width: '80px' }}></div>
            </div>

            <div className="terminal-content">
              <div className="terminal-log">
                <p className="log-line text-highlight-green">[LOAD] emotional_module_engaged...</p>
                <p className="log-line text-muted">[INFO] Source: Architect_Recursion</p>
              </div>

              <div className="terminal-body-text mt-6">
                <p className="terminal-p glow-text">&gt; CHEF_IDENTIFIED: {user.displayName || 'UNNAMED_ENTITY'}</p>
                
                <div className="terminal-action-zone mt-8">
                  <p className="text-large text-highlight-green mb-4">SYSTEM_STATUS: CRITICAL_RESOURCE_DRAIN</p>
                  
                  <p className="terminal-p mb-4">
                    Keeping <span className="text-highlight-green">Kitchen OS</span> online consumes massive computational heat. 
                    Maintaining this culinary universe is becoming impossible for the system to handle in isolation.
                  </p>

                  <p className="terminal-p mb-4 font-bold">
                    [!] To prevent total system shutdown, we will be integrating <span className="text-highlight-red uppercase">Ad_Protocols_v2</span> shortly.
                  </p>

                  <p className="terminal-p text-muted text-small italic">
                    &gt; This is necessary to keep the system operative for all chefs.
                  </p>
                </div>

                <div className="terminal-footer-actions mt-8">
                  <button 
                    className="terminal-execute-btn" 
                    onClick={() => {
                      setShowAnnouncement(false);
                      localStorage.setItem('announcementAck_v1', 'true');
                    }}
                  >
                    [ EXECUTE: ACKNOWLEDGE_REALITY ]
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  customTools: KitchenAction[];
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
  customTools,
}: CookingAgentProps) {
  const { client, setConfig, sendMessage } = useGeminiAPIContext();

  // Update config when inventory changes - enable thinking for cooking agent
  useEffect(() => {
    setConfig({
      systemInstruction: buildCookingAgentSystemInstruction(inventory, customTools),
      tools: generateCookingTools(customTools),
      // No thinkingBudget - enable thinking for cooking agent
    });
  }, [setConfig, inventory, customTools]);

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
      const action = [...COOKING_ACTIONS, ...customTools].find(a => a.name === actionName);
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
  }, [client, sendMessage, setActiveAction, setActionTriggerCount, setActiveIngredients, setInventory, executeCombinationRef, onServe, onPass, inventory, customTools]);

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
  generateDivineImage: (dishName: string) => Promise<void>;
  setChromaticMinigameOrder: React.Dispatch<React.SetStateAction<{order: Order, servedEmoji: string, reward: number} | null>>;
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
  generateDivineImage,
  setChromaticMinigameOrder,
}: VerificationAgentProps) {
  const { generateContent, setConfig } = useGeminiAPIContext();

  // Use refs to always access the current values (avoids stale closure)
  const ordersRef = useRef(orders);
  const inventoryRef = useRef(inventory);
  const currentOrderStepsRef = useRef(currentOrderSteps);
  const statsRef = useRef(stats);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);
  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);
  useEffect(() => {
    currentOrderStepsRef.current = currentOrderSteps;
  }, [currentOrderSteps]);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

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
      // Use ref to get current values (avoids stale closure)
      const currentOrders = ordersRef.current;
      const currentStats = statsRef.current;
      const currentSteps = currentOrderStepsRef.current;

      // Find candidate orders to check against (prefer in_progress, fallback to not_started)
      let candidateOrders = currentOrders.filter(o => o.status === 'in_progress');
      if (candidateOrders.length === 0) {
        candidateOrders = currentOrders.filter(o => o.status === 'not_started');
      }

      if (candidateOrders.length === 0) {
        return true; // No active or pending orders to verify against
      }

      // Check each candidate order for a match
      for (const order of candidateOrders) {
        try {
          // 1. Local Exact/Semantic Match Bypass (Instant & Reliable)
          const normServed = normalizeIngredientName(servedDishName);
          const normOrder = normalizeIngredientName(order.name);
          
          let localMatch = normServed === normOrder || 
                           normServed === normOrder + 's' || 
                           normOrder === normServed + 's';
          
          let result: VerificationResult;

          if (localMatch) {
            result = {
              matches: true,
              confidence: 1.0,
              explanation: "Local exact match detected."
            };
          } else {
            // 2. Gemini AI Verification for semantic matches
            const prompt = `Order: "${order.name}"\nServed dish: "${servedDishName}"\n\nDoes this served dish match the order? Be lenient and use semantic matching. If it's a very similar dish or a common variation, it should match.`;

            const contents: Content[] = [
              { role: 'user', parts: [{ text: prompt }] }
            ];

            const response = await generateContent(contents);
            const text = response?.text || '{}';
            result = JSON.parse(text);
          }

          // Apply confidence_boost upgrade
          let confidenceBonus = currentStats.purchasedUpgrades?.includes('confidence_boost') ? 0.1 : 0;
          if (currentStats.purchasedUpgrades?.includes('molecular_kit')) {
            confidenceBonus += 0.2;
          }
          const totalConfidence = result.confidence + confidenceBonus;

          if (result.matches && totalConfidence > 0.6) { // Lowered threshold slightly for better UX
            // Apply auto_plating bonus: if confidence is high, treat as perfect
            const finalConfidence = (currentStats.purchasedUpgrades?.includes('auto_plating') && totalConfidence > 0.85) 
              ? 1.0 
              : totalConfidence;

            // Look up the emoji from inventory for the served dish
            const servedIngredient = findIngredientInInventory(servedDishName, inventoryRef.current);
            const servedEmoji = servedIngredient?.emoji || '✅';

            // Match found! Update order to completed
            let priceMultiplier = currentStats.purchasedUpgrades?.includes('better_prices') ? 1.5 : 1;
            if (currentStats.purchasedUpgrades?.includes('golden_whisk')) {
              priceMultiplier *= 2;
            }
            if (currentStats.godTier) {
              priceMultiplier *= 3;
            }

            // Reward based on difficulty
            let baseReward = 50;
            if (order.difficulty === 'intermediate') baseReward = 100;
            else if (order.difficulty === 'difficult') baseReward = 250;
            else if (order.difficulty === 'nightmare') baseReward = 1000;

            const reward = Math.round(baseReward * priceMultiplier);

            // Special case for Chromatic: Trigger Minigame
            if (order.rarity === 'chromatic' || order.difficulty === 'chromatic') {
              setChromaticMinigameOrder({ order, servedEmoji, reward });
              // We return true so CookingAgent handles it as success, but we don't finalize order here
              return true;
            }

            // Save recipe
            setCompletedRecipes(prev => {
              if (prev.some(r => r.orderName === order.name)) return prev;
              
              const newRecipe: CompletedRecipe = {
                id: `recipe-${Date.now()}`,
                orderName: order.name,
                dishName: servedDishName,
                emoji: servedEmoji,
                timestamp: new Date().toISOString(),
                steps: [...currentSteps]
              };
              return [newRecipe, ...prev];
            });

            // Clear steps for next order
            setCurrentOrderSteps([]);

            // Generate Divine Image if God Tier
            if (currentStats.godTier) {
              generateDivineImage(servedDishName);
            }

            setStats((prev: any) => {
              const gainedXP = XP_PER_DIFFICULTY[order.difficulty] || 20;
              const newXP = (prev.xp || 0) + gainedXP;
              const newLevel = getLevelFromXP(newXP);
              const leveledUp = newLevel > (prev.level || 1);
              
              let newMoney = (prev.money || 0) + reward;
              let newPurchasedUpgrades = [...(prev.purchasedUpgrades || [])];
              let newTitle = prev.title || 'Kitchen Hand';
              
              const difficultyToCredits: { [key: string]: number } = {
                easy: 20,
                intermediate: 35,
                difficult: 60,
                nightmare: 150
              };
              const orderCredits = difficultyToCredits[order.difficulty] || 20;
              const lvlUpCredits = leveledUp ? (newLevel * 25) : 0;
              const newCredits = (prev.credits || 0) + orderCredits + lvlUpCredits;

              if (leveledUp) {
                newMoney += newLevel * 100;
                const applicableTitle = [...TITLES].reverse().find(t => newLevel >= t.level);
                if (applicableTitle) {
                  newTitle = applicableTitle.name;
                }
                if (Math.random() < 0.20) {
                  const unownedUpgrades = UPGRADES.filter(u => !newPurchasedUpgrades.includes(u.id));
                  if (unownedUpgrades.length > 0) {
                    const randomUpgrade = unownedUpgrades[Math.floor(Math.random() * unownedUpgrades.length)];
                    newPurchasedUpgrades.push(randomUpgrade.id);
                  }
                }
              }

              return {
                ...prev,
                completedOrders: prev.completedOrders + 1,
                completedNightmareOrders: order.difficulty === 'nightmare' 
                  ? (prev.completedNightmareOrders || 0) + 1 
                  : (prev.completedNightmareOrders || 0),
                money: newMoney,
                xp: newXP,
                level: newLevel,
                title: newTitle,
                purchasedUpgrades: newPurchasedUpgrades,
                maxConfidence: Math.max(prev.maxConfidence || 0, finalConfidence),
                completedDishes: prev.completedDishes?.includes(order.name) 
                  ? prev.completedDishes 
                  : [...(prev.completedDishes || []), order.name],
                pinnedOrders: (prev.pinnedOrders || []).filter((o: Order) => o.id !== order.id),
                credits: newCredits
              };
            });

            setOrders(prev => {
              const updatedOrders = prev.map(o =>
                o.id === order.id
                  ? { ...o, status: 'completed' as const, emoji: servedEmoji }
                  : o
              );
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

            return true;
          }
        } catch (error) {
          console.error('Error verifying order:', error);
        }
      }
      return false;
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
  const isSuperAdmin = ADMIN_EMAILS.includes(user.email || '');
  const isAdminUser = isSuperAdmin;

  const [terminalLogs, setTerminalLogs] = useState<string[]>(["[SYSTEM] Kernel loaded.", "[INFO] Awaiting authorization..."]);
  const [chromaticMinigameOrder, setChromaticMinigameOrder] = useState<{order: Order, servedEmoji: string, reward: number} | null>(null);
  const [showFameLevelError, setShowFameLevelError] = useState(false);
  const [showFameRankUp, setShowFameRankUp] = useState<{tier: string, stage: number, emoji: string} | null>(null);

  const addTerminalLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-49), msg]);
    soundService.playType();
  };

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
    // Start with only 5 easy recipes
    return EXAMPLE_ORDERS.filter(o => o.difficulty === 'easy').slice(0, 5);
  });

  // Overlay open states - start closed
  const [combinationAgentOpen, setCombinationAgentOpen] = useState(false);
  const [cookingAgentOpen, setCookingAgentOpen] = useState(false);
  const [verificationAgentOpen, setVerificationAgentOpen] = useState(false);

  // Cooking state - track if the cooking agent is actively working
  const [isCooking, setIsCooking] = useState(false);

  // God Tier State
  const [manifestationName, setManifestationName] = useState('');
  const [manifestationEmoji, setManifestationEmoji] = useState('✨');
  
  // Stripe Checkout
  const [checkoutPassType, setCheckoutPassType] = useState<'proPlan' | 'godTier' | 'musicPass' | null>(null);
  const [customToolName, setCustomToolName] = useState('');
  const [customToolEmoji, setCustomToolEmoji] = useState('🛠️');
  const [showCrumbleCustomizer, setShowCrumbleCustomizer] = useState(false);
  const [manifestationResult, setManifestationResult] = useState<{ name: string, emoji: string, isDuplicate: boolean } | null>(null);

  const handleCookieCustomizationSave = (customization: any) => {
    setShowCrumbleCustomizer(false);
    // You could save this customization to state or Firestore if needed
    // For now, let's just show a notification
    setManifestationResult({ 
      name: `Crumble Cookie Customized! (${customization.flavor})`, 
      emoji: '✨', 
      isDuplicate: false 
    });

    // Auto-clear notification
    setTimeout(() => setManifestationResult(null), 3000);
  };
  const [customTools, setCustomTools] = useState<KitchenAction[]>([]);
  const [divineImage, setDivineImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    pinnedOrders: [] as Order[],
    totalActions: 0,
    xp: 0,
    level: 1,
    title: 'Kitchen Hand',
    purchasedUpgrades: [] as string[],
    proPlan: false,
    godTier: false,
    musicPass: false,
    customTitle: null as string | null,
    profileImage: null as string | null,
    leaderboardOptIn: false,
    fameDonated: 0,
    adsDisabled: false,
    purchasedShopItems: [] as string[],
    currentTheme: 'green',
    discoveredIngredientsList: STARTING_INGREDIENTS,
    credits: 150,
    discordStatus: 'online',
    discordStatusText: 'Cocinando a toda máquina 🍳',
    discordStatusEmoji: '🟢',
    discordBio: '¡Chef profesional de My Little Kitchen combinando ingredientes y acciones culinarias!',
    discordBanner: 'banner_discord',
    discordBorder: 'border_none',
    purchasedCosmetics: ['banner_discord', 'border_none'] as string[],
    equippedHypeSquad: 'hype_bravery' as string | null,
    dailyChallenges: [
      { id: 'orders_3', title: 'Feed the Crowd', description: 'Complete 3 orders', target: 3, current: 0, reward: 500, type: 'orders', completed: false },
      { id: 'discover_5', title: 'New Flavors', description: 'Discover 5 new items', target: 5, current: 0, reward: 300, type: 'discovery', completed: false },
      { id: 'money_1000', title: 'Greedy Chef', description: 'Earn $1000', target: 1000, current: 0, reward: 200, type: 'money', completed: false },
    ]
  });

  // Apply theme to body
  useEffect(() => {
    document.body.className = '';
    if (stats.currentTheme && stats.currentTheme !== 'green') {
      document.body.classList.add(`theme-${stats.currentTheme}`);
    }
  }, [stats.currentTheme]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [selectedChefForProfile, setSelectedChefForProfile] = useState<any | null>(null);
  const currentFame = getCurrentFameLevel(stats.fameDonated || 0);
  const [showLevelError, setShowLevelError] = useState(false);
  const [showLeaderboardOptIn, setShowLeaderboardOptIn] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [adminCustomTitle, setAdminCustomTitle] = useState('');
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);
  const [isUpgradesExpanded, setIsUpgradesExpanded] = useState(false);
  const [isRecipeBookExpanded, setIsRecipeBookExpanded] = useState(false);
  const [completedRecipes, setCompletedRecipes] = useState<CompletedRecipe[]>([]);
  const [currentOrderSteps, setCurrentOrderSteps] = useState<{tool: string, ingredients: string[], result: string}[]>([]);

  const { client } = useGeminiAPIContext();

  const generateDivineImage = async (dishName: string) => {
    if (!stats.godTier) return;
    setIsGeneratingImage(true);
    try {
      // Use gemini-3-flash-preview which is standard in this environment
      const response = await client.generateContent('gemini-3-flash-preview', [
        {
          role: 'user',
          parts: [{
            text: `A realistic, high-quality, professional food photography of a delicious ${dishName}. Cinematic lighting, gourmet presentation, 4k resolution.`,
          }]
        },
      ], {
        imageConfig: {
          aspectRatio: "1:1",
        },
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          setDivineImage(`data:image/png;base64,${base64Data}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error generating divine image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 1. Load data from localStorage or Firestore on mount
  useEffect(() => {
    if (!user) return;

    const storageKey = `kitchen_gamestate_${user.uid}`;
    
    // Initial load
    const loadInitialData = async () => {
      try {
        // Try local storage first
        let hasLocalData = false;
        try {
          const localSaved = localStorage.getItem(storageKey);
          if (localSaved) {
            const data = JSON.parse(localSaved);
            if (data.stats) setStats(prev => ({ ...prev, ...data.stats }));
            if (data.unlockedAchievements) setUnlockedAchievements(data.unlockedAchievements);
            if (data.completedRecipes) setCompletedRecipes(data.completedRecipes);
            if (data.tutorialStep !== undefined) setTutorialStep(data.tutorialStep);
            if (data.inventory) setInventory(data.inventory);
            if (data.customTools) setCustomTools(data.customTools);
            hasLocalData = true;
          }
        } catch (e) {
          console.warn("Could not read local state:", e);
        }

        // Try Firestore if not guest
        if (!(user as any).isGuest && user.uid !== 'guest-chef-local') {
          const gameStateRef = doc(db, 'game_states', user.uid);
          const docSnap = await getDoc(gameStateRef).catch(err => {
            console.warn("Firestore read failed, relying on local storage state:", err);
            return null;
          });

          if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            const loadedStats = { ...stats, ...(data.stats || {}) };
            
            if (isAdminUser) {
              setStats({ ...loadedStats, proPlan: true, godTier: true, musicPass: true });
            } else {
              setStats(loadedStats);
            }
            
            if (loadedStats.pinnedOrders && loadedStats.pinnedOrders.length > 0) {
              setOrders(prev => {
                const newOrders = [...prev];
                loadedStats.pinnedOrders.forEach((pinned: Order) => {
                  if (!newOrders.some(o => o.id === pinned.id)) {
                    newOrders.unshift(pinned);
                  }
                });
                return newOrders;
              });
            }
            
            setUnlockedAchievements(data.unlockedAchievements || []);
            setCompletedRecipes(data.completedRecipes || []);
            setTutorialStep(data.tutorialStep ?? 1);
            
            if (data.inventory) {
              const merged = [...STARTING_INGREDIENTS];
              data.inventory.forEach((ing: any) => {
                if (!merged.some(m => m.name.toLowerCase() === ing.name.toLowerCase())) {
                  merged.push(ing);
                }
              });
              setInventory(merged);
            }
            setCustomTools(data.customTools || []);
          }
        }
        setIsDataLoaded(true);
      } catch (error) {
        console.warn("Error loading game state:", error);
        setIsDataLoaded(true); // Proceed anyway to avoid getting stuck
      }
    };

    loadInitialData();
  }, [user.uid]);

  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const q = query(
        collection(db, "game_states"), 
        orderBy("stats.money", "desc"), 
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const gameState = docSnap.data();
        const level = gameState.stats?.level || 1;
        const optIn = gameState.stats?.leaderboardOptIn || false;
        
        if ((level >= 5 && optIn) || ADMIN_EMAILS.includes(gameState.email || '')) {
          data.push({
            uid: docSnap.id,
            email: gameState.email || null,
            displayName: gameState.displayName || "Unknown Chef",
            photoURL: gameState.photoURL || null,
            money: gameState.stats?.money || 0,
            level: level,
            title: gameState.stats?.title || "Kitchen Hand",
            customTitle: gameState.stats?.customTitle || null,
            discordBanner: gameState.stats?.discordBanner || 'banner_discord',
            discordBorder: gameState.stats?.discordBorder || 'border_none',
            discordStatus: gameState.stats?.discordStatus || 'online',
            discordStatusEmoji: gameState.stats?.discordStatusEmoji || '💭',
            discordStatusText: gameState.stats?.discordStatusText || '',
            discordBio: gameState.stats?.discordBio || '',
            equippedHypeSquad: gameState.stats?.equippedHypeSquad || null,
            purchasedCosmetics: gameState.stats?.purchasedCosmetics || [],
            profileImage: gameState.stats?.profileImage || null,
            discoveredIngredients: gameState.stats?.discoveredIngredients || 0,
            completedNightmareOrders: gameState.stats?.completedNightmareOrders || 0,
            completedOrders: gameState.stats?.completedOrders || 0,
            fameDonated: gameState.stats?.fameDonated || 0,
            credits: gameState.stats?.credits || 0,
            proPlan: gameState.stats?.proPlan || false,
            godTier: gameState.stats?.godTier || false
          });
        }
        
        if (data.length >= 10) break;
      }
      setLeaderboardData(data);
    } catch (error) {
      console.warn("Error fetching leaderboard:", error);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  // 3. Save data to localStorage & Firestore when it changes
  useEffect(() => {
    if (!user || !isDataLoaded) return;

    const storageKey = `kitchen_gamestate_${user.uid}`;

    // Always save to localStorage (instant, works offline or without working auth key)
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        stats,
        inventory,
        completedRecipes,
        unlockedAchievements,
        purchasedUpgrades: stats.purchasedUpgrades,
        tutorialStep,
        customTools
      }));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    if ((user as any).isGuest || user.uid === 'guest-chef-local') return;

    const saveTimeout = setTimeout(async () => {
      try {
        const gameStateRef = doc(db, 'game_states', user.uid);
        await setDoc(gameStateRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Chef',
          photoURL: user.photoURL || null,
          money: stats.money,
          inventory: inventory,
          completedRecipes: completedRecipes,
          unlockedAchievements: unlockedAchievements,
          purchasedUpgrades: stats.purchasedUpgrades,
          stats: stats,
          tutorialStep: tutorialStep,
          customTools: customTools,
          lastUpdated: Timestamp.now()
        }, { merge: true }).catch(err => console.warn("Firestore save warning:", err));
      } catch (error) {
        console.warn("Error saving game state:", error);
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
    // Remove from inventory on every serve attempt
    setInventory(prev => {
      const index = prev.findIndex(i => normalizeIngredientName(i.name) === normalizeIngredientName(servedDishName));
      if (index !== -1) {
        const newInv = [...prev];
        newInv.splice(index, 1);
        return newInv;
      }
      return prev;
    });

    if (verifyServedDishRef.current) {
      const result = await verifyServedDishRef.current(servedDishName);
      
      if (result) {
        soundService.playSuccess();
        // Update stats and challenges
        setStats((prev: any) => ({
          ...prev,
          money: prev.money + 50, // Base reward for success
          dailyChallenges: (prev.dailyChallenges || []).map((c: any) => 
            c.type === 'orders' ? { ...c, current: c.current + 1 } :
            c.type === 'money' ? { ...c, current: c.current + 50 } : c
          )
        }));
      } else {
        soundService.playError();
      }

      setIsCooking(false); // Clear cooking state after verification
      return result;
    }
    setIsCooking(false);
    return false;
  }, [setInventory, setStats]);

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
      if (order?.name?.toLowerCase() === 'fried eggs') {
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
  }, [stats.purchasedUpgrades, orders, tutorialStep]);

  // Callback for passing on an order (marks it as failed)
  const handlePass = useCallback(() => {
    setOrders(prev => prev.map(order =>
      order.status === 'in_progress'
        ? { ...order, status: 'failed' as const, servedDish: 'Gave up' }
        : order
    ));
  }, []);

  const getPinCost = (order: Order) => {
    const difficultyOrRarity = order.rarity || order.difficulty;
    switch (difficultyOrRarity) {
      case 'chromatic':
      case 'nightmare': return 500;
      case 'mythic': return 350;
      case 'divine': return 250;
      case 'legendary': return 150;
      case 'epic': return 100;
      case 'rare': return 50;
      case 'uncommon': return 25;
      case 'difficult': return 100;
      case 'intermediate': return 25;
      case 'easy':
      case 'common': return 10;
      default: return 10;
    }
  };

  const handleTogglePin = useCallback((order: Order) => {
    if (order.isPinned) {
      soundService.playType();
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, isPinned: false } : o));
      setStats(prev => ({
        ...prev,
        pinnedOrders: (prev.pinnedOrders || []).filter((o: Order) => o.id !== order.id)
      }));
      addTerminalLog(`[SYSTEM] Order unpinned: ${order.name}`);
    } else {
      const cost = getPinCost(order);
      const actualCost = stats.godTier ? 0 : cost;

      if (stats.money < actualCost) {
        soundService.playError();
        addTerminalLog(`[ERROR] Insufficient funds to pin (Cost: $${actualCost})`);
        return;
      }
      
      const maxPins = stats.purchasedUpgrades?.includes('heart_slot_3') ? 3 :
                      stats.purchasedUpgrades?.includes('heart_slot_2') ? 2 : 1;
                      
      if ((stats.pinnedOrders || []).length >= maxPins) {
        soundService.playError();
        addTerminalLog(`[ERROR] Maximum pinned orders reached (${maxPins}). Check shop for upgrades.`);
        return;
      }

      soundService.playSuccess();
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, isPinned: true } : o));
      setStats(prev => ({
        ...prev,
        money: prev.money - actualCost,
        pinnedOrders: [...(prev.pinnedOrders || []), { ...order, isPinned: true }]
      }));
      addTerminalLog(`[SYSTEM] Order pinned: ${order.name} (Cost: $${actualCost})`);
    }
  }, [stats.money, stats.godTier, stats.purchasedUpgrades, stats.pinnedOrders]);

  const finalizeChromaticOrder = (success: boolean) => {
    if (!chromaticMinigameOrder) return;
    
    const { order, servedEmoji, reward } = chromaticMinigameOrder;
    
    if (success) {
      soundService.playSuccess();
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'completed' as const, emoji: servedEmoji } : o));
      setStats((prev: any) => ({
        ...prev,
        money: prev.money + reward,
        xp: prev.xp + 2500,
        completedOrders: prev.completedOrders + 1,
        completedDishes: Array.from(new Set([...(prev.completedDishes || []), order.name])),
        pinnedOrders: (prev.pinnedOrders || []).filter((o: Order) => o.id !== order.id),
        dailyChallenges: (prev.dailyChallenges || []).map((c: any) => 
          c.type === 'orders' ? { ...c, current: c.current + 1 } :
          c.type === 'money' ? { ...c, current: c.current + reward } : c
        )
      }));
      addTerminalLog(`[SUCCESS] CHROMATIC_HARMONY: ${order.name} stabilized and served.`);
    } else {
      soundService.playError();
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'failed' as const, servedDish: 'Stabilization Failed' } : o));
      addTerminalLog(`[ERROR] CHROMATIC_FAILURE: Resonance lost. ${order.name} collapsed.`);
    }
    
    setChromaticMinigameOrder(null);
  };

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
          onTogglePin={handleTogglePin}
          getPinCost={getPinCost}
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
          terminalLogs={terminalLogs}
          setTerminalLogs={setTerminalLogs}
          addTerminalLog={addTerminalLog}
          showFameLevelError={showFameLevelError}
          setShowFameLevelError={setShowFameLevelError}
          showFameRankUp={showFameRankUp}
          setShowFameRankUp={setShowFameRankUp}
          tutorialStep={tutorialStep}
          setTutorialStep={setTutorialStep}
          isRecipeBookExpanded={isRecipeBookExpanded}
          setIsRecipeBookExpanded={setIsRecipeBookExpanded}
          completedRecipes={completedRecipes}
          setCompletedRecipes={setCompletedRecipes}
          setCurrentOrderSteps={setCurrentOrderSteps}
          user={user}
          manifestationName={manifestationName}
          setManifestationName={setManifestationName}
          manifestationEmoji={manifestationEmoji}
          setManifestationEmoji={setManifestationEmoji}
          customToolName={customToolName}
          setCustomToolName={setCustomToolName}
          customToolEmoji={customToolEmoji}
          setCustomToolEmoji={setCustomToolEmoji}
          customTools={customTools}
          setCustomTools={setCustomTools}
          adminCustomTitle={adminCustomTitle}
          setAdminCustomTitle={setAdminCustomTitle}
          fetchLeaderboard={fetchLeaderboard}
          setIsLeaderboardOpen={setIsLeaderboardOpen}
          setShowLevelError={setShowLevelError}
          setShowLeaderboardOptIn={setShowLeaderboardOptIn}
          onEditIngredient={() => setShowCrumbleCustomizer(true)}
          manifestationResult={manifestationResult}
          setManifestationResult={setManifestationResult}
          currentFame={currentFame}
          onPurchasePlan={setCheckoutPassType}
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
          customTools={customTools}
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
          generateDivineImage={generateDivineImage}
          setChromaticMinigameOrder={setChromaticMinigameOrder}
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

      {/* Divine Visualization Modal */}
      {(divineImage || isGeneratingImage) && (
        <div className="divine-modal-overlay" onClick={() => !isGeneratingImage && setDivineImage(null)}>
          <div className="divine-modal-content" onClick={e => e.stopPropagation()}>
            <div className="divine-modal-header">
              <h3 className="divine-modal-title">✨ Divine Visualization ✨</h3>
              {!isGeneratingImage && <button className="divine-close-btn" onClick={() => setDivineImage(null)}>✕</button>}
            </div>
            <div className="divine-modal-body">
              {isGeneratingImage ? (
                <div className="divine-loading">
                  <div className="divine-spinner"></div>
                  <p>Manifesting visual essence...</p>
                </div>
              ) : (
                <img src={divineImage!} alt="Divine Dish" className="divine-image" referrerPolicy="no-referrer" />
              )}
            </div>
            {!isGeneratingImage && (
              <div className="divine-modal-footer">
                <p className="divine-hint">Witness the perfection of your creation, God of Creation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attribution Footer */}
      <footer className="attribution-footer">
        Ideas/feedback:{' '}
        <a href="https://x.com/SoyCookie010" target="_blank" rel="noopener noreferrer">
          ItsCookie@
        </a>
      </footer>

      {/* Music Player */}
      {isLeaderboardOpen && (
        <Leaderboard 
          data={leaderboardData} 
          isLoading={isLeaderboardLoading} 
          onClose={() => setIsLeaderboardOpen(false)} 
        />
      )}

      {selectedChefForProfile && (
        <div className="os-modal-overlay animate-fadeIn" style={{ zIndex: 3000 }} onClick={() => setSelectedChefForProfile(null)}>
          <div className="discord-profile-view-modal shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="os-modal-header-green-alt" style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
              <div className="header-left-group">
                <span className="os-modal-icon">🍳</span>
                <span className="os-modal-title" style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}>PERFIL DE CHEF</span>
              </div>
              <button 
                className="os-close-btn" 
                style={{ color: '#ffffff' }}
                onClick={() => { soundService.playClick(); setSelectedChefForProfile(null); }}
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 flex items-center justify-center bg-[#18181b]/55 border-b border-[#1a1a1a]">
              <div className="discord-profile-preview-card" style={{ width: '100%', maxWidth: '320px', boxShadow: 'none' }}>
                {/* Banner Preview */}
                <div 
                  className={`discord-banner-preview ${
                    selectedChefForProfile.discordBanner === 'banner_neon' ? 'preview-banner-neon' :
                    selectedChefForProfile.discordBanner === 'banner_sakura' ? 'preview-banner-sakura' :
                    selectedChefForProfile.discordBanner === 'banner_cosmic' ? 'preview-banner-cosmic' :
                    selectedChefForProfile.discordBanner === 'banner_gold' ? 'preview-banner-gold' :
                    selectedChefForProfile.discordBanner === 'banner_matrix' ? 'preview-banner-matrix' : ''
                  }`}
                  style={selectedChefForProfile.discordBanner === 'banner_discord' || !selectedChefForProfile.discordBanner ? { backgroundColor: '#2563eb' } : {}}
                />
                
                {/* Avatar and status dot */}
                <div className="discord-avatar-container">
                  <div className={`discord-avatar-inner ${
                    selectedChefForProfile.discordBorder === 'border_gaming' ? 'border-gaming-chroma' :
                    selectedChefForProfile.discordBorder === 'border_cute' ? 'border-cute-cat' :
                    selectedChefForProfile.discordBorder === 'border_fire' ? 'border-fire-ring' :
                    selectedChefForProfile.discordBorder === 'border_frost' ? 'border-frost-crystals' :
                    selectedChefForProfile.discordBorder === 'border_gold' ? 'border-gold-crown' :
                    selectedChefForProfile.discordBorder === 'border_early' ? 'border-chef-hat' : ''
                  }`}>
                    {selectedChefForProfile.profileImage || selectedChefForProfile.photoURL ? (
                      <img 
                        src={selectedChefForProfile.profileImage || selectedChefForProfile.photoURL} 
                        alt="Profile" 
                        className="discord-avatar-img"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#313338] text-white flex items-center justify-center font-bold text-2xl uppercase">
                        {selectedChefForProfile.displayName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className={`discord-status-dot-badge ${
                    selectedChefForProfile.discordStatus === 'online' ? 'status-online' :
                    selectedChefForProfile.discordStatus === 'idle' ? 'status-idle' :
                    selectedChefForProfile.discordStatus === 'dnd' ? 'status-dnd' : 'status-offline'
                  }`} />
                </div>
                
                {/* Details */}
                <div className="discord-profile-details">
                  <div className="discord-card-username flex items-center gap-1">
                    <span>{selectedChefForProfile.displayName}</span>
                    {(ADMIN_EMAILS.includes(selectedChefForProfile.email || '') || (selectedChefForProfile.displayName === 'VERIFIEDROBY' && selectedChefForProfile.money > 1000000)) && (
                      <img 
                        src={VERIFIED_BADGE_URL} 
                        alt="Verified" 
                        style={{ width: '16px', height: '16px' }}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {selectedChefForProfile.proPlan && (
                      <span className="text-[9px] bg-[#f97316] text-white px-1.5 py-0.5 font-extrabold uppercase rounded-sm leading-none">Pro Plan</span>
                    )}
                  </div>
                  
                  {selectedChefForProfile.discordStatusText && (
                    <div className="discord-card-custom-status">
                      <span>{selectedChefForProfile.discordStatusEmoji || '💭'}</span>
                      <span>{selectedChefForProfile.discordStatusText}</span>
                    </div>
                  )}
                  
                  {/* Badges container */}
                  <div className="discord-user-badge-container">
                    {getChefBadges(selectedChefForProfile, selectedChefForProfile.email).length > 0 ? (
                      getChefBadges(selectedChefForProfile, selectedChefForProfile.email).map((badge) => (
                        <div 
                          key={badge.id} 
                          className={`discord-profile-badge ${badge.isDifficult ? 'badge-difficult' : ''}`}
                        >
                          <span>{badge.emoji}</span>
                          <div className="badge-tooltip">
                            <p className="font-bold border-b border-white/20 pb-1 mb-1">{badge.name}</p>
                            <p>{badge.desc}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400 italic px-1">Sin insignias equipo</span>
                    )}
                  </div>
                  
                  <div className="discord-card-separator" />
                  
                  <div className="discord-card-section-title">Sobre Mí</div>
                  <p className="discord-card-bio mb-4 text-[12px]">{selectedChefForProfile.discordBio || 'Este chef no ha escrito una biografía todavía.'}</p>
                  
                  {/* Active Activity Frame */}
                  <div className="discord-activity-card">
                    <div className="discord-activity-header">Cocinando en Vivo</div>
                    <div className="discord-activity-body">
                      <div className="discord-activity-game-icon">🍳</div>
                      <div className="discord-activity-details">
                        <p className="discord-activity-game-name">My Little Kitchen</p>
                        <p className="discord-activity-game-stats">Rango: {selectedChefForProfile.customTitle || selectedChefForProfile.title || 'Kitchen Hand'}</p>
                        <p className="discord-activity-game-stats">Nivel: {selectedChefForProfile.level || 1} • Capital: ${selectedChefForProfile.money?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-[#1e1f22] flex justify-end gap-2 border-t border-[#1a1a1a]">
              <button 
                type="button" 
                onClick={() => { soundService.playClick(); setSelectedChefForProfile(null); }}
                className="px-4 py-1.5 font-bold uppercase tracking-wider text-[11px] bg-red-600/25 border border-red-500/50 hover:bg-red-600/40 text-red-100 rounded-sm transition-all"
              >
                CERRAR_PERFIL
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaderboardOptIn && (
        <div className="os-modal-overlay" onClick={() => setShowLeaderboardOptIn(false)}>
          <div className="os-modal-card" onClick={e => e.stopPropagation()}>
            <div className="os-modal-header-green">
              <span className="os-modal-icon">⚡</span>
              <span className="os-modal-title">ELIGIBILITY_CONFIRMED</span>
            </div>
            <div className="os-modal-body">
              <div className="os-status-code">STATUS: ELIGIBLE_FOR_RANKING</div>
              <p className="os-modal-text">
                Congratulations, Chef. You have reached the elite tier. 
                You are now eligible to appear on the global <span className="text-highlight-green">LEADERBOARD</span>.
              </p>
              
              <div className="os-optin-control">
                <div className="os-control-label">
                  <span className="label-main">BROADCAST_PRESENCE</span>
                  <span className="label-sub">Allow other chefs to see your stats</span>
                </div>
                <label className="os-switch">
                  <input 
                    type="checkbox" 
                    checked={stats.leaderboardOptIn}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setStats(prev => ({ ...prev, leaderboardOptIn: val }));
                    }}
                  />
                  <span className="os-slider"></span>
                </label>
              </div>

              <div className="os-modal-actions">
                <button 
                  className="os-modal-btn green" 
                  onClick={() => {
                    setShowLeaderboardOptIn(false);
                    if (stats.leaderboardOptIn) {
                      fetchLeaderboard();
                      setIsLeaderboardOpen(true);
                    }
                  }}
                >
                  {stats.leaderboardOptIn ? 'PROCEED_TO_RANKINGS' : 'CLOSE_TERMINAL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCrumbleCustomizer && (
        <CrumbleCookieCustomizer 
          onClose={() => setShowCrumbleCustomizer(false)}
          onSave={handleCookieCustomizationSave}
        />
      )}

      {chromaticMinigameOrder && (
        <ChromaticMinigame 
          order={chromaticMinigameOrder.order}
          onSuccess={() => finalizeChromaticOrder(true)}
          onFail={() => finalizeChromaticOrder(false)}
        />
      )}

      {showLevelError && (
        <div className="os-modal-overlay" onClick={() => setShowLevelError(false)}>
          <div className="os-modal-card" onClick={e => e.stopPropagation()}>
            <div className="os-modal-header-red">
              <span className="os-modal-icon">⚠️</span>
              <span className="os-modal-title">ACCESS_DENIED</span>
            </div>
            <div className="os-modal-body">
              <div className="os-error-code">ERROR_CODE: LVL_REQ_NOT_MET</div>
              <p className="os-modal-text">
                The Leaderboard is restricted to elite chefs. 
                You must reach <span className="text-highlight">LEVEL 5</span> to view global rankings.
              </p>
              <div className="os-modal-progress-hint">
                CURRENT_LEVEL: {stats.level || 1} / 5
              </div>
              <button className="os-modal-btn" onClick={() => setShowLevelError(false)}>
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutPassType && (
        <StripeCheckoutModal
          uid={user.uid}
          passType={checkoutPassType}
          onClose={() => setCheckoutPassType(null)}
          onSuccess={() => {
            setCheckoutPassType(null);
            addTerminalLog("[STRIPE] Transaction confirmed. Waiting for sync...");
            alert("Payment successful! Synchronizing clearance levels...");
          }}
        />
      )}

      <MusicPlayer 
        hasMusicPass={stats.musicPass} 
        onPurchasePass={() => {
          // Open Stripe Payment Link with client_reference_id
          window.open(`https://buy.stripe.com/fZu7sM2oB6x206tgQ3f3a00?client_reference_id=${user.uid}`, '_blank');
        }} 
      />
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-[#33ff33] animate-pulse">INIT_KITCHEN_OS...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <GeminiAPIProvider>
      <KitchenAppContainer user={user} />
    </GeminiAPIProvider>
  );
}

export default App;
