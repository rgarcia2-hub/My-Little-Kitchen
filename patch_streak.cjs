const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const oldVerify = `      if (result) {
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
      } else {`;

const newVerify = `      if (result) {
        soundService.playSuccess();
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Update stats and challenges
        setStats((prev: any) => {
          let newStreak = prev.streak || 0;
          let lastActive = prev.lastActiveDay;

          if (lastActive !== todayStr) {
            if (!lastActive) {
              newStreak = 1;
            } else {
              const lastActiveDate = new Date(lastActive);
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              if (lastActive === yesterdayStr) {
                newStreak += 1;
              } else {
                newStreak = 1; // Skipped a day
              }
            }
          }

          return {
            ...prev,
            money: prev.money + 50, // Base reward for success
            streak: newStreak,
            lastActiveDay: todayStr,
            dailyChallenges: (prev.dailyChallenges || []).map((c: any) => 
              c.type === 'orders' ? { ...c, current: c.current + 1 } :
              c.type === 'money' ? { ...c, current: c.current + 50 } : c
            )
          };
        });
      } else {`;

code = code.replace(oldVerify, newVerify);
fs.writeFileSync('App.tsx', code);
console.log("Patched streak logic");
