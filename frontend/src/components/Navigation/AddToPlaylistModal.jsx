import React, { useState, useEffect } from 'react';
import { X, Plus, Check, FolderPlus, Music, Disc3, Sparkles } from 'lucide-react';
import { getCustomPlaylists, createCustomPlaylist, addTrackToPlaylist } from '../../utils/playlistStorage';

/**
 * Universal "Add to Playlist" Modal.
 * Supports adding songs to any playlist without arbitrary limits.
 */
export const AddToPlaylistModal = ({
  isOpen,
  onClose,
  track,
  onPlaylistsUpdated
}) => {
  const [playlists, setPlaylists] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [feedback, setFeedback] = useState(null); // { playlistId, message }

  useEffect(() => {
    if (isOpen) {
      setPlaylists(getCustomPlaylists());
      setIsCreating(false);
      setNewPlaylistName('');
      setFeedback(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !track) return null;

  const handleAddToPlaylist = (playlist) => {
    const updated = addTrackToPlaylist(playlist.id, track);
    if (updated) {
      setPlaylists(getCustomPlaylists());
      if (onPlaylistsUpdated) onPlaylistsUpdated();
      setFeedback({ playlistId: playlist.id, message: `Added to ${playlist.name}!` });

      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleCreateAndAdd = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPlaylist = createCustomPlaylist({
      name: newPlaylistName.trim(),
      description: 'Created from track selection',
      cover: track.albumArt
    });

    if (newPlaylist) {
      addTrackToPlaylist(newPlaylist.id, track);
      setPlaylists(getCustomPlaylists());
      if (onPlaylistsUpdated) onPlaylistsUpdated();
      setFeedback({ playlistId: newPlaylist.id, message: `Created "${newPlaylist.name}" & added song!` });
      setIsCreating(false);
      setNewPlaylistName('');

      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 bg-black/75 backdrop-blur-2xl transition-all cursor-pointer select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl sm:rounded-3xl glass-panel border border-white/20 p-4 xs:p-5 sm:p-6 flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.85)] cursor-default overflow-hidden max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-neonCyan/10 border border-neonCyan/30 text-neonCyan">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-white tracking-wide">
                Add to Playlist
              </h3>
              <p className="text-[10px] xs:text-[11px] font-mono text-slate-400">
                NO LIMITS ON SONGS PER PLAYLIST
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

        {/* Selected Track Preview Card */}
        <div className="my-3 xs:my-4 glass-card p-2.5 xs:p-3 rounded-2xl border-white/10 flex items-center space-x-3 bg-white/5">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
            <img
              src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
              alt={track.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate">
              {track.name}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {track.artists}
            </p>
          </div>
          <Disc3 className="w-4 h-4 text-neonCyan animate-spin-slow flex-shrink-0" />
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Create New Playlist Inline Toggle/Form */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full mb-3 py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-neonCyan/10 border border-white/10 hover:border-neonCyan/40 text-xs font-semibold text-slate-200 hover:text-neonCyan flex items-center justify-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreateAndAdd} className="mb-3 flex items-center space-x-2">
            <input
              type="text"
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter playlist title..."
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-neonCyan/50 text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-neonCyan"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-neonCyan text-slate-950 font-bold text-xs hover:scale-105 active:scale-95 transition-all"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Playlists List */}
        <div className="max-h-[38vh] overflow-y-auto space-y-2 pr-1">
          {playlists.length > 0 ? (
            playlists.map((playlist) => {
              const isAdded = feedback?.playlistId === playlist.id;
              return (
                <div
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist)}
                  className={`glass-card p-2.5 rounded-2xl flex items-center justify-between cursor-pointer group transition-all ${
                    isAdded
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'hover:border-neonCyan/40 hover:bg-neonCyan/5'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                      <img
                        src={playlist.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-slate-100 group-hover:text-neonCyan truncate">
                        {playlist.name}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400">
                        {playlist.tracks?.length || 0} Songs
                      </span>
                    </div>
                  </div>

                  <div className="pl-2">
                    {isAdded ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 group-hover:bg-neonCyan/20 group-hover:text-neonCyan group-hover:border-neonCyan/40 flex items-center justify-center text-slate-400 transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-slate-500 text-xs font-mono">
              No playlists found. Create one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
