const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetComponent = `function OrderCard({ order, isDisabled, isHighlighted, onPickUp, onCookWithGemini, onOpenVerificationAgent }: OrderCardProps) {
  const statusClass = order.status === 'completed' ? 'completed' :
    order.status === 'failed' ? 'failed' :
      order.status === 'in_progress' ? 'in-progress' : 'not-started';

  const difficultyClass = order.difficulty ? \`difficulty-\${order.difficulty}\` : '';
  const rarityClass = order.rarity ? \`rarity-\${order.rarity}\` : '';

  return (
    <div className={\`order-card \${statusClass} \${isDisabled ? 'disabled' : ''} \${isHighlighted ? 'tutorial-highlight' : ''} \${rarityClass}\`}>`;

const replaceComponent = `function OrderCard({ order, isDisabled, isHighlighted, onPickUp, onCookWithGemini, onOpenVerificationAgent, onDeleteOrder, canDelete }: OrderCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const statusClass = order.status === 'completed' ? 'completed' :
    order.status === 'failed' ? 'failed' :
      order.status === 'in_progress' ? 'in-progress' : 'not-started';

  const difficultyClass = order.difficulty ? \`difficulty-\${order.difficulty}\` : '';
  const rarityClass = order.rarity ? \`rarity-\${order.rarity}\` : '';

  const handleDelete = () => {
    if (!canDelete || !onDeleteOrder) return;
    setIsDeleting(true);
    soundService.playTear();
    setTimeout(() => {
      onDeleteOrder(order.id);
    }, 400);
  };

  return (
    <div className={\`order-card group \${statusClass} \${isDisabled ? 'disabled' : ''} \${isHighlighted ? 'tutorial-highlight' : ''} \${rarityClass} \${isDeleting ? 'animate-paper-tear' : ''}\`}>
      {onDeleteOrder && (
        <button 
          className={\`absolute -top-2 -left-2 bg-black text-white p-1.5 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600 \${!canDelete ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer'}\`}
          onClick={handleDelete}
          disabled={!canDelete}
          title={canDelete ? "Delete Order" : "Need at least 6 orders to delete"}
        >
          <Trash2 size={12} />
        </button>
      )}`;

code = code.replace(targetComponent, replaceComponent);
fs.writeFileSync('App.tsx', code);
console.log("Patched OrderCard component");
