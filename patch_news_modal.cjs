const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetStr = `      {/* News Feed Archive Modal */}
      {showNewsFeed && (
        <div className="os-modal-overlay system-news-overlay" onClick={() => setShowNewsFeed(false)}>
          <div className="os-modal-card news-archive-card" onClick={e => e.stopPropagation()}>
            <div className="os-modal-header news-header">
              <span className="os-modal-icon">📡</span>
              <span className="os-modal-title">SYSTEM_BROADCAST_ARCHIVE</span>
              <button className="terminal-close ml-auto" onClick={() => setShowNewsFeed(false)}>X</button>
            </div>
            <div className="os-modal-body news-archive-body">
            {activeNewsId ? (
              <div className="active-news-detail">
                <div className="flex items-center gap-2 mb-4">
                  <button className="os-button-mini" onClick={() => setActiveNewsId(null)}>&lt; BACK</button>
                  <h3 className="news-detail-title">{NEWS_ITEMS.find(n => n.id === activeNewsId)?.title}</h3>
                </div>
                <div className="news-detail-content">
                  <p>{NEWS_ITEMS.find(n => n.id === activeNewsId)?.content}</p>
                </div>
              </div>
            ) : (
              <div className="news-list">
                {NEWS_ITEMS.map(item => (
                  <div 
                    key={item.id} 
                    className="news-item-row"
                    onClick={() => {
                      soundService.playClick();
                      setActiveNewsId(item.id);
                    }}
                  >
                    <div className="news-item-status">
                      <span className="status-dot pulsed"></span>
                    </div>
                    <div className="news-item-main">
                      <div className="news-item-header">
                        <span className="news-item-badge">{item.badge}</span>
                        <span className="news-item-date">{item.date}</span>
                      </div>
                      <div className="news-item-title">{item.title}</div>
                    </div>
                    <div className="news-item-arrow">
                      &gt;
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      )}`;

