const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const startIdx = code.indexOf('{/* Settings & Account Modal */}');
const endIdx = code.indexOf('<div className="skip-modal-body">', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newHeader = `{/* Settings & Account Modal */}
      {showSkipModal && (
        <div className="skip-modal-overlay">
          <div className="skip-modal">
            <div className="skip-modal-header">
              <h3>⚙️ Ajustes y Cuenta</h3>
              <button className="skip-close-btn" onClick={() => setShowSkipModal(false)}>✕</button>
            </div>
            `;
  
  code = code.substring(0, startIdx) + newHeader + code.substring(endIdx);
  fs.writeFileSync('App.tsx', code);
  console.log('Patched Settings Modal');
} else {
  console.log('Could not find boundaries', startIdx, endIdx);
}
