const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const oldComp = \`function UpgradeItem({ upgrade, isPurchased, canAfford, onBuy }: { 
  upgrade: Upgrade; 
  isPurchased: boolean; 
  canAfford: boolean;
  onBuy: () => void;
}) {
  return (
    <div className={\\\`upgrade-item \${isPurchased ? 'purchased' : canAfford ? 'affordable' : 'expensive'}\\\`}>
      <div className="upgrade-icon">{upgrade.emoji}</div>
      <div className="upgrade-info">
        <div className="upgrade-name">{upgrade.name}</div>
        <div className="upgrade-description">{upgrade.description}</div>
        <div className="upgrade-cost">
          {isPurchased ? 'PURCHASED' : \\\`Cost: $\\$\{upgrade.cost\}\\\`}
        </div>
      </div>
      {!isPurchased && (
        <button 
          className="buy-upgrade-btn" 
          onClick={onBuy}
          disabled={!canAfford}
        >
          Buy
        </button>
      )}
    </div>
  );
}\`;

const newComp = \`function UpgradeItem({ upgrade, isPurchased, canAfford, meetsRequirement, onBuy }: { 
  upgrade: Upgrade; 
  isPurchased: boolean; 
  canAfford: boolean;
  meetsRequirement: boolean;
  onBuy: () => void;
}) {
  return (
    <div className={\\\`upgrade-item \${isPurchased ? 'purchased' : (!meetsRequirement ? 'locked' : (canAfford ? 'affordable' : 'expensive'))}\\\`}>
      <div className="upgrade-icon">{upgrade.emoji}</div>
      <div className="upgrade-info">
        <div className="upgrade-name">{upgrade.name}</div>
        <div className="upgrade-description">{upgrade.description}</div>
        {!meetsRequirement && !isPurchased && upgrade.requirementText && (
          <div className="text-red-400 text-xs font-mono mt-1 flex items-center gap-1">
            <span>⚠️</span> {upgrade.requirementText}
          </div>
        )}
        <div className="upgrade-cost">
          {isPurchased ? 'PURCHASED' : \\\`Cost: $\\$\{upgrade.cost\}\\\`}
        </div>
      </div>
      {!isPurchased && (
        <button 
          className="buy-upgrade-btn" 
          onClick={onBuy}
          disabled={!canAfford || !meetsRequirement}
        >
          {meetsRequirement ? 'Buy' : 'Locked'}
        </button>
      )}
    </div>
  );
}\`;

code = code.replace(oldComp, newComp);

const oldCall = \`            {UPGRADES.map(upgrade => (
              <UpgradeItem 
                key={upgrade.id} 
                upgrade={upgrade} 
                isPurchased={(stats.purchasedUpgrades || []).includes(upgrade.id)}
                canAfford={(stats.money || 0) >= upgrade.cost}
                onBuy={() => onBuyUpgrade(upgrade)}
              />
            ))}\`;
const newCall = \`            {UPGRADES.map(upgrade => (
              <UpgradeItem 
                key={upgrade.id} 
                upgrade={upgrade} 
                isPurchased={(stats.purchasedUpgrades || []).includes(upgrade.id)}
                canAfford={(stats.money || 0) >= upgrade.cost}
                meetsRequirement={upgrade.condition ? upgrade.condition(stats) : true}
                onBuy={() => onBuyUpgrade(upgrade)}
              />
            ))}\`;

code = code.replace(oldCall, newCall);

fs.writeFileSync('App.tsx', code);
