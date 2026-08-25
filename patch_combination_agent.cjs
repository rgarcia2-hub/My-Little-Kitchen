const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetProps = `  onServe,
  onOpenCombinationAgent,
  onOpenCookingAgent,
  onOpenVerificationAgent,`;

const replaceProps = `  onServe,
  onOpenCombinationAgent,
  onOpenCookingAgent,
  onOpenVerificationAgent,
  onDeleteOrder,`;

code = code.replace(targetProps, replaceProps);

const targetRender = `<CombinationAgent
          inventory={inventory}
          setInventory={setInventory}`;

const replaceRender = `<CombinationAgent
          onDeleteOrder={handleDeleteOrder}
          inventory={inventory}
          setInventory={setInventory}`;

code = code.replace(targetRender, replaceRender);

fs.writeFileSync('App.tsx', code);
console.log("Patched CombinationAgent");
