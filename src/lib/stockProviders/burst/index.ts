export interface BurstStockProvider {
  name: "burst";
  apiUrl: "https://burst.shopify.com/api/";
}

// Stores metadata of images we've used to avoid repeating them if logic is enforced
export const usedBurstImagesMetadata: Array<{ id: string; url: string; usedAt: string }> = [];
