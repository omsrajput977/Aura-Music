import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio, Compass, Search, ListMusic, Shuffle, Repeat, Repeat1, X } from 'lucide-react';
import { ScrubBar } from './ScrubBar';

/**
 * Avant-Garde Spatial HUD Capsule.
 * A floating, glassmorphic control capsule replacing the traditional bottom player bar.
 * Features full Spotify-style transport controls: Shuffle, Previous, Play/Pause, Next, Repeat, and Queue.
 */
export const SpatialHUD = ({
  isPlaying,
  progressMs,
  durationMs,
  volume,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onChangeVolume,
  onOpenSearch,
  onToggleOrbit,
  showOrbit,
  isShuffle,
  repeatMode = 'all',
  onToggleShuffle,
  onToggleRepeat,
  onOpenQueue,
  activeQueue = [],
  activeQueueIndex = 0
}) => {
  const [showMobileVolume, setShowMobileVolume] = useState(false);

  return (
    <div className="fixed bottom-3 sm:bottom-6 inset-x-0 mx-auto w-[95%] sm:w-11/12 max-w-3xl z-40">
      <div className="glass-pill px-3 py-2.5 xs:px-4 xs:py-3 sm:px-5 sm:py-4 rounded-2xl sm:rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col space-y-2 xs:space-y-2.5 sm:space-y-3">
        {/* Top: Holographic Scrub Track */}
        <ScrubBar
          progressMs={progressMs}
          durationMs={durationMs}
          onSeek={onSeek}
        />

        {/* Bottom Row: Controls, Actions, and Volume */}
        <div className="flex items-center justify-between gap-1 xs:gap-2">
          {/* Left Action Buttons: Queue badge on mobile; Orbit & Search on desktop */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2">
            <button
              onClick={onToggleOrbit}
              className={`hidden sm:flex p-1.5 xs:p-2 rounded-full border transition-all cursor-pointer ${
                showOrbit
                  ? 'bg-neonCyan/20 text-neonCyan border-neonCyan/50 shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title="Toggle Constellation Orbit"
            >
              <Compass className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </button>

            <button
              onClick={onOpenSearch}
              className="hidden sm:flex p-1.5 xs:p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Search Music Catalog"
            >
              <Search className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </button>

            <button
              onClick={onOpenQueue}
              className="flex items-center space-x-1 xs:space-x-1.5 px-2 xs:px-2.5 py-1 xs:py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-neonCyan/40 transition-all cursor-pointer"
              title="View & Edit Queue"
            >
              <ListMusic className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-neonCyan" />
              {activeQueue.length > 0 && (
                <span className="text-[10px] xs:text-xs font-mono text-slate-300 font-semibold">
                  {activeQueueIndex + 1}/{activeQueue.length}
                </span>
              )}
            </button>

            {/* Audio Engine Status (Desktop only) */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/5 text-[10px] font-mono text-slate-400">
              <Radio className="w-3 h-3 text-neonCyan animate-pulse" />
              <span>320K FULL AUDIO</span>
            </div>
          </div>

          {/* Center: Spotify-Style Playback Controls with Shuffle & Repeat */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3">
            {/* Shuffle Button */}
            <button
              onClick={onToggleShuffle}
              className={`p-2 xs:p-2.5 rounded-full border transition-all cursor-pointer ${
                isShuffle
                  ? 'bg-neonCyan/20 text-neonCyan border-neonCyan/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
              title={isShuffle ? 'Shuffle Active' : 'Shuffle Off'}
            >
              <Shuffle className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </button>

            {/* Previous Track Button */}
            <button
              onClick={onPrevious}
              className="p-2 xs:p-2.5 sm:p-3 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 xs:w-5 xs:h-5 fill-current" />
            </button>

            {/* Play / Pause Master Centerpiece */}
            <button
              onClick={onTogglePlay}
              className="relative p-3 xs:p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-neonCyan via-teal-400 to-spotifyGreen text-slate-950 shadow-[0_0_20px_rgba(0,242,254,0.5)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={onNext}
              className="p-2 xs:p-2.5 sm:p-3 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 xs:w-5 xs:h-5 fill-current" />
            </button>

            {/* Repeat Button */}
            <button
              onClick={onToggleRepeat}
              className={`p-2 xs:p-2.5 rounded-full border transition-all cursor-pointer ${
                repeatMode === 'one'
                  ? 'bg-neonAmber/20 text-neonAmber border-neonAmber/40 shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                  : repeatMode === 'all'
                  ? 'bg-spotifyGreen/20 text-spotifyGreen border-spotifyGreen/40 shadow-[0_0_10px_rgba(30,215,96,0.3)]'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> : <Repeat className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
            </button>
          </div>

          {/* Right: Tactile Volume Dial */}
          <div className="relative flex items-center">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 640) {
                  setShowMobileVolume(prev => !prev);
                } else {
                  onChangeVolume(volume === 0 ? 80 : 0);
                }
              }}
              className="p-1.5 xs:p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={volume === 0 ? 'Unmute' : 'Volume'}
            >
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
            </button>

            {/* Desktop / Tablet Volume Slider */}
            <div className="hidden sm:flex items-center ml-1 w-16 sm:w-20 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onChangeVolume(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-neonCyan"
              />
            </div>

            {/* Mobile Volume Popover Drawer */}
            {showMobileVolume && (
              <div className="sm:hidden absolute bottom-12 right-0 p-3 rounded-2xl glass-panel border border-white/20 shadow-2xl flex items-center space-x-2.5 z-50 animate-fade-in w-44">
                <button
                  onClick={() => onChangeVolume(volume === 0 ? 80 : 0)}
                  className="text-slate-400 hover:text-white"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onChangeVolume(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-neonCyan"
                />
                <button
                  onClick={() => setShowMobileVolume(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
