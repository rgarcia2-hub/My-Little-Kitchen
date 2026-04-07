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

export interface Ingredient {
  name: string;
  emoji: string;
}

export interface KitchenAction {
  name: string;           // Function name (alphanumeric + underscores)
  displayName: string;    // Human-readable name
  emoji: string;
}

export interface CombinationResult {
  result_name: string;
  emoji: string;
}

export type OrderDifficulty = 'easy' | 'intermediate' | 'difficult' | 'nightmare';

export interface Order {
  id: string;
  name: string;
  emoji: string;
  difficulty: OrderDifficulty;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  servedDish?: string;  // What was actually served (for failed orders)
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
}

export const UPGRADES: Upgrade[] = [
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
    condition: (stats) => stats.discoveredIngredients >= 10
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
    condition: (stats) => stats.discoveredIngredients >= 50
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
    condition: (stats) => stats.discoveredIngredients >= 100
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
  { id: 'order-1', name: 'Fried Eggs', emoji: '🍳', difficulty: 'easy', status: 'not_started' },
  { id: 'order-6', name: 'Avocado Toast', emoji: '🥑', difficulty: 'easy', status: 'not_started' },
  { id: 'order-13', name: 'Buttered Toast', emoji: '🍞', difficulty: 'easy', status: 'not_started' },
  { id: 'order-14', name: 'Simple Salad', emoji: '🥗', difficulty: 'easy', status: 'not_started' },
  { id: 'order-4', name: 'Lemon Sponge Cake', emoji: '🍰', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-2', name: 'Tonkotsu Ramen', emoji: '🍜', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-7', name: 'Spicy Tuna Roll', emoji: '🍣', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-15', name: 'Eggs Benedict', emoji: '🥚', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-16', name: 'Chicken Tikka Masala', emoji: '🍛', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-5', name: 'Lasagna', emoji: '🍝', difficulty: 'intermediate', status: 'not_started' },
  { id: 'order-3', name: 'Itek Tim', emoji: '🍲', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-8', name: 'Beef Wellington', emoji: '🥩', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-9', name: 'Peking Duck', emoji: '🦆', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-17', name: 'Chocolate Soufflé', emoji: '🍫', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-18', name: 'Lobster Thermidor', emoji: '🦞', difficulty: 'difficult', status: 'not_started' },
  { id: 'order-10', name: '12-Course Tasting Menu', emoji: '🍽️', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-11', name: 'Molecular Truffle Sphere', emoji: '🔮', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-12', name: 'Intergalactic Star-Soup', emoji: '🌌', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-19', name: 'The Singularity Cake', emoji: '🕳️', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-20', name: 'Quantum Soup', emoji: '⚛️', difficulty: 'nightmare', status: 'not_started' },
  { id: 'order-21', name: 'Phoenix Down Omelette', emoji: '🔥', difficulty: 'nightmare', status: 'not_started' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/** Get a random difficulty based on weighted probabilities */
export function getRandomDifficulty(): OrderDifficulty {
  const rand = Math.random();
  // Easy: 60%, Intermediate: 20%, Difficult: 15%, Nightmare: 5%
  if (rand < 0.60) return 'easy';
  if (rand < 0.80) return 'intermediate';
  if (rand < 0.95) return 'difficult';
  return 'nightmare';
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
  createAction('blend', '🌪️'), createAction('combine', '🥣'), createAction('toss', '🥗'),

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
  { name: 'chicken', emoji: '🐔' }, { name: 'beef', emoji: '🥩' }, { name: 'pork', emoji: '🐷' },
  { name: 'fish', emoji: '🐟' }, { name: 'salmon', emoji: '🍣' }, { name: 'shrimp', emoji: '🦐' },
  { name: 'eggs', emoji: '🥚' }, { name: 'tofu', emoji: '🧈' }, { name: 'beans', emoji: '🫘' },
  { name: 'lentils', emoji: '🫘' }, { name: 'turkey', emoji: '🦃' }, { name: 'lamb', emoji: '🐑' },
  { name: 'duck', emoji: '🦆' },

  // Dairy
  { name: 'milk', emoji: '🥛' }, { name: 'butter', emoji: '🧈' }, { name: 'cheese', emoji: '🧀' },
  { name: 'cream', emoji: '🥛' }, { name: 'yogurt', emoji: '🥛' }, { name: 'sour cream', emoji: '🥛' },
  { name: 'mozzarella', emoji: '🧀' }, { name: 'parmesan', emoji: '🧀' }, { name: 'cheddar', emoji: '🧀' },

  // Grains & Starches
  { name: 'flour', emoji: '🌾' }, { name: 'rice', emoji: '🍚' }, { name: 'pasta', emoji: '🍝' },
  { name: 'bread', emoji: '🍞' }, { name: 'oats', emoji: '🌾' },
  { name: 'barley', emoji: '🌾' }, { name: 'wheat', emoji: '🌾' }, { name: 'corn', emoji: '🌽' },
  { name: 'potatoes', emoji: '🥔' }, { name: 'sweet potato', emoji: '🍠' }, { name: 'noodles', emoji: '🍜' },

  // Herbs & Spices
  { name: 'basil', emoji: '🌿' }, { name: 'oregano', emoji: '🌿' }, { name: 'thyme', emoji: '🌿' },
  { name: 'rosemary', emoji: '🌿' }, { name: 'parsley', emoji: '🌿' }, { name: 'cilantro', emoji: '🌿' },
  { name: 'salt', emoji: '🧂' }, { name: 'pepper', emoji: '🌶️' }, { name: 'paprika', emoji: '🌶️' },
  { name: 'cumin', emoji: '🌶️' }, { name: 'cinnamon', emoji: '🌶️' }, { name: 'vanilla', emoji: '🌿' },

  // Pantry Staples
  { name: 'olive oil', emoji: '🫒' }, { name: 'vegetable oil', emoji: '🛢️' }, { name: 'vinegar', emoji: '🍶' },
  { name: 'soy sauce', emoji: '🍶' }, { name: 'honey', emoji: '🍯' }, { name: 'maple syrup', emoji: '🍯' },

  // Baking
  { name: 'sugar', emoji: '🍯' }, { name: 'baking soda', emoji: '🥄' }, { name: 'yeast', emoji: '🍞' },
  { name: 'vanilla extract', emoji: '🌿' }, { name: 'cocoa powder', emoji: '☕' }, { name: 'chocolate', emoji: '🍫' },

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

CRITICAL RULE:
Use the most standard, common, and obvious name for the result. 
If the combination is a well-known recipe step, use that specific name.
If a "CURRENT RECIPE GUIDE" is provided in the prompt, you MUST follow its logic and use its 'result' names for matching combinations.
Avoid being overly creative; prioritize consistency so that players following a recipe guide can recognize the results.`;

export const COMBINATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    result_name: { type: Type.STRING },
    emoji: { type: Type.STRING }
  },
  required: ['result_name', 'emoji']
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
- 'easy': Provide the most direct path possible (usually 1 or 2 steps). Avoid intermediate ingredients like 'Cracked Eggs' unless strictly necessary (e.g., 'eggs + fry -> Fried Eggs' is better than 'eggs + crack -> Cracked Eggs' then 'Cracked Eggs + fry -> Fried Eggs').
- 'intermediate': Provide clear steps, but can include 1-2 logical intermediate steps.
- 'difficult': Provide more abstract steps. Use broader terms for ingredients or tools (e.g., 'a heat source' instead of 'stove', 'some greens' instead of 'lettuce').
- 'nightmare': Provide extremely vague, cryptic steps. Omit some intermediate steps or use riddles/metaphors. The player should have to experiment to find the exact path.

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
