/**
 * Robust Client-Side Logo Palette Extractor
 * Samples colors from uploaded logo images using HTML5 Canvas,
 * filters out transparent, near-white, and near-black background pixels,
 * clusters dominant hues, and returns up to 5 distinctive brand colors.
 */

export function extractColorsFromImage(
  dataUrl: string,
  callback: (palette: string[], primary: string, accent: string) => void
) {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        callback(['#1E824C', '#45B1E8', '#E8B14A', '#8854D0', '#2C3E50'], '#1E824C', '#45B1E8');
        return;
      }

      // Resize canvas for efficient sampling (e.g. 100x100 max)
      const maxDim = 120;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imgData = ctx.getImageData(0, 0, width, height).data;
      const colorCounts: { [hex: string]: { r: number; g: number; b: number; count: number } } = {};

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        // Skip transparent or semi-transparent pixels
        if (a < 128) continue;

        // Skip extreme white/near-white backgrounds (e.g. RGB > 245)
        if (r > 240 && g > 240 && b > 240) continue;

        // Skip extreme black/near-black backgrounds (e.g. RGB < 15) unless that's all there is
        const isNearBlack = r < 20 && g < 20 && b < 20;

        // Quantize colors to reduce noise (step of 16)
        const qR = Math.round(r / 16) * 16;
        const qG = Math.round(g / 16) * 16;
        const qB = Math.round(b / 16) * 16;

        const hex = `#${((1 << 24) + (qR << 16) + (qG << 8) + qB).toString(16).slice(1).toUpperCase()}`;

        if (!colorCounts[hex]) {
          colorCounts[hex] = { r: qR, g: qG, b: qB, count: isNearBlack ? 0.2 : 1 };
        } else {
          colorCounts[hex].count += isNearBlack ? 0.2 : 1;
        }
      }

      // Sort by frequency
      const sortedColors = Object.values(colorCounts).sort((a, b) => b.count - a.count);

      // Select up to 5 distinct colors (ensuring minimum color distance)
      const selected: string[] = [];
      const isDistinct = (r: number, g: number, b: number) => {
        for (const hex of selected) {
          const sr = parseInt(hex.slice(1, 3), 16);
          const sg = parseInt(hex.slice(3, 5), 16);
          const sb = parseInt(hex.slice(5, 7), 16);
          // Euclidean color distance
          const dist = Math.sqrt((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2);
          if (dist < 45) return false;
        }
        return true;
      };

      for (const col of sortedColors) {
        if (selected.length >= 5) break;
        if (isDistinct(col.r, col.g, col.b)) {
          const hex = `#${((1 << 24) + (col.r << 16) + (col.g << 8) + col.b).toString(16).slice(1).toUpperCase()}`;
          selected.push(hex);
        }
      }

      // If fewer than 5, supplement with balanced harmonious accents
      const fallbackBrandPalette = ['#1E824C', '#45B1E8', '#E8B14A', '#8854D0', '#2C3E50', '#E52B50'];
      for (const fb of fallbackBrandPalette) {
        if (selected.length >= 5) break;
        if (!selected.includes(fb)) {
          selected.push(fb);
        }
      }

      const primary = selected[0] || '#1E824C';
      const accent = selected[1] || selected[0] || '#45B1E8';

      callback(selected.slice(0, 5), primary, accent);
    } catch (err) {
      console.warn('Color extraction fallback triggered:', err);
      callback(['#1E824C', '#45B1E8', '#E8B14A', '#8854D0', '#2C3E50'], '#1E824C', '#45B1E8');
    }
  };

  img.onerror = () => {
    callback(['#1E824C', '#45B1E8', '#E8B14A', '#8854D0', '#2C3E50'], '#1E824C', '#45B1E8');
  };

  img.src = dataUrl;
}
