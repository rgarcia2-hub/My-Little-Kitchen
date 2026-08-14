const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetStr = `              <div className="admin-section">
                <h4>UI Beta / Experimental Features</h4>
                <div className="bg-white border border-gray-300 p-3 flex items-center justify-between gap-3 rounded-none hover:border-gray-400 transition-all">`;

const replacement = `              <div className="admin-section">
                <h4>UI Beta / Experimental Features</h4>
                <div className="flex flex-col gap-3">
                  <div className="bg-white border border-gray-300 p-3 flex items-center justify-between gap-3 rounded-none hover:border-gray-400 transition-all">`;

code = code.replace(targetStr, replacement);

const targetStr2 = `                      {stats.betaUiOrders ? 'ON' : 'OFF'}
                    </div>
                  </button>
                </div>
              </div>`;

const replacement2 = `                      {stats.betaUiOrders ? 'ON' : 'OFF'}
                    </div>
                  </button>
                </div>

                {/* Infinity AI Toggle */}
                <div className="bg-white border border-gray-300 p-3 flex items-center justify-between gap-3 rounded-none hover:border-gray-400 transition-all">
                  <div className="flex flex-col pr-2">
                    <span className="font-sans font-bold text-sm text-[#1a1a1a] flex items-center gap-2">
                      Beta
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f8efff] text-[#c074f5]">
                        <FlaskConical size={12} fill="currentColor" stroke="currentColor" />
                      </span>
                      Infinity AI Engine
                    </span>
                    <span className="text-xs text-gray-500 font-mono mt-0.5">
                      Enable the new experimental Infinity AI engine (Work in progress)
                    </span>
                  </div>
                  
                  {/* Square Horizontal Switch */}
                  <button
                    type="button"
                    className={\`relative w-14 h-7 border-2 border-[#1a1a1a] transition-all cursor-pointer select-none p-0.5 flex items-center shrink-0 \${
                      stats.betaInfinityAI ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                    }\`}
                    onClick={() => {
                      soundService.playClick();
                      setStats((prev: any) => ({ ...prev, betaInfinityAI: !prev.betaInfinityAI }));
                    }}
                    title={stats.betaInfinityAI ? 'Infinity AI: Enabled' : 'Infinity AI: Disabled'}
                  >
                    <div 
                      className={\`w-5 h-5 flex items-center justify-center font-mono font-bold text-[10px] transition-all transform \${
                        stats.betaInfinityAI 
                          ? 'translate-x-[26px] bg-white text-[#1a1a1a]' 
                          : 'translate-x-0 bg-[#1a1a1a] text-white'
                      }\`}
                    >
                      {stats.betaInfinityAI ? 'ON' : 'OFF'}
                    </div>
                  </button>
                </div>
              </div>
            </div>`;

code = code.replace(targetStr2, replacement2);

fs.writeFileSync('App.tsx', code);
console.log("Infinity AI toggle added");
