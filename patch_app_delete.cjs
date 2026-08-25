const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetMethod = `  // Callback for adding a new custom order
  const handleAddOrder = useCallback((orderName: string) => {`;

const replaceMethod = `  const handleDeleteOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  // Callback for adding a new custom order
  const handleAddOrder = useCallback((orderName: string) => {`;

code = code.replace(targetMethod, replaceMethod);

const targetRender = `<OrderCard
                    key={order.id}
                    order={order}
                    isDisabled={hasInProgressOrder && order.status === 'not_started'}
                    isHighlighted={tutorialStep === 2 && order.name === 'Fried Eggs'}
                    onPickUp={onPickUp}`;

const replaceRender = `<OrderCard
                    key={order.id}
                    order={order}
                    isDisabled={hasInProgressOrder && order.status === 'not_started'}
                    isHighlighted={tutorialStep === 2 && order.name === 'Fried Eggs'}
                    onPickUp={onPickUp}
                    onDeleteOrder={handleDeleteOrder}
                    canDelete={orders.length > 5}`;

code = code.replace(targetRender, replaceRender);

fs.writeFileSync('App.tsx', code);
console.log("Patched App.tsx delete method and render");
