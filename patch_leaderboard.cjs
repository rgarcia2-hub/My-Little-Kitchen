const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const replacement = `
function Leaderboard({ data, isLoading, onClose }: LeaderboardProps) {
  return (
    <div className="os-modal-overlay z-[15000]" onClick={onClose}>
      <div className="os-leaderboard-card max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="os-modal-header-green-alt flex items-center justify-between p-4 bg-[#111] border-b border-[#222]">
          <div className="header-left-group flex items-center gap-2">
            <span className="os-modal-icon text-xl">🏆</span>
            <span className="os-modal-title font-bold text-green-500 tracking-wider">GLOBAL_RANKINGS_v3.0</span>
          </div>
          <button className="os-close-btn text-gray-500 hover:text-white" onClick={onClose}>&times;</button>
        </div>
        
        <div className="os-leaderboard-body bg-[#0a0a0a] p-6 max-h-[70vh] overflow-y-auto">
          {/* Rivalidad Semanal Header */}
          <div className="mb-6 p-4 border border-purple-500/30 bg-purple-500/5 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚔️</span>
              <h3 className="text-purple-400 font-bold uppercase tracking-wider">Rivalidad Semanal</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Objetivo: "Chef Supremo". Cocina 50 platillos nivel Divino.
            </p>
            <div className="w-full bg-[#111] h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[45%]"></div>
            </div>
            <p className="text-right text-xs text-purple-500 mt-1">45% completado</p>
          </div>

          {isLoading ? (
            <div className="os-loading-state text-center py-10">
              <div className="os-spinner inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="block text-green-500 font-mono text-sm">FETCHING_DATA...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="os-empty-state text-center py-10 text-gray-500 font-mono">
              NO_DATA_FOUND
            </div>
          ) : (
            <div className="os-leaderboard-list flex flex-col gap-2">
              {data.map((u, index) => {
                const isTop3 = index < 3;
                return (
                  <div key={u.uid} className={\`os-leaderboard-row flex items-center justify-between p-3 rounded-lg border \${isTop3 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-[#222] bg-[#111]'}\`}>
                    <div className="row-left flex items-center gap-4">
                      <span className={\`row-rank font-bold w-6 text-center \${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-600'}\`}>
                        #{index + 1}
                      </span>
                      <div className="row-avatar text-2xl">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt="avatar" className="w-8 h-8 rounded-full border border-[#333]" />
                        ) : '👨‍🍳'}
                      </div>
                      <div className="row-info flex flex-col">
                        <span className="row-name font-bold text-gray-200">
                          {u.email ? u.email.split('@')[0] : 'Unknown_Chef'}
                        </span>
                        <div className="row-badges flex gap-1 mt-1">
                          {u.badges && u.badges.map((b, i) => (
                            <span key={i} className="text-xs">{b}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="row-right flex items-center gap-6 text-right">
                      <div className="row-stat flex flex-col">
                        <span className="text-xs text-gray-500 uppercase">Level</span>
                        <span className="font-mono text-green-400">{u.level}</span>
                      </div>
                      <div className="row-stat flex flex-col">
                        <span className="text-xs text-gray-500 uppercase">Fame</span>
                        <span className="font-mono text-yellow-400">{u.fameDonated || 0}</span>
                      </div>
                      <div className="row-stat flex flex-col min-w-[60px]">
                        <span className="text-xs text-gray-500 uppercase">Money</span>
                        <span className="font-mono text-green-500">\\$\\{u.money.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="os-leaderboard-footer p-3 bg-[#111] border-t border-[#222] flex justify-between items-center text-xs text-gray-500 font-mono">
          <div className="footer-status text-green-500">SYSTEM_STATUS: ONLINE</div>
          <div className="footer-timestamp">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}
`;

code = code.replace(/function Leaderboard\(\{\s*data,\s*isLoading,\s*onClose\s*\}\:\s*LeaderboardProps\)\s*\{[\s\S]*?(?=function |\/\/ ============================================================================|$)/, replacement.replace(/\\$/g, '$').replace(/\\{/g, '{'));

fs.writeFileSync('App.tsx', code);
