const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const autoFarmCode = `
  // Auto Farm Scripts Effect
  useEffect(() => {
    let income = 0;
    if (stats.purchasedUpgrades?.includes('auto_script_1')) income += 5;
    if (stats.purchasedUpgrades?.includes('auto_script_2')) income += 20;
    if (stats.purchasedUpgrades?.includes('auto_script_3')) income += 100;
    
    if (income > 0) {
      const interval = setInterval(() => {
        setStats(s => ({ ...s, money: s.money + income }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stats.purchasedUpgrades]);

  // Apply theme to body`;

code = code.replace(/\/\/ Apply theme to body/, autoFarmCode);

fs.writeFileSync('App.tsx', code);
