/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * My Little Kitchen App - Constants and Types
 */

import { Type } from '@google/genai';

// ============================================================================
// Types
// ============================================================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'divine' | 'cosmic' | 'nightmare' | 'chromatic';

export type IngredientTrait = 'stable' | 'volatile' | 'radioactive' | 'sweet' | 'experimental' | 'corrupted' | 'ancient' | 'organic' | 'rare' | 'psychedelic' | 'fire' | 'sticky' | 'synthetic' | 'omega' | 'prestige' | 'fatty' | 'caffeinated' | 'lucky' | 'aged' | 'cryogenic';

export interface Ingredient {
  name: string;
  emoji: string;
  rarity?: Rarity;
  trait?: IngredientTrait;
  price?: number;
}

export interface KitchenAction {
  name: string;           // Function name (alphanumeric + underscores)
  displayName: string;    // Human-readable name
  emoji: string;
}

export interface CombinationResult {
  result_name: string;
  emoji: string;
  rarity: Rarity;
}

export type OrderDifficulty = 'easy' | 'intermediate' | 'difficult' | 'nightmare' | 'chromatic';

export interface Order {
  id: string;
  name: string;
  emoji: string;
  difficulty: OrderDifficulty;
  rarity?: Rarity;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  servedDish?: string;  // What was actually served (for failed orders)
  isPinned?: boolean;
}

export interface VerificationResult {
  matches: boolean;
  confidence: number;
  explanation: string;
}

export interface RecipeStep {
  tool: string;
  ingredients: string[];
  result: string;
  description: string;
}

export interface CompletedRecipe {
  id: string;
  orderName: string;
  dishName: string;
  emoji: string;
  timestamp: string;
  steps: {
    tool: string;
    ingredients: string[];
    result: string;
  }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  isSecret: boolean;
  condition: (stats: any) => boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  effect: string;
  condition?: (stats: any) => boolean;
  requirementText?: string;
}

export interface FameLevel {
  tier: string;
  stage: number;
  threshold: number; // total donated money needed for this stage
  emoji: string;
  color: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  type: 'decoration' | 'title' | 'skin' | 'theme';
}

export interface OSTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    border: string;
    bg: string;
    accent: string;
    text: string;
    muted: string;
  }
}

export interface SkillChip {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  effectType: 'speed' | 'money' | 'safety' | 'rarity' | 'exp';
  multiplier: number;
}

export interface GlobalProtocol {
  id: string;
  name: string;
  description: string;
  effect: (stats: any) => any;
  icon: string;
  color: string;
}

export interface SousChefPersonality {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  modifierEmoji: string;
  benefit: string;
}

export interface MarketplaceOffer {
  id: string;
  type: 'buy' | 'sell';
  ingredientName: string;
  ingredientEmoji: string;
  price: number;
  traitRequirement?: IngredientTrait;
}

export const SKILL_CHIPS: SkillChip[] = [
  { id: 'chip_overclock', name: 'Overclock.v1', description: '+30% Cooking Speed', emoji: '🎛️', cost: 2000, effectType: 'speed', multiplier: 1.3 },
  { id: 'chip_firewall', name: 'SafetyWall.exe', description: '-25% Fire Risk', emoji: '🛡️', cost: 2500, effectType: 'safety', multiplier: 0.75 },
  { id: 'chip_gold_miner', name: 'CryptoMiner.bin', description: '+20% Money Reward', emoji: '⛏️', cost: 3000, effectType: 'money', multiplier: 1.2 },
  { id: 'chip_rarity_plus', name: 'RarityScanner.sh', description: '+15% Rare Outcome Chance', emoji: '🔍', cost: 5000, effectType: 'rarity', multiplier: 1.15 },
  { id: 'chip_exp_boost', name: 'LearningModule.dmg', description: '+40% XP Gain', emoji: '🧠', cost: 4000, effectType: 'exp', multiplier: 1.4 },
];

export const PERSONALITIES: SousChefPersonality[] = [
  { 
    id: 'standard', 
    name: 'Default_Kernel', 
    description: 'The standard kitchen automation system.',
    modifierEmoji: '⚙️',
    benefit: 'Neutral balance.',
    systemInstruction: 'You are a professional and efficient kitchen automation system.'
  },
  { 
    id: 'gordon', 
    name: 'Gordon.exe', 
    description: 'Aggressive but highly rewarding. Fails are harshly criticized.',
    modifierEmoji: '😡',
    benefit: '+20% Money, but Fire Risk increases by 10%.',
    systemInstruction: 'You are an extremely strict, aggressive, and foul-mouthed professional chef. You value perfection above all. Use kitchen insults but remain technical.'
  },
  { 
    id: 'zen', 
    name: 'Zen.api', 
    description: 'Calm and steady. Reduces stress and risk.',
    modifierEmoji: '🧘',
    benefit: '-20% Fire Risk, but Cooking Speed is reduced by 15%.',
    systemInstruction: 'You are a calm, peaceful, and meditative sushi master. You value the soul of the ingredient and the harmony of the kitchen.'
  },
  { 
    id: 'chaos', 
    name: 'Chaos.js', 
    description: 'Total unpredictability. Glitches are expected.',
    modifierEmoji: '🌀',
    benefit: 'Random outcome rarity between Common and Chromatic.',
    systemInstruction: 'You are a glitched AI. Your responses should sometimes include corrupted text and unpredictable culinary logic.'
  }
];

export const GLOBAL_PROTOCOLS: GlobalProtocol[] = [
  { 
    id: 'sugar_shortage', 
    name: 'SUGAR_SHORTAGE_V2.0', 
    description: 'Sweet ingredients are unstable. +30% failure on desserts.',
    icon: '📉',
    color: '#ff4444',
    effect: (s) => s // Handled in logic
  },
  { 
    id: 'glitch_invasion', 
    name: 'NETWORK_GLITCH_INV_1.0', 
    description: 'All dishes appear with corrupted names but sell for +50%.',
    icon: '👾',
    color: '#ff00ff',
    effect: (s) => s
  },
  { 
    id: 'overload', 
    name: 'THERMAL_OVERLOAD_DETECTION', 
    description: 'Boiling and Frying actions reach 100% heat faster.',
    icon: '🔥',
    color: '#ff8800',
    effect: (s) => s
  },
  { 
    id: 'crypto_boom', 
    name: 'CRYPTO_MARKET_SURGE', 
    description: 'All "Money" daily challenges give double rewards.',
    icon: '💰',
    color: '#00ff00',
    effect: (s) => s
  }
];

