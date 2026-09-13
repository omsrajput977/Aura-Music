import React, { useState, useEffect } from 'react';
import { Search, X, Disc, Play, Loader2, Music, History, Trash2, Plus, Heart, ListPlus } from 'lucide-react';
import { searchOnlineMusic, getRecentSearchHistory, clearSearchHistory } from '../../utils/onlineMusicApi';
import { usePlayer } from '../../context/PlayerContext';

/**
 * High-Speed Search Modal with 6 Recently Played History Songs.
 * Displays user's recent listening/search history rather than trending songs when query is empty.
 * Streams 100% full-length 320kbps CD Quality tracks with zero subscription or cutoffs.
 */
export const SearchModal = ({
  isOpen,
  onClose,
  onSelectTrack,
  onAddToPlaylist
}) => {
  const { addToUserQueue, toggleLike, isLiked } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(() => getRecentSearchHistory());
  const [isSearching, setIsSearching] = useState(false);

  // Load the 6 recently played songs whenever modal opens or query is cleared
  useEffect(() => {
    if (isOpen && !query.trim()) {
      setResults(getRecentSearchHistory());
    }
  }, [isOpen, query]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults(getRecentSearchHistory());
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const onlineData = await searchOnlineMusic(query, 'IN', 18);
        setResults(onlineData);
      } catch (err) {
        console.warn('Search query error:', err.message);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const formatDuration = (ms) => {
    if (!ms) return '3:30';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleClearHistory = () => {
    const fresh = clearSearchHistory();
    setResults(fresh);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-2.5 xs:p-3 sm:p-4 pt-10 xs:pt-12 sm:pt-20 bg-black/70 backdrop-blur-2xl transition-all cursor-pointer select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl glass-panel border border-white/20 p-3.5 xs:p-4 sm:p-6 flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.8)] cursor-default"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3 xs:mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-neonCyan/10 border border-neonCyan/30 text-neonCyan">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-white tracking-wide">
                Music Search & Discovery
              </h3>
              <p className="text-[10px] xs:text-[11px] font-mono text-neonCyan">
                320KBPS FULL-LENGTH CD AUDIO
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center mb-3.5 xs:mb-5">
          <Search className="absolute left-3.5 xs:left-4 w-4 xs:w-5 h-4 xs:h-5 text-neonCyan" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Arijit Singh, Mockingbird, Diljit..."
            className="w-full py-2.5 xs:py-3.5 pl-10 xs:pl-12 pr-10 xs:pr-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-neonCyan/50 focus:ring-2 focus:ring-neonCyan/20 text-xs xs:text-sm sm:text-base font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 xs:right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results / Recently Played History Area */}
        <div className="max-h-[58vh] overflow-y-auto space-y-2.5 pr-1">
          {/* Header for Recently Played History vs Search Results */}
          {!query.trim() ? (
            <div className="flex items-center justify-between text-xs font-mono text-neonCyan px-1 pb-1">
              <div className="flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-neonCyan" />
                <span>RECENT PLAYED & SEARCH HISTORY ({results.length} SONGS)</span>
              </div>
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Reset history"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 px-1 pb-1">
              <Search className="w-3.5 h-3.5 text-neonCyan" />
              <span>SEARCH RESULTS FOR "{query}"</span>
            </div>
          )}

          {isSearching ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-neonCyan" />
              <span className="text-xs font-mono">Fetching full 320kbps audio...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((track, idx) => (
              <div
                key={`${track.id || track.name}-${idx}`}
                onClick={() => {
                  onSelectTrack(track, results);
                  onClose();
                }}
                className="glass-card p-2 xs:p-2.5 sm:p-3 rounded-2xl flex items-center justify-between cursor-pointer group hover:border-neonCyan/40 hover:bg-neonCyan/10 transition-all gap-2"
              >
                <div className="flex items-center space-x-2.5 xs:space-x-3 min-w-0 flex-1">
                  <div className="relative w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                    <img
                      src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'}
                      alt={track.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-neonCyan fill-current" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <h4 className="text-xs xs:text-sm font-semibold text-slate-100 group-hover:text-neonCyan truncate block">
                        {track.name}
                      </h4>
                      {!query.trim() && (
                        <span className="text-[8px] xs:text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-400 group-hover:text-neonCyan flex-shrink-0">
                          #{idx + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] xs:text-xs text-slate-400 truncate mt-0.5">
                      {track.artists} {track.duration ? `• ${formatDuration(track.duration)}` : ''} {track.albumName ? `• ${track.albumName}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 flex-shrink-0">
                  <span className="text-[10px] xs:text-xs font-mono text-slate-400 hidden sm:inline">
                    {formatDuration(track.duration)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track);
                    }}
                    className={`p-1 xs:p-1.5 rounded-full transition-colors cursor-pointer ${
                      isLiked(track.id || track.name)
                        ? 'text-spotifyGreen'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={isLiked(track.id || track.name) ? 'Remove from Liked' : 'Save to Liked'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked(track.id || track.name) ? 'fill-current text-spotifyGreen' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToUserQueue(track);
                    }}
                    className="p-1 xs:p-1.5 rounded-full bg-white/5 hover:bg-spotifyGreen/20 text-slate-400 hover:text-spotifyGreen border border-white/10 hover:border-spotifyGreen/40 transition-colors cursor-pointer"
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
                      className="p-1 xs:p-1.5 rounded-full bg-white/5 hover:bg-neonCyan/20 text-slate-400 hover:text-neonCyan border border-white/10 hover:border-neonCyan/40 transition-colors cursor-pointer"
                      title="Add to Custom Playlist"
                    >
                      <Plus className="w-3 xs:w-3.5 h-3 xs:h-3.5" />
                    </button>
                  )}

                  <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300 group-hover:bg-neonCyan/20 group-hover:text-neonCyan group-hover:border-neonCyan/40 transition-colors">
                    <Disc className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>PLAY</span>
                  </span>
                </div>
              </div>
            ))
          ) : query ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              No full tracks found for "{query}". Try another title or artist.
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs font-mono">
              Start typing above to search full-length music.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
