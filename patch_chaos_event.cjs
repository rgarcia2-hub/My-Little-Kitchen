const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `  const [chaosEvent, setChaosEvent] = useState<'none' | 'gravity' | 'fire' | 'slimes'>('none');
  const [chaosItems, setChaosItems] = useState<{id: string, x: number, y: number}[]>([]);
  
  useEffect(() => {
    // Randomly trigger chaos events every 45-90 seconds
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {`;

const replacement = `  const [chaosEvent, setChaosEvent] = useState<'none' | 'gravity' | 'fire' | 'virus'>('none');
  const [chaosItems, setChaosItems] = useState<{id: string, x: number, y: number}[]>([]);
  
  const purchasedUpgradesRef = useRef(stats.purchasedUpgrades || []);
  useEffect(() => {
    purchasedUpgradesRef.current = stats.purchasedUpgrades || [];
  }, [stats.purchasedUpgrades]);

  useEffect(() => {
    // Randomly trigger chaos events every 45-90 seconds
    const interval = setInterval(() => {
      const upgrades = purchasedUpgradesRef.current;
      if (upgrades.includes('hazard_shield_3')) return; // 100% elimination
      
      let baseChance = 0.3;
      if (upgrades.includes('hazard_shield_2')) {
        baseChance *= 0.2; // 80% reduction
      } else if (upgrades.includes('hazard_shield_1')) {
        baseChance *= 0.5; // 50% reduction
      }
      
      if (Math.random() < baseChance) {`;

code = code.replace(target, replacement);

const targetSlimes1 = `const events: ('gravity' | 'fire' | 'slimes')[] = ['gravity', 'fire', 'slimes'];`;
const replaceSlimes1 = `const events: ('gravity' | 'fire' | 'virus')[] = ['gravity', 'fire', 'virus'];`;
code = code.replace(targetSlimes1, replaceSlimes1);

const targetSlimes2 = `if (randomEvent === 'slimes') {`;
const replaceSlimes2 = `if (randomEvent === 'virus') {`;
code = code.replace(targetSlimes2, replaceSlimes2);

const targetSlimes3 = `{chaosEvent === 'slimes' && (`;
const replaceSlimes3 = `{chaosEvent === 'virus' && (`;
code = code.replace(targetSlimes3, replaceSlimes3);

const targetSlimes4 = `🦠 ¡Invasión de Limos! (Aplastarlos)`;
const replaceSlimes4 = `🦠 ¡Brote Viral! (Erradicar)`;
code = code.replace(targetSlimes4, replaceSlimes4);

const targetSlimes5 = `chaosEvent === 'slimes' ? 'animate-bounce' : 'animate-pulse'`;
const replaceSlimes5 = `chaosEvent === 'virus' ? 'animate-bounce' : 'animate-pulse'`;
code = code.replace(targetSlimes5, replaceSlimes5);

fs.writeFileSync('App.tsx', code);
console.log("Patched chaos event");