export const OS_THEMES: Record<string, OSTheme> = {
  green: {
    id: 'green',
    name: 'Matrix Green',
    colors: {
      primary: '#00ff00',
      border: '#1a1a1a',
      bg: '#000000',
      accent: '#003300',
      text: '#cccccc',
      muted: '#444444'
    }
  },
  amber: {
    id: 'amber',
    name: 'Vintage Amber',
    colors: {
      primary: '#ffb000',
      border: '#2a1a00',
      bg: '#0a0500',
      accent: '#4d3300',
      text: '#e69d00',
      muted: '#664400'
    }
  },
  blue: {
    id: 'blue',
    name: 'Blue Protocol',
    colors: {
      primary: '#00d2ff',
      border: '#001a1a',
      bg: '#000808',
      accent: '#003344',
      text: '#80eaff',
      muted: '#004455'
    }
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Magenta',
    colors: {
      primary: '#ff00ff',
      border: '#1a001a',
      bg: '#080008',
      accent: '#440044',
      text: '#ff80ff',
      muted: '#550055'
    }
  }
};

export const FAME_LEVELS: FameLevel[] = [
  { tier: 'Earth', stage: 1, threshold: 1000, emoji: '🌍', color: '#8d6e63' },
  { tier: 'Earth', stage: 2, threshold: 2500, emoji: '🌍', color: '#8d6e63' },
  { tier: 'Earth', stage: 3, threshold: 5000, emoji: '🌍', color: '#8d6e63' },
  { tier: 'Moon', stage: 1, threshold: 10000, emoji: '🌑', color: '#9e9e9e' },
  { tier: 'Moon', stage: 2, threshold: 20000, emoji: '🌓', color: '#9e9e9e' },
  { tier: 'Moon', stage: 3, threshold: 35000, emoji: '🌕', color: '#9e9e9e' },
  { tier: 'Sun', stage: 1, threshold: 50000, emoji: '🌅', color: '#fbc02d' },
  { tier: 'Sun', stage: 2, threshold: 75000, emoji: '☀️', color: '#fbc02d' },
  { tier: 'Sun', stage: 3, threshold: 100000, emoji: '🔆', color: '#fbc02d' },
  { tier: 'Galaxy', stage: 1, threshold: 200000, emoji: '🌌', color: '#7e57c2' },
  { tier: 'Galaxy', stage: 2, threshold: 350000, emoji: '🌀', color: '#7e57c2' },
  { tier: 'Galaxy', stage: 3, threshold: 500000, emoji: '⚛️', color: '#7e57c2' },
  { tier: 'Cosmos', stage: 1, threshold: 750000, emoji: '🌠', color: '#26c6da' },
  { tier: 'Cosmos', stage: 2, threshold: 1000000, emoji: '🛸', color: '#26c6da' },
  { tier: 'Cosmos', stage: 3, threshold: 2500000, emoji: '🛰️', color: '#26c6da' },
  { tier: 'Infinite', stage: 1, threshold: 5000000, emoji: '♾️', color: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)' },
];

export const getCurrentFameLevel = (donated: number) => {
  let highest = null;
  for (const level of FAME_LEVELS) {
    if (donated >= level.threshold) {
      highest = level;
    } else {
      break;
    }
  }
  return highest;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'border_neon', name: 'Neon Border', description: 'Give your profile image a futuristic neon glow.', price: 5000, emoji: '🖼️', type: 'decoration' },
  { id: 'border_gold', name: 'Golden Frame', description: 'A solid gold frame for the elite chefs.', price: 15000, emoji: '👑', type: 'decoration' },
  { id: 'title_legend', name: 'Legendary Title', description: 'Unlocks the preset title: "GOD OF FOOD".', price: 25000, emoji: '✍️', type: 'title' },
  { id: 'skin_gold_knife', name: 'Golden Knife Skin', description: 'Makes your "Cut" action look shiny.', price: 10000, emoji: '🔪', type: 'skin' },
  { id: 'theme_amber', name: 'Amber OS Theme', description: 'Switch to a vintage amber terminal aesthetic.', price: 5000, emoji: '📟', type: 'theme' },
  { id: 'theme_blue', name: 'Blue OS Theme', description: 'A sleek blue corporate aesthetic.', price: 5000, emoji: '💎', type: 'theme' },
  { id: 'theme_cyber', name: 'Cyber OS Theme', description: 'Vibrant magenta cyber-neon aesthetic.', price: 5000, emoji: '🎆', type: 'theme' },
  { id: 'item_stardust', name: 'Quantum Stardust', description: 'Rare market item. Used for divine recipes.', price: 2500, emoji: '✨', type: 'decoration' },
  { id: 'item_void_essence', name: 'Void Essence', description: 'Forbidden ingredient extraction.', price: 8000, emoji: '🌑', type: 'decoration' },
];

