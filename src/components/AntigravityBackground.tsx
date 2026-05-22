import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const DEFAULT_EMOJIS = ['🍳', '🔪', '🔥', '⏲️', '🥫', '🥖', '🥗', '🍩', '🍕', '🍰', '🧁', '🍦', '🍜', '🍣'];

export function AntigravityBackground({ 
  count = 15, 
  emojis = DEFAULT_EMOJIS,
  zIndex = 0,
  opacityRange = [0.1, 0.3]
}: { 
  count?: number; 
  emojis?: string[];
  zIndex?: number;
  opacityRange?: [number, number];
}) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: Math.random() * (40 - 20) + 20,
      duration: Math.random() * (20 - 10) + 10,
      delay: Math.random() * -20,
      opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
    }));
  }, [count, emojis, opacityRange]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: `${p.y}vh`,
            opacity: 0 
          }}
          animate={{
            y: [`${p.y}vh`, `${p.y - 15}vh`, `${p.y}vh`],
            x: [`${p.x}vw`, `${p.x + 5}vw`, `${p.x}vw`],
            rotate: [0, 360],
            opacity: p.opacity
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            fontSize: p.size,
            filter: 'blur(1px)',
            userSelect: 'none',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent mix-blend-overlay" />
    </div>
  );
}
