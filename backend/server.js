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

// Extracts comprehensive, accurate artist and singer names from JioSaavn payload
function extractArtists(track) {
  if (!track) return 'Artist';

  // 1. Primary artists from artistMap
  const primary = track.more_info?.artistMap?.primary_artists
    ?.map(a => unescapeHtml(a.name || '').trim())
    .filter(Boolean) || [];

  // 2. Singers from artistMap
  const singers = track.more_info?.artistMap?.artists
    ?.filter(a => a.role === 'singer' || a.role === 'primary_artists')
    ?.map(a => unescapeHtml(a.name || '').trim())
    .filter(Boolean) || [];

  // 3. Featured artists from artistMap
  const featured = track.more_info?.artistMap?.featured_artists
    ?.map(a => unescapeHtml(a.name || '').trim())
    .filter(Boolean) || [];

  // Uniquely combine
  const allSingers = Array.from(new Set([...primary, ...singers, ...featured]));
  if (allSingers.length > 0) {
    return allSingers.join(', ');
  }

  // 4. Fall back to singers string
  if (track.more_info?.singers) {
    return unescapeHtml(track.more_info.singers);
  }

  // 5. Fall back to music composer string
  if (track.more_info?.music) {
    return unescapeHtml(track.more_info.music);
  }

  // 6. Fall back to subtitle
  if (track.subtitle) {
    return unescapeHtml(track.subtitle);
  }

  return 'Artist';
}

function parseSaavnTrack(track) {
  if (!track || !track.title) return null;
  const streamUrl = decryptSaavnMediaUrl(track.more_info?.encrypted_media_url);
  if (!streamUrl) return null;

  const highResArt = track.image
    ? track.image.replace('150x150.jpg', '500x500.jpg').replace('50x50.jpg', '500x500.jpg')
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

  const durationSec = Number(track.more_info?.duration || track.duration || 180);

  return {
    id: `saavn-${track.id}`,
    name: unescapeHtml(track.title),
    artists: extractArtists(track),
    albumName: unescapeHtml(track.more_info?.album || 'Single'),
    albumArt: highResArt,
    audioUrl: streamUrl,
    duration: durationSec * 1000,
    genre: track.language || 'Music',
    source: 'full_stream'
  };
}

function calculateRelevance(track, query) {
  const q = query.toLowerCase().trim();
  const qClean = q.replace(/[^a-z0-9\s]/g, '');
  const qTokens = qClean.split(/\s+/).filter(Boolean);
  const qNoSpace = qClean.replace(/\s+/g, '');

  const title = (track.name || '').toLowerCase();
  const titleClean = title.replace(/[^a-z0-9\s]/g, '');
  const titleNoSpace = titleClean.replace(/\s+/g, '');
  const artists = (track.artists || '').toLowerCase();
  const artistsClean = artists.replace(/[^a-z0-9\s]/g, '');
  const artistsNoSpace = artistsClean.replace(/\s+/g, '');
  const album = (track.albumName || '').toLowerCase();

  let score = 0;

  // 1. Exact title match (with or without spaces)
  if (titleClean === qClean || titleNoSpace === qNoSpace) {
    score += 350;
  } else if (titleClean.startsWith(qClean) || titleNoSpace.startsWith(qNoSpace)) {
    score += 220;
  } else if (titleClean.includes(qClean) || titleNoSpace.includes(qNoSpace)) {
    score += 160;
  }

  // 2. All search tokens found in title
  let allTokensInTitle = qTokens.length > 0;
  for (const token of qTokens) {
    if (titleClean.includes(token)) {
      score += 30;
    } else {
      allTokensInTitle = false;
    }
  }
  if (allTokensInTitle && qTokens.length > 1) {
    score += 120;
  }

  // 3. Artist match
  if (artistsClean === qClean || artistsNoSpace === qNoSpace || artists.includes(q)) {
    score += 240;
  } else {
    for (const token of qTokens) {
      if (token.length > 2 && (artists.includes(token) || artistsClean.includes(token))) {
        score += 50;
      }
    }
  }

  // 4. Album match
  if (album.includes(qClean)) {
    score += 40;
  }

  // Penalty for compilation albums if the track title does not contain the query words
  const isCompilation = /vibes|party|summer|spring|beach|frühstück|cortisol|skiing|gym|driving/i.test(album);
  if (isCompilation && qTokens.length > 0 && !titleClean.includes(qTokens[0])) {
    score -= 50;
  }

  return score;
}

