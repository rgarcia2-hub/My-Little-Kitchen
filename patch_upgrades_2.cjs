const fs = require('fs');
let code = fs.readFileSync('constants.ts', 'utf8');

const newUpgrades = `
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
`;

code = code.replace('export const UPGRADES: Upgrade[] = [', 'export const UPGRADES: Upgrade[] = [' + newUpgrades);
fs.writeFileSync('constants.ts', code);
console.log("Added upgrades");
