const fs = require('fs');
let code = fs.readFileSync('constants.ts', 'utf8');

code = code.replace('Permite fijar (pin) las instrucciones de recetas de dificultad Easy en la pantalla.', 'Allows pinning Easy difficulty recipe instructions to the screen.');
code = code.replace('Permite fijar recetas de dificultad Intermediate. (Requiere Basic)', 'Allows pinning Intermediate difficulty recipes. (Requires Basic)');
code = code.replace('Permite fijar recetas de dificultad Difficult. (Requiere Advanced)', 'Allows pinning Difficult difficulty recipes. (Requires Advanced)');
code = code.replace('Permite fijar recetas de dificultad Nightmare. (Requiere Expert)', 'Allows pinning Nightmare difficulty recipes. (Requires Expert)');
code = code.replace('Permite fijar recetas de dificultad Chromatic. (Requiere Nightmare)', 'Allows pinning Chromatic difficulty recipes. (Requires Nightmare)');

fs.writeFileSync('constants.ts', code);
console.log("Translated upgrades to English");
