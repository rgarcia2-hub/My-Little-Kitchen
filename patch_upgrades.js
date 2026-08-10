const fs = require('fs');
let code = fs.readFileSync('constants.ts', 'utf8');

const newUpgrades = `
  {
    id: 'auto_script_1',
    name: 'Script: Lavaplatos',
    description: 'Automatización básica. Genera $5 por segundo.',
    emoji: '🤖',
    cost: 3000,
    effect: 'auto_farm_5'
  },
  {
    id: 'auto_script_2',
    name: 'Script: Sous Chef',
    description: 'Automatización intermedia. Genera $20 por segundo.',
    emoji: '⚙️',
    cost: 15000,
    effect: 'auto_farm_20'
  },
  {
    id: 'auto_script_3',
    name: 'Script: IA de Cocina en la Nube',
    description: 'Automatización avanzada. Genera $100 por segundo.',
    emoji: '☁️',
    cost: 50000,
    effect: 'auto_farm_100'
  },
`;

code = code.replace(/export const UPGRADES: Upgrade\[\] = \[/, 'export const UPGRADES: Upgrade[] = [' + newUpgrades);

fs.writeFileSync('constants.ts', code);
