import React, { useEffect } from 'react';
import { X, Play, Music, Shuffle, Repeat, Repeat1, Trash2, Disc, Sparkles, Volume2, Plus, Heart, ListPlus, Radio } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

/**
 * Spotify-Grade Two-Tier Playback Queue Modal.
 * Tier 1: "Now Playing"
 * Tier 2: "Next in Queue" (User Queue - tracks queued via Add to Queue that play next)
 * Tier 3: "Next from: [Context]" (Remaining tracks in current playlist/station)
 */
export const QueueModal = ({
  isOpen,
  onClose,
  onAddToPlaylist
}) => {
  const {
    currentTrack,
    isPlaying,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    activeQueue,
    activeQueueIndex,
    userQueue,
    removeFromUserQueue,
    clearUserQueue,
    jumpToQueueIndex,
    removeFromQueue,
    clearQueue,
    addToUserQueue,
    playTrackItem,
    contextName,
    likedSongs,
    toggleLike,
    isLiked
  } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const upcomingContextTracks = activeQueue.slice(activeQueueIndex + 1);

  const formatDuration = (ms) => {
    if (!ms) return '3:30';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCurrentLiked = currentTrack ? isLiked(currentTrack.id || currentTrack.name) : false;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 sm:p-6 bg-black/75 backdrop-blur-2xl transition-all cursor-pointer select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl sm:rounded-3xl glass-panel border border-white/20 p-4 xs:p-5 sm:p-6 flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.85)] cursor-default overflow-hidden"
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-neonCyan/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-spotifyGreen/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 xs:pb-4 border-b border-white/10 z-10 gap-2">
          <div className="flex items-center space-x-2.5 xs:space-x-3 min-w-0">
            <div className="p-2 xs:p-2.5 rounded-2xl bg-gradient-to-tr from-neonCyan/20 to-spotifyGreen/20 border border-neonCyan/30 text-neonCyan flex-shrink-0">
              <Disc className={`w-4 h-4 xs:w-5 xs:h-5 ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base xs:text-lg font-bold font-display text-white tracking-tight flex items-center space-x-2 truncate">
                <span>Play Queue</span>
                <span className="text-[10px] xs:text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono font-normal flex-shrink-0">
                  {userQueue.length + upcomingContextTracks.length + 1} Tracks
                </span>
              </h3>
              <p className="text-[10px] xs:text-xs text-slate-400 truncate">
                {contextName || 'AURA Stream'}
              </p>
            </div>
          </div>

          {/* Header Controls: Shuffle, Repeat, Clear All, Close */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 flex-shrink-0">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 xs:p-2 rounded-full border transition-all cursor-pointer ${
                isShuffle
                  ? 'bg-neonCyan/20 text-neonCyan border-neonCyan/40 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
              }`}
              title={isShuffle ? 'Shuffle Active' : 'Shuffle Off'}
            >
              <Shuffle className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 xs:p-2 rounded-full border transition-all cursor-pointer ${
                repeatMode !== 'off'
                  ? 'bg-spotifyGreen/20 text-spotifyGreen border-spotifyGreen/40 shadow-[0_0_12px_rgba(30,215,96,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
              }`}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> : <Repeat className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Queue Content */}
        <div className="flex-1 overflow-y-auto pt-4 pb-2 pr-1 space-y-5">
          {/* 1. NOW PLAYING */}
          <div>
            <div className="text-[11px] font-mono tracking-wider text-neonCyan uppercase mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Now Playing</span>
            </div>

            {currentTrack && (
              <div className="glass-card p-3 rounded-2xl border-neonCyan/40 bg-neonCyan/10 shadow-[0_0_25px_rgba(0,242,254,0.15)] flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-neonCyan/30 flex-shrink-0">
                    <img
                      src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
                      alt={currentTrack.name}
                      className="w-full h-full object-cover"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-end space-x-0.5 h-4">
                          <span className="w-1 bg-neonCyan rounded-full animate-pulse h-full" />
                          <span className="w-1 bg-spotifyGreen rounded-full animate-pulse h-2/3" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 bg-neonCyan rounded-full animate-pulse h-5/6" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {currentTrack.name}
                    </h4>
                    <p className="text-xs text-slate-300 truncate mt-0.5">
                      {currentTrack.artists}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 pl-3">
                  <span className="text-xs font-mono text-slate-300">
                    {formatDuration(currentTrack.duration)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(currentTrack);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      isCurrentLiked
                        ? 'text-spotifyGreen'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={isCurrentLiked ? 'Remove from Liked' : 'Save to Liked'}
                  >
                    <Heart className={`w-4 h-4 ${isCurrentLiked ? 'fill-current' : ''}`} />
                  </button>
                  {onAddToPlaylist && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(currentTrack);
                      }}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-neonCyan/20 text-slate-400 hover:text-neonCyan border border-white/10 transition-colors"
                      title="Add to Playlist"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. NEXT IN QUEUE (User Queue - Plays First) */}
          <div>
            <div className="text-[11px] font-mono tracking-wider text-slate-300 uppercase mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-spotifyGreen inline-block animate-pulse" />
                <span className="font-bold text-white">Next in Queue ({userQueue.length})</span>
                <span className="text-[10px] text-slate-400 lowercase font-normal hidden sm:inline">
                  — user queued, plays next
                </span>
              </div>
              {userQueue.length > 0 && (
                <button
                  onClick={clearUserQueue}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {userQueue.length > 0 ? (
              <div className="space-y-1.5">
                {userQueue.map((track, i) => (
                  <div
                    key={`${track.id || track.name}-user-${i}`}
                    onClick={() => {
                      // Play this user queued track immediately
                      removeFromUserQueue(i);
                      playTrackItem(track, null, null, null, 0);
                    }}
                    className="glass-card p-2.5 rounded-xl flex items-center justify-between cursor-pointer group hover:border-spotifyGreen/40 hover:bg-spotifyGreen/5 transition-all border border-spotifyGreen/20"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-5 text-center text-xs font-mono text-spotifyGreen group-hover:text-white flex-shrink-0">
                        {i + 1}
                      </span>
                      <img
                        src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                        alt={track.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-white truncate group-hover:text-spotifyGreen transition-colors">
                          {track.name}
                        </h5>
                        <p className="text-[11px] text-slate-400 truncate">
                          {track.artists}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDuration(track.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromUserQueue(i);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 px-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                <p className="text-xs text-slate-400">Your custom queue is empty.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Click "Add to Queue" on any song in browse or search to queue it next.
                </p>
              </div>
            )}
          </div>

          {/* 3. NEXT FROM CONTEXT (Ongoing Album / Playlist / Station) */}
          <div>
            <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
              <span>Next from: {contextName || 'Current Station'}</span>
              {repeatMode === 'all' && (
                <span className="text-[10px] text-spotifyGreen font-normal">Loops continuously</span>
              )}
            </div>

            {upcomingContextTracks.length > 0 ? (
              <div className="space-y-1.5">
                {upcomingContextTracks.map((track, i) => {
                  const queueIndex = activeQueueIndex + 1 + i;
                  return (
                    <div
                      key={`${track.id || track.name}-${queueIndex}`}
                      onClick={() => jumpToQueueIndex(queueIndex)}
                      className="glass-card p-2.5 rounded-xl flex items-center justify-between cursor-pointer group hover:border-white/20 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="w-5 text-center text-xs font-mono text-slate-500 group-hover:text-neonCyan flex-shrink-0">
                          {i + 1}
                        </span>
                        <img
                          src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                          alt={track.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-semibold text-slate-200 group-hover:text-neonCyan truncate">
                            {track.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 truncate">
                            {track.artists}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDuration(track.duration)}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToUserQueue(track);
                          }}
                          className="p-1 text-slate-500 hover:text-spotifyGreen opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Add to Next in Queue"
                        >
                          <ListPlus className="w-3.5 h-3.5" />
                        </button>

                        {onAddToPlaylist && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToPlaylist(track);
                            }}
                            className="p-1 text-slate-500 hover:text-neonCyan opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Add to Playlist"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                End of context queue.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
