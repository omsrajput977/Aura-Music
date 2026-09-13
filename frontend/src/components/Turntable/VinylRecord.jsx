import React from 'react';

/**
 * High-fidelity, interactive vinyl record with realistic grooves,
 * center album art label, and dynamic RPM spinning animations.
 */
export const VinylRecord = ({ isPlaying, albumArt, trackName, rpm = 33, onClick, className = '' }) => {
  const spinSpeedClass = rpm === 45 ? 'animate-spin-45' : 'animate-spin-33';

  return (
    <div 
      onClick={onClick}
      className={`relative rounded-full cursor-pointer group select-none transition-transform duration-500 hover:scale-[1.02] ${
        className || 'w-56 h-56 xs:w-64 xs:h-64 sm:w-80 sm:h-80 md:w-96 md:h-96'
      }`}
    >
      {/* Vinyl Outer Rim & Concentric Grooves */}
      <div 
        className={`w-full h-full rounded-full vinyl-disc relative flex items-center justify-center transition-all duration-700 ${
          isPlaying ? spinSpeedClass : ''
        }`}
        style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
      >
        {/* Holographic Light Sheen (Conic Gradient) */}
        <div className="absolute inset-0 rounded-full vinyl-sheen pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Outer Run-in Groove */}
        <div className="absolute inset-2 xs:inset-3 sm:inset-4 rounded-full border border-white/5 pointer-events-none" />
        
        {/* Middle Transition Groove */}
        <div className="absolute inset-8 xs:inset-10 sm:inset-16 rounded-full border border-white/5 pointer-events-none" />

        {/* Center Label Rim */}
        <div className="relative w-24 h-24 xs:w-28 xs:h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-amber-500/30 via-slate-900 to-cyan-500/30 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Album Artwork Center Label */}
          {albumArt ? (
            <img
              src={albumArt}
              alt={trackName || 'Album Art'}
              className="w-full h-full object-cover rounded-full filter contrast-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-950 to-purple-950 rounded-full flex flex-col items-center justify-center p-1.5 xs:p-2 text-center">
              <div className="w-6 h-6 xs:w-8 xs:h-8 rounded-full border border-neonCyan/40 flex items-center justify-center mb-0.5 xs:mb-1">
                <span className="text-[8px] xs:text-[10px] tracking-widest text-neonCyan font-mono">AURA</span>
              </div>
              <span className="text-[8px] xs:text-[10px] text-slate-300 line-clamp-1 font-medium">{trackName || 'VINYL'}</span>
            </div>
          )}

          {/* Center Label Inner Ring */}
          <div className="absolute inset-2 xs:inset-3 sm:inset-4 rounded-full border border-black/30 pointer-events-none" />

          {/* Center Spindle Hole */}
          <div className="absolute w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-void border-2 border-slate-600/70 shadow-inner flex items-center justify-center z-10">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
