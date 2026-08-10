const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetStr = `  // News Items Data
  const NEWS_ITEMS = [
    {
      id: 'announcement_v1',
      title: 'SYSTEM_MAINTENANCE_UPDATE',
      content: 'Keeping Kitchen OS online consumes massive computational heat. Advertising protocols will be integrated to prevent total system shutdown.',
      date: '2026-04-22',
      badge: 'URGENT',
      icon: '⚠️'
    },
    {
      id: 'sounds_v1',
      title: 'AUDIO_ENGINE_INITIALIZED',
      content: 'High-fidelity 8-bit sound engine is now operational. Experience the crunch of every ingredient.',
      date: '2026-04-23',
      badge: 'UPDATE',
      icon: '🔊'
    }
  ];`;

const newStr = `  // News Items Data
  const [newsItems, setNewsItems] = useState<any[]>([]);
  useEffect(() => {
    const newsRef = collection(db, "system_news");
    const q = query(newsRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewsItems(items);
    }, (error) => {
      console.error("Error fetching news:", error);
    });
    return () => unsubscribe();
  }, []);`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('App.tsx', code);
