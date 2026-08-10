const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// replace require with nothing and make sure deleteDoc is imported at the top
code = code.replace("import { doc, getDoc, setDoc, onSnapshot, getDocFromServer, Timestamp, query, orderBy, limit, getDocs, collection } from \\"firebase/firestore\\";", "import { doc, getDoc, setDoc, onSnapshot, getDocFromServer, Timestamp, query, orderBy, limit, getDocs, collection, deleteDoc } from \\"firebase/firestore\\";");

code = code.replace("const { deleteDoc } = require('firebase/firestore');", "");

fs.writeFileSync('App.tsx', code);