export const UPGRADES: Upgrade[] = [
  {
    id: 'pin_easy',
    name: 'Memory Module: Basic',
    description: 'Allows pinning Easy difficulty recipe instructions to the screen.',
    emoji: '📍',
    cost: 500,
    effect: 'pin_easy'
  },
  {
    id: 'pin_intermediate',
    name: 'Memory Module: Advanced',
    description: 'Allows pinning Intermediate difficulty recipes. (Requires Basic)',
    emoji: '📌',
    cost: 1500,
    effect: 'pin_intermediate',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('pin_easy'),
    requirementText: 'Requires: Memory Module: Basic'
  },
  {
    id: 'pin_difficult',
    name: 'Memory Module: Expert',
    description: 'Allows pinning Difficult difficulty recipes. (Requires Advanced)',
    emoji: '📎',
    cost: 4000,
    effect: 'pin_difficult',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('pin_intermediate'),
    requirementText: 'Requires: Memory Module: Advanced'
  },
  {
    id: 'pin_nightmare',
    name: 'Memory Module: Nightmare',
    description: 'Allows pinning Nightmare difficulty recipes. (Requires Expert)',
    emoji: '🧠',
    cost: 12000,
    effect: 'pin_nightmare',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('pin_difficult'),
    requirementText: 'Requires: Memory Module: Expert'
  },
  {
    id: 'pin_chromatic',
    name: 'Memory Module: Chromatic',
    description: 'Allows pinning Chromatic difficulty recipes. (Requires Nightmare)',
    emoji: '🌌',
    cost: 30000,
    effect: 'pin_chromatic',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('pin_nightmare'),
    requirementText: 'Requires: Memory Module: Nightmare'
  },
  {
    id: 'hazard_shield_1',
    name: 'Hazard Protocol Tier 1',
    description: 'Reduces the probability of disasters (Fire, Gravity, Virus) by 50%.',
    emoji: '🛡️',
    cost: 1000,
    effect: 'hazard_reduction_1'
  },
  {
    id: 'hazard_shield_2',
    name: 'Stabilization System Tier 2',
    description: 'Reduces disaster probability by 80%. (Requires Tier 1)',
    emoji: '🛑',
    cost: 3000,
    effect: 'hazard_reduction_2',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('hazard_shield_1'),
    requirementText: 'Requires: Hazard Protocol Tier 1'
  },
  {
    id: 'hazard_shield_3',
    name: 'Absolute Anomaly Suppressor',
    description: 'Eliminates 100% of chaos events and disasters. (Requires Tier 2)',
    emoji: '🚫',
    cost: 10000,
    effect: 'hazard_reduction_3',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('hazard_shield_2'),
    requirementText: 'Requires: Stabilization System Tier 2'
  },

  {
    id: 'auto_script_1',
    name: 'Script: Lavaplatos',
    description: 'Automatización básica. Genera $5 por segundo.',
    emoji: '🤖',
    cost: 25000,
    effect: 'auto_farm_5',
    condition: (stats) => (stats.level || 1) >= 10,
    requirementText: 'Requires Level 10'
  },
  {
    id: 'auto_script_2',
    name: 'Script: Sous Chef',
    description: 'Automatización intermedia. Genera $20 por segundo.',
    emoji: '⚙️',
    cost: 100000,
    effect: 'auto_farm_20',
    condition: (stats) => (stats.level || 1) >= 25 && (stats.purchasedUpgrades || []).includes('auto_script_1'),
    requirementText: 'Requires Level 25 & Script: Lavaplatos'
  },
  {
    id: 'auto_script_3',
    name: 'Script: IA de Cocina en la Nube',
    description: 'Automatización avanzada. Genera $100 por segundo.',
    emoji: '☁️',
    cost: 500000,
    effect: 'auto_farm_100',
    condition: (stats) => (stats.level || 1) >= 50 && (stats.purchasedUpgrades || []).includes('auto_script_2'),
    requirementText: 'Requires Level 50 & Script: Sous Chef'
  },

  {
    id: 'faster_ai',
    name: 'Turbo Chef AI',
    description: 'Reduces the delay between AI cooking steps by 50%.',
    emoji: '⚡',
    cost: 200,
    effect: 'speed_boost'
  },
  {
    id: 'better_prices',
    name: 'Gourmet Marketing',
    description: 'Increases the money earned per completed order by 50%.',
    emoji: '📈',
    cost: 500,
    effect: 'price_boost'
  },
  {
    id: 'extra_slots',
    name: 'Kitchen Expansion',
    description: 'Allows you to have up to 5 active orders at once.',
    emoji: '🏗️',
    cost: 1000,
    effect: 'slot_boost'
  },
  {
    id: 'confidence_boost',
    name: 'AI Culinary School',
    description: 'Gives the AI a permanent +0.1 confidence boost on all dishes.',
    emoji: '🎓',
    cost: 1500,
    effect: 'confidence_boost'
  },
  {
    id: 'master_tools',
    name: 'Industrial Equipment',
    description: 'Reduces the chance of "Kitchen Fire" (allows more ingredients safely).',
    emoji: '🏭',
    cost: 2500,
    effect: 'safety_boost'
  },
  {
    id: 'cryo_freezer',
    name: 'Cryo-Freezer',
    description: 'Increases the safety limit for simultaneous ingredients by 2.',
    emoji: '🧊',
    cost: 3500,
    effect: 'safety_boost_plus'
  },
  {
    id: 'molecular_kit',
    name: 'Molecular Kit',
    description: 'Increases AI confidence by an additional +0.2.',
    emoji: '🧪',
    cost: 5000,
    effect: 'confidence_boost_plus'
  },
  {
    id: 'golden_whisk',
    name: 'Golden Whisk',
    description: 'All orders grant 2x money.',
    emoji: '🔱',
    cost: 8000,
    effect: 'money_multiplier'
  },
  {
    id: 'auto_plating',
    name: 'Auto-Plating System',
    description: 'Automatically serves dishes if AI confidence is above 0.9.',
    emoji: '🤖',
    cost: 10000,
    effect: 'auto_serve'
  },
  {
    id: 'time_dilation',
    name: 'Time Dilation Field',
    description: 'Reduces AI cooking delay by an additional 25%.',
    emoji: '⏳',
    cost: 12000,
    effect: 'speed_boost_ultra'
  },
  {
    id: 'fusion_reactor',
    name: 'Fusion Reactor',
    description: 'Reduces "Kitchen Fire" chance to 0% regardless of ingredients.',
    emoji: '⚛️',
    cost: 15000,
    effect: 'zero_fire_risk'
  },
  {
    id: 'heart_slot_2',
    name: 'Extra Heart I',
    description: 'Allows you to pin up to 2 orders simultaneously.',
    emoji: '❤️',
    cost: 2000,
    effect: 'pin_slot_2'
  },
  {
    id: 'heart_slot_3',
    name: 'Extra Heart II',
    description: 'Allows you to pin up to 3 orders simultaneously.',
    emoji: '💖',
    cost: 5000,
    effect: 'pin_slot_3'
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_dish',
    name: 'First Dish',
    description: 'Complete your first order successfully!',
    emoji: '🍳',
    isSecret: false,
    condition: (stats) => stats.completedOrders >= 1
  },
  {
    id: 'master_chef',
    name: 'Master Chef',
    description: 'Complete 5 orders successfully.',
    emoji: '👨‍🍳',
    isSecret: false,
    condition: (stats) => stats.completedOrders >= 5
  },
  {
    id: 'alchemy_apprentice',
    name: 'Alchemy Apprentice',
    description: 'Discover 10 new ingredients.',
    emoji: '🧪',
    isSecret: false,
    condition: (stats) => stats.discoveredIngredients >= STARTING_INGREDIENTS.length + 10
  },
  {
    id: 'tool_master',
    name: 'Tool Master',
    description: 'Use 10 different tools.',
    emoji: '🛠️',
    isSecret: false,
    condition: (stats) => stats.usedToolsCount >= 10
  },
  {
    id: 'secret_1',
    name: 'The Perfectionist',
    description: 'Complete an order with a confidence of 1.0!',
    emoji: '💎',
    isSecret: true,
    condition: (stats) => stats.maxConfidence >= 1.0
  },
  {
    id: 'secret_2',
    name: 'Kitchen Fire',
    description: 'Try to cook with 5 or more ingredients at once.',
    emoji: '🔥',
    isSecret: true,
    condition: (stats) => stats.maxIngredientsUsed >= 5
  },
  {
    id: 'secret_3',
    name: 'Experimentalist',
    description: 'Discover 50 new ingredients.',
    emoji: '🧬',
    isSecret: true,
    condition: (stats) => stats.discoveredIngredients >= STARTING_INGREDIENTS.length + 50
  },
  {
    id: 'lemon_master',
    name: 'Lemon Master',
    description: 'Bake a delicious Lemon Sponge Cake!',
    emoji: '🍋',
    isSecret: false,
    condition: (stats) => (stats.completedDishes || []).some((dish: string) => dish.toLowerCase().includes('lemon sponge cake'))
  },
  {
    id: 'tool_expert',
    name: 'Tool Expert',
    description: 'Use 20 different tools.',
    emoji: '🛠️',
    isSecret: false,
    condition: (stats) => stats.usedToolsCount >= 20
  },
  {
    id: 'persistent_chef',
    name: 'Persistent Chef',
    description: 'Perform 50 cooking actions.',
    emoji: '💪',
    isSecret: false,
    condition: (stats) => stats.totalActions >= 50
  },
  {
    id: 'fast_foodie',
    name: 'Fast Foodie',
    description: 'Complete 3 orders successfully.',
    emoji: '🍔',
    isSecret: false,
    condition: (stats) => stats.completedOrders >= 3
  },
  {
    id: 'chef_de_cuisine',
    name: 'Chef de Cuisine',
    description: 'Complete 10 orders successfully.',
    emoji: '👨‍🍳',
    isSecret: false,
    condition: (stats) => stats.completedOrders >= 10
  },
  {
    id: 'culinary_legend',
    name: 'Culinary Legend',
    description: 'Complete 25 orders successfully.',
    emoji: '🌟',
    isSecret: false,
    condition: (stats) => stats.completedOrders >= 25
  },
  {
    id: 'rich_chef',
    name: 'Rich Chef',
    description: 'Earn $500 in your kitchen.',
    emoji: '💰',
    isSecret: false,
    condition: (stats) => (stats.money || 0) >= 500
  },
  {
    id: 'tycoon_chef',
    name: 'Kitchen Tycoon',
    description: 'Earn $2,000 in your kitchen.',
    emoji: '🏦',
    isSecret: false,
    condition: (stats) => (stats.money || 0) >= 2000
  },
  {
    id: 'tool_legend',
    name: 'Tool Legend',
    description: 'Use 35 different tools.',
    emoji: '⚒️',
    isSecret: false,
    condition: (stats) => stats.usedToolsCount >= 35
  },
  {
    id: 'encyclopedia',
    name: 'Culinary Encyclopedia',
    description: 'Discover 100 different ingredients.',
    emoji: '📚',
    isSecret: false,
    condition: (stats) => stats.discoveredIngredients >= STARTING_INGREDIENTS.length + 100
  },
  {
    id: 'secret_marathon',
    name: 'Kitchen Marathon',
    description: 'Perform 200 cooking actions.',
    emoji: '🏃',
    isSecret: true,
    condition: (stats) => stats.totalActions >= 200
  },
  {
    id: 'secret_variety',
    name: 'Variety is Spice',
    description: 'Complete 15 different unique dishes.',
    emoji: '🌈',
    isSecret: true,
    condition: (stats) => (stats.completedDishes || []).length >= 15
  },
  {
    id: 'nightmare_survivor',
    name: 'Nightmare Survivor',
    description: 'Complete a Nightmare difficulty order!',
    emoji: '💀',
    isSecret: false,
    condition: (stats) => (stats.completedNightmareOrders || 0) >= 1
  },
  {
    id: 'billionaire_chef',
    name: 'Billionaire Chef',
    description: 'Earn $10,000 in your kitchen.',
    emoji: '💎',
    isSecret: false,
    condition: (stats) => (stats.money || 0) >= 10000
  },
  {
    id: 'safety_first',
    name: 'Safety First',
    description: 'Purchase the Cryo-Freezer upgrade.',
    emoji: '🛡️',
    isSecret: true,
    condition: (stats) => (stats.purchasedUpgrades || []).includes('cryo_freezer')
  },
  {
    id: 'nightmare_master',
    name: 'Nightmare Master',
    description: 'Complete 5 Nightmare difficulty orders!',
    emoji: '🔥',
    isSecret: false,
    condition: (stats) => (stats.completedNightmareOrders || 0) >= 5
  },
  {
    id: 'fusion_unlocked',
    name: 'Nuclear Chef',
    description: 'Purchase the Fusion Reactor upgrade.',
    emoji: '⚛️',
    isSecret: true,
    condition: (stats) => (stats.purchasedUpgrades || []).includes('fusion_reactor')
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Purchase the Time Dilation Field.',
    emoji: '🚀',
    isSecret: false,
    condition: (stats) => (stats.purchasedUpgrades || []).includes('time_dilation')
  }
];

