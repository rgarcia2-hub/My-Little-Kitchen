const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetProps = `  onOpenVerificationAgent: () => void;
  activeIngredients: Set<string>;`;

const replaceProps = `  onOpenVerificationAgent: () => void;
  onDeleteOrder?: (id: string) => void;
  activeIngredients: Set<string>;`;

code = code.replace(targetProps, replaceProps);
fs.writeFileSync('App.tsx', code);
console.log("Patched CombinationAgentProps");
