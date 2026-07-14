export interface FlaticonProvider {
  name: "flaticon";
  apiUrl: "https://api.flaticon.com/v3/";
}

// Stores metadata of images we've used to avoid repeating them if logic is enforced
export const usedFlaticonImagesMetadata: Array<{ id: string; url: string; usedAt: string }> = [];
