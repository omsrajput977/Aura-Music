import { useState, useEffect } from 'react';

/**
 * Extracts dominant and accent colors from an album art image URL.
 * Falls back to ambient palettes if CORS or network prevents direct canvas sampling.
 */
export const useColorExtractor = (imageUrl) => {
  const [colors, setColors] = useState({
    primary: '#1ed760',
    secondary: '#00f2fe',
    dark: '#07080d',
    rgbaPrimary: 'rgba(30, 215, 96, 0.4)',
    rgbaSecondary: 'rgba(0, 242, 254, 0.25)',
    gradient: 'radial-gradient(circle at 50% 40%, rgba(30, 215, 96, 0.35) 0%, rgba(0, 242, 254, 0.15) 45%, #07080d 90%)'
  });

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 40;
        canvas.height = 40;
        ctx.drawImage(img, 0, 0, 40, 40);

        const imageData = ctx.getImageData(0, 0, 40, 40).data;
        let r = 0, g = 0, b = 0;
        let r2 = 0, g2 = 0, b2 = 0;
        let count = 0;

        for (let i = 0; i < imageData.length; i += 16) {
          const red = imageData[i];
          const green = imageData[i + 1];
          const blue = imageData[i + 2];
          
          // Avoid too dark or too white pixels
          const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
          if (brightness > 30 && brightness < 220) {
            r += red;
            g += green;
            b += blue;
            count++;
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);

          // Complementary or shifted accent
          r2 = Math.min(255, Math.round(r * 0.7 + 50));
          g2 = Math.min(255, Math.round(g * 0.9 + 30));
          b2 = Math.min(255, Math.round(b * 1.3 + 60));

          setColors({
            primary: `rgb(${r}, ${g}, ${b})`,
            secondary: `rgb(${r2}, ${g2}, ${b2})`,
            dark: '#07080d',
            rgbaPrimary: `rgba(${r}, ${g}, ${b}, 0.45)`,
            rgbaSecondary: `rgba(${r2}, ${g2}, ${b2}, 0.25)`,
            gradient: `radial-gradient(circle at 50% 40%, rgba(${r}, ${g}, ${b}, 0.4) 0%, rgba(${r2}, ${g2}, ${b2}, 0.2) 50%, #07080d 90%)`
          });
        }
      } catch (err) {
        // In case of strict CORS restrictions on CDN images, derive from string hash
        let hash = 0;
        for (let i = 0; i < imageUrl.length; i++) {
          hash = imageUrl.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        setColors({
          primary: `hsl(${hue}, 80%, 55%)`,
          secondary: `hsl(${(hue + 60) % 360}, 75%, 50%)`,
          dark: '#07080d',
          rgbaPrimary: `hsla(${hue}, 80%, 55%, 0.4)`,
          rgbaSecondary: `hsla(${(hue + 60) % 360}, 75%, 50%, 0.2)`,
          gradient: `radial-gradient(circle at 50% 40%, hsla(${hue}, 80%, 55%, 0.35) 0%, hsla(${(hue + 60) % 360}, 75%, 50%, 0.15) 50%, #07080d 90%)`
        });
      }
    };
  }, [imageUrl]);

  return colors;
};