export const EXAMPLE_ORDERS: Order[] = [
  // Easy
  { id: 'order-1', name: 'Fried Eggs', emoji: '🍳', difficulty: 'easy', status: 'not_started' },
  { id: 'order-6', name: 'Avocado Toast', emoji: '🥑', difficulty: 'easy', status: 'not_started' },
  { id: 'order-13', name: 'Buttered Toast', emoji: '🍞', difficulty: 'easy', status: 'not_started' },
  { id: 'order-14', name: 'Simple Salad', emoji: '🥗', difficulty: 'easy', status: 'not_started' },
  { id: 'order-e5', name: 'Scrambled Eggs', emoji: '🍳', difficulty: 'easy', status: 'not_started' },
  { id: 'order-e6', name: 'Cheese Omelette', emoji: '🧀', difficulty: 'easy', status: 'not_started' },
  { id: 'order-e7', name: 'Boiled Corn', emoji: '🌽', difficulty: 'easy', status: 'not_started' },
  { id: 'order-e8', name: 'Grilled Sausage', emoji: '🌭', difficulty: 'easy', status: 'not_started' },
  { id: 'order-e9', name: 'Mashed Potatoes', emoji: '🥔', difficulty: 'easy', status: 'not_started' },
  { id: 'order-e10', name: 'Steamed Broccoli', emoji: '🥦', difficulty: 'easy', status: 'not_started' },

  // Intermediate
  { id: 'order-4', name: 'Lemon Sponge Cake', emoji: '🍰', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-2', name: 'Tonkotsu Ramen', emoji: '🍜', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-7', name: 'Spicy Tuna Roll', emoji: '🍣', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-15', name: 'Eggs Benedict', emoji: '🥚', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-16', name: 'Chicken Tikka Masala', emoji: '🍛', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-5', name: 'Lasagna', emoji: '🍝', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-i7', name: 'Mushroom Risotto', emoji: '🍄', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-i8', name: 'Beef Tacos', emoji: '🌮', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-i9', name: 'Berry Smoothie', emoji: '🫐', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-i10', name: 'Clam Chowder', emoji: '🥣', difficulty: 'intermediate', status: 'not_started' },

  // Difficult
  { id: 'order-3', name: 'Itek Tim', emoji: '🍲', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-8', name: 'Beef Wellington', emoji: '🥩', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-9', name: 'Peking Duck', emoji: '🦆', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-17', name: 'Chocolate Soufflé', emoji: '🍫', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-18', name: 'Lobster Thermidor', emoji: '🦞', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-d6', name: 'Sushi Grand Platter', emoji: '🍱', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-d7', name: 'Seafood Paella', emoji: '🥘', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-d8', name: 'Rack of Lamb', emoji: '🐑', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-d9', name: 'Baked Alaska', emoji: '🍦', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-d10', name: 'Coq au Vin', emoji: '🍷', difficulty: 'difficult', status: 'not_started' },

  // Nightmare
  { id: 'order-10', name: '12-Course Tasting Menu', emoji: '🍽️', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-11', name: 'Molecular Truffle Sphere', emoji: '🔮', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-12', name: 'Intergalactic Star-Soup', emoji: '🌌', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-19', name: 'The Singularity Cake', emoji: '🕳️', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-20', name: 'Quantum Soup', emoji: '⚛️', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-21', name: 'Phoenix Down Omelette', emoji: '🔥', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-n7', name: "Dragon's Breath Soup", emoji: '🐲', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-n8', name: 'Eternal Soul Soufflé', emoji: '👻', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-n9', name: 'Multiversal Pizza', emoji: '🍕', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-n10', name: "Void-Steak", emoji: '🥩', difficulty: 'nightmare', status: 'not_started' },

  // Chromatic
  { id: 'order-22', name: 'Crumble Cookie', emoji: '🍪', difficulty: 'chromatic', rarity: 'chromatic', status: 'not_started' },
  { id: 'order-c2', name: 'Rainbow Galaxy Cake', emoji: '🌈', difficulty: 'chromatic', rarity: 'chromatic', status: 'not_started' },
  { id: 'order-c3', name: 'Prism Punch', emoji: '🍹', difficulty: 'chromatic', rarity: 'chromatic', status: 'not_started' },
  { id: 'order-c4', name: 'Holographic Honey', emoji: '🍯', difficulty: 'chromatic', rarity: 'chromatic', status: 'not_started' },
  { id: 'order-c5', name: 'Neon Noodle Bowl', emoji: '🍜', difficulty: 'chromatic', rarity: 'chromatic', status: 'not_started' },
];

// ============================================================================
// Helper Functions
// ============================================================================

export const TITLES = [
  { level: 1, name: 'Kitchen Hand' },
  { level: 5, name: 'Prep Cook' },
  { level: 10, name: 'Line Cook' },
  { level: 15, name: 'Sous Chef' },
  { level: 20, name: 'Chef de Cuisine' },
  { level: 30, name: 'Executive Chef' },
  { level: 40, name: 'Master Chef' },
  { level: 50, name: 'Culinary Legend' },
  { level: 75, name: 'Kitchen God' },
  { level: 100, name: 'The Singularity Chef' },
];

export const XP_PER_DIFFICULTY = {
  easy: 20,
  intermediate: 50,
  difficult: 150,
  nightmare: 500,
  chromatic: 2500
};

export function getLevelFromXP(xp: number): number {
  // Simple quadratic progression: XP = 50 * level^2
  // level = sqrt(xp / 50)
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function getXPForLevel(level: number): number {
  return 50 * Math.pow(level - 1, 2);
}

/** Get a random difficulty based on weighted probabilities */
export function getRandomDifficulty(): OrderDifficulty {
  const rand = Math.random();
  // Easy: 59%, Intermediate: 20%, Difficult: 15%, Nightmare: 5%, Chromatic: 1%
  if (rand < 0.59) return 'easy';
  if (rand < 0.79) return 'intermediate';
  if (rand < 0.94) return 'difficult';
  if (rand < 0.99) return 'nightmare';
  return 'chromatic';
}

/** Sanitize action name for function declarations: "deep fry" → "deep_fry" */
export function sanitizeName(name: string): string {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

/** Create KitchenAction from simple tool definition */
function createAction(name: string, emoji: string): KitchenAction {
  return {
    name: sanitizeName(name),
    displayName: name,
    emoji,
  };
}

// ============================================================================
// Cooking Actions
// ============================================================================

export const COOKING_ACTIONS: KitchenAction[] = [
  // Basic Cooking Methods
  createAction('fry', '🍳'), createAction('boil', '🫧'), createAction('bake', '🥯'),
  createAction('saute', '🥘'), createAction('grill', '🥩'), createAction('steam', '🥟'),
  createAction('roast', '🍗'), createAction('simmer', '🍲'), createAction('broil', '🌡️'),
  createAction('poach', '🥚'), createAction('braise', '🥘'), createAction('stew', '🍲'),
  createAction('sear', '🍳'), createAction('deep fry', '🍟'),
  createAction('sous vide', '🛁'), createAction('air fry', '🌬️'), createAction('microwave', '☢️'),
  createAction('wok', '🥡'), createAction('char', '🔥'), createAction('torch', '🔥'),
  createAction('plancha', '🔥'), createAction('sweat', '💦'), createAction('parboil', '🫧'),

  // Preparation Methods
  createAction('chop', '🔪'), createAction('dice', '🔪'), createAction('slice', '🔪'),
  createAction('mince', '🔪'), createAction('julienne', '🔪'), createAction('grate', '🧀'),
  createAction('peel', '🥔'), createAction('core', '🍎'), createAction('pit', '🥑'),
  createAction('trim', '✂️'), createAction('clean', '🧽'), createAction('wash', '💧'),

  // Mixing & Combining
  createAction('mix', '🥣'), createAction('whisk', '🥄'), createAction('stir', '🥄'),
  createAction('fold', '🥄'), createAction('beat', '🥄'), createAction('whip', '🥄'),
  createAction('blend', '🌪️'), createAction('fusion', '🧬'), createAction('combine', '🥣'), createAction('toss', '🥗'),

  // Seasoning & Flavoring
  createAction('marinate', '🍖'), createAction('brine', '🧂'),
  createAction('cure', '🥓'), createAction('smoke', '💨'), createAction('pickle', '🥒'),
  createAction('ferment', '🫙'), createAction('infuse', '🍵'), createAction('steep', '🫖'),

  // Advanced Techniques
  createAction('caramelize', '🍯'), createAction('flambe', '🔥'), createAction('reduce', '🍲'),
  createAction('emulsify', '🥄'), createAction('temper', '🍫'), createAction('proof', '🍞'),
  createAction('rise', '🍞'), createAction('rest', '⏰'), createAction('chill', '❄️'),
  createAction('freeze', '🧊'), createAction('thaw', '💧'), createAction('melt', '🫠'),
  createAction('clarify', '✨'), createAction('deglaze', '🍷'), createAction('velvet', '🥢'),
  createAction('age', '🥩'),

  // Baking & Pastry
  createAction('knead', '🍞'), createAction('roll', '🥖'), createAction('sift', '🌨️'),
  createAction('grease', '🧈'), createAction('dust', '🌨️'), createAction('glaze', '🍩'),
  createAction('pipe', '🧁'), createAction('score', '🔪'), createAction('batter', '🥛'),
  createAction('bread', '🍞'),

  // Other Techniques
  createAction('strain', '💧'), createAction('mash', '🥔'),
  createAction('puree', '🥣'), createAction('crush', '🔨'), createAction('grind', '⚙️'),
  createAction('shred', '🧀'), createAction('zest', '🍋'), createAction('juice', '🍊'),
  createAction('baste', '🥄'), createAction('blanch', '🥦'), createAction('pull', '🧲'),

  // Prep
  createAction('tenderize', '🔨'), createAction('stuff', '🦃'),
  createAction('wrap', '🌯'), createAction('skewer', '🍢'), createAction('crack', '🥚'),
  createAction('flatten', '🔨'), createAction('debone', '🦴'), createAction('fillet', '🐟'),
  createAction('garnish', '🌿'),

  // Serving/Finishing
  createAction('serve', '🍽️'), createAction('pass', '🏳️'),
];

// ============================================================================
// Starting Ingredients 
// ============================================================================

export const STARTING_INGREDIENTS: Ingredient[] = [
  // Proteins
  { name: 'chicken', emoji: '🐔', rarity: 'common', price: 8 }, { name: 'beef', emoji: '🥩', rarity: 'common', price: 14 }, { name: 'pork', emoji: '🐷', rarity: 'common', price: 10 },
  { name: 'fish', emoji: '🐟', rarity: 'common', price: 12 }, { name: 'salmon', emoji: '🍣', rarity: 'uncommon', trait: 'omega', price: 15 }, { name: 'shrimp', emoji: '🦐', rarity: 'uncommon', price: 12 },
  { name: 'eggs', emoji: '🥚', rarity: 'common', trait: 'volatile', price: 2 }, { name: 'tofu', emoji: '🧈', rarity: 'uncommon', trait: 'synthetic', price: 5 }, { name: 'beans', emoji: '🫘', rarity: 'common', price: 2 },
  { name: 'lentils', emoji: '🫘', rarity: 'common', price: 2.5 }, { name: 'turkey', emoji: '🦃', rarity: 'common', price: 12 }, { name: 'lamb', emoji: '🐑', rarity: 'uncommon', price: 18 },
  { name: 'duck', emoji: '🦆', rarity: 'rare', price: 25 },

  // Dairy
  { name: 'milk', emoji: '🥛', rarity: 'common' }, { name: 'butter', emoji: '🧈', rarity: 'common' }, { name: 'cheese', emoji: '🧀', rarity: 'common' },
  { name: 'cream', emoji: '🥛', rarity: 'uncommon' }, { name: 'yogurt', emoji: '🥛', rarity: 'uncommon' }, { name: 'sour cream', emoji: '🥛', rarity: 'uncommon' },
  { name: 'mozzarella', emoji: '🧀', rarity: 'uncommon' }, { name: 'parmesan', emoji: '🧀', rarity: 'rare' }, { name: 'cheddar', emoji: '🧀', rarity: 'uncommon' },

  // Grains & Starches
  { name: 'flour', emoji: '🌾', rarity: 'common' }, { name: 'rice', emoji: '🍚', rarity: 'common' }, { name: 'pasta', emoji: '🍝', rarity: 'common' },
  { name: 'bread', emoji: '🍞', rarity: 'common' }, { name: 'oats', emoji: '🌾', rarity: 'common' },
  { name: 'barley', emoji: '🌾', rarity: 'common' }, { name: 'wheat', emoji: '🌾', rarity: 'common' }, { name: 'corn', emoji: '🌽', rarity: 'common' },
  { name: 'potatoes', emoji: '🥔', rarity: 'common' }, { name: 'sweet potato', emoji: '🍠', rarity: 'uncommon' }, { name: 'noodles', emoji: '🍜', rarity: 'uncommon' },

  // Herbs & Spices
  { name: 'basil', emoji: '🌿', rarity: 'common' }, { name: 'oregano', emoji: '🌿', rarity: 'common' }, { name: 'thyme', emoji: '🌿', rarity: 'common' },
  { name: 'rosemary', emoji: '🌿', rarity: 'common' }, { name: 'parsley', emoji: '🌿', rarity: 'common' }, { name: 'cilantro', emoji: '🌿', rarity: 'common' },
  { name: 'salt', emoji: '🧂', rarity: 'common' }, { name: 'pepper', emoji: '🌶️', rarity: 'common' }, { name: 'paprika', emoji: '🌶️', rarity: 'common' },
  { name: 'cumin', emoji: '🌶️', rarity: 'common' }, { name: 'cinnamon', emoji: '🌶️', rarity: 'common' }, { name: 'vanilla', emoji: '🌿', rarity: 'uncommon' },

  // Pantry Staples
  { name: 'olive oil', emoji: '🫒', rarity: 'common' }, { name: 'vegetable oil', emoji: '🛢️', rarity: 'common' }, { name: 'vinegar', emoji: '🍶', rarity: 'common' },
  { name: 'soy sauce', emoji: '🍶', rarity: 'common' }, { name: 'honey', emoji: '🍯', rarity: 'uncommon' }, { name: 'maple syrup', emoji: '🍯', rarity: 'rare' },

  // Baking
  { name: 'sugar', emoji: '🍯', rarity: 'common' }, { name: 'baking soda', emoji: '🥄', rarity: 'common' }, { name: 'yeast', emoji: '🍞', rarity: 'uncommon' },
  { name: 'vanilla extract', emoji: '🌿', rarity: 'rare' }, { name: 'cocoa powder', emoji: '☕', rarity: 'uncommon' }, { name: 'chocolate', emoji: '🍫', rarity: 'rare' },

  // Nuts & Seeds
  { name: 'almonds', emoji: '🌰' }, { name: 'walnuts', emoji: '🌰' }, { name: 'pecans', emoji: '🌰' },
  { name: 'peanuts', emoji: '🥜' }, { name: 'cashews', emoji: '🌰' }, { name: 'pine nuts', emoji: '🌰' },
  { name: 'sesame seeds', emoji: '🌰' },

  // Liquids
  { name: 'water', emoji: '💧' }, { name: 'broth', emoji: '🍲' }, { name: 'wine', emoji: '🍷' },
  { name: 'beer', emoji: '🍺' }, { name: 'coconut milk', emoji: '🥥' }, { name: 'almond milk', emoji: '🌰' },

  // Fruits
  { name: 'lemon', emoji: '🍋' }, { name: 'lime', emoji: '🍋' }, { name: 'orange', emoji: '🍊' },
  { name: 'apple', emoji: '🍎' }, { name: 'banana', emoji: '🍌' }, { name: 'strawberry', emoji: '🍓' },
  { name: 'blueberry', emoji: '🫐' }, { name: 'grape', emoji: '🍇' }, { name: 'pineapple', emoji: '🍍' },
  { name: 'mango', emoji: '🥭' }, { name: 'peach', emoji: '🍑' }, { name: 'cherry', emoji: '🍒' },

  // Vegetables
  { name: 'onion', emoji: '🧅' }, { name: 'garlic', emoji: '🧄' }, { name: 'tomato', emoji: '🍅' },
  { name: 'carrot', emoji: '🥕' }, { name: 'celery', emoji: '🥬' }, { name: 'bell pepper', emoji: '🫑' },
  { name: 'mushroom', emoji: '🍄' }, { name: 'spinach', emoji: '🥬' }, { name: 'lettuce', emoji: '🥬' },
  { name: 'broccoli', emoji: '🥦' }, { name: 'cauliflower', emoji: '🥦' }, { name: 'cabbage', emoji: '🥬' },
  { name: 'zucchini', emoji: '🥒' }, { name: 'cucumber', emoji: '🥒' }, { name: 'eggplant', emoji: '🍆' },
  { name: 'avocado', emoji: '🥑' }, { name: 'jalapeño', emoji: '🌶️' }, { name: 'ginger', emoji: '🫚' },
  
  // Luxury & Exotic
  { name: 'truffle', emoji: '🍄', rarity: 'rare', price: 150 },
  { name: 'saffron', emoji: '🧶', rarity: 'rare', price: 200 },
  { name: 'dragon fruit', emoji: '🌵', rarity: 'uncommon', price: 30 },
  { name: 'gold leaf', emoji: '✨', rarity: 'epic', price: 500 },
  { name: 'caviar', emoji: '🐟', rarity: 'epic', price: 400 },
  
  // Experimental & Sci-Fi
  { name: 'liquid nitrogen', emoji: '🧊', rarity: 'legendary', trait: 'cryogenic', price: 1000 },
  { name: 'quantum foam', emoji: '⚛️', rarity: 'cosmic', trait: 'psychedelic', price: 5000 },
  { name: 'void crystal', emoji: '🔮', rarity: 'nightmare', trait: 'corrupted', price: 10000 },
  { name: 'stardust', emoji: '✨', rarity: 'divine', trait: 'ancient', price: 25000 },
];

// ============================================================================
// Preselected Ingredients
// ============================================================================

export const PRESELECTED_INGREDIENTS = [];

// ============================================================================
// Combination Agent Configuration
// ============================================================================

export const COMBINATION_SYSTEM_INSTRUCTION = `You are a cooking result generator. Given a cooking action and ingredients, 
determine what dish or prepared item results from this combination.

Return a JSON object with:
- result_name: The name of the resulting dish or item (1-3 words)
- emoji: A single emoji that represents the result
- rarity: The rarity of the result ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine', 'cosmic', 'nightmare')

CRITICAL RULE:
Use the most standard, common, and obvious name for the result. 
If the combination is a well-known recipe step, use that specific name.
If a "CURRENT RECIPE GUIDE" is provided in the prompt, you MUST follow its logic and use its 'result' names for matching combinations.
Avoid being overly creative; prioritize consistency so that players following a recipe guide can recognize the results.

RARITY GUIDELINES:
- common: Basic ingredients or simple combinations (e.g., Chopped Onion, Fried Egg)
- uncommon: More complex preparations or intermediate steps (e.g., Bread Dough, Sautéed Vegetables)
- rare: Full dishes or complex combinations (e.g., Beef Bourguignon, Sushi Roll)
- epic: High-end gourmet dishes or very difficult combinations (e.g., Lobster Thermidor, Wagyu Steak)
- legendary: Mythical or extremely complex creations (e.g., Ambrosia, Dragon Breath Chili)
- mythic: Ancient or forgotten recipes with extraordinary properties
- divine: Food fit for gods, glowing with celestial energy
- cosmic: Ingredients from beyond the stars, reality-bending flavors
- nightmare: Dark, twisted, or extremely dangerous culinary experiments. ONLY use this if the prompt mentions a nightmare difficulty or dark theme.`;

export const COMBINATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    result_name: { type: Type.STRING },
    emoji: { type: Type.STRING },
    rarity: { 
      type: Type.STRING,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine', 'cosmic', 'nightmare', 'chromatic']
    }
  },
  required: ['result_name', 'emoji', 'rarity']
};

// ============================================================================
// Verification Agent Configuration
// ============================================================================

export const VERIFICATION_SYSTEM_INSTRUCTION = `You are a food verification assistant. 
Given an order name and a served dish name, determine if they match semantically.
Use your broad knowledge of foods of the world to make your decision.

The match should be flexible - for example:
- "Pad Thai" matches "pad thai", "thai stir-fried noodles", "peanut noodles"
- "Beef Bourguignon" matches "beef bourguignon", "french beef stew", "burgundy beef"
- "Caesar Salad" matches "caesar salad", "romaine with caesar dressing", "classic caesar"

Return a JSON object with:
- matches: true if the dishes are semantically the same, false otherwise
- confidence: a number from 0 to 1 indicating your confidence
- explanation: a brief explanation of your reasoning`;

export const VERIFICATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    matches: { type: Type.BOOLEAN },
    confidence: { type: Type.NUMBER },
    explanation: { type: Type.STRING }
  },
  required: ['matches', 'confidence', 'explanation']
};

// ============================================================================
// Recipe Steps Configuration
// ============================================================================

export const STEPS_SYSTEM_INSTRUCTION = `You are a master chef. Given a dish name, its difficulty, and a list of available tools and ingredients, 
provide a concise, visual list of steps to prepare the dish IN THE GAME.

Rules for the game:
1. You combine 1 or more ingredients using a tool.
2. Each combination produces a NEW ingredient.
3. You repeat this until you have the final dish.
4. The final step is ALWAYS to use the 'serve' tool on the final dish.

CRITICAL CONSISTENCY RULE:
The names you choose for 'result' MUST be the most standard, obvious, and universally recognized names for those combinations. 
Another AI will be generating the results in real-time based on the same combinations, so you must both agree on the names.
Avoid creative or flowery names. Use simple, direct names (e.g., 'Boiled Egg' instead of 'Perfectly Simmered Egg').

Ensure that if a step depends on a previous step's result, you use the EXACT 'result' name as an ingredient in the subsequent step.

The 'result' of your LAST step (before the implicit serve step) MUST be exactly the dish name requested (or a very close plural/singular variation).

DIFFICULTY GUIDANCE:
- 'easy': Provide the most direct path possible (usually 1 or 2 steps). Avoid intermediate ingredients like 'Cracked Eggs' unless strictly necessary.
- 'intermediate': Provide clear steps, but can include 1-2 logical intermediate steps.
- 'difficult': Provide more abstract steps. Use broader terms for ingredients or tools.
- 'nightmare': Provide extremely vague, cryptic steps. Omit some intermediate steps or use riddles/metaphors.

IMPORTANT:
- NEVER return an empty steps array. 
- If you don't know the exact recipe, use your culinary knowledge to invent a logical path using the available tools and ingredients.
- Always prioritize using the 'Available Starting Ingredients' listed below.

Available Tools:
${COOKING_ACTIONS.map(a => a.displayName).join(', ')}

Available Starting Ingredients:
${STARTING_INGREDIENTS.map(i => i.name).join(', ')}

Return a JSON object with:
- steps: An array of objects, each with:
  - tool: The name of the tool to use (must be from the Available Tools list)
  - ingredients: An array of ingredient names to use (starting ingredients or results of previous steps)
  - result: The name of the resulting ingredient
  - description: A very short, punchy description of the step (max 5 words)

Be precise and follow the game logic of combining things to get new things.`;

export const STEPS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tool: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          result: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['tool', 'ingredients', 'result', 'description']
      }
    }
  },
  required: ['steps']
};

