const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetStr = `            {[...COOKING_ACTIONS, ...customTools]
              .filter(action => action.displayName.toLowerCase().includes(toolsSearchTerm.toLowerCase()))
              .map(action => {
                const isServeDisabled = action.name === 'serve' && selectedIngredients.size !== 1;`;

const newStr = `            {[...COOKING_ACTIONS, ...customTools]
              .filter(action => action.displayName.toLowerCase().includes(toolsSearchTerm.toLowerCase()))
              .sort((a, b) => {
                if (a.name === 'serve') return -1;
                if (b.name === 'serve') return 1;
                return a.displayName.localeCompare(b.displayName);
              })
              .map(action => {
                const isServeAction = action.name === 'serve';
                const isServeDisabled = isServeAction && selectedIngredients.size !== 1;`;

code = code.replace(targetStr, newStr);

const classTargetStr = `                    className={\`lab-action-btn \${activeAction === action.name ? 'active' : ''} \${isDisabled ? 'disabled' : ''} \${tutorialStep === 4 && action.name === 'serve' ? 'tutorial-highlight' : ''}\`}`;
const newClassStr = `                    className={\`lab-action-btn \${activeAction === action.name ? 'active' : ''} \${isDisabled ? 'disabled' : ''} \${tutorialStep === 4 && isServeAction ? 'tutorial-highlight' : ''} \${isServeAction ? 'col-span-full !bg-green-100 !border-green-600 !border-2 !shadow-md !py-4 hover:!bg-green-200' : ''}\`}
                    style={isServeAction ? { gridColumn: '1 / -1', fontSize: '1.2rem', justifyContent: 'center' } : {}}`;

code = code.replace(classTargetStr, newClassStr);

fs.writeFileSync('App.tsx', code);
