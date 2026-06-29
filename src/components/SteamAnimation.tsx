import React from 'react';

export default function SteamAnimation() {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 flex gap-3 mb-1 pointer-events-none">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-1 h-8 rounded-full bg-white/30 steam-${i}`}
          style={{ filter: 'blur(2px)' }}
        />
      ))}
    </div>
  );
}
