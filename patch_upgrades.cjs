const fs = require('fs');
let code = fs.readFileSync('constants.ts', 'utf8');

const upgradesAdd = `export const UPGRADES: Upgrade[] = [
  {
    id: 'pin_easy',
    name: 'Memory Module: Basic',
    description: 'Permite fijar (pin) las instrucciones de recetas de dificultad Easy en la pantalla.',
    emoji: '📍',
    cost: 500,
    effect: 'pin_easy'
  },
  {
    id: 'pin_intermediate',
    name: 'Memory Module: Advanced',
    description: 'Permite fijar recetas de dificultad Intermediate. (Requiere Basic)',
    emoji: '📌',
    cost: 1500,
    effect: 'pin_intermediate',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('pin_easy'),
    requirementText: 'Requires: Memory Module: Basic'
  },
  {
    id: 'pin_difficult',
    name: 'Memory Module: Expert',
    description: 'Permite fijar recetas de dificultad Difficult. (Requiere Advanced)',
    emoji: '📎',
    cost: 4000,
    effect: 'pin_difficult',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('pin_intermediate'),
    requirementText: 'Requires: Memory Module: Advanced'
  },
  {
    id: 'pin_nightmare',
    name: 'Memory Module: Nightmare',
    description: 'Permite fijar recetas de dificultad Nightmare. (Requiere Expert)',
    emoji: '🧠',
    cost: 12000,
    effect: 'pin_nightmare',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('pin_difficult'),
    requirementText: 'Requires: Memory Module: Expert'
  },
  {
    id: 'pin_chromatic',
    name: 'Memory Module: Chromatic',
    description: 'Permite fijar recetas de dificultad Chromatic. (Requiere Nightmare)',
    emoji: '🌌',
    cost: 30000,
    effect: 'pin_chromatic',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('pin_nightmare'),
    requirementText: 'Requires: Memory Module: Nightmare'
  },`;

code = code.replace('export const UPGRADES: Upgrade[] = [', upgradesAdd);

fs.writeFileSync('constants.ts', code);
console.log("Patched constants.ts upgrades");
