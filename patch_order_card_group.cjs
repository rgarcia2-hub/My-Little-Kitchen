const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `<div className={\`order-card \${statusClass} \${isDisabled ? 'disabled' : ''} \${isHighlighted ? 'tutorial-highlight' : ''} \${rarityClass} \${isDeleting ? 'animate-paper-tear' : ''}\`}>`;
const replace = `<div className={\`order-card group \${statusClass} \${isDisabled ? 'disabled' : ''} \${isHighlighted ? 'tutorial-highlight' : ''} \${rarityClass} \${isDeleting ? 'animate-paper-tear' : ''}\`}>`;

code = code.replace(target, replace);
fs.writeFileSync('App.tsx', code);
console.log("Patched group class");
