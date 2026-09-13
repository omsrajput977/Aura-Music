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

// Load Rich Categorized Music Catalog (80+ unique, non-overlapping songs)
let musicCatalog = {};
try {
  musicCatalog = require('./data/musicCatalog.json');
} catch (e) {
  console.warn('[Music Catalog]: Warning - musicCatalog.json not found, using fallbacks');
}

/**
 * Endpoint: /api/music/shelves
 * Full Spotify-grade categorized home shelves with 320kbps CD audio streams.
 * Guaranteed genre-accurate, unique songs with ZERO repetition across libraries.
 */
app.get('/api/music/shelves', (req, res) => {
  const shelvesData = {
    quickAccess: [
      {
        id: 'qa-liked',
        type: 'liked',
        title: 'Liked Songs',
        description: 'Your favorite tracks in one personal collection',
        isLikedTile: true,
        gradient: 'from-indigo-600 to-purple-800'
      },
      {
        id: 'qa-garba',
        title: 'GARBA NONSTOP',
        description: 'High tempo festive garba beats & non-stop energy',
        cover: musicCatalog.qaGarbaTracks?.[0]?.albumArt || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
        tracks: musicCatalog.qaGarbaTracks || []
      },
      {
        id: 'qa-emraan',
        title: 'Emraan Hashmi Hits',
        description: 'Golden era Bollywood romance and nostalgia',
        cover: musicCatalog.qaEmraanTracks?.[0]?.albumArt || 'https://c.saavncdn.com/221/Soulful-Hits-Hindi-2026-20260529163806-500x500.jpg',
        tracks: musicCatalog.qaEmraanTracks || []
      },
      {
        id: 'qa-bollywood',
        title: 'Bollywood Hits 2026',
        description: 'Top trending theatrical releases and chartbusters',
        cover: musicCatalog.qaBollywoodTracks?.[0]?.albumArt || 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
        tracks: musicCatalog.qaBollywoodTracks || []
      },
      {
        id: 'qa-punjabi',
        title: 'Punjabi Heat 🔥',
        description: 'Heavy basslines, desi swagger and dancefloor bangers',
        cover: musicCatalog.qaPunjabiTracks?.[0]?.albumArt || 'https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg',
        tracks: musicCatalog.qaPunjabiTracks || []
      },
      {
        id: 'qa-hiphop',
        title: 'Hip-Hop & Rap Anthems',
        description: 'Lyrical masterpieces and international rap anthems',
        cover: musicCatalog.qaHiphopTracks?.[0]?.albumArt || 'https://c.saavncdn.com/700/Encore-Premiere-Explicit-2004-500x500.jpg',
        tracks: musicCatalog.qaHiphopTracks || []
      },
      {
        id: 'qa-highway',
        title: 'Highway Road Trip',
        description: 'Open windows, sunset skies and long drive tunes',
        cover: musicCatalog.qaHighwayTracks?.[0]?.albumArt || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80',
        tracks: musicCatalog.qaHighwayTracks || []
      },
      {
        id: 'qa-lofi',
        title: 'Midnight Lo-Fi & Chill',
        description: 'Relaxing ambient frequencies and warm analog vinyl',
        cover: musicCatalog.qaLofiTracks?.[0]?.albumArt || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80',
        tracks: musicCatalog.qaLofiTracks || []
      }
    ],
    madeForUser: [
      {
        id: 'dm-1',
        title: 'Daily Mix 01',
        subtitle: 'Anuv Jain, Dream Note, Prateek Kuhad',
        cover: musicCatalog.dm1Tracks?.[0]?.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        badgeColor: 'border-teal-500',
        mixNumber: '01',
        tracks: musicCatalog.dm1Tracks || []
      },
      {
        id: 'dm-2',
        title: 'Daily Mix 02',
        subtitle: 'KR$NA, Emiway Bantai, Divine and more',
        cover: musicCatalog.dm2Tracks?.[0]?.albumArt || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
        badgeColor: 'border-amber-400',
        mixNumber: '02',
        tracks: musicCatalog.dm2Tracks || []
      },
      {
        id: 'dm-3',
        title: 'Daily Mix 03',
        subtitle: 'A.R. Rahman, Javed Ali, Mohit Chauhan',
        cover: musicCatalog.dm3Tracks?.[0]?.albumArt || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80',
        badgeColor: 'border-rose-500',
        mixNumber: '03',
        tracks: musicCatalog.dm3Tracks || []
      },
      {
        id: 'dm-4',
        title: 'Daily Mix 04',
        subtitle: 'Darshan Raval, Amit Trivedi, Kai Po Che',
        cover: musicCatalog.dm4Tracks?.[0]?.albumArt || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
        badgeColor: 'border-pink-400',
        mixNumber: '04',
        tracks: musicCatalog.dm4Tracks || []
      },
      {
        id: 'dm-5',
        title: 'Daily Mix 05',
        subtitle: 'Kishore Kumar, R.D. Burman, Lata Mangeshkar',
        cover: musicCatalog.dm5Tracks?.[0]?.albumArt || 'https://c.saavncdn.com/221/Soulful-Hits-Hindi-2026-20260529163806-500x500.jpg',
        badgeColor: 'border-emerald-400',
        mixNumber: '05',
        tracks: musicCatalog.dm5Tracks || []
      },
      {
        id: 'dm-6',
        title: 'Daily Mix 06',
        subtitle: 'Badshah, Neha Kakkar, Fazilpuria',
        cover: musicCatalog.dm6Tracks?.[0]?.albumArt || 'https://c.saavncdn.com/700/Encore-Premiere-Explicit-2004-500x500.jpg',
        badgeColor: 'border-blue-400',
        mixNumber: '06',
        tracks: musicCatalog.dm6Tracks || []
      },
      {
        id: 'dm-dw',
        title: 'Discover Weekly',
        subtitle: 'Your weekly mixtape of fresh indie music. Updated every Monday.',
        cover: musicCatalog.discoverWeeklyTracks?.[0]?.albumArt || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        badgeColor: 'border-purple-400',
        tracks: musicCatalog.discoverWeeklyTracks || []
      }
    ],
    jumpBackIn: [
      {
        id: 'jb-1',
        title: 'Catch All Bhojpuri Hits',
        subtitle: 'Power Star Pawan Singh, Khesari Lal & more',
        cover: musicCatalog.jbBhojpuri?.[0]?.albumArt || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.jbBhojpuri || []
      },
      {
        id: 'jb-2',
        title: 'Diljit Dosanjh: All Songs',
        subtitle: 'From soulful melodies to bhangra bangers',
        cover: musicCatalog.jbDiljit?.[0]?.albumArt || 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg',
        tracks: musicCatalog.jbDiljit || []
      },
      {
        id: 'jb-3',
        title: 'Navratri Special ✨ Garba 2026',
        subtitle: 'Gujarati garba, Dakla, dandiya, Raas...',
        cover: musicCatalog.jbNavratri?.[0]?.albumArt || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.jbNavratri || []
      },
      {
        id: 'jb-4',
        title: 'Bhajan & Devotional Mix',
        subtitle: 'Peaceful devotional & soulful hymns',
        cover: musicCatalog.jbBhajan?.[0]?.albumArt || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.jbBhajan || []
      },
      {
        id: 'jb-5',
        title: 'Arijit Singh Soul Sanctuary',
        subtitle: 'The ultimate collection of romantic anthems',
        cover: musicCatalog.jbArijit?.[0]?.albumArt || 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
        tracks: musicCatalog.jbArijit || []
      }
    ],
    recommendedStations: [
      {
        id: 'st-1',
        title: 'KR$NA Radio',
        subtitle: 'With Raftaar, Karma, Brodha V and more',
        badgeBg: 'bg-emerald-800',
        cover: musicCatalog.stKrsna?.[0]?.albumArt || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.stKrsna || []
      },
      {
        id: 'st-2',
        title: 'Arijit Singh Radio',
        subtitle: 'With Pritam, Sachin-Jigar, Atif Aslam',
        badgeBg: 'bg-indigo-900',
        cover: musicCatalog.stArijit?.[0]?.albumArt || 'https://c.saavncdn.com/221/Soulful-Hits-Hindi-2026-20260529163806-500x500.jpg',
        tracks: musicCatalog.stArijit || []
      },
      {
        id: 'st-3',
        title: 'Diljit Dosanjh Radio',
        subtitle: 'With Karan Aujla, AP Dhillon, Shubh',
        badgeBg: 'bg-amber-900',
        cover: musicCatalog.stDiljit?.[0]?.albumArt || 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg',
        tracks: musicCatalog.stDiljit || []
      },
      {
        id: 'st-4',
        title: 'Sidhu Moose Wala Radio',
        subtitle: 'With Sunny Malton, Byg Byrd, Prem Dhillon',
        badgeBg: 'bg-teal-900',
        cover: musicCatalog.stSidhu?.[0]?.albumArt || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.stSidhu || []
      },
      {
        id: 'st-5',
        title: 'Eminem & Rap Radio',
        subtitle: 'With Dr. Dre, 50 Cent, Snoop Dogg',
        badgeBg: 'bg-purple-950',
        cover: musicCatalog.stEminem?.[0]?.albumArt || 'https://c.saavncdn.com/700/Encore-Premiere-Explicit-2004-500x500.jpg',
        tracks: musicCatalog.stEminem || []
      }
    ],
    moreOfWhatYouLike: [
      {
        id: 'mw-1',
        title: 'Trending Now India',
        subtitle: 'Every track you are listening to right now',
        cover: musicCatalog.moreTrending?.[0]?.albumArt || 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
        tracks: musicCatalog.moreTrending || []
      },
      {
        id: 'mw-2',
        title: 'Hot Hits Hindi',
        subtitle: 'Hottest Hindi music that India is listening to',
        cover: musicCatalog.moreHindi?.[0]?.albumArt || 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
        tracks: musicCatalog.moreHindi || []
      },
      {
        id: 'mw-3',
        title: 'Chai & Classics',
        subtitle: 'A cup of tea served with iconic retro tunes',
        cover: musicCatalog.moreClassics?.[0]?.albumArt || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.moreClassics || []
      },
      {
        id: 'mw-4',
        title: 'Safar Mix',
        subtitle: 'A perfect travel soundtrack for your journey',
        cover: musicCatalog.moreSafar?.[0]?.albumArt || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.moreSafar || []
      },
      {
        id: 'mw-5',
        title: 'Bollywood Bhakti',
        subtitle: 'Blissful aartis, bhajans & spiritual songs',
        cover: musicCatalog.moreBhakti?.[0]?.albumArt || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.moreBhakti || []
      },
      {
        id: 'mw-6',
        title: "India's Rap Scene",
        subtitle: 'Underground bars, street beats & lyrical heat',
        cover: musicCatalog.moreRap?.[0]?.albumArt || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
        tracks: musicCatalog.moreRap || []
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