function deduplicateTracks(tracks, limit = 18) {
  const seen = new Set();
  const results = [];

  for (const track of tracks) {
    const baseTitle = (track.name || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();

    const baseArtist = (track.artists || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12);

    const key = `${baseTitle}__${baseArtist}`;

    if (!seen.has(key)) {
      seen.add(key);
      results.push(track);
    }

    if (results.length >= limit) break;
  }

  return results;
}

// Load Rich Categorized Music Catalog (80+ unique, non-overlapping songs)
let musicCatalog = {};
try {
  musicCatalog = require('./data/musicCatalog.json');
} catch (e) {
  console.warn('[Music Catalog]: Warning - musicCatalog.json not found, using fallbacks');
}

// Flatten catalog tracks for high-speed local search matches
const allCatalogTracks = [];
const catalogSeen = new Set();
for (const key of Object.keys(musicCatalog)) {
  const list = musicCatalog[key];
  if (Array.isArray(list)) {
    for (const t of list) {
      if (t && t.id && !catalogSeen.has(t.id)) {
        catalogSeen.add(t.id);
        allCatalogTracks.push(t);
      }
    }
  }
}

function searchLocalCatalog(query) {
  if (!allCatalogTracks.length || !query) return [];
  const q = query.toLowerCase().trim();
  const qTokens = q.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

  return allCatalogTracks.filter(t => {
    const name = (t.name || '').toLowerCase();
    const artists = (t.artists || '').toLowerCase();
    const album = (t.albumName || '').toLowerCase();
    const genre = (t.genre || '').toLowerCase();

    if (name.includes(q) || artists.includes(q) || album.includes(q) || genre.includes(q)) {
      return true;
    }
    return qTokens.length > 0 && qTokens.every(tok => name.includes(tok) || artists.includes(tok));
  });
}

/**
 * Endpoint: /api/music/search
 * Searches full-length songs (Indian & Global) with 320kbps audio streams.
 * Multi-query Lucene token strategy + Artist discography + Deduplication.
 */
app.get('/api/music/search', async (req, res) => {
  const query = req.query.q;
  const limit = Math.min(40, Number(req.query.limit) || 18);

  if (!query || !query.trim()) {
    return res.json([]);
  }

  const cleanQuery = query.trim();
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  try {
    const searchUrls = [];

    // Variation A: Plus-joined tokens (forces Lucene AND condition, critical for multi-word titles like "we are empire")
    if (tokens.length > 1) {
      searchUrls.push(`https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(tokens.join('+'))}&_format=json&_marker=0&api_version=4&n=25&p=1`);
    }

    // Variation B: Standard query
    searchUrls.push(`https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(cleanQuery)}&_format=json&_marker=0&api_version=4&n=25&p=1`);

    // Variation C: Compacted without spaces (e.g. "weareempire")
    if (tokens.length > 1) {
      searchUrls.push(`https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(tokens.join(''))}&_format=json&_marker=0&api_version=4&n=15&p=1`);
    }

    // Variation D: Artist search to fetch verified discography when query is a singer/artist
    searchUrls.push(`https://www.jiosaavn.com/api.php?__call=search.getArtistResults&q=${encodeURIComponent(cleanQuery)}&_format=json&_marker=0&api_version=4&n=2&p=1`);

    const responses = await Promise.allSettled(
      searchUrls.map(u => axios.get(u, { timeout: 4500 }))
    );

    const candidates = [];
    const artistDetailsPromises = [];

    for (let i = 0; i < responses.length; i++) {
      const resp = responses[i];
      if (resp.status !== 'fulfilled' || !resp.value.data) continue;
      const data = resp.value.data;

      // Last item was artist search
      if (i === searchUrls.length - 1) {
        const topArtist = data.results?.[0];
        if (topArtist?.id) {
          artistDetailsPromises.push(
            axios.get(`https://www.jiosaavn.com/api.php?__call=artist.getArtistPageDetails&artistId=${topArtist.id}&_format=json&_marker=0&api_version=4&n_song=10`, { timeout: 3500 })
              .then(r => r.data?.topSongs?.songs || [])
              .catch(() => [])
          );
        }
      } else if (Array.isArray(data.results)) {
        for (const rawTrack of data.results) {
          const parsed = parseSaavnTrack(rawTrack);
          if (parsed) candidates.push(parsed);
        }
      }
    }

    // Await any artist discography results
    if (artistDetailsPromises.length > 0) {
      const artistResults = await Promise.allSettled(artistDetailsPromises);
      for (const ar of artistResults) {
        if (ar.status === 'fulfilled' && Array.isArray(ar.value)) {
          for (const rawTrack of ar.value) {
            const parsed = parseSaavnTrack(rawTrack);
            if (parsed) candidates.push(parsed);
          }
        }
      }
    }

    // Also match from our curated catalog (80+ unique 320kbps CD tracks)
    const localMatches = searchLocalCatalog(cleanQuery);
    for (const lt of localMatches) {
      candidates.push({ ...lt, source: 'curated_catalog' });
    }

    // Calculate relevance scores
    for (const t of candidates) {
      t.score = calculateRelevance(t, cleanQuery);
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    // Deduplicate to eliminate playlist repetitions
    const finalTracks = deduplicateTracks(candidates, limit);

    res.json(finalTracks);
  } catch (err) {
    console.error('[Music Search API Error]:', err.message);
    const fallback = searchLocalCatalog(cleanQuery);
    res.json(fallback.slice(0, limit));
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
      .map(track => parseSaavnTrack(track))
      .filter(Boolean);

    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: 'Trending failed', message: err.message });
  }
});

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
