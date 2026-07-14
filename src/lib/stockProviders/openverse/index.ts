export interface OpenverseStockProvider {
  name: "openverse";
  apiUrl: "https://api.openverse.org/v1/";
}

// Stores metadata of images we've used to avoid repeating them if logic is enforced
export const usedOpenverseImagesMetadata: Array<{ id: string; url: string; usedAt: string }> = [];
