const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace("Pensando...", "Thinking...");
code = code.replace("Pedir Pista", "Get Hint");

fs.writeFileSync('App.tsx', code);
console.log("Hint translations applied");
