# A U R A // Spatial Vinyl & Ambient Music Experience

> A high-fidelity, direct-drive interactive vinyl turntable and ambient harmonic music portal featuring full-length 320kbps CD-quality audio streaming, custom playlists, and responsive mobile-first design.

---

## Features

- **Direct-Drive Vinyl Turntable Engine**:
  - Realistic rotating vinyl grooves, holographic light sheens, and dual-speed 33⅓ & 45 RPM mechanics.
  - Interactive tonearm physics with smooth cueing, tracking, and needle-drop animations.
  - Full-circle album art display and local MP3 drop support.
- **Full-Length 320kbps Audio Streaming**:
  - Continuous, full-length 3-6 minute CD-quality music streaming with zero previews or cutoffs.
  - Catalog includes Bollywood, Hindi, Punjabi, and international hits, plus real-time search.
- **Custom Playlists Hub**:
  - Create unlimited playlists with zero song limits (>30+ tracks supported).
  - Add tracks on-the-fly, remove tracks, and delete playlists with persistent local storage.
  - Dedicated custom playlist playback queue mode.
- **Constellation Orbit Library & Queue**:
  - Fast visual constellation library with instant track selection.
  - Interactive playback queue manager with reordering and removal controls.
- **Responsive Touch Ergonomics**:
  - Tailored for mobile devices (iPhone, Android) and desktop screens with dynamic safe areas.
  - Strictly non-scrollable, zero-clipping viewports for both the landing portal and main player HUD.
- **Standalone & Independent**:
  - 100% decoupled from third-party login hurdles. Ready to spin with zero subscriptions.

---

## Tech Stack

- **Frontend**:
  - React 18, Vite
  - Tailwind CSS, Lucide Icons, Canvas Confetti
  - Web Audio API, HTML5 Audio Engine
- **Backend**:
  - Node.js, Express
  - High-speed stream proxy and search engine
  - CORS, dotenv

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd Music
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

1. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5001
   ```

2. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:5173
   ```

---

## License
MIT License
