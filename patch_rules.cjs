const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const newRule = `    match /system_news/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    match /test/connection {`;

code = code.replace("    match /test/connection {", newRule);

code = code.replace(`    function isAdmin() {
      return isAuthenticated() &&
             (request.auth.token.email == "robert.garcia.alsina2012@gmail.com" || 
              request.auth.token.email == "gianlucaperalta555@gmail.com") &&
             request.auth.token.email_verified == true;
    }`, `    function isAdmin() {
      return isAuthenticated() &&
             request.auth.token.email == "robert.garcia.alsina2012@gmail.com" &&
             request.auth.token.email_verified == true;
    }`);

fs.writeFileSync('firestore.rules', code);
