const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(/onDeleteOrder={handleDeleteOrder}/g, 'onDeleteOrder={onDeleteOrder}');

fs.writeFileSync('App.tsx', code);
console.log("Patched onDeleteOrder inside CombinationAgent");
