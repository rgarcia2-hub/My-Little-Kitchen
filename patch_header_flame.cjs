const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetHeader = `              <div className="profile-btn-content">
                {stats.profileImage || user.photoURL ? (
                  <img src={stats.profileImage || user.photoURL} alt="Profile" className="user-avatar object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.[0] || user.email?.[0] || '?'}
                  </div>
                )}
              </div>`;

const replaceHeader = `              <div className="profile-btn-content relative">
                {stats.profileImage || user.photoURL ? (
                  <img src={stats.profileImage || user.photoURL} alt="Profile" className="user-avatar object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.[0] || user.email?.[0] || '?'}
                  </div>
                )}
                <StreakFlame streak={stats.streak || 0} size={14} className="absolute -bottom-1 -right-1" />
              </div>`;

code = code.replace(targetHeader, replaceHeader);
fs.writeFileSync('App.tsx', code);
console.log("Patched header flame");
