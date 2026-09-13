/**
 * Custom Playlists Storage & Management Engine
 * Supports unlimited tracks per playlist (exceeding 30, 50, 100+ songs) with zero artificial caps.
 * Persisted in browser localStorage.
 */

import { sanitizeTrack } from './onlineMusicApi';

const CUSTOM_PLAYLISTS_KEY = 'aura_custom_playlists';

// Default initial demo playlist to welcome the user
const DEFAULT_PLAYLISTS = [
  {
    id: 'playlist-favorites',
    name: 'My Starred Soundtracks',
    description: 'Personal cosmic favorites and timeless melodies',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
    createdAt: Date.now(),
    tracks: []
  }
];

/**
 * Retrieves all custom playlists from localStorage.
 */
export const getCustomPlaylists = () => {
  try {
    const saved = localStorage.getItem(CUSTOM_PLAYLISTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(playlist => ({
          ...playlist,
          tracks: (playlist.tracks || []).map(sanitizeTrack)
        }));
      }
    }
  } catch (e) {
    console.warn('Error reading custom playlists:', e.message);
  }
  return DEFAULT_PLAYLISTS;
};

/**
 * Saves the entire list of playlists to localStorage.
 */
const persistPlaylists = (playlists) => {
  try {
    localStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    console.warn('Error saving custom playlists:', e.message);
  }
};

/**
 * Creates a brand new custom playlist.
 */
export const createCustomPlaylist = ({ name, description = '', cover = null }) => {
  const playlists = getCustomPlaylists();
  const cleanName = (name || '').trim() || `My Playlist #${playlists.length + 1}`;

  const newPlaylist = {
    id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: cleanName,
    description: description.trim(),
    cover: cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
    createdAt: Date.now(),
    tracks: []
  };

  const updated = [newPlaylist, ...playlists];
  persistPlaylists(updated);
  return newPlaylist;
};

/**
 * Adds a track to a playlist with NO song limit (supports 30, 50, 100+ tracks).
 */
export const addTrackToPlaylist = (playlistId, rawTrack) => {
  if (!playlistId || !rawTrack) return false;
  const track = sanitizeTrack(rawTrack);
  const playlists = getCustomPlaylists();

  const index = playlists.findIndex(p => p.id === playlistId);
  if (index === -1) return false;

  const playlist = playlists[index];
  const existingTracks = playlist.tracks || [];

  // Update cover if playlist currently has default cover and this track has high-res art
  let updatedCover = playlist.cover;
  if (existingTracks.length === 0 && track.albumArt) {
    updatedCover = track.albumArt;
  }

  // Create clean track item
  const trackItem = {
    id: track.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: track.name,
    artists: track.artists || 'Artist',
    albumName: track.albumName || '',
    albumArt: track.albumArt,
    audioUrl: track.audioUrl,
    duration: track.duration || 210000,
    addedAt: Date.now()
  };

  const updatedPlaylist = {
    ...playlist,
    cover: updatedCover,
    tracks: [...existingTracks, trackItem] // Unlimited additions!
  };

  playlists[index] = updatedPlaylist;
  persistPlaylists(playlists);
  return updatedPlaylist;
};

/**
 * Removes a track from a playlist by index.
 */
export const removeTrackFromPlaylist = (playlistId, trackIndex) => {
  const playlists = getCustomPlaylists();
  const index = playlists.findIndex(p => p.id === playlistId);
  if (index === -1) return null;

  const playlist = playlists[index];
  const updatedTracks = (playlist.tracks || []).filter((_, i) => i !== trackIndex);

  const updatedPlaylist = {
    ...playlist,
    tracks: updatedTracks
  };

  playlists[index] = updatedPlaylist;
  persistPlaylists(playlists);
  return updatedPlaylist;
};

/**
 * Deletes an entire custom playlist.
 */
export const deleteCustomPlaylist = (playlistId) => {
  const playlists = getCustomPlaylists();
  const filtered = playlists.filter(p => p.id !== playlistId);
  persistPlaylists(filtered);
  return filtered;
};

/**
 * Updates playlist metadata (name, description, cover).
 */
export const updateCustomPlaylist = (playlistId, updates) => {
  const playlists = getCustomPlaylists();
  const index = playlists.findIndex(p => p.id === playlistId);
  if (index === -1) return null;

  const updatedPlaylist = {
    ...playlists[index],
    ...updates
  };

  playlists[index] = updatedPlaylist;
  persistPlaylists(playlists);
  return updatedPlaylist;
};
