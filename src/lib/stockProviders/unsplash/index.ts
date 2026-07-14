export interface UnsplashStockProvider {
  name: "unsplash";
  apiUrl: "https://api.unsplash.com/";
}

// Stores metadata of images we've used to avoid repeating them if logic is enforced
export const usedUnsplashImagesMetadata: Array<{ id: string; url: string; usedAt: string }> = [];
