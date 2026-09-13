import React, { useEffect } from 'react';
import { X, Play, Music, Shuffle, Repeat, Repeat1, Trash2, Disc, Sparkles, Volume2, Plus } from 'lucide-react';

/**
 * Spotify-Style Playback Queue Modal.
 * Shows active queue, upcoming tracks, and allows reordering/jumping.
 */
export const QueueModal = ({
  isOpen,
  onClose,
  currentTrack,
  activeQueue = [],
  activeQueueIndex = 0,
  isPlaying,
  isShuffle,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
  onJumpToIndex,
  onRemoveFromQueue,
  onClearQueue,
  onAddToPlaylist
}) => {
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

  const upcomingTracks = activeQueue.slice(activeQueueIndex + 1);

  const formatDuration = (ms) => {
    if (!ms) return '3:30';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 sm:p-6 bg-black/70 backdrop-blur-2xl transition-all cursor-pointer select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] rounded-2xl sm:rounded-3xl glass-panel border border-white/20 p-3.5 xs:p-5 sm:p-6 flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.85)] cursor-default overflow-hidden"
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-neonCyan/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-spotifyGreen/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 xs:pb-4 border-b border-white/10 z-10 gap-2">
          <div className="flex items-center space-x-2 xs:space-x-3 min-w-0">
            <div className="p-2 xs:p-2.5 rounded-2xl bg-gradient-to-tr from-neonCyan/20 to-spotifyGreen/20 border border-neonCyan/30 text-neonCyan flex-shrink-0">
              <Disc className={`w-4 h-4 xs:w-5 xs:h-5 ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base xs:text-lg font-bold font-display text-white tracking-tight flex items-center space-x-2 truncate">
                <span>Play Queue</span>
                <span className="text-[10px] xs:text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono font-normal flex-shrink-0">
                  {activeQueue.length} Tracks
                </span>
              </h3>
              <p className="text-[10px] xs:text-xs text-slate-400 truncate">
                Track {activeQueueIndex + 1} of {activeQueue.length}
              </p>
            </div>
          </div>

          {/* Header Controls: Shuffle, Repeat, Clear, Close */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 flex-shrink-0">
            <button
              onClick={onToggleShuffle}
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
              onClick={onToggleRepeat}
              className={`p-1.5 xs:p-2 rounded-full border transition-all cursor-pointer ${
                repeatMode !== 'off'
                  ? 'bg-spotifyGreen/20 text-spotifyGreen border-spotifyGreen/40 shadow-[0_0_12px_rgba(30,215,96,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
              }`}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> : <Repeat className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
            </button>

            {activeQueue.length > 1 && (
              <button
                onClick={onClearQueue}
                className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-rose-400 border border-white/5 hover:bg-white/10 transition-colors"
                title="Clear upcoming queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Queue Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto pt-5 pb-2 pr-1 space-y-5">
          {/* Section 1: Now Playing */}
          <div>
            <div className="text-xs font-mono tracking-wider text-neonCyan uppercase mb-2.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Now Playing</span>
            </div>

            {currentTrack && (
              <div className="glass-card p-3.5 rounded-2xl border-neonCyan/40 bg-neonCyan/10 shadow-[0_0_25px_rgba(0,242,254,0.15)] flex items-center justify-between">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-neonCyan/30 flex-shrink-0">
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
                    <span className="text-[10px] font-mono text-neonCyan/80 truncate block mt-0.5">
                      {currentTrack.albumName || 'Direct Audio'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 pl-3 text-right">
                  <span className="text-xs font-mono text-slate-300">
                    {formatDuration(currentTrack.duration)}
                  </span>
                  {onAddToPlaylist && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(currentTrack);
                      }}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-neonCyan/20 text-slate-400 hover:text-neonCyan border border-white/10 hover:border-neonCyan/40 transition-colors"
                      title="Add to Custom Playlist"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Next In Queue */}
          <div>
            <div className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-2.5 flex items-center justify-between">
              <span>Next Up ({upcomingTracks.length})</span>
              {repeatMode === 'all' && (
                <span className="text-[10px] text-spotifyGreen font-normal">Loops when finished</span>
              )}
            </div>

            {upcomingTracks.length > 0 ? (
              <div className="space-y-2">
                {upcomingTracks.map((track, i) => {
                  const queueIndex = activeQueueIndex + 1 + i;
                  return (
                    <div
                      key={`${track.id || track.name}-${queueIndex}`}
                      onClick={() => onJumpToIndex(queueIndex)}
                      className="glass-card p-2.5 rounded-2xl flex items-center justify-between cursor-pointer group hover:border-white/20 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:text-neonCyan flex-shrink-0">
                          {i + 1}
                        </span>

                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                          <img
                            src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                            alt={track.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-3.5 h-3.5 text-neonCyan fill-current" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h5 className="text-xs font-semibold text-slate-200 group-hover:text-neonCyan truncate">
                            {track.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 truncate">
                            {track.artists}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 pl-3">
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDuration(track.duration)}
                        </span>

                        {onAddToPlaylist && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToPlaylist(track);
                            }}
                            className="p-1 text-slate-500 hover:text-neonCyan opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Add to Custom Playlist"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromQueue(queueIndex);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from queue"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center glass-card rounded-2xl border-dashed border-white/10">
                <Music className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No more songs queued.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Search songs or explore Constellation to queue more tracks.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
