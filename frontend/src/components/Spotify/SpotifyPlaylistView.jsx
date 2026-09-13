import React from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Plus, 
  ListPlus, 
  Clock, 
  ArrowLeft, 
  Shuffle, 
  Sparkles,
  Disc3,
  Music2
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export const SpotifyPlaylistView = ({
  collection,
  onBack,
  onAddToPlaylist
}) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playTrackItem,
    addToUserQueue,
    isLiked,
    toggleLike,
    likedSongs,
    contextName,
    isShuffle,
    toggleShuffle
  } = usePlayer();

  if (!collection) return null;

  // If this is the Liked Songs collection, pull live from likedSongs state
  const isLikedCollection = collection.type === 'liked' || collection.id === 'qa-liked';
  const tracks = isLikedCollection ? likedSongs : (collection.tracks || []);
  const title = isLikedCollection ? 'Liked Songs' : collection.title;
  const description = isLikedCollection
    ? 'All the tracks you have liked across AURA in one curated space.'
    : (collection.description || collection.subtitle || 'Curated playlist with 320kbps full streaming audio.');
  const coverArt = isLikedCollection ? null : (collection.cover || tracks[0]?.albumArt);

  const isCurrentCollectionPlaying = isPlaying && (
    contextName === title || (currentTrack && tracks.some(t => t.id === currentTrack.id || t.name === currentTrack.name))
  );

  const formatDuration = (ms) => {
    if (!ms) return '3:30';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate total playlist duration
  const totalMs = tracks.reduce((acc, t) => acc + (t.duration || 210000), 0);
  const totalMin = Math.round(totalMs / 60000);

  const handlePlayEntirePlaylist = () => {
    if (tracks.length === 0) return;
    if (isCurrentCollectionPlaying) {
      togglePlay();
    } else {
      playTrackItem(tracks[0], null, tracks, 0, 0, title);
    }
  };

  const handleAddAllToQueue = () => {
    tracks.forEach(track => {
      addToUserQueue(track);
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col pb-36 px-3 xs:px-4 sm:px-6 md:px-8 max-w-7xl mx-auto z-10 transition-all">
      {/* Top Navigation Row */}
      <div className="pt-20 sm:pt-24 pb-4 flex items-center space-x-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Browse</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-white/10 via-white/5 to-transparent border border-white/10 shadow-2xl mb-6">
        {/* Cover Art Container */}
        {isLikedCollection ? (
          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-xl bg-gradient-to-br from-indigo-700 via-purple-700 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-[0_15px_40px_rgba(109,40,217,0.4)]">
            <Heart className="w-20 h-20 text-white fill-current animate-pulse" />
          </div>
        ) : (
          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 shadow-2xl border border-white/10">
            <img
              src={coverArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title, Subtitle, & Meta info */}
        <div className="flex-1 min-w-0 flex flex-col justify-end text-center sm:text-left">
          <span className="text-[10px] sm:text-xs font-bold font-mono tracking-widest text-spotifyGreen uppercase mb-1">
            {collection.type === 'radio' ? 'ARTIST RADIO' : 'PLAYLIST'}
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-tight mb-2 drop-shadow">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mb-3 line-clamp-2 max-w-2xl leading-relaxed">
            {description}
          </p>

          <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-slate-300 font-mono">
            <span className="font-bold text-white">AURA Music</span>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
            <span>•</span>
            <span className="text-slate-400">about {totalMin} min</span>
            <span className="hidden xs:inline">•</span>
            <span className="hidden xs:inline-flex items-center space-x-1 text-spotifyGreen font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-spotifyGreen animate-pulse" />
              <span>320K Hi-Fi</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center space-x-3.5 sm:space-x-4 mb-6 px-1">
        {/* Big Green Circular Play Button */}
        <button
          onClick={handlePlayEntirePlaylist}
          disabled={tracks.length === 0}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-[0_8px_25px_rgba(30,215,96,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          title={isCurrentCollectionPlaying ? 'Pause Playlist' : 'Play Playlist'}
        >
          {isCurrentCollectionPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Shuffle Button */}
        <button
          onClick={toggleShuffle}
          className={`p-2.5 sm:p-3 rounded-full border transition-all cursor-pointer ${
            isShuffle
              ? 'bg-spotifyGreen/20 text-spotifyGreen border-spotifyGreen/40 shadow-[0_0_12px_rgba(30,215,96,0.3)]'
              : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
          }`}
          title={isShuffle ? 'Shuffle Active' : 'Shuffle Off'}
        >
          <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Add All to Queue Button */}
        <button
          onClick={handleAddAllToQueue}
          disabled={tracks.length === 0}
          className="flex items-center space-x-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          title="Add all songs to your play queue"
        >
          <ListPlus className="w-4 h-4 text-spotifyGreen" />
          <span className="hidden sm:inline">Add All to Queue</span>
        </button>
      </div>

      {/* Tracklist Table */}
      {tracks.length > 0 ? (
        <div className="w-full flex flex-col space-y-1">
          {/* Table Header Row */}
          <div className="grid grid-cols-12 px-3 py-2 text-[11px] font-mono tracking-wider text-slate-400 uppercase border-b border-white/10 select-none">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-6 sm:col-span-5">Title</span>
            <span className="hidden sm:block sm:col-span-4">Album</span>
            <span className="col-span-5 sm:col-span-2 text-right flex items-center justify-end space-x-1">
              <Clock className="w-3.5 h-3.5 inline" />
            </span>
          </div>

          {/* Track Rows */}
          {tracks.map((track, idx) => {
            const isTrackActive = currentTrack && (track.id === currentTrack.id || track.name === currentTrack.name);
            const liked = isLiked(track.id || track.name);

            return (
              <div
                key={`${track.id || track.name}-${idx}`}
                onClick={() => playTrackItem(track, null, tracks, idx, 0, title)}
                className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-xl transition-all cursor-pointer group select-none ${
                  isTrackActive
                    ? 'bg-spotifyGreen/15 border border-spotifyGreen/30 shadow-[0_0_15px_rgba(30,215,96,0.15)]'
                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
              >
                {/* Track # or Play Icon */}
                <div className="col-span-1 text-center flex items-center justify-center">
                  {isTrackActive && isPlaying ? (
                    <div className="flex items-end space-x-0.5 h-3.5">
                      <span className="w-0.5 bg-spotifyGreen rounded-full animate-pulse h-full" />
                      <span className="w-0.5 bg-neonCyan rounded-full animate-pulse h-2/3" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 bg-spotifyGreen rounded-full animate-pulse h-5/6" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-mono text-slate-400 group-hover:hidden">
                        {idx + 1}
                      </span>
                      <Play className="w-3.5 h-3.5 text-white fill-current hidden group-hover:block" />
                    </>
                  )}
                </div>

                {/* Title & Artist & Artwork */}
                <div className="col-span-6 sm:col-span-5 flex items-center space-x-3 min-w-0 pr-2">
                  <img
                    src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
                    alt={track.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-900 border border-white/5"
                  />
                  <div className="min-w-0 flex-1">
                    <span className={`text-xs sm:text-sm font-semibold truncate block ${
                      isTrackActive ? 'text-spotifyGreen font-bold' : 'text-white group-hover:text-white'
                    }`}>
                      {track.name}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {track.artists}
                    </span>
                  </div>
                </div>

                {/* Album Name */}
                <div className="hidden sm:block sm:col-span-4 text-xs text-slate-400 truncate pr-2">
                  {track.albumName || 'Single'}
                </div>

                {/* Duration & Row Actions */}
                <div className="col-span-5 sm:col-span-2 flex items-center justify-end space-x-2">
                  {/* Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      liked
                        ? 'text-spotifyGreen'
                        : 'text-slate-500 hover:text-white opacity-0 group-hover:opacity-100'
                    }`}
                    title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current text-spotifyGreen' : ''}`} />
                  </button>

                  {/* Add to User Queue Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToUserQueue(track);
                    }}
                    className="p-1.5 rounded-full text-slate-500 hover:text-spotifyGreen opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Add to Next in Queue"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                  </button>

                  {/* Add to Custom Playlist Button */}
                  {onAddToPlaylist && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(track);
                      }}
                      className="p-1.5 rounded-full text-slate-500 hover:text-neonCyan opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add to Custom Playlist"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Duration */}
                  <span className="text-xs font-mono text-slate-400 min-w-[36px] text-right">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
          <Music2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">
            {isLikedCollection ? 'No liked songs yet' : 'No tracks available'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isLikedCollection
              ? 'Tap the heart button on any track while browsing or listening to save songs here.'
              : 'Try exploring other playlists or stations.'}
          </p>
        </div>
      )}
    </div>
  );
};
