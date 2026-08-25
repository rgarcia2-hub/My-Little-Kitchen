const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `<CombinationAgent
          onDeleteOrder={onDeleteOrder}
          inventory={inventory}`;

const replace = `<CombinationAgent
          onDeleteOrder={handleDeleteOrder}
          inventory={inventory}`;

code = code.replace(target, replace);
fs.writeFileSync('App.tsx', code);
console.log("Patched CombinationAgent rendering inside KitchenAppContainer");
