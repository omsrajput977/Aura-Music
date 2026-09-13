import React, { useEffect, useRef } from 'react';
import { useColorExtractor } from '../../hooks/useColorExtractor';

/**
 * Ambient Nebula Canvas Visualizer.
 * Creates an organic, breathing background aurora that dynamically extracts
 * color harmonies from the current track's album artwork and pulses with playback.
 */
export const AmbientNebula = ({ albumArt, isPlaying }) => {
  const canvasRef = useRef(null);
  const colors = useColorExtractor(albumArt);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Nebula cosmic floating orbs
    const orbs = [
      { x: width * 0.3, y: height * 0.4, r: 280, vx: 0.2, vy: 0.15, phase: 0 },
      { x: width * 0.7, y: height * 0.5, r: 340, vx: -0.18, vy: 0.12, phase: Math.PI / 2 },
      { x: width * 0.5, y: height * 0.7, r: 300, vx: 0.12, vy: -0.2, phase: Math.PI },
      { x: width * 0.2, y: height * 0.8, r: 240, vx: -0.1, vy: -0.15, phase: Math.PI * 1.5 },
    ];

    // Star dust particles
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.02 + 0.005
    }));

    let t = 0;

    const render = () => {
      t += isPlaying ? 0.015 : 0.005;
      ctx.clearRect(0, 0, width, height);

      // Deep void background
      ctx.fillStyle = '#07080d';
      ctx.fillRect(0, 0, width, height);

      // Draw flowing nebula orbs
      orbs.forEach((orb, i) => {
        orb.x += orb.vx * (isPlaying ? 1.5 : 0.8);
        orb.y += orb.vy * (isPlaying ? 1.5 : 0.8);

        // Boundary wrap
        if (orb.x < -100) orb.x = width + 100;
        if (orb.x > width + 100) orb.x = -100;
        if (orb.y < -100) orb.y = height + 100;
        if (orb.y > height + 100) orb.y = -100;

        const pulseScale = 1 + Math.sin(t + orb.phase) * (isPlaying ? 0.18 : 0.08);
        const radius = orb.r * pulseScale;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          radius
        );

        const orbColor = i % 2 === 0 ? colors.rgbaPrimary : colors.rgbaSecondary;
        gradient.addColorStop(0, orbColor);
        gradient.addColorStop(0.5, orbColor.replace(/[\d.]+\)$/, '0.12)'));
        gradient.addColorStop(1, 'rgba(7, 8, 13, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Star dust particle field
      stars.forEach(star => {
        star.alpha += Math.sin(t * 2 + star.x) * star.pulse;
        const clampedAlpha = Math.max(0.1, Math.min(0.8, star.alpha));
        ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [albumArt, isPlaying, colors]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Radial vignette overlay */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />
    </div>
  );
};
