const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetPinBtn = `{canPin && onTogglePin && (
              <button onClick={onTogglePin} className="recipe-steps-close" title={isPinned ? "Unpin recipe" : "Pin recipe to screen"}>
                {isPinned ? '📌' : '📍'}
              </button>
            )}`;

const replacePinBtn = `{canPin && onTogglePin && (
              <button onClick={onTogglePin} className={\`recipe-steps-close \${isPinned ? 'bg-white text-black' : ''}\`} title={isPinned ? "Unpin recipe" : "Pin recipe to screen"}>
                <Pin size={16} />
              </button>
            )}`;

code = code.replace(targetPinBtn, replacePinBtn);

const targetImport = `ShoppingBag, Bot, Cpu, Search, Lock, FlaskConical } from "lucide-react";`;
const replaceImport = `ShoppingBag, Bot, Cpu, Search, Lock, FlaskConical, Pin } from "lucide-react";`;
code = code.replace(targetImport, replaceImport);

fs.writeFileSync('App.tsx', code);
console.log("Patched Pin button");
