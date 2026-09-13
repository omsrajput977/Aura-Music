import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Trash2, ArrowLeft, Disc, Music, Sparkles, FolderPlus, Clock, Search } from 'lucide-react';
import { getCustomPlaylists, createCustomPlaylist, deleteCustomPlaylist, removeTrackFromPlaylist } from '../../utils/playlistStorage';

/**
 * Full-Featured Custom Playlists Hub.
 * Allows users to create unlimited playlists with zero limits on song capacity (30, 50, 100+ tracks).
 * Plays playlists in an isolated queue context.
 */
export const PlaylistsModal = ({
  isOpen,
  onClose,
  onPlayPlaylist,
  currentTrackId,
  isPlaying
}) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const reloadPlaylists = () => {
    const list = getCustomPlaylists();
    setPlaylists(list);
    if (selectedPlaylist) {
      const updated = list.find(p => p.id === selectedPlaylist.id);
      setSelectedPlaylist(updated || null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadPlaylists();
      setIsCreating(false);
      setPlaylistName('');
      setPlaylistDesc('');
      setConfirmDeleteId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (confirmDeleteId) setConfirmDeleteId(null);
        else if (selectedPlaylist) setSelectedPlaylist(null);
        else onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedPlaylist, confirmDeleteId, onClose]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    const newP = createCustomPlaylist({
      name: playlistName.trim(),
      description: playlistDesc.trim()
    });

    setPlaylistName('');
    setPlaylistDesc('');
    setIsCreating(false);
    reloadPlaylists();
    setSelectedPlaylist(newP);
  };

  const handleDeletePlaylist = (playlistId) => {
    deleteCustomPlaylist(playlistId);
    setConfirmDeleteId(null);
    setSelectedPlaylist(null);
    reloadPlaylists();
  };

  const handleRemoveTrack = (trackIdx) => {
    if (!selectedPlaylist) return;
    const updated = removeTrackFromPlaylist(selectedPlaylist.id, trackIdx);
    if (updated) {
      reloadPlaylists();
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return '3:30';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 sm:p-8 bg-black/75 backdrop-blur-2xl transition-all cursor-pointer select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl sm:rounded-3xl glass-panel border border-white/20 p-4 xs:p-5 sm:p-8 overflow-hidden flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.85)] cursor-default"
      >
        {/* Background Ambient Aura Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-neonCyan/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-spotifyGreen/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 sm:pb-5 border-b border-white/10 z-10 gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            {selectedPlaylist ? (
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="p-1.5 xs:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors mr-0.5 flex-shrink-0 cursor-pointer"
                title="Back to all playlists"
              >
                <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5" />
              </button>
            ) : (
              <div className="p-2 xs:p-2.5 rounded-2xl bg-gradient-to-tr from-neonCyan/30 to-spotifyGreen/20 border border-neonCyan/40 text-neonCyan flex-shrink-0">
                <FolderPlus className="w-4 h-4 xs:w-5 xs:h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base xs:text-lg sm:text-xl font-bold font-display text-white tracking-tight flex items-center space-x-2 truncate">
                <span className="truncate">{selectedPlaylist ? selectedPlaylist.name : 'Custom Playlists'}</span>
                <span className="text-[10px] xs:text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono font-normal flex-shrink-0">
                  {selectedPlaylist ? `${selectedPlaylist.tracks?.length || 0} Songs` : `${playlists.length} Playlists`}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {selectedPlaylist
                  ? (selectedPlaylist.description || 'Isolated playlist playback queue • Unlimited tracks')
                  : 'Create custom soundscapes with zero song limits'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3 flex-shrink-0">
            {!selectedPlaylist && (
              <button
                onClick={() => setIsCreating(prev => !prev)}
                className="flex items-center space-x-1 xs:space-x-1.5 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full bg-gradient-to-r from-neonCyan to-teal-400 text-slate-950 font-bold text-[11px] xs:text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                <span className="hidden xs:inline">New Playlist</span>
                <span className="xs:hidden">New</span>
              </button>
            )}

            {selectedPlaylist && selectedPlaylist.tracks?.length > 0 && (
              <button
                onClick={() => {
                  onPlayPlaylist(selectedPlaylist, 0);
                  onClose();
                }}
                className="flex items-center space-x-1 xs:space-x-1.5 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full bg-gradient-to-r from-neonCyan via-teal-400 to-spotifyGreen text-slate-950 font-bold text-[11px] xs:text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 xs:w-4 xs:h-4 fill-current" />
                <span>Play</span>
              </button>
            )}

            {selectedPlaylist && (
              confirmDeleteId === selectedPlaylist.id ? (
                <div className="flex items-center space-x-1.5 animate-fade-in">
                  <button
                    onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                    className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono hover:bg-rose-500/40 transition-colors cursor-pointer"
                  >
                    Confirm Delete?
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(selectedPlaylist.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-full hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inline Create Form */}
        {isCreating && !selectedPlaylist && (
          <form onSubmit={handleCreateSubmit} className="mt-4 p-4 rounded-2xl glass-card border border-neonCyan/40 bg-neonCyan/5 flex flex-col space-y-3 animate-fade-in z-10">
            <h4 className="text-xs font-mono font-bold text-neonCyan uppercase tracking-wider">
              Create New Playlist
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                autoFocus
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Playlist Title (e.g. Punjabi Party, Bollywood Nights, Workout Power)..."
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-neonCyan text-xs sm:text-sm"
              />
              <input
                type="text"
                value={playlistDesc}
                onChange={(e) => setPlaylistDesc(e.target.value)}
                placeholder="Description (optional)..."
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-neonCyan text-xs sm:text-sm"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-neonCyan text-slate-950 font-bold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Body View */}
        <div className="flex-1 overflow-y-auto pt-6 pb-2 pr-1 space-y-4">
          {!selectedPlaylist ? (
            /* VIEW 1: All Playlists Grid */
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4">
              {playlists.map((playlist) => {
                const songCount = playlist.tracks?.length || 0;
                return (
                  <div
                    key={playlist.id}
                    onClick={() => setSelectedPlaylist(playlist)}
                    className="glass-card p-3 xs:p-4 rounded-2xl group cursor-pointer hover:border-neonCyan/40 hover:bg-neonCyan/5 transition-all flex flex-col justify-between relative"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5 xs:mb-3.5 border border-white/10">
                      <img
                        src={playlist.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-neonCyan font-bold">
                        {songCount} SONGS
                      </div>

                      {/* Card Delete Button with inline confirmation */}
                      {confirmDeleteId === playlist.id ? (
                        <div className="absolute top-2 left-2 flex items-center space-x-1 z-10 animate-fade-in">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(playlist.id);
                            }}
                            className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono shadow-md cursor-pointer hover:bg-rose-500"
                          >
                            Delete?
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="p-1 rounded-full bg-black/70 text-slate-300 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(playlist.id);
                          }}
                          className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {songCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayPlaylist(playlist, 0);
                            onClose();
                          }}
                          className="absolute bottom-3 right-3 p-3 rounded-full bg-neonCyan text-slate-950 shadow-[0_0_20px_rgba(0,242,254,0.6)] opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                          title="Play playlist directly"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-100 group-hover:text-neonCyan truncate text-base">
                        {playlist.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {playlist.description || `${songCount} tracks added`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: Selected Playlist Tracklist & Detail View */
            <div className="space-y-4">
              {/* Search filter within large playlist if > 10 tracks */}
              {selectedPlaylist.tracks?.length > 10 && (
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={trackSearchQuery}
                    onChange={(e) => setTrackSearchQuery(e.target.value)}
                    placeholder={`Filter ${selectedPlaylist.tracks.length} songs...`}
                    className="w-full py-2 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-neonCyan"
                  />
                </div>
              )}

              {/* Tracks List */}
              {selectedPlaylist.tracks?.length > 0 ? (
                <div className="space-y-2">
                  {selectedPlaylist.tracks
                    .filter(t => !trackSearchQuery || t.name.toLowerCase().includes(trackSearchQuery.toLowerCase()) || t.artists.toLowerCase().includes(trackSearchQuery.toLowerCase()))
                    .map((track, idx) => {
                      const isSelected = track.id === currentTrackId;
                      return (
                        <div
                          key={`${track.id}-${idx}`}
                          onClick={() => {
                            onPlayPlaylist(selectedPlaylist, idx);
                            onClose();
                          }}
                          className={`glass-card p-3 rounded-2xl flex items-center justify-between cursor-pointer group transition-all ${
                            isSelected
                              ? 'border-neonCyan/60 bg-neonCyan/10 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                              : 'hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:text-neonCyan flex-shrink-0">
                              {idx + 1}
                            </span>

                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                              <img
                                src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                                alt={track.name}
                                className="w-full h-full object-cover"
                              />
                              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                <Play className="w-4 h-4 text-neonCyan fill-current" />
                              </div>
                            </div>

                            <div className="min-w-0">
                              <h5 className={`text-sm font-semibold truncate ${
                                isSelected ? 'text-neonCyan' : 'text-slate-100 group-hover:text-neonCyan'
                              }`}>
                                {track.name}
                              </h5>
                              <p className="text-xs text-slate-400 truncate">
                                {track.artists}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 flex-shrink-0 pl-3">
                            <span className="text-xs font-mono text-slate-400">
                              {formatDuration(track.duration)}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTrack(idx);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-rose-500/10"
                              title="Remove from playlist"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-16 text-center glass-card rounded-2xl border-dashed border-white/10">
                  <Music className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-slate-300">Playlist is Empty</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Search any music in the library or explore Constellation and click the "+" icon to add unlimited tracks here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
