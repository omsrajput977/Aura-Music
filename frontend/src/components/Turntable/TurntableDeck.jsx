import React, { useRef, useState } from 'react';
import { VinylRecord } from './VinylRecord';
import { ToneArm } from './ToneArm';
import { Sparkles, Disc3, Upload, Music, Plus } from 'lucide-react';

/**
 * Centerpiece Floating Turntable Platter Deck.
 */
export const TurntableDeck = ({
  isPlaying,
  currentTrack,
  rpm = 33,
  onToggleRpm,
  onTogglePlay,
  onDropFile,
  onAddToPlaylist
}) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (onDropFile) onDropFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (onDropFile) onDropFile(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full flex flex-col items-center justify-center p-1 sm:p-4 select-none"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />

      {/* Platter Deck Chassis (Glassmorphism & Obsidian) */}
      <div className={`relative w-full max-w-[340px] xs:max-w-[370px] sm:max-w-xl p-4 xs:p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2.5rem] glass-panel border transition-all duration-700 shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur-3xl ${
        isDragOver ? 'border-neonCyan ring-4 ring-neonCyan/20 scale-[1.01]' : 'border-white/10'
      }`}>
        {/* Subtle Ambient Ring Glow behind platter */}
        <div 
          className={`absolute inset-2 xs:inset-4 sm:inset-6 rounded-[2rem] filter blur-3xl opacity-30 transition-opacity duration-1000 pointer-events-none ${
            isPlaying ? 'opacity-50' : 'opacity-10'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(0,242,254,0.4) 0%, rgba(155,81,224,0.2) 60%, transparent 80%)'
          }}
        />

        {/* Deck Header Bar: Status, Brand, Load Audio & Speed Switch */}
        <div className="flex items-center justify-between w-full mb-3 xs:mb-4 sm:mb-6 z-10 relative gap-2">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              isPlaying ? 'bg-spotifyGreen shadow-[0_0_10px_#1ed760] animate-pulse' : 'bg-slate-600'
            }`} />
            <span className="text-[10px] xs:text-xs font-mono uppercase tracking-widest text-slate-400">
              {isPlaying ? 'DIRECT-DRIVE' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 xs:space-x-2">
            {/* Load Local MP3 Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 xs:space-x-1.5 px-2 xs:px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-neonCyan/40 hover:bg-neonCyan/10 text-[10px] xs:text-[11px] font-mono text-slate-300 hover:text-neonCyan transition-all cursor-pointer"
              title="Drop or choose any local MP3/audio file to play"
            >
              <Upload className="w-3 h-3" />
              <span className="hidden xs:inline">Drop MP3</span>
              <span className="xs:hidden">MP3</span>
            </button>

            {/* RPM Selector Pill */}
            <div className="flex items-center space-x-0.5 xs:space-x-1 p-0.5 xs:p-1 rounded-full bg-black/40 border border-white/10 text-[10px] xs:text-[11px] font-mono">
              <button
                onClick={() => onToggleRpm(33)}
                className={`px-2 xs:px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  rpm === 33
                    ? 'bg-gradient-to-r from-neonCyan to-blue-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                33
              </button>
              <button
                onClick={() => onToggleRpm(45)}
                className={`px-2 xs:px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  rpm === 45
                    ? 'bg-gradient-to-r from-neonAmber to-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                45
              </button>
            </div>
          </div>
        </div>

        {/* Turntable Plinth Centerpiece: Platter + Floating Tonearm */}
        <div className="relative flex items-center justify-center my-1 xs:my-2 w-full">
          {/* The Platter Base with Stroboscope Rim */}
          <div className="relative p-2 xs:p-2.5 sm:p-4 rounded-full bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border-2 border-white/10 shadow-2xl flex items-center justify-center">
            {/* Stroboscope Dots on Rim */}
            <div className="absolute inset-1 rounded-full border border-dashed border-white/20 pointer-events-none opacity-40" />

            {/* Vinyl Record */}
            <VinylRecord
              isPlaying={isPlaying}
              albumArt={currentTrack?.albumArt}
              trackName={currentTrack?.name}
              rpm={rpm}
              onClick={onTogglePlay}
            />
          </div>

          {/* Tonearm Assembly mounted on the plinth */}
          <ToneArm isPlaying={isPlaying} />
        </div>

        {/* Track Title & Artist Plaque below turntable */}
        <div className="mt-3.5 xs:mt-5 text-center z-10 relative max-w-[280px] xs:max-w-[320px] sm:max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Disc3 className={`w-3.5 h-3.5 text-neonCyan ${isPlaying ? 'animate-spin-slow' : ''}`} />
              <span className="text-[11px] text-slate-300 font-medium tracking-wide">
                {currentTrack?.albumName || 'High-Fidelity Audio'}
              </span>
            </div>

            {currentTrack && onAddToPlaylist && (
              <button
                type="button"
                onClick={() => onAddToPlaylist(currentTrack)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-neonCyan/20 text-slate-400 hover:text-neonCyan border border-white/10 hover:border-neonCyan/40 transition-colors text-[11px] font-mono cursor-pointer"
                title="Add current track to custom playlist"
              >
                <Plus className="w-3 h-3" />
                <span>Playlist</span>
              </button>
            )}
          </div>

          <h2 className="text-lg sm:text-2xl font-bold font-display text-white tracking-tight truncate">
            {currentTrack?.name || 'Awaiting Selection'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">
            {currentTrack?.artists || 'Select a track or playlist to spin'}
          </p>
        </div>
      </div>
    </div>
  );
};
