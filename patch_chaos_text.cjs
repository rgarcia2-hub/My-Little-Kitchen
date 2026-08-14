const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace('⚠️ ¡Fuga de Gravedad!', '⚠️ Gravity Leak!');
code = code.replace('🔥 ¡Fuego en la Cocina! (Apágalos)', '🔥 Kitchen Fire! (Put it out)');
code = code.replace('🦠 ¡Brote Viral! (Erradicar)', '🦠 Viral Outbreak! (Eradicate)');

fs.writeFileSync('App.tsx', code);
console.log("Chaos text translated.");
