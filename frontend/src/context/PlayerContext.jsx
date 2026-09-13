import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { 
  searchOnlineMusic, 
  CURATED_ONLINE_TRACKS, 
  saveToSearchHistory, 
  isPreviewOrCutoffUrl, 
  sanitizeTrack,
  fetchLikedSongsApi,
  toggleLikeApi
} from '../utils/onlineMusicApi';

const PlayerContext = createContext(null);

// Local storage persistence keys
const STORAGE_KEYS = {
  CURRENT_TRACK: 'aura_current_track',
  PROGRESS_MS: 'aura_progress_ms',
  ACTIVE_QUEUE: 'aura_active_queue',
  ACTIVE_QUEUE_INDEX: 'aura_active_queue_index',
  USER_QUEUE: 'aura_user_queue',
  LIKED_SONGS: 'aura_liked_songs',
  VIEW_MODE: 'aura_view_mode',
  CONTEXT_NAME: 'aura_context_name',
  VOLUME: 'aura_volume',
  RPM: 'aura_rpm',
  SHUFFLE: 'aura_shuffle',
  REPEAT_MODE: 'aura_repeat_mode'
};

export const PlayerProvider = ({ children }) => {
  const { isDemoMode, hasEntered } = useAuth();

  // Playback state restored from localStorage
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TRACK);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return sanitizeTrack(parsed);
      }
    } catch (e) {
      console.warn('Could not restore currentTrack from localStorage:', e.message);
    }
    return CURATED_ONLINE_TRACKS[0];
  });

  const [progressMs, setProgressMs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS_MS);
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num) && num >= 0) return num;
      }
    } catch (e) {}
    return 0;
  });

  const [durationMs, setDurationMs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TRACK);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.duration && parsed.duration > 40000) return parsed.duration;
      }
    } catch (e) {}
    return CURATED_ONLINE_TRACKS[0].duration;
  });

  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num) && num >= 0 && num <= 100) return num;
      }
    } catch (e) {}
    return 80;
  });

  const [rpm, setRpm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RPM);
      if (saved) {
        const num = Number(saved);
        if (num === 33 || num === 45) return num;
      }
    } catch (e) {}
    return 33;
  });

  const [playlists, setPlaylists] = useState([]);
  const [topTracks, setTopTracks] = useState(CURATED_ONLINE_TRACKS);
  
  // Spotify-style Queue & Progression State restored from localStorage
  const [activeQueue, setActiveQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUEUE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeTrack);
      }
    } catch (e) {
      console.warn('Could not restore activeQueue from localStorage:', e.message);
    }
    return CURATED_ONLINE_TRACKS;
  });

  const [activeQueueIndex, setActiveQueueIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUEUE_INDEX);
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num) && num >= 0) return num;
      }
    } catch (e) {}
    return 0;
  });

  const [isShuffle, setIsShuffle] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SHUFFLE) === 'true';
    } catch (e) {}
    return false;
  });

  const [repeatMode, setRepeatMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPEAT_MODE);
      if (saved && ['off', 'all', 'one'].includes(saved)) return saved;
    } catch (e) {}
    return 'all'; // 'off' | 'all' | 'one'
  });

  // Spotify User Queue (explicitly queued tracks that play NEXT before context queue)
  const [userQueue, setUserQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_QUEUE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(sanitizeTrack);
      }
    } catch (e) {}
    return [];
  });

  // User's Liked Songs collection
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeTrack);
      }
    } catch (e) {}
    return [CURATED_ONLINE_TRACKS[0], CURATED_ONLINE_TRACKS[2]];
  });

  // View Mode: 'browse' (Spotify grid & shelves) vs 'turntable' (3D Vinyl Deck)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      if (saved === 'browse' || saved === 'turntable') return saved;
    } catch (e) {}
    return 'browse';
  });

  // Spotify Right Sidebar (Now Playing / About Artist)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return true;
  });

  // Playing Context Name (e.g. "Trending Bollywood", "Recommended Stations", "Liked Songs")
  const [contextName, setContextName] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CONTEXT_NAME) || 'AURA Curated Stream';
    } catch (e) {}
    return 'AURA Curated Stream';
  });

  // Toast notification for user actions (e.g. Added to queue, Saved to Liked Songs)
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  // Stable refs for audio listeners & event callbacks to avoid stale closures
  const demoAudioRef = useRef(new Audio());
  const activeQueueRef = useRef(activeQueue);
  const activeQueueIndexRef = useRef(activeQueueIndex);
  const userQueueRef = useRef(userQueue);
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const currentTrackRef = useRef(currentTrack);
  const isPlayingRef = useRef(isPlaying);
  const handleNextRef = useRef(null);
  const handlePreviousRef = useRef(null);
  const lastSavedTimeRef = useRef(0);
  const hasEnteredRef = useRef(hasEntered);

  useEffect(() => { activeQueueRef.current = activeQueue; }, [activeQueue]);
  useEffect(() => { activeQueueIndexRef.current = activeQueueIndex; }, [activeQueueIndex]);
  useEffect(() => { userQueueRef.current = userQueue; }, [userQueue]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // When user is on landing page (hasEntered is false), strictly pause and deactivate media sessions
  useEffect(() => {
    hasEnteredRef.current = hasEntered;
    if (!hasEntered) {
      demoAudioRef.current.pause();
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
      }
    }
  }, [hasEntered]);

  // Persist playback parameters to localStorage
  useEffect(() => {
    if (currentTrack) {
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, JSON.stringify(currentTrack));
      } catch (e) {}
    }
  }, [currentTrack]);

  useEffect(() => {
    if (activeQueue && activeQueue.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_QUEUE, JSON.stringify(activeQueue));
      } catch (e) {}
    }
  }, [activeQueue]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_QUEUE_INDEX, activeQueueIndex.toString());
    } catch (e) {}
  }, [activeQueueIndex]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    } catch (e) {}
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RPM, rpm.toString());
    } catch (e) {}
  }, [rpm]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHUFFLE, isShuffle.toString());
    } catch (e) {}
  }, [isShuffle]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPEAT_MODE, repeatMode);
    } catch (e) {}
  }, [repeatMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_QUEUE, JSON.stringify(userQueue));
    } catch (e) {}
  }, [userQueue]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(likedSongs));
    } catch (e) {}
  }, [likedSongs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    } catch (e) {}
  }, [viewMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTEXT_NAME, contextName);
    } catch (e) {}
  }, [contextName]);

  // Sync liked songs with server on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const serverLiked = await fetchLikedSongsApi();
      if (mounted && serverLiked && Array.isArray(serverLiked) && serverLiked.length > 0) {
        setLikedSongs(serverLiked.map(sanitizeTrack));
      }
    })();
    return () => { mounted = false; };
  }, []);


  // Save exact playback position on window refresh/unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const audio = demoAudioRef.current;
      if (audio && audio.currentTime) {
        localStorage.setItem(STORAGE_KEYS.PROGRESS_MS, Math.floor(audio.currentTime * 1000).toString());
      }
      if (currentTrackRef.current) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, JSON.stringify(currentTrackRef.current));
      }
      if (activeQueueRef.current) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_QUEUE, JSON.stringify(activeQueueRef.current));
      }
      localStorage.setItem(STORAGE_KEYS.ACTIVE_QUEUE_INDEX, activeQueueIndexRef.current.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Pre-load audio source and position on initial mount without auto-playing
  useEffect(() => {
    const audio = demoAudioRef.current;
    if (currentTrack) {
      const src = currentTrack.audioUrl;
      if (src && !isPreviewOrCutoffUrl(src)) {
        audio.src = src;
        audio.volume = volume / 100;
        if (progressMs > 0) {
          audio.currentTime = progressMs / 1000;
        }
      }
    }
  }, []);

  // Load initial top tracks and default active queue if not already restored
  useEffect(() => {
    setPlaylists([]);
    setTopTracks(CURATED_ONLINE_TRACKS);
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_QUEUE)) {
      setActiveQueue(CURATED_ONLINE_TRACKS);
      setActiveQueueIndex(0);
    }
  }, []);

  /**
   * Resolves 100% full-length 320kbps CD Quality audio stream.
   * Explicitly REJECTS and eliminates 30-second previews from iTunes / Spotify.
   */
  const resolveTrackAudio = async (track) => {
    // If the track already has a verified non-preview audioUrl, use it
    if (track.audioUrl && !isPreviewOrCutoffUrl(track.audioUrl)) {
      return track.audioUrl;
    }

    try {
      const cleanName = track.name.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
      const cleanArtist = (track.artists || '').split(',')[0].trim();
      const query = `${cleanName} ${cleanArtist}`.trim();

      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&limit=1`);
      if (res.ok) {
        const matches = await res.json();
        if (Array.isArray(matches) && matches.length > 0 && matches[0].audioUrl) {
          const fullStream = matches[0].audioUrl;
          track.audioUrl = fullStream;
          if (matches[0].duration && (!track.duration || track.duration < 40000)) {
            track.duration = matches[0].duration;
            setDurationMs(matches[0].duration);
          }
          return fullStream;
        }
      }
    } catch (err) {
      console.warn('[Full Stream Auto-Resolve Notice]:', err.message);
    }

    // Default to curated 320kbps full track
    return CURATED_ONLINE_TRACKS[0].audioUrl;
  };

  // Play specific track with Spotify-style queue adoption
  const playTrackItem = async (rawTrack, contextUri = null, newQueue = null, targetIndex = null, startFromMs = 0, contextLabel = null) => {
    if (!rawTrack || !hasEnteredRef.current) return;
    const track = sanitizeTrack(rawTrack);
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setProgressMs(startFromMs);
    if (track.duration) setDurationMs(track.duration);
    if (contextLabel) {
      setContextName(contextLabel);
    }

    // Save to recently played / search history
    saveToSearchHistory(track);

    // Adopt new queue if supplied (e.g. from search results, constellation library, or playlist click)
    let queue = activeQueueRef.current;
    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setActiveQueue(newQueue);
      activeQueueRef.current = newQueue;
      queue = newQueue;

      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < newQueue.length) {
        setActiveQueueIndex(targetIndex);
        activeQueueIndexRef.current = targetIndex;
      } else {
        const foundIdx = newQueue.findIndex(t => t.id === track.id || (t.name === track.name && t.artists === track.artists));
        const finalIdx = foundIdx !== -1 ? foundIdx : 0;
        setActiveQueueIndex(finalIdx);
        activeQueueIndexRef.current = finalIdx;
      }
    } else if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < queue.length) {
      setActiveQueueIndex(targetIndex);
      activeQueueIndexRef.current = targetIndex;
    } else {
      // Find if track already in queue
      const existingIdx = queue.findIndex(t => t.id === track.id || (t.name === track.name && t.artists === track.artists));
      if (existingIdx !== -1) {
        setActiveQueueIndex(existingIdx);
        activeQueueIndexRef.current = existingIdx;
      } else {
        // Spotify "Play Next" behavior: insert after current track
        const curIdx = activeQueueIndexRef.current;
        const updated = [...queue.slice(0, curIdx + 1), track, ...queue.slice(curIdx + 1)];
        setActiveQueue(updated);
        activeQueueRef.current = updated;
        setActiveQueueIndex(curIdx + 1);
        activeQueueIndexRef.current = curIdx + 1;
      }
    }

    // Direct 320kbps full audio stream engine (NEVER 30-second previews)
    const audio = demoAudioRef.current;
    const targetSource = await resolveTrackAudio(track);
    audio.src = targetSource;
    audio.volume = volume / 100;
    if (startFromMs > 0) {
      audio.currentTime = startFromMs / 1000;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio play notice:', e.message);
      setIsPlaying(true);
    }
  };

  // Skip to next track in queue (prioritizes User Queue, then Context Queue)
  const handleNext = async () => {
    if (repeatModeRef.current === 'one') {
      const audio = demoAudioRef.current;
      audio.currentTime = 0;
      setProgressMs(0);
      localStorage.setItem(STORAGE_KEYS.PROGRESS_MS, '0');
      audio.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    // 1. Prioritize User Queue: user-added tracks always play next
    if (userQueueRef.current && userQueueRef.current.length > 0) {
      const [nextUserTrack, ...remaining] = userQueueRef.current;
      setUserQueue(remaining);
      userQueueRef.current = remaining;
      playTrackItem(nextUserTrack, null, null, null, 0);
      return;
    }

    // 2. Play next in Context Queue
    const queue = activeQueueRef.current;
    if (!queue || queue.length === 0) return;

    const curIdx = activeQueueIndexRef.current;
    if (repeatModeRef.current === 'off' && curIdx >= queue.length - 1) {
      // Reached end of queue without repeat
      demoAudioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    let nextIdx;
    if (isShuffleRef.current && queue.length > 1) {
      let rand;
      do {
        rand = Math.floor(Math.random() * queue.length);
      } while (rand === curIdx);
      nextIdx = rand;
    } else {
      nextIdx = (curIdx + 1) % queue.length;
    }

    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setActiveQueueIndex(nextIdx);
      activeQueueIndexRef.current = nextIdx;
      playTrackItem(nextTrack, null, queue, nextIdx, 0);
    }
  };
  handleNextRef.current = handleNext;

  // Skip to previous track (restart if > 3s, else go to previous track)
  const handlePrevious = async () => {
    const audio = demoAudioRef.current;
    const currentProgress = audio.currentTime * 1000 || progressMs;

    // If track has been playing for more than 3 seconds (3000ms),
    // restart the current song from 0:00
    if (currentProgress > 3000) {
      audio.currentTime = 0;
      setProgressMs(0);
      localStorage.setItem(STORAGE_KEYS.PROGRESS_MS, '0');
      audio.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    // Otherwise, skip to the previous track in the queue
    const queue = activeQueueRef.current;
    if (!queue || queue.length === 0) return;

    const curIdx = activeQueueIndexRef.current;
    const prevIdx = (curIdx - 1 + queue.length) % queue.length;
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setActiveQueueIndex(prevIdx);
      activeQueueIndexRef.current = prevIdx;
      playTrackItem(prevTrack, null, queue, prevIdx, 0);
    }
  };
  handlePreviousRef.current = handlePrevious;

  // Direct queue jump
  const jumpToQueueIndex = (index) => {
    const queue = activeQueueRef.current;
    if (!queue || index < 0 || index >= queue.length) return;
    setActiveQueueIndex(index);
    activeQueueIndexRef.current = index;
    playTrackItem(queue[index], null, queue, index, 0);
  };

  // Add track to User Queue (Plays next in Spotify style)
  const addToUserQueue = (rawTrack) => {
    if (!rawTrack) return;
    const clean = sanitizeTrack(rawTrack);
    setUserQueue(prev => [...prev, clean]);
    showToast(`Added "${clean.name}" to queue`);
  };

  // Play next immediately (insert at front of user queue)
  const playNextInUserQueue = (rawTrack) => {
    if (!rawTrack) return;
    const clean = sanitizeTrack(rawTrack);
    setUserQueue(prev => [clean, ...prev]);
    showToast(`Playing "${clean.name}" next`);
  };

  // Remove track from User Queue
  const removeFromUserQueue = (index) => {
    setUserQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Clear User Queue
  const clearUserQueue = () => {
    setUserQueue([]);
    showToast('Queue cleared');
  };

  // Add track to general queue
  const addToQueue = (track) => {
    if (!track) return;
    addToUserQueue(track);
  };

  // Remove track from context queue
  const removeFromQueue = (index) => {
    setActiveQueue(prev => {
      if (prev.length <= 1) return prev;
      const nextQueue = prev.filter((_, i) => i !== index);
      if (index < activeQueueIndexRef.current) {
        setActiveQueueIndex(i => Math.max(0, i - 1));
      } else if (index === activeQueueIndexRef.current) {
        const newIdx = Math.min(index, nextQueue.length - 1);
        setActiveQueueIndex(newIdx);
        playTrackItem(nextQueue[newIdx], null, nextQueue, newIdx, 0);
      }
      return nextQueue;
    });
  };

  // Clear context queue
  const clearQueue = () => {
    if (currentTrackRef.current) {
      setActiveQueue([currentTrackRef.current]);
      setActiveQueueIndex(0);
    }
    clearUserQueue();
  };

  // Liked songs management
  const toggleLike = async (rawTrack) => {
    if (!rawTrack) return;
    const track = sanitizeTrack(rawTrack);
    const trackId = String(track.id || track.name);
    const alreadyLiked = likedSongs.some(
      t => String(t.id) === trackId || (t.name === track.name && t.artists === track.artists)
    );

    if (alreadyLiked) {
      setLikedSongs(prev => prev.filter(t => String(t.id) !== trackId && !(t.name === track.name && t.artists === track.artists)));
      showToast(`Removed "${track.name}" from Liked Songs`);
    } else {
      setLikedSongs(prev => [track, ...prev]);
      showToast(`Added "${track.name}" to Liked Songs`);
    }

    toggleLikeApi(track).catch(() => {});
  };

  const isLiked = (identifier) => {
    if (!identifier) return false;
    const key = String(identifier);
    return likedSongs.some(
      t => String(t.id) === key || t.name.toLowerCase() === key.toLowerCase()
    );
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'browse' ? 'turntable' : 'browse');
  };

  const toggleRightPanel = () => {
    setIsRightPanelOpen(prev => !prev);
  };

  // Unified audio timeupdate & progression listener
  useEffect(() => {
    const audio = demoAudioRef.current;

    const handleTimeUpdate = () => {
      const currentMs = audio.currentTime * 1000;
      setProgressMs(currentMs);
      if (audio.duration && !isNaN(audio.duration)) {
        setDurationMs(audio.duration * 1000);
      }

      // Throttled persistence of progress to localStorage (every 1 second)
      const now = Date.now();
      if (now - lastSavedTimeRef.current > 1000) {
        lastSavedTimeRef.current = now;
        try {
          localStorage.setItem(STORAGE_KEYS.PROGRESS_MS, Math.floor(currentMs).toString());
        } catch (e) {}
      }
    };

    const handleEnded = () => {
      try {
        localStorage.setItem(STORAGE_KEYS.PROGRESS_MS, '0');
      } catch (e) {}

      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (handleNextRef.current) {
        handleNextRef.current();
      }
    };

    const handleAudioPlay = () => {
      if (!hasEnteredRef.current) {
        audio.pause();
        setIsPlaying(false);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.playbackState = 'none';
        }
        return;
      }
      setIsPlaying(true);
      isPlayingRef.current = true;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const handleAudioPause = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      try {
        if (audio.currentTime) {
          localStorage.setItem(STORAGE_KEYS.PROGRESS_MS, Math.floor(audio.currentTime * 1000).toString());
        }
      } catch (e) {}
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
    };
  }, []);

  // MediaSession API Integration for Bluetooth Devices, OS Lockscreen & Hardware Media Keys
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (!hasEntered) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      return;
    }

    if (currentTrack) {
      const artwork = [];
      if (currentTrack.albumArt) {
        artwork.push(
          { src: currentTrack.albumArt, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.albumArt, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.albumArt, sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.albumArt, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.albumArt, sizes: '384x384', type: 'image/jpeg' },
          { src: currentTrack.albumArt, sizes: '512x512', type: 'image/jpeg' }
        );
      }

      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.name || 'AURA Track',
        artist: currentTrack.artists || 'AURA Music',
        album: currentTrack.albumName || contextName || 'AURA',
        artwork
      });
    }

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [currentTrack, contextName, isPlaying, hasEntered]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const actionHandlers = [
      ['play', async () => {
        if (!hasEnteredRef.current) {
          demoAudioRef.current.pause();
          setIsPlaying(false);
          return;
        }
        const audio = demoAudioRef.current;
        try {
          await audio.play();
        } catch (e) {
          console.warn('MediaSession play notice:', e.message);
        }
        setIsPlaying(true);
      }],
      ['pause', () => {
        const audio = demoAudioRef.current;
        audio.pause();
        setIsPlaying(false);
      }],
      ['previoustrack', () => {
        if (!hasEnteredRef.current) return;
        if (handlePreviousRef.current) handlePreviousRef.current();
      }],
      ['nexttrack', () => {
        if (!hasEnteredRef.current) return;
        if (handleNextRef.current) handleNextRef.current();
      }],
      ['seekto', (details) => {
        if (!hasEnteredRef.current) return;
        if (details.seekTime !== undefined && details.seekTime !== null) {
          seekTo(details.seekTime * 1000);
        }
      }]
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    }

    return () => {
      for (const [action] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) {}
      }
    };
  }, []);

  // Update MediaSession position state for seekbars on lockscreen / bluetooth
  useEffect(() => {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
    if (!hasEntered) return;
    try {
      const audio = demoAudioRef.current;
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate || 1,
          position: Math.min(audio.currentTime, audio.duration)
        });
      }
    } catch (e) {}
  }, [progressMs, durationMs, hasEntered]);

  // Handle Play/Pause
  const togglePlay = async () => {
    if (!hasEnteredRef.current) {
      return;
    }
    const audio = demoAudioRef.current;
    if (isPlaying || !audio.paused) {
      audio.pause();
      setIsPlaying(false);
      try {
        localStorage.setItem(STORAGE_KEYS.PROGRESS_MS, Math.floor(audio.currentTime * 1000).toString());
      } catch (e) {}
    } else {
      const currentSrc = audio.src;
      if (!currentSrc || isPreviewOrCutoffUrl(currentSrc) || (currentTrack?.audioUrl && !currentSrc.includes(currentTrack.audioUrl))) {
        const src = await resolveTrackAudio(currentTrack);
        audio.src = src;
        audio.volume = volume / 100;
        if (progressMs > 0) {
          audio.currentTime = progressMs / 1000;
        }
      } else if (progressMs > 0 && Math.abs(audio.currentTime - progressMs / 1000) > 2) {
        audio.currentTime = progressMs / 1000;
      }

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio play notice:', err.message);
        setIsPlaying(true);
      }
    }
  };

  // Seek position
  const seekTo = async (positionMs) => {
    setProgressMs(positionMs);
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS_MS, Math.floor(positionMs).toString());
    } catch (e) {}
    demoAudioRef.current.currentTime = positionMs / 1000;
  };

  // Set Volume
  const changeVolume = (newVol) => {
    const clamped = Math.max(0, Math.min(100, newVol));
    setVolume(clamped);
    demoAudioRef.current.volume = clamped / 100;
  };

  // Shuffle toggle
  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  // Repeat toggle (off -> all -> one -> off)
  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Load and play a local audio file
  const loadLocalAudio = (file) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");

    const localTrack = {
      id: `local-${Date.now()}`,
      name: cleanName,
      artists: 'Local File',
      albumName: 'Personal Sound Library',
      albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      audioUrl: objectUrl,
      duration: 180000
    };

    playTrackItem(localTrack, null, [localTrack, ...activeQueueRef.current], 0, 0);
  };

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        currentTrack,
        progressMs,
        durationMs,
        volume,
        rpm,
        playlists,
        topTracks,
        activeQueue,
        activeQueueIndex,
        userQueue,
        likedSongs,
        viewMode,
        isRightPanelOpen,
        contextName,
        toastMessage,
        isShuffle,
        repeatMode,
        setRpm,
        togglePlay,
        playTrackItem,
        handleNext,
        handlePrevious,
        jumpToQueueIndex,
        addToQueue,
        addToUserQueue,
        playNextInUserQueue,
        removeFromUserQueue,
        clearUserQueue,
        removeFromQueue,
        clearQueue,
        toggleLike,
        isLiked,
        toggleViewMode,
        setViewMode,
        toggleRightPanel,
        setContextName,
        seekTo,
        changeVolume,
        toggleShuffle,
        toggleRepeat,
        loadLocalAudio,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