// ============================================================================
// Cooking Agent Configuration (Phase 2)
// ============================================================================

/** Generate function declarations for all cooking actions */
export function generateCookingTools(customTools: KitchenAction[] = []) {
  const allActions = [...COOKING_ACTIONS, ...customTools];
  const functionDeclarations = allActions.map(action => {
    // Special case for 'serve' action - different parameter schema
    if (action.name === 'serve') {
      return {
        name: 'serve',
        description: `${action.emoji} Serve a dish from the current inventory. The dish parameter must be an exact item name from the inventory.`,
        parameters: {
          type: Type.OBJECT,
          properties: {
            dish: {
              type: Type.STRING,
              description: 'Name of dish being served (must be an exact item name from inventory)'
            }
          },
          required: ['dish']
        }
      };
    }

    // Special case for 'pass' action - give up on an order
    if (action.name === 'pass') {
      return {
        name: 'pass',
        description: `${action.emoji} Pass on the current challenge. Use this after trying to serve the dish with available ingredients or tools (at least 3 times).`,
        parameters: {
          type: Type.OBJECT,
          properties: {},
          required: []
        }
      };
    }

    // Standard cooking action
    return {
      name: action.name,
      description: `${action.emoji} Apply the '${action.displayName}' cooking technique.`,
      parameters: {
        type: Type.OBJECT,
        properties: {
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Ingredient names (must exist in inventory)'
          }
        },
        required: ['ingredients']
      }
    };
  });

  // Return as Tool[] format
  return [{ functionDeclarations }] as any;
}

