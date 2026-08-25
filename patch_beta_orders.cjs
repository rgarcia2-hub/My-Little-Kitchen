const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetProps = `interface BetaOrdersConsoleProps {
  orders: Order[];
  currentOrder: Order | undefined;
  tutorialStep: number;
  fetchRecipeSteps: (name: string, difficulty?: string) => void;
  isCooking: boolean;
  isFetchingSteps: boolean;
  onPickUp: (orderId: string) => void;
  onCookWithGemini: (orderName: string) => void;
  onOpenVerificationAgent?: () => void;
  onAddOrder: (orderName: string) => void;
}`;

const replaceProps = `interface BetaOrdersConsoleProps {
  orders: Order[];
  currentOrder: Order | undefined;
  tutorialStep: number;
  fetchRecipeSteps: (name: string, difficulty?: string) => void;
  isCooking: boolean;
  isFetchingSteps: boolean;
  onPickUp: (orderId: string) => void;
  onCookWithGemini: (orderName: string) => void;
  onOpenVerificationAgent?: () => void;
  onAddOrder: (orderName: string) => void;
  onDeleteOrder?: (id: string) => void;
  canDelete?: boolean;
}`;

code = code.replace(targetProps, replaceProps);

const targetComp = `function BetaOrdersConsole({
  orders,
  currentOrder,
  tutorialStep,
  fetchRecipeSteps,
  isCooking,
  isFetchingSteps,
  onPickUp,
  onCookWithGemini,
  onOpenVerificationAgent,
  onAddOrder,
}: BetaOrdersConsoleProps) {`;

const replaceComp = `function BetaOrdersConsole({
  orders,
  currentOrder,
  tutorialStep,
  fetchRecipeSteps,
  isCooking,
  isFetchingSteps,
  onPickUp,
  onCookWithGemini,
  onOpenVerificationAgent,
  onAddOrder,
  onDeleteOrder,
  canDelete
}: BetaOrdersConsoleProps) {`;

code = code.replace(targetComp, replaceComp);

const targetRender = `<OrderCard
                  key={order.id}
                  order={order}
                  isDisabled={hasInProgressOrder && order.status === 'not_started'}
                  isHighlighted={tutorialStep === 2 && order.name === 'Fried Eggs'}
                  onPickUp={onPickUp}
                  onCookWithGemini={onCookWithGemini}
                  onOpenVerificationAgent={onOpenVerificationAgent}
                />`;

const replaceRender = `<OrderCard
                  key={order.id}
                  order={order}
                  isDisabled={hasInProgressOrder && order.status === 'not_started'}
                  isHighlighted={tutorialStep === 2 && order.name === 'Fried Eggs'}
                  onPickUp={onPickUp}
                  onCookWithGemini={onCookWithGemini}
                  onOpenVerificationAgent={onOpenVerificationAgent}
                  onDeleteOrder={onDeleteOrder}
                  canDelete={canDelete}
                />`;

code = code.replace(targetRender, replaceRender);

const targetAppRender = `<BetaOrdersConsole
            orders={orders}
            currentOrder={currentOrder}
            tutorialStep={tutorialStep}
            fetchRecipeSteps={fetchRecipeSteps}
            isCooking={isCooking}
            isFetchingSteps={isFetchingSteps}
            onPickUp={onPickUp}
            onCookWithGemini={onCookWithGemini}
            onOpenVerificationAgent={onOpenVerificationAgent}
            onAddOrder={onAddOrder}
          />`;

const replaceAppRender = `<BetaOrdersConsole
            orders={orders}
            currentOrder={currentOrder}
            tutorialStep={tutorialStep}
            fetchRecipeSteps={fetchRecipeSteps}
            isCooking={isCooking}
            isFetchingSteps={isFetchingSteps}
            onPickUp={onPickUp}
            onCookWithGemini={onCookWithGemini}
            onOpenVerificationAgent={onOpenVerificationAgent}
            onAddOrder={onAddOrder}
            onDeleteOrder={handleDeleteOrder}
            canDelete={orders.length > 5}
          />`;

code = code.replace(targetAppRender, replaceAppRender);

fs.writeFileSync('App.tsx', code);
console.log("Patched BetaOrdersConsole");
