const fs = require('fs');
let css = fs.readFileSync('App.css', 'utf8');

const targetCss = `.recipe-steps-overlay.pinned .recipe-steps-modal {
  max-width: 350px;
  max-height: 60vh;
  box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.2);
  opacity: 0.95;
}`;

const replacementCss = `.recipe-steps-overlay.pinned .recipe-steps-modal {
  max-width: 350px;
  max-height: 60vh;
  box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.2);
  opacity: 0.95;
  pointer-events: auto;
}`;

css = css.replace(targetCss, replacementCss);
fs.writeFileSync('App.css', css);
console.log("Patched CSS properly");
