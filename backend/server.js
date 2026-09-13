const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:5173';

// Connect to Database
connectDB();

// Middleware Configuration
app.use(cors({
  origin: [FRONTEND_URI, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Authentication Routes
app.use('/api/auth', authRouter);

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    port: PORT,
    frontendUri: FRONTEND_URI
  });
});

// Decrypts 320kbps full-length song URLs using DES-ECB
function decryptSaavnMediaUrl(encryptedUrl) {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse("38346591");
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url) return null;
    return url.replace('_96.mp4', '_320.mp4');
  } catch (err) {
    return null;
  }
}

function unescapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Endpoint: /api/music/search
 * Searches full-length songs (Indian & Global) with 320kbps audio streams.
 */
app.get('/api/music/search', async (req, res) => {
  const query = req.query.q;
  const limit = Math.min(30, Number(req.query.limit) || 16);

  if (!query || !query.trim()) {
    return res.json([]);
  }

  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&n=${limit}&p=1`;
    const response = await axios.get(searchUrl);
    const results = response.data?.results || [];

    const tracks = results
      .map(track => {
        const streamUrl = decryptSaavnMediaUrl(track.more_info?.encrypted_media_url);
        if (!streamUrl) return null;

        const highResArt = track.image
          ? track.image.replace('150x150.jpg', '500x500.jpg').replace('50x50.jpg', '500x500.jpg')
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

        const durationSec = Number(track.more_info?.duration || track.duration || 180);

        return {
          id: `saavn-${track.id}`,
          name: unescapeHtml(track.title),
          artists: unescapeHtml(track.more_info?.singers || track.more_info?.music || track.subtitle || 'Artist'),
          albumName: unescapeHtml(track.more_info?.album || 'Single'),
          albumArt: highResArt,
          audioUrl: streamUrl,
          duration: durationSec * 1000,
          genre: track.language || 'Music',
          source: 'full_stream'
        };
      })
      .filter(Boolean);

    res.json(tracks);
  } catch (err) {
    console.error('[Music Search API Error]:', err.message);
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
});

/**
 * Endpoint: /api/music/trending
 * Top trending full-length songs.
 */
app.get('/api/music/trending', async (req, res) => {
  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=Kesariya&_format=json&_marker=0&api_version=4&n=12&p=1`;
    const response = await axios.get(searchUrl);
    const results = response.data?.results || [];

    const tracks = results
      .map(track => {
        const streamUrl = decryptSaavnMediaUrl(track.more_info?.encrypted_media_url);
        if (!streamUrl) return null;

        const highResArt = track.image
          ? track.image.replace('150x150.jpg', '500x500.jpg')
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

        return {
          id: `saavn-${track.id}`,
          name: unescapeHtml(track.title),
          artists: unescapeHtml(track.more_info?.singers || track.more_info?.music || track.subtitle || 'Artist'),
          albumName: unescapeHtml(track.more_info?.album || 'Single'),
          albumArt: highResArt,
          audioUrl: streamUrl,
          duration: Number(track.more_info?.duration || 180) * 1000,
          genre: track.language || 'Music',
          source: 'full_stream'
        };
      })
      .filter(Boolean);

    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: 'Trending failed', message: err.message });
  }
});

// Start the Express Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🎵 AURA High-Fidelity Music Engine running on port ${PORT}`);
  console.log(`🔗 Health Check:    http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend Origin: ${FRONTEND_URI}`);
  console.log('====================================================');
});
