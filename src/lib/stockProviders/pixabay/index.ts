export interface PixabayStockProvider {
  name: "pixabay";
  apiUrl: "https://pixabay.com/api/";
}

// Stores metadata of images we've used to avoid repeating them if logic is enforced
export const usedPixabayImagesMetadata: Array<{ id: string; url: string; usedAt: string }> = [];
