import React from 'react';
import { Disc3, Sparkles, ArrowRight, Play, Radio, Volume2 } from 'lucide-react';
import { VinylRecord } from '../Turntable/VinylRecord';

/**
 * Striking Avant-Garde Landing & Welcome Portal.
 * Pure high-fidelity music experience without Spotify login hurdles.
 */
export const AvantGardeLogin = ({ onEnter }) => {
  return (
    <div className="relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col items-center justify-between p-3.5 xs:p-4 sm:p-8 md:p-12 pt-safe pb-safe overflow-hidden select-none">
      {/* Dynamic Cosmic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] xs:w-[350px] sm:w-[550px] h-[280px] xs:h-[350px] sm:h-[550px] bg-gradient-to-tr from-neonCyan/20 via-spotifyGreen/15 to-neonViolet/20 rounded-full filter blur-[60px] sm:blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-20 -left-20 w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] bg-neonViolet/15 rounded-full filter blur-[60px] sm:blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2 xs:space-x-2.5">
          <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-xl xs:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
            <Disc3 className="w-4 h-4 xs:w-5 xs:h-5 text-spotifyGreen animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base xs:text-lg sm:text-xl font-bold font-display tracking-widest text-white">
              A U R A
            </h1>
            <p className="text-[8px] xs:text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              Spatial Vinyl Player
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] xs:text-[10px] sm:text-xs font-mono text-slate-400">
          <Radio className="w-2.5 xs:w-3 h-2.5 xs:h-3 text-neonCyan animate-pulse" />
          <span className="tracking-wider">320KBPS HI-FI ENGINE</span>
        </div>
      </header>

      {/* Centerpiece Showcase */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-2 xs:py-3 sm:py-6 max-w-3xl w-full">
        {/* Floating Vinyl Platter Hero */}
        <div className="mb-4 xs:mb-5 sm:mb-8 relative group shrink-0">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-neonCyan/30 via-spotifyGreen/20 to-neonViolet/30 filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
          <VinylRecord
            isPlaying={true}
            rpm={33}
            albumArt="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
            trackName="AURA SPATIAL"
            className="w-52 h-52 xs:w-60 xs:h-60 sm:w-72 sm:h-72 md:w-80 md:h-80"
          />
        </div>

        {/* Avant-Garde Title & Pitch */}
        <div className="space-y-1.5 xs:space-y-2.5 sm:space-y-4 px-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] xs:text-xs font-medium text-slate-300">
            <Sparkles className="w-3 h-3 text-neonAmber" />
            <span>Interactive Spatial Vinyl & Nebula</span>
          </div>

          <h2 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
            Sound Reimagined as a <br className="hidden xs:inline" />
            <span className="bg-gradient-to-r from-neonCyan via-teal-300 to-spotifyGreen bg-clip-text text-transparent">
              Spatial Cosmic Orbit
            </span>
          </h2>

          <p className="text-[11px] xs:text-xs sm:text-sm md:text-base text-slate-400 max-w-xs xs:max-w-md sm:max-w-xl mx-auto leading-relaxed">
            Direct-drive analog vinyl physics, ambient real-time harmonic nebulae, and full-length 320kbps CD Quality soundscapes.
          </p>
        </div>

        {/* Single Primary Action Button: Start Listening */}
        <div className="mt-4 xs:mt-5 sm:mt-8 flex flex-col items-center justify-center w-full max-w-[280px] xs:max-w-xs sm:max-w-sm px-2">
          <button
            onClick={onEnter}
            className="w-full py-2.5 xs:py-3.5 sm:py-4 px-5 xs:px-7 sm:px-8 rounded-2xl bg-gradient-to-r from-neonCyan via-teal-400 to-spotifyGreen text-slate-950 font-bold text-xs xs:text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:shadow-[0_0_45px_rgba(0,242,254,0.6)] active:scale-95 transition-all flex items-center justify-center space-x-2 xs:space-x-2.5 cursor-pointer group"
          >
            <Play className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5 fill-current group-hover:scale-110 transition-transform" />
            <span>Start Listening</span>
            <ArrowRight className="w-3.5 xs:w-4 h-3.5 xs:h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Creator Signature Highlight */}
          <div className="mt-3 xs:mt-3.5 sm:mt-4 inline-flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-3.5 sm:px-4 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-neonCyan/30 shadow-[0_0_20px_rgba(0,242,254,0.12)] backdrop-blur-xl transition-all duration-300">
            <Sparkles className="w-3 xs:w-3.5 h-3 xs:h-3.5 text-neonCyan animate-pulse flex-shrink-0" />
            <span className="text-[10px] xs:text-[11px] sm:text-xs font-mono tracking-wider text-slate-400 uppercase">
              Designed & Built by
            </span>
            <span className="text-xs xs:text-sm sm:text-sm font-black font-display tracking-widest bg-gradient-to-r from-neonCyan via-teal-300 to-spotifyGreen bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,242,254,0.45)]">
              OM RAJPUT
            </span>
          </div>
        </div>
      </main>

      {/* Footer Details */}
      <footer className="w-full max-w-4xl text-center text-slate-500 text-[9px] xs:text-[10px] sm:text-xs font-mono z-10 pt-2 pb-1 sm:pt-4 border-t border-white/5 flex flex-col xs:flex-row items-center justify-between gap-1 xs:gap-2 shrink-0">
        <div className="flex items-center space-x-1.5 xs:space-x-2">
          <Volume2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-spotifyGreen" />
          <span>Full-Length 320kbps Audio • Spatial Vinyl</span>
        </div>
        <span>Ready to Spin • Zero Subscription</span>
      </footer>
    </div>
  );
};
