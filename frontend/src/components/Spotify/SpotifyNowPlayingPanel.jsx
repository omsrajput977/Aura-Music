import React from 'react';
import { X, Heart, Plus, Music2, ExternalLink, Radio, Sparkles, UserCheck, Disc3 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export const SpotifyNowPlayingPanel = ({ onClose, onOpenQueue, onAddToPlaylist }) => {
  const {
    currentTrack,
    isPlaying,
    likedSongs,
    toggleLike,
    isLiked,
    userQueue,
    activeQueue,
    activeQueueIndex,
    playTrackItem
  } = usePlayer();

  if (!currentTrack) return null;

  const isCurrentLiked = isLiked(currentTrack.id || currentTrack.name);
  const nextTrack = userQueue.length > 0
    ? userQueue[0]
    : activeQueue[activeQueueIndex + 1] || null;

  const artistName = (currentTrack.artists || 'Artist').split(',')[0].trim();

  return (
    <aside className="w-80 sm:w-88 flex-shrink-0 h-[calc(100vh-6.5rem)] sticky top-20 overflow-y-auto pr-2 hidden lg:flex flex-col space-y-4 select-none pb-28">
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col space-y-4 shadow-xl">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px]">
            {currentTrack.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Large Cover Art */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900 shadow-2xl group border border-white/10">
          <img
            src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'}
            alt={currentTrack.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isPlaying && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center space-x-1.5 text-[10px] font-mono text-neonCyan">
              <span className="w-1.5 h-1.5 rounded-full bg-spotifyGreen animate-ping" />
              <span>LIVE 320K</span>
            </div>
          )}
        </div>

        {/* Track Title & Artist with Heart */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-white truncate hover:underline cursor-pointer">
              {currentTrack.name}
            </h4>
            <p className="text-xs text-slate-300 truncate mt-0.5 hover:text-white cursor-pointer">
              {currentTrack.artists}
            </p>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isCurrentLiked
                  ? 'text-spotifyGreen scale-110'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={isCurrentLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart className={`w-4 h-4 ${isCurrentLiked ? 'fill-current text-spotifyGreen' : ''}`} />
            </button>

            {onAddToPlaylist && (
              <button
                onClick={() => onAddToPlaylist(currentTrack)}
                className="p-2 rounded-full text-slate-400 hover:text-neonCyan hover:bg-white/10 transition-colors"
                title="Add to Custom Playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Next in Queue Card */}
        {nextTrack && (
          <div
            onClick={onOpenQueue}
            className="glass-card p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {userQueue.length > 0 ? 'Next in Queue' : 'Next from Station'}
              </span>
              <span className="text-[10px] text-neonCyan group-hover:underline">
                Open queue
              </span>
            </div>
            <div className="flex items-center space-x-2.5 min-w-0">
              <img
                src={nextTrack.albumArt}
                alt={nextTrack.name}
                className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white truncate block group-hover:text-neonCyan transition-colors">
                  {nextTrack.name}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {nextTrack.artists}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* "About the artist" Card */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex flex-col group">
          <div className="relative h-36 w-full overflow-hidden">
            <img
              src={currentTrack.albumArt}
              alt={artistName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white">
              About the artist
            </div>
            <div className="absolute bottom-3 left-3">
              <h5 className="text-base font-bold text-white truncate drop-shadow">
                {artistName}
              </h5>
              <span className="text-[10px] font-mono text-slate-300">
                18,420,891 monthly listeners
              </span>
            </div>
          </div>

          <div className="p-3.5 flex flex-col space-y-2.5 bg-slate-950/80">
            <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
              Award-winning singer and composer celebrated across the Indian subcontinent and global charts with iconic blockbuster soundtracks and chart-topping singles.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-spotifyGreen uppercase tracking-wider">
                VERIFIED ARTIST
              </span>
              <span className="text-[10px] text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center space-x-1">
                <span>View artist</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
