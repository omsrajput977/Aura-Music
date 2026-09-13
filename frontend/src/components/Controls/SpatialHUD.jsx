import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Radio, 
  Compass, 
  Search, 
  ListMusic, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart,
  Disc3,
  LayoutGrid,
  PanelRightClose,
  PanelRightOpen,
  X 
} from 'lucide-react';
import { ScrubBar } from './ScrubBar';
import { usePlayer } from '../../context/PlayerContext';

/**
 * Spotify-Grade Avant-Garde Spatial HUD Capsule.
 * Floating, glassmorphic control capsule replacing the traditional bottom player bar.
 * Includes Track info with Heart button, Transport controls, View mode toggle, Queue counter, and Artist drawer toggle.
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
  onOpenQueue
}) => {
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const {
    currentTrack,
    likedSongs,
    toggleLike,
    isLiked,
    userQueue,
    activeQueue,
    activeQueueIndex,
    viewMode,
    toggleViewMode,
    isRightPanelOpen,
    toggleRightPanel
  } = usePlayer();

  const isCurrentLiked = currentTrack ? isLiked(currentTrack.id || currentTrack.name) : false;
  const totalUpcoming = userQueue.length + Math.max(0, activeQueue.length - activeQueueIndex - 1);

  return (
    <div className="fixed bottom-2.5 xs:bottom-3 sm:bottom-5 inset-x-0 mx-auto w-[96%] sm:w-11/12 max-w-5xl z-40">
      <div className="glass-pill px-3 py-2 xs:px-4 xs:py-2.5 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col space-y-1.5 xs:space-y-2 sm:space-y-2.5">
        {/* Top: Holographic Scrub Track */}
        <ScrubBar
          progressMs={progressMs}
          durationMs={durationMs}
          onSeek={onSeek}
        />

        {/* Bottom Row: Left Track Info, Center Transport Controls, Right Actions & Volume */}
        <div className="flex items-center justify-between gap-1 xs:gap-2">
          {/* Left: Current Track Thumbnail, Title, Artist & Heart */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 max-w-[30%] sm:max-w-[28%] md:max-w-[30%]">
            {currentTrack && (
              <>
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 group cursor-pointer"
                  onClick={toggleRightPanel}
                  title="Toggle Now Playing Panel"
                >
                  <img
                    src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                    alt={currentTrack.name}
                    className="w-full h-full object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Disc3 className="w-4 h-4 text-neonCyan animate-spin-slow" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 hidden xs:block">
                  <span className="text-xs sm:text-sm font-bold text-white truncate block hover:underline cursor-pointer"
                    onClick={toggleRightPanel}
                  >
                    {currentTrack.name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 truncate block">
                    {currentTrack.artists}
                  </span>
                </div>

                {/* Heart Button */}
                <button
                  onClick={() => toggleLike(currentTrack)}
                  className={`p-1 sm:p-1.5 rounded-full transition-all cursor-pointer flex-shrink-0 ${
                    isCurrentLiked
                      ? 'text-spotifyGreen scale-110'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={isCurrentLiked ? 'Remove from Liked' : 'Save to Liked'}
                >
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCurrentLiked ? 'fill-current text-spotifyGreen' : ''}`} />
                </button>
              </>
            )}
          </div>

          {/* Center: Spotify-Style Playback Transport Controls */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2.5">
            {/* Shuffle Button */}
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer ${
                isShuffle
                  ? 'bg-neonCyan/20 text-neonCyan border-neonCyan/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
              title={isShuffle ? 'Shuffle Active' : 'Shuffle Off'}
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Previous Track Button */}
            <button
              onClick={onPrevious}
              className="p-1.5 sm:p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            {/* Play / Pause Master Centerpiece */}
            <button
              onClick={onTogglePlay}
              className="relative p-2.5 xs:p-3 sm:p-3.5 rounded-full bg-gradient-to-tr from-neonCyan via-teal-400 to-spotifyGreen text-slate-950 shadow-[0_0_20px_rgba(0,242,254,0.5)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={onNext}
              className="p-1.5 sm:p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            {/* Repeat Button */}
            <button
              onClick={onToggleRepeat}
              className={`p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer ${
                repeatMode === 'one'
                  ? 'bg-neonAmber/20 text-neonAmber border-neonAmber/40 shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                  : repeatMode === 'all'
                  ? 'bg-spotifyGreen/20 text-spotifyGreen border-spotifyGreen/40 shadow-[0_0_10px_rgba(30,215,96,0.3)]'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>

          {/* Right: View Switcher, Queue, Now Playing Drawer & Volume */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2">
            {/* View Mode Toggle Button: Browse vs Turntable */}
            <button
              onClick={toggleViewMode}
              className={`flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full border transition-all cursor-pointer ${
                viewMode === 'turntable'
                  ? 'bg-neonCyan/20 text-neonCyan border-neonCyan/50 shadow-[0_0_10px_rgba(0,242,254,0.3)] font-semibold'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title={viewMode === 'browse' ? 'Switch to 3D Vinyl Turntable' : 'Switch to Spotify Browse Feed'}
            >
              {viewMode === 'browse' ? (
                <>
                  <Disc3 className="w-3.5 h-3.5 text-neonCyan animate-spin-slow" />
                  <span className="hidden md:inline text-[11px]">Turntable</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-spotifyGreen" />
                  <span className="hidden md:inline text-[11px]">Browse</span>
                </>
              )}
            </button>

            {/* Queue Button with Counter */}
            <button
              onClick={onOpenQueue}
              className="flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-spotifyGreen/40 transition-all cursor-pointer"
              title="View Queue (Now Playing, Next in Queue, Upcoming)"
            >
              <ListMusic className="w-3.5 h-3.5 text-spotifyGreen" />
              {totalUpcoming > 0 && (
                <span className="text-[10px] sm:text-xs font-mono text-slate-300 font-semibold">
                  {userQueue.length > 0 ? `+${userQueue.length}` : totalUpcoming}
                </span>
              )}
            </button>

            {/* Right Drawer Toggle Button (Now Playing / About Artist) */}
            <button
              onClick={toggleRightPanel}
              className={`hidden lg:flex p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer ${
                isRightPanelOpen
                  ? 'bg-spotifyGreen/20 text-spotifyGreen border-spotifyGreen/40 shadow-[0_0_10px_rgba(30,215,96,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
              }`}
              title={isRightPanelOpen ? 'Hide Now Playing Panel' : 'Show Now Playing Panel'}
            >
              {isRightPanelOpen ? (
                <PanelRightClose className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            {/* Volume Control */}
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 640) {
                    setShowMobileVolume(prev => !prev);
                  } else {
                    onChangeVolume(volume === 0 ? 80 : 0);
                  }
                }}
                className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={volume === 0 ? 'Unmute' : 'Volume'}
              >
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>

              {/* Desktop / Tablet Volume Slider */}
              <div className="hidden sm:flex items-center ml-1 w-14 sm:w-20 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onChangeVolume(Number(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-spotifyGreen"
                />
              </div>

              {/* Mobile Volume Popover */}
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
                    className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-spotifyGreen"
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
    </div>
  );
};
