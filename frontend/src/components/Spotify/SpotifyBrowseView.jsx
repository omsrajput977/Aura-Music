import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, Plus, MoreHorizontal, Radio, Sparkles, ChevronRight, Disc3, Check, ListPlus } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { fetchShelves } from '../../utils/onlineMusicApi';

export const SpotifyBrowseView = ({ onOpenAddToPlaylist, onOpenLikedSongs }) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playTrackItem,
    addToUserQueue,
    playNextInUserQueue,
    likedSongs,
    toggleLike,
    isLiked,
    contextName
  } = usePlayer();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'music' | 'podcasts'
  const [shelvesData, setShelvesData] = useState(null);
  const [activeDropdownTrackId, setActiveDropdownTrackId] = useState(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleWindowClick = () => setActiveDropdownTrackId(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const handlePlayCollection = (collection, contextTitle) => {
    if (!collection.tracks || collection.tracks.length === 0) return;
    const tracks = collection.tracks;
    playTrackItem(tracks[0], null, tracks, 0, 0, contextTitle || collection.title);
  };

  const isCurrentCollectionPlaying = (collection) => {
    if (!collection || !collection.tracks || !currentTrack) return false;
    return collection.tracks.some(t => t.id === currentTrack.id || t.name === currentTrack.name);
  };

  const quickAccessList = shelvesData?.quickAccess || [
    {
      id: 'qa-liked',
      type: 'liked',
      title: 'Liked Songs',
      isLikedTile: true
    },
    {
      id: 'qa-garba',
      title: 'GARBA NONSTOP',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
      tracks: []
    }
  ];

  const jumpBackInList = shelvesData?.jumpBackIn || [];
  const recommendedStations = shelvesData?.recommendedStations || [];
  const moreOfWhatYouLike = shelvesData?.moreOfWhatYouLike || [];

  return (
    <div className="w-full flex-1 flex flex-col pb-36 px-3 xs:px-4 sm:px-6 md:px-8 max-w-7xl mx-auto z-10 transition-all">
      {/* Top Filter Chips */}
      <div className="flex items-center space-x-2.5 pt-20 sm:pt-24 pb-4 select-none">
        {['all', 'music', 'podcasts'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
              activeFilter === filter
                ? 'bg-white text-slate-950 shadow-md font-bold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/5'
            }`}
          >
            {filter === 'all' ? 'All' : filter === 'music' ? 'Music' : 'Podcasts'}
          </button>
        ))}
      </div>

      {/* 2x4 Spotify Quick Access Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          {quickAccessList.map((item) => {
            const isPlayingThis = isCurrentCollectionPlaying(item);

            if (item.isLikedTile) {
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (likedSongs.length > 0) {
                      playTrackItem(likedSongs[0], null, likedSongs, 0, 0, 'Liked Songs');
                    }
                  }}
                  className="group relative flex items-center bg-white/5 hover:bg-white/15 rounded-md overflow-hidden transition-all duration-200 cursor-pointer border border-white/5 hover:border-white/20 shadow-sm"
                >
                  {/* Purple Gradient Heart Tile */}
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

                  {/* Play Button on hover */}
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
                onClick={() => handlePlayCollection(item, item.title)}
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

                {/* Play Button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPlaying && isPlayingThis) {
                      togglePlay();
                    } else {
                      handlePlayCollection(item, item.title);
                    }
                  }}
                  className="mr-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 hover:scale-110 flex-shrink-0"
                  title={`Play ${item.title}`}
                >
                  {isPlaying && isPlayingThis ? (
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

      {/* Shelf 1: "Jump back in" */}
      {jumpBackInList.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-lg sm:text-2xl font-bold font-display text-white tracking-tight hover:underline cursor-pointer">
              Jump back in
            </h2>
            <span className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">
              Show all
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {jumpBackInList.map((card) => {
              const firstTrack = card.tracks?.[0];
              const isCardActive = firstTrack && currentTrack?.id === firstTrack.id;

              return (
                <div
                  key={card.id}
                  onClick={() => handlePlayCollection(card, card.title)}
                  className="group relative p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer flex flex-col border border-transparent hover:border-white/10"
                >
                  {/* Artwork Container */}
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 bg-slate-900 shadow-md">
                    <img
                      src={card.cover || firstTrack?.albumArt}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Floating Green Spotify Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlaying && isCardActive) {
                          togglePlay();
                        } else {
                          handlePlayCollection(card, card.title);
                        }
                      }}
                      className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 ${
                        isPlaying && isCardActive
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                      }`}
                      title="Play"
                    >
                      {isPlaying && isCardActive ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
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

      {/* Shelf 2: "Recommended Stations" */}
      {recommendedStations.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block">
                Non-stop music based on your favorite songs and artists
              </span>
              <h2 className="text-lg sm:text-2xl font-bold font-display text-white tracking-tight hover:underline cursor-pointer">
                Recommended Stations
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">
              Show all
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {recommendedStations.map((station) => {
              const firstTrack = station.tracks?.[0];
              const isStationActive = firstTrack && currentTrack?.id === firstTrack.id;

              return (
                <div
                  key={station.id}
                  onClick={() => handlePlayCollection(station, station.title)}
                  className="group relative p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer flex flex-col border border-transparent hover:border-white/10"
                >
                  {/* Station Art with Circular Collage Center */}
                  <div className={`relative w-full aspect-square rounded-md overflow-hidden mb-3 ${station.badgeBg || 'bg-slate-800'} p-2 flex items-center justify-center shadow-md`}>
                    <div className="absolute top-2 left-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono font-bold text-white tracking-widest uppercase">
                      <Radio className="w-2.5 h-2.5 text-spotifyGreen" />
                      <span>RADIO</span>
                    </div>

                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={station.cover || firstTrack?.albumArt}
                        alt={station.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Floating Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlaying && isStationActive) {
                          togglePlay();
                        } else {
                          handlePlayCollection(station, station.title);
                        }
                      }}
                      className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 ${
                        isPlaying && isStationActive
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                      }`}
                      title={`Play ${station.title}`}
                    >
                      {isPlaying && isStationActive ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
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

      {/* Shelf 3: "More of what you like" */}
      {moreOfWhatYouLike.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block">
                Hear a little bit of everything you love
              </span>
              <h2 className="text-lg sm:text-2xl font-bold font-display text-white tracking-tight hover:underline cursor-pointer">
                More of what you like
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">
              Show all
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {moreOfWhatYouLike.map((card) => {
              const firstTrack = card.tracks?.[0];
              const isCardActive = firstTrack && currentTrack?.id === firstTrack.id;

              return (
                <div
                  key={card.id}
                  onClick={() => handlePlayCollection(card, card.title)}
                  className="group relative p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer flex flex-col border border-transparent hover:border-white/10"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3 bg-slate-900 shadow-md">
                    <img
                      src={card.cover || firstTrack?.albumArt}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Floating Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlaying && isCardActive) {
                          togglePlay();
                        } else {
                          handlePlayCollection(card, card.title);
                        }
                      }}
                      className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-spotifyGreen text-slate-950 flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 ${
                        isPlaying && isCardActive
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                      }`}
                      title="Play"
                    >
                      {isPlaying && isCardActive ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
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
