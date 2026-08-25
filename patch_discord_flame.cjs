const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetDiscord = `                  <div className={\`discord-status-dot-badge \${
                    selectedChefForProfile.discordStatus === 'online' ? 'status-online' :
                    selectedChefForProfile.discordStatus === 'idle' ? 'status-idle' :
                    selectedChefForProfile.discordStatus === 'dnd' ? 'status-dnd' : 'status-offline'
                  }\`} />
                </div>`;

const replaceDiscord = `                  <div className={\`discord-status-dot-badge \${
                    selectedChefForProfile.discordStatus === 'online' ? 'status-online' :
                    selectedChefForProfile.discordStatus === 'idle' ? 'status-idle' :
                    selectedChefForProfile.discordStatus === 'dnd' ? 'status-dnd' : 'status-offline'
                  }\`} />
                  <StreakFlame streak={selectedChefForProfile.streak || 0} size={28} className="absolute -bottom-2 -left-2" />
                </div>`;

code = code.replace(targetDiscord, replaceDiscord);
fs.writeFileSync('App.tsx', code);
console.log("Patched discord flame");
