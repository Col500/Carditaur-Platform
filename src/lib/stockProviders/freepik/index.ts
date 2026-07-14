export interface FreepikStockProvider {
  name: "freepik";
  apiUrl: "https://api.freepik.com/v1/";
}

// Stores metadata of images we've used to avoid repeating them if logic is enforced
export const usedFreepikImagesMetadata: Array<{ id: string; url: string; usedAt: string }> = [];
