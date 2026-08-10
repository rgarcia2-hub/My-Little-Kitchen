const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const vipStateCode = `
  const [vipEvent, setVipEvent] = useState<{title: string, description: string, reward: number, timeLeft: number} | null>(null);

  useEffect(() => {
    const int1 = setInterval(() => {
      setVipEvent(prev => {
        if (prev) return prev;
        if (Math.random() > 0.3) {
          return {
            title: "🕵️‍♂️ VIP Hacker Request",
            description: "El sindicato 'CyberChef' exige que cocines a la máxima velocidad para probar tus scripts.",
            reward: 25000,
            timeLeft: 300
          };
        }
        return null;
      });
    }, 120000); // Check every 2 minutes
    
    const int2 = setInterval(() => {
      setVipEvent(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) return null;
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    return () => { clearInterval(int1); clearInterval(int2); };
  }, []);

  const completeVipEvent = () => {
    if (!vipEvent) return;
    setStats(s => ({ ...s, money: s.money + vipEvent.reward }));
    soundService.playSuccess();
    setVipEvent(null);
    addTerminalLog("[SUCCESS] VIP Hacker transaction complete. Funds transferred.");
  };

  const [chromaticMinigameOrder, setChromaticMinigameOrder]`;

code = code.replace(/const \[chromaticMinigameOrder, setChromaticMinigameOrder\]/, vipStateCode);

const vipUiCode = `
        {/* VIP Event Overlay */}
        {vipEvent && (
          <div className="mb-4 p-4 border border-red-500/50 bg-red-500/10 rounded-lg relative overflow-hidden animate-pulse">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30">
              <div className="h-full bg-red-500" style={{ width: \`\${(vipEvent.timeLeft / 300) * 100}%\` }}></div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-red-400 font-bold flex items-center gap-2">
                  {vipEvent.title}
                  <span className="text-xs bg-red-500 text-black px-2 py-0.5 rounded">URGENT</span>
                </h3>
                <p className="text-gray-300 text-sm mt-1">{vipEvent.description}</p>
                <p className="text-red-300 text-xs mt-2 font-mono">Time Remaining: {Math.floor(vipEvent.timeLeft / 60)}:{(vipEvent.timeLeft % 60).toString().padStart(2, '0')}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-green-500 font-mono font-bold text-lg">$\\{vipEvent.reward.toLocaleString()}</span>
                <button 
                  className="mt-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500 px-4 py-1 rounded text-sm transition-colors"
                  onClick={completeVipEvent}
                >
                  Deliver Data
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="os-card orders-container">
`;

code = code.replace(/<div className="os-card orders-container">/, vipUiCode.replace(/\\$/g, '$').replace(/\\{/g, '{'));

fs.writeFileSync('App.tsx', code);
