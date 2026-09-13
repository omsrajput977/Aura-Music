/**
 * Public Free Online Music Streaming API (powered by Audius open network)
 * No API key, subscription, or login required.
 * Allows searching and streaming millions of full-length online tracks.
 */

const APP_NAME = 'AURA_SPATIAL_MUSIC';
const DISCOVERY_ENDPOINT = 'https://discoveryprovider.audius.co/v1';

export const searchOnlineTracks = async (query, limit = 15) => {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `${DISCOVERY_ENDPOINT}/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&app_name=${APP_NAME}`
    );
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const json = await res.json();
    if (!json.data) return [];

    return json.data.map(track => ({
      id: `audius-${track.id || track.track_id}`,
      name: track.title,
      artists: track.user?.name || 'Unknown Artist',
      albumName: track.genre || 'Online Stream',
      albumArt: track.artwork?.['480x480'] || track.artwork?.['150x150'] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      audioUrl: track.stream?.url || `${DISCOVERY_ENDPOINT}/tracks/${track.id}/stream?app_name=${APP_NAME}`,
      duration: (track.duration || 180) * 1000,
      source: 'online'
    }));
  } catch (err) {
    console.warn('[Audius Search Notice]:', err.message);
    return [];
  }
};

export const getTrendingOnlineTracks = async (limit = 12) => {
  try {
    const res = await fetch(
      `${DISCOVERY_ENDPOINT}/tracks/trending?limit=${limit}&app_name=${APP_NAME}`
    );
    if (!res.ok) throw new Error(`Trending failed: ${res.status}`);
    const json = await res.json();
    if (!json.data) return [];

    return json.data.map(track => ({
      id: `audius-${track.id || track.track_id}`,
      name: track.title,
      artists: track.user?.name || 'Popular Artist',
      albumName: track.genre || 'Trending Sound',
      albumArt: track.artwork?.['480x480'] || track.artwork?.['150x150'] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      audioUrl: track.stream?.url || `${DISCOVERY_ENDPOINT}/tracks/${track.id}/stream?app_name=${APP_NAME}`,
      duration: (track.duration || 180) * 1000,
      source: 'online'
    }));
  } catch (err) {
    console.warn('[Audius Trending Notice]:', err.message);
    return [];
  }
};
