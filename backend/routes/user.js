const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'aura_spatial_cosmic_jwt_super_secret_key_2026_x89!';

// Auth verification helper middleware
const requireAuth = async (req, res, next) => {
  let token = req.cookies?.aura_jwt;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
};

/**
 * GET /api/user/liked
 * Fetch all liked songs for the current logged-in user
 */
router.get('/liked', requireAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(req.userId)) {
        user = await User.findById(req.userId).select('likedSongs');
      }
      if (!user) {
        return res.json({ likedSongs: [] });
      }
      return res.json({ likedSongs: user.likedSongs || [] });
    } else {
      return res.json({ likedSongs: [] });
    }
  } catch (error) {
    console.error('Error fetching liked songs:', error.message);
    res.status(500).json({ error: 'Failed to fetch liked songs' });
  }
});

/**
 * POST /api/user/like
 * Toggle like for a track (adds if not liked, removes if already liked)
 * Request body: { track: { id, name, artists, albumName, albumArt, audioUrl, duration, genre } }
 */
router.post('/like', requireAuth, async (req, res) => {
  try {
    const { track } = req.body;
    if (!track || (!track.id && !track.name)) {
      return res.status(400).json({ error: 'Invalid track data' });
    }

    const trackId = String(track.id || track.name);

    if (mongoose.connection.readyState === 1) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(req.userId)) {
        user = await User.findById(req.userId);
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.likedSongs) {
        user.likedSongs = [];
      }

      const existingIndex = user.likedSongs.findIndex(
        s => String(s.id) === trackId || (s.name === track.name && s.artists === track.artists)
      );

      let isLiked = false;
      if (existingIndex > -1) {
        // Remove from liked songs
        user.likedSongs.splice(existingIndex, 1);
        isLiked = false;
      } else {
        // Add to liked songs (prepend to front)
        user.likedSongs.unshift({
          id: trackId,
          name: track.name,
          artists: track.artists || 'Artist',
          albumName: track.albumName || '',
          albumArt: track.albumArt || '',
          audioUrl: track.audioUrl || '',
          duration: track.duration || 210000,
          genre: track.genre || 'Music',
          likedAt: new Date()
        });
        isLiked = true;
      }

      await user.save();

      return res.json({
        status: 'success',
        isLiked,
        likedSongs: user.likedSongs
      });
    } else {
      // Offline / fallback mock
      return res.json({
        status: 'success',
        isLiked: true,
        likedSongs: [track]
      });
    }
  } catch (error) {
    console.error('Error toggling track like:', error.message);
    res.status(500).json({ error: 'Failed to update liked songs' });
  }
});

module.exports = router;
