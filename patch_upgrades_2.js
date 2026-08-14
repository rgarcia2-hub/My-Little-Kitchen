const fs = require('fs');
let code = fs.readFileSync('constants.ts', 'utf8');

const newUpgrades = `
  {
    id: 'hazard_shield_1',
    name: 'Protocolo de Contención Nivel 1',
    description: 'Reduce la probabilidad de desastres en la cocina (Fuego, Gravedad, Virus) un 50%.',
    emoji: '🛡️',
    cost: 1000,
    effect: 'hazard_reduction_1'
  },
  {
    id: 'hazard_shield_2',
    name: 'Sistema de Estabilización Nivel 2',
    description: 'Reduce la probabilidad de desastres un 80%. (Requiere Nivel 1)',
    emoji: '🛑',
    cost: 3000,
    effect: 'hazard_reduction_2',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('hazard_shield_1'),
    requirementText: 'Requiere: Protocolo de Contención Nivel 1'
  },
  {
    id: 'hazard_shield_3',
    name: 'Supresor de Anomalías Absoluto',
    description: 'Elimina al 100% todos los eventos de caos y desastres en la cocina. (Requiere Nivel 2)',
    emoji: '🚫',
    cost: 10000,
    effect: 'hazard_reduction_3',
    condition: (stats) => (stats.purchasedUpgrades || []).includes('hazard_shield_2'),
    requirementText: 'Requiere: Sistema de Estabilización Nivel 2'
  }
`;

code = code.replace('export const UPGRADES: Upgrade[] = [', 'export const UPGRADES: Upgrade[] = [' + newUpgrades);
fs.writeFileSync('constants.ts', code);
console.log("Added upgrades");
