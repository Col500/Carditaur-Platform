export interface PexelsStockProvider {
  name: "pexels";
  apiUrl: "https://api.pexels.com/v1/";
}

// Stores metadata of images we've used to avoid repeating them if logic is enforced
export const usedPexelsImagesMetadata: Array<{ id: string; url: string; usedAt: string }> = [];