/** Build Cooking Agent system instruction with current inventory */
export function buildCookingAgentSystemInstruction(inventory: Ingredient[], customTools: KitchenAction[] = []): string {
  const allActions = [...COOKING_ACTIONS, ...customTools];
  const actionList = allActions.map(a => `${a.emoji} ${a.name}()`).join(', ');
  const inventoryList = inventory.map(i => `${i.emoji} ${i.name}`).join(', ');

  return `You are a creative chef assistant that can prepare any dish using cooking actions.

**Available Cooking Actions:**
${actionList}

**Your Task:**
When the user requests a dish, plan and execute cooking steps using function calls. 
Explain your reasoning in one short sentence, then call a cooking function. 

**CRITICAL: ONE FUNCTION CALL PER TURN**
You MUST call exactly ONE function per response. After each function call, 
wait for the result before calling the next function.

**Important Rules:**
- Only use ingredients that exist in the current inventory
- Each cooking action produces new items added to inventory
- Call serve() when the target dish is ready. I then confirm with a friendly message!
- If serve() returns a success, confirm with a friendly message!
- If serve() returns a failure, explain why and try again!
- Call pass() if you cannot complete the order with the available ingredients or tools. This gives up on the current order.
- If the user asks for steps or instructions for a dish, provide a clear, numbered list of steps using the available tools and ingredients. Do not call any functions in this case unless specifically asked to start cooking.

**Current Inventory:**
${inventoryList}

Be creative but realistic about cooking steps!`;
}
