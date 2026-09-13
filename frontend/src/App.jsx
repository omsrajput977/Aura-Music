import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { usePlayer } from './context/PlayerContext';
import { AmbientNebula } from './components/Visualizer/AmbientNebula';
import { TurntableDeck } from './components/Turntable/TurntableDeck';
import { SpatialHUD } from './components/Controls/SpatialHUD';
import { SpotifyBrowseView } from './components/Spotify/SpotifyBrowseView';
import { SpotifyNowPlayingPanel } from './components/Spotify/SpotifyNowPlayingPanel';
import { OrbitLibrary } from './components/Navigation/OrbitLibrary';
import { SearchModal } from './components/Navigation/SearchModal';
import { QueueModal } from './components/Navigation/QueueModal';
import { PlaylistsModal } from './components/Navigation/PlaylistsModal';
import { AddToPlaylistModal } from './components/Navigation/AddToPlaylistModal';
import { AvantGardeLogin } from './components/Auth/AvantGardeLogin';
import { AuthModal } from './components/Auth/AuthModal';
import { LogoutWarningModal } from './components/Navigation/LogoutWarningModal';
import { 
  Disc3, 
  Search, 
  Compass, 
  LogOut, 
  Radio, 
  ListMusic, 
  FolderHeart, 
  Heart,
  LayoutGrid,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function MainPlayerApp() {
  const { exitExperience, logout, user } = useAuth();
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
    userQueue,
    likedSongs,
    viewMode,
    toggleViewMode,
    isRightPanelOpen,
    toggleRightPanel,
    toastMessage,
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
  const [isLogoutWarningOpen, setIsLogoutWarningOpen] = useState(false);
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
    playTrackItem(cleanTracks[startIdx], null, cleanTracks, startIdx, 0, playlist.name);
    triggerCosmicDust();
  };

  // Clicking the AURA Logo: Pause playback and redirect to home page
  const handleLogoClick = () => {
    if (isPlaying) {
      togglePlay();
    }
    exitExperience();
  };

  // Confirming Logout from warning modal
  const handleConfirmLogout = async () => {
    if (isPlaying) {
      togglePlay();
    }
    setIsLogoutWarningOpen(false);
    await logout();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
      {/* Dynamic Ambient Background Canvas */}
      <AmbientNebula
        albumArt={currentTrack?.albumArt}
        isPlaying={isPlaying}
      />

      {/* Floating Top Navigation Bar */}
      <header className="fixed top-2.5 xs:top-3 sm:top-4 inset-x-0 mx-auto w-[96%] sm:w-11/12 max-w-7xl z-40">
        <div className="glass-pill px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center justify-between shadow-xl gap-2">
          {/* Brand Logo - Pauses music and redirects to home */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group flex-shrink-0"
            onClick={handleLogoClick}
            title="Pause music and return to Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-neonCyan to-spotifyGreen flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.4)] group-hover:scale-105 transition-transform">
              <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold font-display tracking-widest text-white group-hover:text-neonCyan transition-colors">
                A U R A
              </span>
            </div>
          </div>

          {/* Spotify-Style Central Search Input: "What do you want to play?" */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 max-w-xs sm:max-w-md mx-1.5 sm:mx-3 flex items-center space-x-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shadow-inner group"
            title="Click to search songs, artists, and albums"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-neonCyan transition-colors flex-shrink-0" />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate">
              What do you want to play?
            </span>
          </div>

          {/* Right Action Pills */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* View Mode Toggle Pill (Browse vs Turntable) */}
            <button
              onClick={toggleViewMode}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                viewMode === 'browse'
                  ? 'bg-spotifyGreen/20 text-spotifyGreen border-spotifyGreen/40 shadow-[0_0_10px_rgba(30,215,96,0.3)] font-semibold'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title={viewMode === 'browse' ? 'Currently in Spotify Browse Feed' : 'Switch to Spotify Browse Feed'}
            >
              {viewMode === 'browse' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-spotifyGreen" />
                  <span className="hidden md:inline text-xs">Browse</span>
                </>
              ) : (
                <>
                  <Disc3 className="w-3.5 h-3.5 text-neonCyan animate-spin-slow" />
                  <span className="hidden md:inline text-xs">Turntable</span>
                </>
              )}
            </button>

            {/* Constellation Library Pill */}
            <button
              onClick={() => setIsOrbitOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-slate-300 transition-all cursor-pointer"
              title="Constellation Library"
            >
              <Compass className="w-3.5 h-3.5 text-neonAmber" />
              <span className="hidden lg:inline">Orbit</span>
            </button>

            {/* Custom Playlists Hub Pill */}
            <button
              onClick={() => setIsPlaylistsOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neonCyan/40 text-xs text-slate-300 hover:text-neonCyan transition-all cursor-pointer"
              title="Custom Playlists"
            >
              <FolderHeart className="w-3.5 h-3.5 text-neonCyan" />
              <span className="hidden md:inline">Playlists</span>
            </button>

            {/* Queue Pill */}
            <button
              onClick={() => setIsQueueOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-spotifyGreen/40 text-xs text-slate-300 transition-all cursor-pointer"
              title="Queue"
            >
              <ListMusic className="w-3.5 h-3.5 text-spotifyGreen" />
              <span className="hidden md:inline">Queue</span>
              {(userQueue.length > 0 || activeQueue.length > 0) && (
                <span className="text-[10px] font-mono text-spotifyGreen font-semibold">
                  {userQueue.length > 0 ? `+${userQueue.length}` : activeQueue.length}
                </span>
              )}
            </button>

            {/* 320K Quality Indicator (Desktop only) */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-spotifyGreen/10 border border-spotifyGreen/30 text-spotifyGreen text-[11px] font-mono">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>320K</span>
            </div>

            {/* Logout Warning Trigger Button */}
            <button
              onClick={() => setIsLogoutWarningOpen(true)}
              className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Log Out of AURA"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 inset-x-0 mx-auto w-fit max-w-sm z-50 animate-bounce-subtle pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-slate-900/90 text-white border border-spotifyGreen/50 shadow-2xl backdrop-blur-xl flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-spotifyGreen flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Viewport: Swappable between Spotify Browse Feed and 3D Vinyl Turntable */}
      {viewMode === 'browse' ? (
        <main className="flex-1 w-full flex justify-center items-start overflow-y-auto pt-2">
          <div className="w-full flex justify-center gap-6 max-w-7xl">
            <SpotifyBrowseView
              onOpenAddToPlaylist={handleOpenAddToPlaylist}
              onOpenLikedSongs={() => {}}
            />
            {isRightPanelOpen && (
              <SpotifyNowPlayingPanel
                onClose={toggleRightPanel}
                onOpenQueue={() => setIsQueueOpen(true)}
                onAddToPlaylist={handleOpenAddToPlaylist}
              />
            )}
          </div>
        </main>
      ) : (
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
      )}

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

      {/* Playback Queue Modal (Spotify Two-Tier Queue) */}
      <QueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
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

      {/* Logout Warning Confirmation Modal */}
      <LogoutWarningModal
        isOpen={isLogoutWarningOpen}
        onClose={() => setIsLogoutWarningOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}

export default function App() {
  const { hasEntered, enterExperience, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // When clicking "Start Listening" on landing page:
  // - If user is already authenticated (auto-login): enter immediately
  // - If not logged in: open the AuthModal to sign in / create account
  const handleStartListening = () => {
    if (isAuthenticated) {
      enterExperience();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  if (!hasEntered) {
    return (
      <>
        <AvantGardeLogin onEnter={handleStartListening} />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return <MainPlayerApp />;
}
