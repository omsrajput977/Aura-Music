import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { usePlayer } from './context/PlayerContext';
import { AmbientNebula } from './components/Visualizer/AmbientNebula';
import { TurntableDeck } from './components/Turntable/TurntableDeck';
import { SpatialHUD } from './components/Controls/SpatialHUD';
import { OrbitLibrary } from './components/Navigation/OrbitLibrary';
import { SearchModal } from './components/Navigation/SearchModal';
import { QueueModal } from './components/Navigation/QueueModal';
import { PlaylistsModal } from './components/Navigation/PlaylistsModal';
import { AddToPlaylistModal } from './components/Navigation/AddToPlaylistModal';
import { AvantGardeLogin } from './components/Auth/AvantGardeLogin';
import { Disc3, Search, Compass, LogOut, Radio, ListMusic, FolderHeart } from 'lucide-react';
import confetti from 'canvas-confetti';

export function MainPlayerApp() {
  const { exitExperience } = useAuth();
  const {
    isPlaying,
    currentTrack,
    progressMs,
    durationMs,
    volume,
    rpm,
    topTracks,
    activeQueue,
    activeQueueIndex,
    isShuffle,
    repeatMode,
    setRpm,
    togglePlay,
    playTrackItem,
    handleNext,
    handlePrevious,
    jumpToQueueIndex,
    removeFromQueue,
    clearQueue,
    seekTo,
    changeVolume,
    toggleShuffle,
    toggleRepeat,
    loadLocalAudio
  } = usePlayer();

  const [isOrbitOpen, setIsOrbitOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);

  const triggerCosmicDust = () => {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#00f2fe', '#1ed760', '#9b51e0']
    });
  };

  const handleTrackChangeAndCelebrate = (track, queue = null, index = null) => {
    playTrackItem(track, null, queue, index);
    triggerCosmicDust();
  };

  const handleOpenAddToPlaylist = (track) => {
    setSelectedTrackForPlaylist(track || currentTrack);
    setIsAddToPlaylistOpen(true);
  };

  const handlePlayPlaylist = (playlist, startIndex = 0) => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return;
    const cleanTracks = playlist.tracks;
    const startIdx = Math.max(0, Math.min(startIndex, cleanTracks.length - 1));
    // Isolate active queue exclusively to this custom playlist!
    playTrackItem(cleanTracks[startIdx], null, cleanTracks, startIdx);
    triggerCosmicDust();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
      {/* Dynamic Ambient Background Canvas */}
      <AmbientNebula
        albumArt={currentTrack?.albumArt}
        isPlaying={isPlaying}
      />

      {/* Floating Top Navigation Bar */}
      <header className="fixed top-2.5 xs:top-4 sm:top-5 inset-x-0 mx-auto w-[95%] sm:w-11/12 max-w-6xl z-40">
        <div className="glass-pill px-2.5 py-2 xs:px-3.5 xs:py-2.5 sm:px-5 sm:py-3 rounded-2xl flex items-center justify-between shadow-xl">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2 xs:space-x-2.5 sm:space-x-3 cursor-pointer" onClick={() => setIsOrbitOpen(prev => !prev)}>
            <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-xl bg-gradient-to-tr from-neonCyan to-spotifyGreen flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.4)]">
              <Disc3 className="w-4 h-4 xs:w-5 xs:h-5 text-slate-950 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs xs:text-sm font-bold font-display tracking-widest text-white">
                A U R A
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-neonCyan tracking-wider uppercase">
                SPATIAL VINYL
              </span>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-1 xs:space-x-1.5 px-2 py-1.5 xs:px-2.5 xs:py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-slate-300 transition-all cursor-pointer"
              title="Search Music"
            >
              <Search className="w-3.5 h-3.5 text-neonCyan" />
              <span className="hidden md:inline">Search Music</span>
            </button>

            <button
              onClick={() => setIsOrbitOpen(true)}
              className="flex items-center space-x-1 xs:space-x-1.5 px-2 py-1.5 xs:px-2.5 xs:py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-slate-300 transition-all cursor-pointer"
              title="Constellation Library"
            >
              <Compass className="w-3.5 h-3.5 text-neonAmber" />
              <span className="hidden md:inline">Constellation</span>
            </button>

            <button
              onClick={() => setIsQueueOpen(true)}
              className="flex items-center space-x-1 xs:space-x-1.5 px-2 py-1.5 xs:px-2.5 xs:py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-slate-300 transition-all cursor-pointer"
              title="Queue"
            >
              <ListMusic className="w-3.5 h-3.5 text-spotifyGreen" />
              <span className="hidden md:inline">Queue</span>
              {activeQueue.length > 0 && (
                <span className="text-[9px] xs:text-[10px] font-mono text-slate-400">
                  ({activeQueueIndex + 1}/{activeQueue.length})
                </span>
              )}
            </button>

            {/* Custom Playlists Hub Header Pill */}
            <button
              onClick={() => setIsPlaylistsOpen(true)}
              className="flex items-center space-x-1 xs:space-x-1.5 px-2 py-1.5 xs:px-2.5 xs:py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neonCyan/40 text-xs text-slate-300 hover:text-neonCyan transition-all cursor-pointer"
              title="Custom Playlists (Unlimited Songs)"
            >
              <FolderHeart className="w-3.5 h-3.5 text-neonCyan" />
              <span className="hidden md:inline">Playlists</span>
            </button>

            {/* Audio Stream Engine Quality Indicator (Desktop & Tablet) */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-spotifyGreen/10 border border-spotifyGreen/30 text-spotifyGreen text-[11px] font-mono">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>320K HI-FI</span>
            </div>

            {/* Return to Portal Button */}
            <button
              onClick={exitExperience}
              className="p-1.5 xs:p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Return to Welcome Screen"
            >
              <LogOut className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Centerpiece Turntable Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 pb-28 sm:pb-32 px-2 sm:px-4 w-full">
        <TurntableDeck
          isPlaying={isPlaying}
          currentTrack={currentTrack}
          rpm={rpm}
          onToggleRpm={setRpm}
          onTogglePlay={togglePlay}
          onDropFile={loadLocalAudio}
          onAddToPlaylist={handleOpenAddToPlaylist}
        />
      </main>

      {/* Floating Spatial HUD Capsule with Full Transport Controls */}
      <SpatialHUD
        isPlaying={isPlaying}
        progressMs={progressMs}
        durationMs={durationMs}
        volume={volume}
        onTogglePlay={togglePlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={seekTo}
        onChangeVolume={changeVolume}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleOrbit={() => setIsOrbitOpen(prev => !prev)}
        showOrbit={isOrbitOpen}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onOpenQueue={() => setIsQueueOpen(true)}
        activeQueue={activeQueue}
        activeQueueIndex={activeQueueIndex}
      />

      {/* Constellation Orbit Library Overlay */}
      <OrbitLibrary
        isOpen={isOrbitOpen}
        onClose={() => setIsOrbitOpen(false)}
        topTracks={topTracks}
        onSelectTrack={handleTrackChangeAndCelebrate}
        currentTrackId={currentTrack?.id}
        onAddToPlaylist={handleOpenAddToPlaylist}
        onOpenPlaylists={() => setIsPlaylistsOpen(true)}
      />

      {/* High-Speed Full-Length Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTrack={handleTrackChangeAndCelebrate}
        onAddToPlaylist={handleOpenAddToPlaylist}
      />

      {/* Playback Queue Modal */}
      <QueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentTrack={currentTrack}
        activeQueue={activeQueue}
        activeQueueIndex={activeQueueIndex}
        isPlaying={isPlaying}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onJumpToIndex={jumpToQueueIndex}
        onRemoveFromQueue={removeFromQueue}
        onClearQueue={clearQueue}
        onAddToPlaylist={handleOpenAddToPlaylist}
      />

      {/* Custom Playlists Hub Modal */}
      <PlaylistsModal
        isOpen={isPlaylistsOpen}
        onClose={() => setIsPlaylistsOpen(false)}
        onPlayPlaylist={handlePlayPlaylist}
        currentTrackId={currentTrack?.id}
        isPlaying={isPlaying}
      />

      {/* Universal Add-to-Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        track={selectedTrackForPlaylist}
      />
    </div>
  );
}

export default function App() {
  const { hasEntered, enterExperience } = useAuth();

  if (!hasEntered) {
    return <AvantGardeLogin onEnter={enterExperience} />;
  }

  return <MainPlayerApp />;
}
