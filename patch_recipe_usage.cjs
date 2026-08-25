const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetUsage = `        <RecipeStepsDisplay 
          steps={recipeSteps} 
          onClose={() => {
            setShowRecipeSteps(false);
            setIsRecipePinned(false);
          }} 
          onRetry={() => fetchRecipeSteps(currentOrder.name, currentOrder.difficulty)}
          isLoading={isFetchingSteps}
          orderName={currentOrder.name}
          difficulty={currentOrder.difficulty}
          adsDisabled={stats.adsDisabled}
          proPlan={stats.proPlan}
          godTier={stats.godTier}
        />`;

const replaceUsage = `        <RecipeStepsDisplay 
          steps={recipeSteps} 
          onClose={() => {
            setShowRecipeSteps(false);
            setIsRecipePinned(false);
          }} 
          onRetry={() => fetchRecipeSteps(currentOrder.name, currentOrder.difficulty)}
          isLoading={isFetchingSteps}
          orderName={currentOrder.name}
          difficulty={currentOrder.difficulty}
          adsDisabled={stats.adsDisabled}
          proPlan={stats.proPlan}
          godTier={stats.godTier}
          isPinned={isRecipePinned}
          onTogglePin={() => setIsRecipePinned(!isRecipePinned)}
          canPin={
            stats.godTier || 
            (currentOrder.difficulty === 'easy' && (stats.purchasedUpgrades || []).includes('pin_easy')) ||
            (currentOrder.difficulty === 'intermediate' && (stats.purchasedUpgrades || []).includes('pin_intermediate')) ||
            (currentOrder.difficulty === 'difficult' && (stats.purchasedUpgrades || []).includes('pin_difficult')) ||
            (currentOrder.difficulty === 'nightmare' && (stats.purchasedUpgrades || []).includes('pin_nightmare')) ||
            (currentOrder.difficulty === 'chromatic' && (stats.purchasedUpgrades || []).includes('pin_chromatic'))
          }
        />`;

code = code.replace(targetUsage, replaceUsage);

fs.writeFileSync('App.tsx', code);
console.log("Patched RecipeStepsDisplay usage");
