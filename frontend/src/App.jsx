import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { usePlayer } from './context/PlayerContext';
import { AmbientNebula } from './components/Visualizer/AmbientNebula';
import { TurntableDeck } from './components/Turntable/TurntableDeck';
import { SpatialHUD } from './components/Controls/SpatialHUD';
import { SpotifyBrowseView } from './components/Spotify/SpotifyBrowseView';
import { SpotifyPlaylistView } from './components/Spotify/SpotifyPlaylistView';
import { SpotifyNowPlayingPanel } from './components/Spotify/SpotifyNowPlayingPanel';
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
  LogOut, 
  Radio, 
  ListMusic, 
  FolderHeart, 
  Heart, 
  LayoutGrid,
  CheckCircle2,
  Home
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
    toggleRepeat
  } = usePlayer();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isLogoutWarningOpen, setIsLogoutWarningOpen] = useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);

  // Dynamic Spotify Sub-view: 'home' | 'playlist'
  const [currentSubView, setCurrentSubView] = useState('home');
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Scroll Preservation & Scroll-To-Top Refs
  const mainScrollRef = useRef(null);
  const browseViewRef = useRef(null);
  const homeScrollPositionRef = useRef(0);

  const handleOpenPlaylist = (collection) => {
    if (mainScrollRef.current) {
      homeScrollPositionRef.current = mainScrollRef.current.scrollTop;
    }
    setSelectedCollection(collection);
    setCurrentSubView('playlist');
    requestAnimationFrame(() => {
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTop = 0;
      }
    });
  };

  const handleOpenLikedSongs = () => {
    if (mainScrollRef.current) {
      homeScrollPositionRef.current = mainScrollRef.current.scrollTop;
    }
    setSelectedCollection({
      id: 'qa-liked',
      type: 'liked',
      title: 'Liked Songs'
    });
    setCurrentSubView('playlist');
    requestAnimationFrame(() => {
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTop = 0;
      }
    });
  };

  // Back to Browse: restores the exact scroll position where the user clicked into the playlist
  const handleBackToBrowse = () => {
    const savedPos = homeScrollPositionRef.current;
    setCurrentSubView('home');
    requestAnimationFrame(() => {
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTop = savedPos;
      }
      setTimeout(() => {
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTop = savedPos;
        }
      }, 30);
    });
  };

  // Home Button Click: smooth scroll to top on front page; returns to Home & top on other views
  const handleHomeClick = () => {
    if (viewMode !== 'browse') {
      toggleViewMode();
    }
    // If inside an expanded category grid, reset back to front page feed
    if (browseViewRef.current?.resetToFrontPage) {
      browseViewRef.current.resetToFrontPage();
    }
    homeScrollPositionRef.current = 0;
    if (currentSubView !== 'home') {
      setCurrentSubView('home');
    }
    // Smooth scroll to top of front page
    setTimeout(() => {
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 10);
  };

  // Ensure scroll position is restored reliably before browser paint when returning to browse
  useLayoutEffect(() => {
    if (currentSubView === 'home' && homeScrollPositionRef.current > 0) {
      const savedPos = homeScrollPositionRef.current;
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTop = savedPos;
      }
      const frameId = requestAnimationFrame(() => {
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTop = savedPos;
        }
      });
      const timerId = setTimeout(() => {
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTop = savedPos;
        }
      }, 50);
      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(timerId);
      };
    }
  }, [currentSubView]);

  const triggerCosmicDust = () => {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#00f2fe', '#1ed760', '#9b51e0']
    });
  };

  // Global Spacebar shortcut: toggles play/pause cleanly without scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        const active = document.activeElement;
        const tag = active?.tagName?.toLowerCase();
        const isEditable = active?.isContentEditable;
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || isEditable) {
          // Allow typing space in text fields
          return;
        }

        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

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
    <div className="relative h-[100dvh] w-full flex flex-col justify-between overflow-hidden">
      {/* Dynamic Ambient Background Canvas */}
      <AmbientNebula
        albumArt={currentTrack?.albumArt}
        isPlaying={isPlaying}
      />

      {/* Floating Top Navigation Bar */}
      <header className="fixed top-2 xs:top-2.5 sm:top-4 inset-x-0 mx-auto w-[96%] sm:w-11/12 max-w-7xl z-40">
        <div className="glass-pill px-2.5 py-1.5 xs:px-3 xs:py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center justify-between shadow-2xl gap-1.5 sm:gap-2.5 border border-white/10 bg-slate-950/80 backdrop-blur-2xl">
          {/* Brand Logo - Pauses music and redirects to home */}
          <div 
            className="flex items-center space-x-1.5 sm:space-x-2.5 cursor-pointer group flex-shrink-0"
            onClick={handleLogoClick}
            title="Pause music and return to Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-neonCyan to-spotifyGreen flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.4)] group-hover:scale-105 transition-transform flex-shrink-0">
              <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 animate-spin-slow" />
            </div>
            <span className="text-xs sm:text-sm font-bold font-display tracking-wider sm:tracking-widest text-white group-hover:text-neonCyan transition-colors">
              AURA
            </span>
          </div>

          {/* Circular Home Button: Smooth scroll to top on Home; returns to Home & top on other views */}
          <button
            onClick={handleHomeClick}
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
              currentSubView === 'home' && viewMode === 'browse'
                ? 'bg-white/20 text-white border-white/30 shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
            }`}
            title="Home / Scroll to Top"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Responsive Spotify-Style Central Search Input */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 min-w-[70px] max-w-xs sm:max-w-md mx-1 sm:mx-3 flex items-center space-x-1.5 sm:space-x-2.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shadow-inner group"
            title="Click to search songs, artists, and albums"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-neonCyan transition-colors flex-shrink-0" />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 truncate select-none">
              <span className="hidden sm:inline">What do you want to play?</span>
              <span className="sm:hidden">Search</span>
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* View Mode Toggle Button (Browse vs Turntable) */}
            <button
              onClick={toggleViewMode}
              className={`w-7 h-7 sm:w-auto sm:px-3 sm:py-1.5 rounded-full border transition-all cursor-pointer flex items-center justify-center space-x-1.5 flex-shrink-0 ${
                viewMode === 'browse'
                  ? 'bg-spotifyGreen/20 text-spotifyGreen border-spotifyGreen/40 shadow-[0_0_10px_rgba(30,215,96,0.3)] font-semibold'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title={viewMode === 'browse' ? 'Currently in Browse Feed' : 'Switch to Browse Feed'}
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

            {/* Custom Playlists Hub Button */}
            <button
              onClick={() => setIsPlaylistsOpen(true)}
              className="w-7 h-7 sm:w-auto sm:px-3 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neonCyan/40 text-xs text-slate-300 hover:text-neonCyan transition-all cursor-pointer flex items-center justify-center space-x-1.5 flex-shrink-0"
              title="Custom Playlists"
            >
              <FolderHeart className="w-3.5 h-3.5 text-neonCyan" />
              <span className="hidden md:inline">Playlists</span>
            </button>

            {/* Queue Pill (Tablet & Desktop only, on mobile it's in bottom HUD) */}
            <button
              onClick={() => setIsQueueOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-spotifyGreen/40 text-xs text-slate-300 transition-all cursor-pointer flex-shrink-0"
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
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
        <main 
          ref={mainScrollRef}
          className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          <div className="w-full flex justify-center gap-6 max-w-7xl mx-auto px-2 sm:px-4">
            <div className={currentSubView === 'home' ? 'w-full flex-1 min-w-0' : 'hidden'}>
              <SpotifyBrowseView
                ref={browseViewRef}
                onOpenPlaylist={handleOpenPlaylist}
                onOpenLikedSongs={handleOpenLikedSongs}
              />
            </div>
            {currentSubView === 'playlist' && (
              <SpotifyPlaylistView
                collection={selectedCollection}
                onBack={handleBackToBrowse}
                onAddToPlaylist={handleOpenAddToPlaylist}
              />
            )}
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
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center pt-16 sm:pt-20 pb-28 sm:pb-32 px-2 sm:px-4">
          <TurntableDeck
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            rpm={rpm}
            onToggleRpm={setRpm}
            onTogglePlay={togglePlay}
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
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onOpenQueue={() => setIsQueueOpen(true)}
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
