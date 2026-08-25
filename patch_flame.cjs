const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const flameComp = `
function StreakFlame({ streak, size = 20, className = "" }: { streak: number, size?: number, className?: string }) {
  if (!streak || streak <= 0) return null;
  return (
    <div className={\`relative flex items-center justify-center \${className}\`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 text-[#ff4444] flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 68, 68, 0.8))' }}>
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
          <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 12.81 5.04 13.56 3.11C13.62 2.95 13.65 2.77 13.59 2.62C13.52 2.47 13.38 2.37 13.23 2.34C13.06 2.31 12.89 2.35 12.76 2.44C10.15 4.3 8.87 7.42 9.4 10.5C9.44 10.74 9.35 10.99 9.17 11.14C8.98 11.29 8.71 11.33 8.49 11.21C7.8 10.82 7.21 10.23 6.78 9.54C6.67 9.37 6.47 9.27 6.27 9.29C6.07 9.31 5.9 9.44 5.81 9.61C4.44 12.18 4.7 15.34 6.44 17.66C7.62 19.24 9.51 20.31 11.58 20.57C11.96 20.62 12.35 20.65 12.75 20.65C15.04 20.65 17.2 19.64 18.66 17.91C20.25 16.03 20.61 13.4 19.62 11.13C19.52 10.92 19.33 10.79 19.1 10.79C18.88 10.79 18.67 10.92 18.57 11.12C18.33 11.55 18.02 11.94 17.66 11.2Z" />
        </svg>
      </div>
      <span className="absolute z-10 font-black text-white" style={{ fontSize: size * 0.45, marginTop: size * 0.15 }}>{streak > 99 ? '99+' : streak}</span>
    </div>
  );
}

// ============================================================================
// App Component
`;

code = code.replace("// ============================================================================\n// App Component\n", flameComp);
fs.writeFileSync('App.tsx', code);
console.log("Added StreakFlame component");
