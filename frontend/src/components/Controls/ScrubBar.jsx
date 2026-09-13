import React, { useState, useEffect } from 'react';

const formatTime = (ms) => {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Holographic scrub bar with seek control.
 */
export const ScrubBar = ({ progressMs = 0, durationMs = 180000, onSeek }) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(progressMs);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(progressMs);
    }
  }, [progressMs, isSeeking]);

  const percentage = durationMs > 0 ? Math.min(100, Math.max(0, (seekValue / durationMs) * 100)) : 0;

  const handleSeekChange = (e) => {
    setSeekValue(Number(e.target.value));
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    if (onSeek) onSeek(seekValue);
  };

  return (
    <div className="w-full flex items-center space-x-2 xs:space-x-3 text-[10px] xs:text-xs font-mono text-slate-400 select-none">
      <span className="w-8 xs:w-10 text-right text-slate-300 font-medium flex-shrink-0">
        {formatTime(isSeeking ? seekValue : progressMs)}
      </span>

      <div className="relative flex-1 flex items-center py-2.5">
        {/* Progress Background Track */}
        <div className="w-full h-1 xs:h-1.5 rounded-full bg-white/10 overflow-hidden relative">
          {/* Active Glowing Fill */}
          <div
            className="h-full bg-gradient-to-r from-neonCyan via-cyan-400 to-spotifyGreen rounded-full shadow-[0_0_10px_rgba(0,242,254,0.6)] transition-all duration-100"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range Slider for Interaction */}
        <input
          type="range"
          min="0"
          max={durationMs || 100}
          value={seekValue}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onChange={handleSeekChange}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <span className="w-8 xs:w-10 text-left text-slate-500 flex-shrink-0">
        {formatTime(durationMs)}
      </span>
    </div>
  );
};
