const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetServe = `      if (result) {
        soundService.playSuccess();
        
        // Update stats and challenges
        setStats((prev: any) => ({
          ...prev,
          money: prev.money + 50, // Base reward for success
          dailyChallenges: (prev.dailyChallenges || []).map((c: any) => 
            c.type === 'orders' ? { ...c, current: c.current + 1 } :
            c.type === 'money' ? { ...c, current: c.current + 50 } : c
          )
        }));
      }`;

const replacementServe = `      if (result) {
        soundService.playSuccess();
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Update stats and challenges
        setStats((prev: any) => {
          let newStreak = prev.streak || 0;
          let lastActiveDate = prev.lastActiveDate || '';
          
          if (lastActiveDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (lastActiveDate === yesterdayStr) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          }
          
          return {
            ...prev,
            money: prev.money + 50, // Base reward for success
            streak: newStreak,
            lastActiveDate: todayStr,
            dailyChallenges: (prev.dailyChallenges || []).map((c: any) => 
              c.type === 'orders' ? { ...c, current: c.current + 1 } :
              c.type === 'money' ? { ...c, current: c.current + 50 } : c
            )
          };
        });
      }`;

code = code.replace(targetServe, replacementServe);
fs.writeFileSync('App.tsx', code);
console.log("Patched serve function");
