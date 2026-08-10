const fs = require('fs');
let code = fs.readFileSync('constants.ts', 'utf8');

code = code.replace(/createAction\('blend', '🌪️'\),/, "createAction('blend', '🌪️'), createAction('fusion', '🧬'),");

fs.writeFileSync('constants.ts', code);
