import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface UseAdaptiveColorProps {
  coverArt: string | null;
  fallbackColor: string;
}

function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(77, 166, 255, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function useAdaptiveColor({ coverArt, fallbackColor }: UseAdaptiveColorProps) {
  const [dominantColor, setDominantColor] = useState<string>(fallbackColor);
  const [dominantColorDim, setDominantColorDim] = useState<string>(() => hexToRgba(fallbackColor, 0.2));
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Fallback on native or if coverArt is missing
    if (Platform.OS !== 'web' || !coverArt) {
      setDominantColor(fallbackColor);
      setDominantColorDim(hexToRgba(fallbackColor, 0.2));
      setIsReady(true);
      return;
    }

    setIsReady(false);

    // Debounce image extraction
    const timer = setTimeout(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = coverArt;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setDominantColor(fallbackColor);
            setDominantColorDim(hexToRgba(fallbackColor, 0.2));
            setIsReady(true);
            return;
          }

          canvas.width = 10;
          canvas.height = 10;
          ctx.drawImage(img, 0, 0, 10, 10);

          const imgData = ctx.getImageData(0, 0, 10, 10).data;
          let rSum = 0;
          let gSum = 0;
          let bSum = 0;
          let count = 0;

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            if (a < 128) continue;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            const saturation = max === 0 ? 0 : delta / max;
            const brightness = max / 255;

            if (saturation > 0.15 && brightness > 0.15 && brightness < 0.85) {
              rSum += r;
              gSum += g;
              bSum += b;
              count++;
            }
          }

          if (count === 0) {
            for (let i = 0; i < imgData.length; i += 4) {
              rSum += imgData[i];
              gSum += imgData[i + 1];
              bSum += imgData[i + 2];
              count++;
            }
          }

          const avgR = Math.round(rSum / count);
          const avgG = Math.round(gSum / count);
          const avgB = Math.round(bSum / count);

          setDominantColor(`rgb(${avgR}, ${avgG}, ${avgB})`);
          setDominantColorDim(`rgba(${avgR}, ${avgG}, ${avgB}, 0.2)`);
          setIsReady(true);
        } catch (e) {
          console.warn('[useAdaptiveColor] Color extraction failed:', e);
          setDominantColor(fallbackColor);
          setDominantColorDim(hexToRgba(fallbackColor, 0.2));
          setIsReady(true);
        }
      };

      img.onerror = () => {
        setDominantColor(fallbackColor);
        setDominantColorDim(hexToRgba(fallbackColor, 0.2));
        setIsReady(true);
      };
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [coverArt, fallbackColor]);

  return { dominantColor, dominantColorDim, isReady };
}
