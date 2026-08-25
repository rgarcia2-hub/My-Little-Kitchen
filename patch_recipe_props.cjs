const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetProps = `interface RecipeStepsDisplayProps {
  steps: RecipeStep[];
  onClose: () => void;
  onRetry: () => void;
  isLoading: boolean;
  orderName: string;
  difficulty?: string;
  adsDisabled?: boolean;
  proPlan?: boolean;
  godTier?: boolean;
}`;

const replaceProps = `interface RecipeStepsDisplayProps {
  steps: RecipeStep[];
  onClose: () => void;
  onRetry: () => void;
  isLoading: boolean;
  orderName: string;
  difficulty?: string;
  adsDisabled?: boolean;
  proPlan?: boolean;
  godTier?: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
  canPin?: boolean;
}`;

code = code.replace(targetProps, replaceProps);

const targetComponent = `function RecipeStepsDisplay({ 
  steps, 
  onClose, 
  onRetry, 
  isLoading, 
  orderName, 
  difficulty, 
  adsDisabled,
  proPlan,
  godTier
}: RecipeStepsDisplayProps) {`;

const replaceComponent = `function RecipeStepsDisplay({ 
  steps, 
  onClose, 
  onRetry, 
  isLoading, 
  orderName, 
  difficulty, 
  adsDisabled,
  proPlan,
  godTier,
  isPinned,
  onTogglePin,
  canPin
}: RecipeStepsDisplayProps) {`;

code = code.replace(targetComponent, replaceComponent);

const targetOverlay = `<div className={\`recipe-steps-overlay \${isProtected ? 'protected-mode' : ''}\`}>`;
const replaceOverlay = `<div className={\`recipe-steps-overlay \${isProtected ? 'protected-mode' : ''} \${isPinned ? 'pinned' : ''}\`}>`;
code = code.replace(targetOverlay, replaceOverlay);

const targetHeaderActions = `<div className="recipe-steps-header-actions">
            <button onClick={onClose} className="recipe-steps-close">✕</button>
          </div>`;

const replaceHeaderActions = `<div className="recipe-steps-header-actions flex items-center gap-2">
            {canPin && onTogglePin && (
              <button onClick={onTogglePin} className="recipe-steps-close" title={isPinned ? "Unpin recipe" : "Pin recipe to screen"}>
                {isPinned ? '📌' : '📍'}
              </button>
            )}
            <button onClick={onClose} className="recipe-steps-close">✕</button>
          </div>`;

code = code.replace(targetHeaderActions, replaceHeaderActions);

fs.writeFileSync('App.tsx', code);
console.log("Patched RecipeStepsDisplay props and UI");
