const fs = require('fs');
let code = fs.readFileSync('constants.ts', 'utf8');

code = code.replace(/export interface Upgrade \{[\s\S]*?\}/, \`export interface Upgrade {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  effect: string;
  condition?: (stats: any) => boolean;
  requirementText?: string;
}\`);

fs.writeFileSync('constants.ts', code);
