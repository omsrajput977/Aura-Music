import React, { useState } from 'react';
import { Disc, Play, Sparkles, X, ListMusic, Music2, Plus, FolderHeart } from 'lucide-react';
import { CURATED_ONLINE_TRACKS, sanitizeTrack } from '../../utils/onlineMusicApi';

const CURATED_COLLECTIONS = [
  {
    id: 'col-bollywood',
    name: 'Bollywood Soul & Melody',
    description: 'Arijit Singh, Pritam, Sachin-Jigar & soulful soundtracks',
    cover: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    tracks: [CURATED_ONLINE_TRACKS[0], CURATED_ONLINE_TRACKS[2], CURATED_ONLINE_TRACKS[4]]
  },
  {
    id: 'col-punjabi',
    name: 'Punjabi High Energy & Heat',
    description: 'Karan Aujla, Diljit Dosanjh & chart-topping bangers',
    cover: 'https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg',
    tracks: [CURATED_ONLINE_TRACKS[3], CURATED_ONLINE_TRACKS[5]]
  },
  {
    id: 'col-hiphop',
    name: 'Global Hip-Hop & Rap Gold',
    description: 'Eminem, The Weeknd & iconic worldwide anthems',
    cover: 'https://c.saavncdn.com/700/Encore-Premiere-Explicit-2004-500x500.jpg',
    tracks: [CURATED_ONLINE_TRACKS[1]]
  },
  {
    id: 'col-midnight',
    name: 'Midnight Cosmic Nebula',
    description: 'Atmospheric frequencies, analog vinyl warmth & peace',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    tracks: [CURATED_ONLINE_TRACKS[2], CURATED_ONLINE_TRACKS[0], CURATED_ONLINE_TRACKS[4]]
  }
];

const FALLBACK_ART = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80';

/**
 * Planetary Constellation Orbit Navigation.
 * Replaces standard sidebars with floating, orbital planetary cards.
 * Adopts full tracklists or curated soundscape collections into the active queue.
 */
export const OrbitLibrary = ({
  isOpen,
  onClose,
  topTracks = CURATED_ONLINE_TRACKS,
  onSelectTrack,
  currentTrackId,
  onAddToPlaylist,
  onOpenPlaylists
}) => {
  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks' | 'collections'

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Ensure all tracks have verified live CDN URLs
  const displayTracks = (topTracks && topTracks.length > 0 ? topTracks : CURATED_ONLINE_TRACKS).map(sanitizeTrack);

  const handleCollectionClick = (collection) => {
    if (collection.tracks && collection.tracks.length > 0) {
      const sanitized = collection.tracks.map(sanitizeTrack);
      onSelectTrack(sanitized[0], sanitized, 0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 sm:p-8 bg-black/60 backdrop-blur-xl transition-all cursor-pointer select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl sm:rounded-3xl glass-panel border border-white/15 p-4 xs:p-5 sm:p-8 overflow-hidden flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.8)] cursor-default"
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-neonCyan/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-neonViolet/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 sm:pb-6 border-b border-white/10 z-10 gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="p-2 xs:p-2.5 rounded-2xl bg-gradient-to-tr from-neonCyan/30 to-blue-500/20 border border-neonCyan/40 text-neonCyan flex-shrink-0">
              <Disc className="w-4 h-4 xs:w-5 xs:h-5 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base xs:text-lg sm:text-xl font-bold font-display text-white tracking-tight truncate">
                Constellation Library
              </h3>
              <p className="text-[10px] xs:text-xs text-slate-400 truncate">
                Planetary nodes orbiting your soundscape
              </p>
            </div>
          </div>

          {/* Tab Selector & Close */}
          <div className="flex items-center space-x-2 xs:space-x-4 flex-shrink-0">
            <div className="flex p-0.5 xs:p-1 rounded-full bg-white/5 border border-white/10 text-[11px] xs:text-xs font-mono">
              <button
                onClick={() => setActiveTab('tracks')}
                className={`px-2.5 xs:px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'tracks'
                    ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tracks
              </button>
              <button
                onClick={() => setActiveTab('collections')}
                className={`px-2.5 xs:px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'collections'
                    ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Soundscapes
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 xs:p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
          </div>
        </div>

        {/* Content Grid (Planetary Cards) */}
        <div className="flex-1 overflow-y-auto pt-4 xs:pt-6 pb-2 pr-1 space-y-4">
          {activeTab === 'tracks' ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2.5 xs:gap-3.5">
              {displayTracks.map((track, index) => {
                const isSelected = track.id === currentTrackId;
                return (
                  <div
                    key={track.id || index}
                    onClick={() => {
                      onSelectTrack(track, displayTracks, index);
                      onClose();
                    }}
                    className={`glass-card p-3 rounded-2xl cursor-pointer group relative flex items-center space-x-3 transition-all ${
                      isSelected
                        ? 'border-neonCyan/60 bg-neonCyan/10 shadow-[0_0_20px_rgba(0,242,254,0.2)]'
                        : 'hover:border-white/20'
                    }`}
                  >
                    {/* Album Art with Play Overlay */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 border border-white/10">
                      <img
                        src={track.albumArt || FALLBACK_ART}
                        alt={track.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_ART;
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <Play className="w-5 h-5 text-neonCyan fill-current" />
                      </div>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-neonCyan' : 'text-slate-100 group-hover:text-neonCyan'
                      }`}>
                        {track.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {track.artists}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        NODE #{index + 1}
                      </span>
                    </div>

                    {/* Quick Add to Playlist Button */}
                    {onAddToPlaylist && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToPlaylist(track);
                        }}
                        className="p-2 rounded-full bg-white/5 hover:bg-neonCyan/20 text-slate-400 hover:text-neonCyan border border-white/10 hover:border-neonCyan/40 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        title="Add to Custom Playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
              {/* Custom Playlists Quick Hub Card */}
              {onOpenPlaylists && (
                <div
                  onClick={() => {
                    onClose();
                    onOpenPlaylists();
                  }}
                  className="glass-card p-4 rounded-2xl group cursor-pointer border-neonCyan/40 bg-neonCyan/5 hover:bg-neonCyan/15 transition-all flex space-x-4 items-center shadow-[0_0_20px_rgba(0,242,254,0.1)]"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-neonCyan/40 flex items-center justify-center bg-gradient-to-tr from-neonCyan/20 to-teal-500/20">
                    <FolderHeart className="w-9 h-9 text-neonCyan group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Sparkles className="w-3 h-3 text-neonCyan" />
                      <span className="text-[10px] font-mono text-neonCyan uppercase font-bold">
                        UNLIMITED SONGS
                      </span>
                    </div>
                    <h4 className="font-semibold text-white group-hover:text-neonCyan truncate text-sm">
                      Your Custom Playlists
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                      Create unlimited playlists, add 30+ favorite tracks, and play in isolated queue.
                    </p>
                  </div>
                </div>
              )}

              {CURATED_COLLECTIONS.map((col) => (
                <div
                  key={col.id}
                  onClick={() => handleCollectionClick(col)}
                  className="glass-card p-4 rounded-2xl group cursor-pointer hover:border-neonCyan/40 hover:bg-neonCyan/5 transition-all flex space-x-4 items-center"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                    <img
                      src={col.cover}
                      alt={col.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_ART;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-6 h-6 text-neonCyan fill-current" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Music2 className="w-3 h-3 text-neonCyan" />
                      <span className="text-[10px] font-mono text-neonCyan uppercase">
                        {col.tracks.length} FULL TRACKS
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-100 group-hover:text-neonCyan truncate text-sm">
                      {col.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {col.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
