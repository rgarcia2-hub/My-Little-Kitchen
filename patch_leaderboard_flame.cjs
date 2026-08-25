const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetLB = `                      <div className="row-avatar text-2xl">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt="avatar" className="w-8 h-8 rounded-full border border-[#333]" />
                        ) : '👨‍🍳'}
                      </div>`;

const replaceLB = `                      <div className="row-avatar text-2xl relative">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt="avatar" className="w-8 h-8 rounded-full border border-[#333] object-cover" />
                        ) : '👨‍🍳'}
                        <StreakFlame streak={u.streak || 0} size={18} className="absolute -bottom-1 -right-1" />
                      </div>`;

code = code.replace(targetLB, replaceLB);
fs.writeFileSync('App.tsx', code);
console.log("Patched leaderboard flame");
