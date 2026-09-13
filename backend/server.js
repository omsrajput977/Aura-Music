const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

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

// Authentication & User Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

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

/**
 * Endpoint: /api/music/shelves
 * Full Spotify-grade categorized home shelves with 320kbps CD audio streams.
 */
app.get('/api/music/shelves', (req, res) => {
  const KESARIYA = {
    id: 'full-kesariya',
    name: 'Kesariya',
    artists: 'Pritam, Arijit Singh & Amitabh Bhattacharya',
    albumName: 'Brahmastra',
    albumArt: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
    duration: 268000,
    genre: 'Bollywood'
  };

  const MOCKINGBIRD = {
    id: 'full-mockingbird',
    name: 'Mockingbird',
    artists: 'Eminem',
    albumName: 'Encore',
    albumArt: 'https://c.saavncdn.com/700/Encore-Premiere-Explicit-2004-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/700/f5df39c690d3ada350b29f990a749576_320.mp4',
    duration: 251000,
    genre: 'Hip-Hop'
  };

  const APNA_BANA_LE = {
    id: 'full-apna-bana-le',
    name: 'Apna Bana Le',
    artists: 'Arijit Singh & Sachin-Jigar',
    albumName: 'Bhediya',
    albumArt: 'https://c.saavncdn.com/221/Soulful-Hits-Hindi-2026-20260529163806-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/221/bd21ae43c005057abd232535e5d2173b_320.mp4',
    duration: 261000,
    genre: 'Bollywood'
  };

  const TAUBA_TAUBA = {
    id: 'full-tauba-tauba',
    name: 'Tauba Tauba',
    artists: 'Karan Aujla',
    albumName: 'Bad Newz',
    albumArt: 'https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4',
    duration: 207000,
    genre: 'Punjabi'
  };

  const CHALEYA = {
    id: 'full-chaleya',
    name: 'Chaleya',
    artists: 'Anirudh Ravichander, Arijit Singh & Shilpa Rao',
    albumName: 'Jawan',
    albumArt: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    duration: 200000,
    genre: 'Bollywood'
  };

  const LOVER = {
    id: 'full-lover',
    name: 'Lover',
    artists: 'Diljit Dosanjh',
    albumName: 'MoonChild Era',
    albumArt: 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4',
    duration: 190000,
    genre: 'Punjabi'
  };

  const shelvesData = {
    quickAccess: [
      {
        id: 'qa-liked',
        type: 'liked',
        title: 'Liked Songs',
        isLikedTile: true,
        gradient: 'from-indigo-600 to-purple-800'
      },
      {
        id: 'qa-garba',
        title: 'GARBA NONSTOP',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
        tracks: [TAUBA_TAUBA, LOVER, CHALEYA]
      },
      {
        id: 'qa-emraan',
        title: 'Emraan Hashmi Hits',
        cover: 'https://c.saavncdn.com/221/Soulful-Hits-Hindi-2026-20260529163806-500x500.jpg',
        tracks: [APNA_BANA_LE, KESARIYA, CHALEYA]
      },
      {
        id: 'qa-bollywood',
        title: 'Bollywood Hits 2026',
        cover: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
        tracks: [KESARIYA, CHALEYA, APNA_BANA_LE]
      },
      {
        id: 'qa-punjabi',
        title: 'Punjabi Heat 🔥',
        cover: 'https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg',
        tracks: [TAUBA_TAUBA, LOVER]
      },
      {
        id: 'qa-hiphop',
        title: 'Mockingbird & Rap',
        cover: 'https://c.saavncdn.com/700/Encore-Premiere-Explicit-2004-500x500.jpg',
        tracks: [MOCKINGBIRD]
      },
      {
        id: 'qa-highway',
        title: 'Highway Road Trip',
        cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80',
        tracks: [LOVER, KESARIYA, TAUBA_TAUBA]
      },
      {
        id: 'qa-lofi',
        title: 'Midnight Lo-Fi & Chill',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80',
        tracks: [APNA_BANA_LE, MOCKINGBIRD]
      }
    ],
    jumpBackIn: [
      {
        id: 'jb-1',
        title: 'Catch All Bhojpuri Hits',
        subtitle: 'Cover: Power Star, Pawan Singh & Khesari',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
        tracks: [TAUBA_TAUBA, LOVER, CHALEYA]
      },
      {
        id: 'jb-2',
        title: 'Diljit Dosanjh: All Songs',
        subtitle: 'From soulful melodies to bhangra bangers',
        cover: 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg',
        tracks: [LOVER, TAUBA_TAUBA]
      },
      {
        id: 'jb-3',
        title: 'Navratri Special ✨ Garba 2026',
        subtitle: 'Gujarati garba, Dakla, dandiya, Raas...',
        cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
        tracks: [TAUBA_TAUBA, CHALEYA, LOVER]
      },
      {
        id: 'jb-4',
        title: 'Bhajan Mix',
        subtitle: 'Peaceful devotional & soulful hymns',
        cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
        tracks: [APNA_BANA_LE, KESARIYA]
      },
      {
        id: 'jb-5',
        title: 'Arijit Singh Soul Sanctuary',
        subtitle: 'The ultimate collection of romantic anthems',
        cover: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
        tracks: [KESARIYA, APNA_BANA_LE, CHALEYA]
      }
    ],
    recommendedStations: [
      {
        id: 'st-1',
        title: 'KR$NA Radio',
        subtitle: 'With Bali, Dhanda Nyoliwala, Paradox and more',
        badgeBg: 'bg-emerald-800',
        cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
        tracks: [MOCKINGBIRD, TAUBA_TAUBA]
      },
      {
        id: 'st-2',
        title: 'Arijit Singh Radio',
        subtitle: 'With Pritam, Sachin-Jigar, Atif Aslam',
        badgeBg: 'bg-indigo-900',
        cover: 'https://c.saavncdn.com/221/Soulful-Hits-Hindi-2026-20260529163806-500x500.jpg',
        tracks: [KESARIYA, APNA_BANA_LE, CHALEYA]
      },
      {
        id: 'st-3',
        title: 'Diljit Dosanjh Radio',
        subtitle: 'With Karan Aujla, AP Dhillon, Sidhu Moosewala',
        badgeBg: 'bg-amber-900',
        cover: 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg',
        tracks: [LOVER, TAUBA_TAUBA]
      },
      {
        id: 'st-4',
        title: 'Atif Aslam Radio',
        subtitle: 'With Rahat Fateh Ali Khan, Mithoon',
        badgeBg: 'bg-teal-900',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
        tracks: [KESARIYA, APNA_BANA_LE]
      },
      {
        id: 'st-5',
        title: 'Global Hip-Hop Radio',
        subtitle: 'With Eminem, Drake, Kendrick Lamar',
        badgeBg: 'bg-purple-950',
        cover: 'https://c.saavncdn.com/700/Encore-Premiere-Explicit-2004-500x500.jpg',
        tracks: [MOCKINGBIRD]
      }
    ],
    moreOfWhatYouLike: [
      {
        id: 'mw-1',
        title: 'Trending Now India',
        subtitle: 'Every track you are listening to right now',
        cover: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
        tracks: [CHALEYA, KESARIYA, TAUBA_TAUBA, LOVER]
      },
      {
        id: 'mw-2',
        title: 'Hot Hits Hindi',
        subtitle: 'Hottest Hindi music that India is listening to',
        cover: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
        tracks: [KESARIYA, APNA_BANA_LE, CHALEYA]
      },
      {
        id: 'mw-3',
        title: 'Chai & Classics',
        subtitle: 'A cup of tea served with iconic retro tunes',
        cover: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        tracks: [KESARIYA, APNA_BANA_LE]
      },
      {
        id: 'mw-4',
        title: 'Safar Mix',
        subtitle: 'A perfect travel soundtrack for your journey',
        cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
        tracks: [LOVER, KESARIYA, TAUBA_TAUBA]
      },
      {
        id: 'mw-5',
        title: 'Bollywood Bhakti',
        subtitle: 'Blissful aartis, bhajans & spiritual songs',
        cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
        tracks: [APNA_BANA_LE, KESARIYA]
      },
      {
        id: 'mw-6',
        title: "India's Rap Scene",
        subtitle: 'Underground bars, street beats & lyrical heat',
        cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
        tracks: [MOCKINGBIRD, TAUBA_TAUBA]
      }
    ]
  };

  res.json(shelvesData);
});

// Start the Express Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🎵 AURA High-Fidelity Music Engine running on port ${PORT}`);
  console.log(`🔗 Health Check:    http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend Origin: ${FRONTEND_URI}`);
  console.log('====================================================');
});
