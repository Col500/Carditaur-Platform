export interface NounProjectProvider {
  name: "nounproject";
  apiUrl: "https://api.thenounproject.com/";
}

// Stores metadata of images we've used to avoid repeating them if logic is enforced
export const usedNounProjectImagesMetadata: Array<{ id: string; url: string; usedAt: string }> = [];
