const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetAccount = `                        <button 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-none border-none cursor-pointer"`;

const replaceAccount = `                        <StreakFlame streak={stats.streak || 0} size={28} className="absolute -bottom-2 -right-2" />
                        <button 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-none border-none cursor-pointer"`;

code = code.replace(targetAccount, replaceAccount);
fs.writeFileSync('App.tsx', code);
console.log("Patched account flame");
