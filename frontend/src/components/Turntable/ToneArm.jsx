import React from 'react';

/**
 * Animated Turntable Tonearm.
 * Smoothly pivots onto the record groove when music plays, and returns to rest when paused.
 * Geometrically proportioned for both mobile phones and desktop displays.
 */
export const ToneArm = ({ isPlaying }) => {
  return (
    <div className="absolute top-0 right-1 xs:top-0 xs:right-2 sm:top-2 sm:right-5 md:top-3 md:right-7 z-20 pointer-events-none select-none">
      {/* Pivot Base Assembly */}
      <div className="relative w-9 h-9 xs:w-10 xs:h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border border-white/25 shadow-2xl flex items-center justify-center">
        {/* Metallic Gimbals / Bearing Housing */}
        <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-slate-950 via-slate-800 to-slate-700 border border-slate-500/40 flex items-center justify-center shadow-inner">
          {/* Jewel Bearing Core */}
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
        </div>

        {/* Counterweight Stub (stays compact within pivot area, never overshoots) */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 xs:w-5 sm:w-6 h-2 xs:h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900 border border-white/20 shadow-sm" />

        {/* Rotating Arm Assembly */}
        <div
          className="absolute top-4 left-4 xs:top-4.5 xs:left-4.5 sm:top-6 sm:left-6 origin-top-left transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: isPlaying ? 'rotate(25deg)' : 'rotate(-2deg)'
          }}
        >
          {/* Main Tonearm Shaft (Brushed Aluminum) */}
          <div className="w-1.5 xs:w-1.5 sm:w-2 h-28 xs:h-32 sm:h-44 md:h-52 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-full shadow-lg relative -left-0.5">
            {/* Cueing Lever Notch */}
            <div className="absolute top-6 xs:top-8 sm:top-12 -left-2 w-2.5 xs:w-3 sm:w-4 h-1 bg-amber-500/80 rounded" />

            {/* Headshell & Cartridge (Needle) */}
            <div className="absolute -bottom-5 -left-1.5 xs:-bottom-6 xs:-left-2 sm:-bottom-7 sm:-left-2.5 w-4.5 xs:w-5 sm:w-6 h-7 xs:h-8 sm:h-10 bg-gradient-to-b from-slate-800 via-slate-900 to-black rounded-b-md border border-white/20 shadow-xl flex flex-col items-center justify-end pb-1 transform rotate-6">
              {/* Cartridge Accent */}
              <div className="w-2 xs:w-2.5 h-1 bg-neonCyan shadow-[0_0_6px_#00f2fe] rounded-full mb-0.5" />
              {/* Stylus Tip */}
              <div className="w-1 h-1 bg-amber-300 rounded-full shadow-[0_0_4px_#fcd34d]" />
            </div>
          </div>
        </div>
      </div>

      {/* Tonearm Rest / Cradle */}
      <div className="absolute top-16 xs:top-20 sm:top-28 right-1 xs:right-2 sm:right-3 w-2 xs:w-2.5 h-4 xs:h-5 bg-slate-800/90 rounded-t border border-white/15 shadow flex items-center justify-center">
        <div className="w-1 h-1.5 bg-slate-500 rounded-full" />
      </div>
    </div>
  );
};
