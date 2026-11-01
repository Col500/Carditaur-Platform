/**
 * Image processing utilities for background removal and alpha masking
 */

export async function removeImageBackground(
  imageUrl: string,
  tolerance: number = 35
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Sample border and corner pixels to detect solid background colors
        const sampleCoords = [
          [0, 0],
          [width - 1, 0],
          [0, height - 1],
          [width - 1, height - 1],
          [Math.floor(width / 2), 0],
          [Math.floor(width / 2), height - 1],
          [0, Math.floor(height / 2)],
          [width - 1, Math.floor(height / 2)],
          [Math.min(5, width - 1), Math.min(5, height - 1)],
          [Math.max(0, width - 6), Math.min(5, height - 1)],
          [Math.min(5, width - 1), Math.max(0, height - 6)],
          [Math.max(0, width - 6), Math.max(0, height - 6)],
        ];

        const bgSamples: { r: number; g: number; b: number }[] = [];
        for (const [x, y] of sampleCoords) {
          const idx = (y * width + x) * 4;
          const a = data[idx + 3];
          if (a > 30) {
            bgSamples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
          }
        }

        // If corners are already transparent, return as-is
        if (bgSamples.length === 0) {
          resolve(canvas.toDataURL('image/png'));
          return;
        }

        // Compute average background color
        const avgBg = bgSamples.reduce(
          (acc, c) => ({
            r: acc.r + c.r / bgSamples.length,
            g: acc.g + c.g / bgSamples.length,
            b: acc.b + c.b / bgSamples.length,
          }),
          { r: 0, g: 0, b: 0 }
        );

        const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
          return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
        };

        // BFS flood fill from outer border pixels to avoid erasing internal elements
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        // Seed all border pixels
        for (let x = 0; x < width; x++) {
          queue.push(x, 0);
          queue.push(x, height - 1);
          visited[0 * width + x] = 1;
          visited[(height - 1) * width + x] = 1;
        }
        for (let y = 1; y < height - 1; y++) {
          queue.push(0, y);
          queue.push(width - 1, y);
          visited[y * width + 0] = 1;
          visited[y * width + (width - 1)] = 1;
        }

        let head = 0;
        while (head < queue.length) {
          const px = queue[head++];
          const py = queue[head++];
          const idx = (py * width + px) * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a === 0) continue;

          // Compute distance to background samples
          let minDistance = colorDist(r, g, b, avgBg.r, avgBg.g, avgBg.b);
          for (const bg of bgSamples) {
            const d = colorDist(r, g, b, bg.r, bg.g, bg.b);
            if (d < minDistance) minDistance = d;
          }

          // Tolerance check with smart white/black thresholds
          const isNearWhite = r > 235 && g > 235 && b > 235 && (avgBg.r > 210 && avgBg.g > 210 && avgBg.b > 210);
          const isNearBlack = r < 20 && g < 20 && b < 20 && (avgBg.r < 30 && avgBg.g < 30 && avgBg.b < 30);

          if (minDistance <= tolerance || isNearWhite || isNearBlack) {
            // Anti-aliased alpha ramping at boundaries
            if (minDistance < tolerance * 0.6) {
              data[idx + 3] = 0;
            } else {
              const alphaFactor = (minDistance - tolerance * 0.6) / (tolerance * 0.4);
              data[idx + 3] = Math.max(0, Math.min(255, Math.round(255 * alphaFactor)));
            }

            // Expand 4-directional neighbors
            if (px + 1 < width && !visited[py * width + (px + 1)]) {
              visited[py * width + (px + 1)] = 1;
              queue.push(px + 1, py);
            }
            if (px - 1 >= 0 && !visited[py * width + (px - 1)]) {
              visited[py * width + (px - 1)] = 1;
              queue.push(px - 1, py);
            }
            if (py + 1 < height && !visited[(py + 1) * width + px]) {
              visited[(py + 1) * width + px] = 1;
              queue.push(px, py + 1);
            }
            if (py - 1 >= 0 && !visited[(py - 1) * width + px]) {
              visited[(py - 1) * width + px] = 1;
              queue.push(px, py - 1);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error removing image background:', err);
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
}
