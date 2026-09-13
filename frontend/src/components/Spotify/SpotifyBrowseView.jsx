import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Radio, 
  Sparkles, 
  ArrowLeft, 
  ChevronRight, 
  Mic2, 
  TrendingUp, 
  Headphones,
  Music 
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { fetchShelves } from '../../utils/onlineMusicApi';

export const SpotifyBrowseView = ({ onOpenPlaylist, onOpenLikedSongs }) => {
  const { user } = useAuth();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playTrackItem,
    likedSongs,
    contextName
  } = usePlayer();

  const [shelvesData, setShelvesData] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchShelves();
      if (mounted && data) {
        setShelvesData(data);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const userName = user?.name || 'Om Rajput';

  const handlePlayCollection = (e, collection) => {
    e.stopPropagation();
    if (!collection.tracks || collection.tracks.length === 0) return;
    const tracks = collection.tracks;
    const isCurrentPlaying = isPlaying && (contextName === collection.title || (currentTrack && tracks.some(t => t.id === currentTrack.id)));
    if (isCurrentPlaying) {
      togglePlay();
    } else {
      playTrackItem(tracks[0], null, tracks, 0, 0, collection.title);
    }
  };

  const isCollectionActive = (collection) => {
    if (!collection || !collection.tracks || !currentTrack) return false;
    return isPlaying && (contextName === collection.title || collection.tracks.some(t => t.id === currentTrack.id || t.name === currentTrack.name));
  };

  const quickAccessList = shelvesData?.quickAccess || [];
  const madeForUserList = shelvesData?.madeForUser || [];
  const jumpBackInList = shelvesData?.jumpBackIn || [];
  const recommendedStations = shelvesData?.recommendedStations || [];
  const moreOfWhatYouLike = shelvesData?.moreOfWhatYouLike || [];

  // Expanded "Show all" view for a category
  if (expandedCategory) {
    let title = '';
    let items = [];
    if (expandedCategory === 'madeForUser') {
      title = `Made For ${userName}`;
      items = madeForUserList;
    } else if (expandedCategory === 'jumpBackIn') {
      title = 'Jump back in';
      items = jumpBackInList;
    } else if (expandedCategory === 'stations') {
      title = 'Recommended Stations';
      items = recommendedStations;
    } else if (expandedCategory === 'moreOfWhatYouLike') {
      title = 'More of what you like';
      items = moreOfWhatYouLike;
    }

    return (
      <div className="w-full flex-1 flex flex-col pb-44 px-3 xs:px-4 sm:px-6 md:px-8 max-w-7xl mx-auto z-10 transition-all">
        <div className="pt-20 sm:pt-24 pb-4 flex items-center space-x-3">
          <button
            onClick={() => setExpandedCategory(null)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight mb-6">
          {title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((card) => {
            const isActive = isCollectionActive(card);
            return (
              <div
                key={card.id}
                onClick={() => onOpenPlaylist(card)}
                className="group relative p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer flex flex-col border border-transparent hover:border-white/10 shadow-sm"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-slate-900 shadow-md">
                  <img
                    src={card.cover || card.tracks?.[0]?.albumArt}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => handlePlayCollection(e, card)}
                    className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 ${
                      isActive
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                    }`}
                    title="Play"
                  >
                    {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate mb-1">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {card.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col pb-44 px-3 xs:px-4 sm:px-6 md:px-8 max-w-7xl mx-auto z-10 transition-all">
      {/* Top Header Spacing */}
      <div className="pt-20 sm:pt-24 pb-2" />

      {/* 2x4 Quick Access Grid */}
      {quickAccessList.length > 0 && (
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {quickAccessList.map((item) => {
              const isPlayingThis = isCollectionActive(item);

              if (item.isLikedTile) {
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onOpenLikedSongs) {
                        onOpenLikedSongs();
                      } else {
                        onOpenPlaylist({ id: 'qa-liked', type: 'liked', title: 'Liked Songs' });
                      }
                    }}
                    className="group relative flex items-center bg-white/5 hover:bg-white/15 rounded-md overflow-hidden transition-all duration-200 cursor-pointer border border-white/5 hover:border-white/20 shadow-sm"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-700 via-purple-700 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />
                    </div>
                    <div className="p-2 sm:p-3 min-w-0 flex-1 flex flex-col justify-center">
                      <span className="text-xs sm:text-sm font-bold text-white truncate block">
                        Liked Songs
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                        {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (likedSongs.length > 0) {
                          if (isPlaying && contextName === 'Liked Songs') {
                            togglePlay();
                          } else {
                            playTrackItem(likedSongs[0], null, likedSongs, 0, 0, 'Liked Songs');
                          }
                        }
                      }}
                      className="mr-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 hover:scale-110 flex-shrink-0"
                      title="Play Liked Songs"
                    >
                      {isPlaying && contextName === 'Liked Songs' ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenPlaylist(item)}
                  className="group relative flex items-center bg-white/5 hover:bg-white/15 rounded-md overflow-hidden transition-all duration-200 cursor-pointer border border-white/5 hover:border-white/20 shadow-sm"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-slate-800 overflow-hidden">
                    <img
                      src={item.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 sm:p-3 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-white truncate block">
                      {item.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handlePlayCollection(e, item)}
                    className="mr-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 hover:scale-110 flex-shrink-0"
                    title={`Play ${item.title}`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Shelf: "Made For [User]" (Matching Spotify Screenshot 2) */}
      {madeForUserList.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block">
                Made For
              </span>
              <h2 className="text-lg sm:text-2xl font-bold font-display text-white tracking-tight hover:underline cursor-pointer"
                onClick={() => setExpandedCategory('madeForUser')}
              >
                {userName}
              </h2>
            </div>
            <span 
              onClick={() => setExpandedCategory('madeForUser')}
              className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Show all
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {madeForUserList.map((card) => {
              const isActive = isCollectionActive(card);
              return (
                <div
                  key={card.id}
                  onClick={() => onOpenPlaylist(card)}
                  className="group relative p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer flex flex-col border border-transparent hover:border-white/10"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 bg-slate-900 shadow-md">
                    <img
                      src={card.cover}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Daily Mix Pill Badge on Cover */}
                    {card.mixNumber && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-white/20 text-[9px] font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                        <span>Daily Mix</span>
                        <span className="text-spotifyGreen">{card.mixNumber}</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => handlePlayCollection(e, card)}
                      className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 ${
                        isActive
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                      }`}
                      title={`Play ${card.title}`}
                    >
                      {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white truncate mb-1">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Shelf: "Jump back in" */}
      {jumpBackInList.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h2 
              onClick={() => setExpandedCategory('jumpBackIn')}
              className="text-lg sm:text-2xl font-bold font-display text-white tracking-tight hover:underline cursor-pointer"
            >
              Jump back in
            </h2>
            <span 
              onClick={() => setExpandedCategory('jumpBackIn')}
              className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Show all
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {jumpBackInList.map((card) => {
              const isActive = isCollectionActive(card);
              return (
                <div
                  key={card.id}
                  onClick={() => onOpenPlaylist(card)}
                  className="group relative p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer flex flex-col border border-transparent hover:border-white/10"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 bg-slate-900 shadow-md">
                    <img
                      src={card.cover || card.tracks?.[0]?.albumArt}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <button
                      onClick={(e) => handlePlayCollection(e, card)}
                      className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 ${
                        isActive
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                      }`}
                      title="Play"
                    >
                      {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white truncate mb-1">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Shelf: "Recommended Stations" */}
      {recommendedStations.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block">
                Non-stop music based on your favorite songs and artists
              </span>
              <h2 
                onClick={() => setExpandedCategory('stations')}
                className="text-lg sm:text-2xl font-bold font-display text-white tracking-tight hover:underline cursor-pointer"
              >
                Recommended Stations
              </h2>
            </div>
            <span 
              onClick={() => setExpandedCategory('stations')}
              className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Show all
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {recommendedStations.map((station) => {
              const isActive = isCollectionActive(station);
              return (
                <div
                  key={station.id}
                  onClick={() => onOpenPlaylist({ ...station, type: 'radio' })}
                  className="group relative p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer flex flex-col border border-transparent hover:border-white/10"
                >
                  <div className={`relative w-full aspect-square rounded-md overflow-hidden mb-3 ${station.badgeBg || 'bg-slate-800'} p-2 flex items-center justify-center shadow-md`}>
                    <div className="absolute top-2 left-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono font-bold text-white tracking-widest uppercase">
                      <Radio className="w-2.5 h-2.5 text-spotifyGreen" />
                      <span>RADIO</span>
                    </div>

                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={station.cover || station.tracks?.[0]?.albumArt}
                        alt={station.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <button
                      onClick={(e) => handlePlayCollection(e, station)}
                      className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 ${
                        isActive
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                      }`}
                      title={`Play ${station.title}`}
                    >
                      {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white truncate mb-1">
                    {station.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {station.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Shelf: "More of what you like" */}
      {moreOfWhatYouLike.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block">
                Hear a little bit of everything you love
              </span>
              <h2 
                onClick={() => setExpandedCategory('moreOfWhatYouLike')}
                className="text-lg sm:text-2xl font-bold font-display text-white tracking-tight hover:underline cursor-pointer"
              >
                More of what you like
              </h2>
            </div>
            <span 
              onClick={() => setExpandedCategory('moreOfWhatYouLike')}
              className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Show all
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {moreOfWhatYouLike.map((card) => {
              const isActive = isCollectionActive(card);
              return (
                <div
                  key={card.id}
                  onClick={() => onOpenPlaylist(card)}
                  className="group relative p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer flex flex-col border border-transparent hover:border-white/10"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 bg-slate-900 shadow-md">
                    <img
                      src={card.cover || card.tracks?.[0]?.albumArt}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <button
                      onClick={(e) => handlePlayCollection(e, card)}
                      className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 ${
                        isActive
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                      }`}
                      title="Play"
                    >
                      {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white truncate mb-1">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