const newStr = `      {/* News Feed Archive Modal */}
      {showNewsFeed && (
        <div className="fame-os-overlay overflow-hidden" onClick={() => setShowNewsFeed(false)}>
          <AntigravityBackground 
            count={20} 
            emojis={['📡', '✉️', '📻', '🗞️']} 
            opacityRange={[0.08, 0.2]}
            zIndex={1}
          />
          <div className="fame-terminal-window" onClick={e => e.stopPropagation()}>
            <div className="terminal-scanline"></div>
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="terminal-title">SYSTEM_BROADCAST_ARCHIVE</div>
              <button className="terminal-close" onClick={() => setShowNewsFeed(false)}>TERMINATE_SESSION</button>
            </div>
            
            <div className="terminal-content">
              {activeNewsId === 'NEW' && isSuperAdmin ? (
                <div className="terminal-fame-display flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button className="terminal-execute-btn bg-[#222] border-[#444] text-white hover:bg-white hover:text-black w-24" onClick={() => setActiveNewsId(null)}>&lt; BACK</button>
                    <h3 className="terminal-h2">CREATE_BROADCAST</h3>
                  </div>
                  <div className="terminal-input-group flex flex-col gap-2">
                    <input id="news-title" type="text" className="terminal-input bg-black border border-[#333] text-[#00ff00] font-mono text-sm p-3 focus:outline-none focus:border-[#00ff00]" placeholder="Title (e.g. SYSTEM_UPDATE)..." />
                    <textarea id="news-content" className="terminal-input bg-black border border-[#333] text-[#00ff00] font-mono text-sm p-3 focus:outline-none focus:border-[#00ff00] min-h-[100px]" placeholder="Content..."></textarea>
                    <div className="flex gap-2">
                      <input id="news-badge" type="text" className="terminal-input bg-black border border-[#333] text-[#00ff00] font-mono text-sm p-3 focus:outline-none focus:border-[#00ff00] flex-1" placeholder="Badge (e.g. URGENT, UPDATE)..." defaultValue="UPDATE" />
                      <input id="news-icon" type="text" className="terminal-input bg-black border border-[#333] text-[#00ff00] font-mono text-sm p-3 focus:outline-none focus:border-[#00ff00] flex-1" placeholder="Icon (e.g. ⚠️)..." defaultValue="📡" />
                    </div>
                    <button 
                      className="terminal-execute-btn border-2 border-[#00ff00] text-[#00ff00] font-black uppercase tracking-widest hover:bg-[#00ff00] hover:text-black transition-all mt-4"
                      onClick={async () => {
                        const title = (document.getElementById('news-title') as HTMLInputElement)?.value;
                        const content = (document.getElementById('news-content') as HTMLTextAreaElement)?.value;
                        const badge = (document.getElementById('news-badge') as HTMLInputElement)?.value;
                        const icon = (document.getElementById('news-icon') as HTMLInputElement)?.value;
                        if (!title || !content) return;
                        
                        try {
                          await setDoc(doc(collection(db, "system_news")), {
                            title, content, badge, icon,
                            date: new Date().toISOString().split('T')[0],
                            timestamp: Date.now()
                          });
                          setActiveNewsId(null);
                        } catch (e) {
                          console.error("Failed to post news", e);
                        }
                      }}
                    >
                      EXECUTE_TRANSMISSION
                    </button>
                  </div>
                </div>
              ) : activeNewsId ? (
                <div className="terminal-fame-display">
                  <div className="flex items-center gap-2 mb-4">
                    <button className="terminal-execute-btn bg-[#222] border-[#444] text-white hover:bg-white hover:text-black w-24" onClick={() => setActiveNewsId(null)}>&lt; BACK</button>
                    <div className="fame-portal-badge" style={{ background: '#1a1a1a', border: '2px solid rgba(255,255,255,0.1)' }}>
                      {newsItems.find(n => n.id === activeNewsId)?.icon || '📡'}
                    </div>
                    <div>
                      <h3 className="terminal-h2">{newsItems.find(n => n.id === activeNewsId)?.title}</h3>
                      <span className="text-[9px] font-mono text-[#00ff00] opacity-70">
                        DATE: {newsItems.find(n => n.id === activeNewsId)?.date} | CLASSIFICATION: {newsItems.find(n => n.id === activeNewsId)?.badge}
                      </span>
                    </div>
                  </div>
                  <div className="t-stat border border-[#222] bg-[#0c0c0c] p-4 rounded-sm mt-4 text-[#00ff00] font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {newsItems.find(n => n.id === activeNewsId)?.content}
                  </div>
                  {isSuperAdmin && (
                    <button 
                      className="mt-4 terminal-execute-btn border-2 border-red-500 text-red-500 font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all w-full"
                      onClick={async () => {
                         if (confirm('Delete this broadcast?')) {
                           try {
                             const { deleteDoc } = require('firebase/firestore');
                             await deleteDoc(doc(db, "system_news", activeNewsId));
                             setActiveNewsId(null);
                           } catch (e) { console.error("Error deleting", e); }
                         }
                      }}
                    >
                      DELETE_TRANSMISSION
                    </button>
                  )}
                </div>
              ) : (
                <div className="terminal-fame-display h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                     <div>
                       <h2 className="terminal-h2">INTERCEPTED_TRANSMISSIONS</h2>
                       <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Found {newsItems.length} logs in archive</div>
                     </div>
                     {isSuperAdmin && (
                        <button 
                          className="terminal-execute-btn border border-[#00ff00] text-[#00ff00] px-4 py-2 text-xs hover:bg-[#00ff00] hover:text-black"
                          onClick={() => setActiveNewsId('NEW')}
                        >
                          + NEW_BROADCAST
                        </button>
                     )}
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-8" style={{ maxHeight: '60vh' }}>
                    {newsItems.length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-[#333] text-gray-500 font-mono text-xs uppercase">
                        NO_TRANSMISSIONS_FOUND
                      </div>
                    ) : newsItems.map(item => (
                      <div 
                        key={item.id} 
                        className="t-stat border border-[#222] bg-[#0c0c0c] p-4 rounded-sm cursor-pointer hover:border-[#00ff00] hover:bg-[#00ff00]/10 transition-colors group flex items-start gap-4"
                        onClick={() => {
                          soundService.playClick();
                          setActiveNewsId(item.id);
                        }}
                      >
                        <div className="fame-portal-badge flex-shrink-0 !w-10 !h-10 !text-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {item.icon || '📡'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] text-gray-500 font-mono uppercase truncate">{item.date} // {item.badge}</span>
                            <span className="text-[#00ff00] opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xs">&gt; OPEN</span>
                          </div>
                          <div className="text-[#00ff00] font-black uppercase truncate text-sm">{item.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('App.tsx', code);
