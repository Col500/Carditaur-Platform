export type BusinessType = 'B2B' | 'B2C' | 'Both';
export type BrandTone = 'corporate' | 'friendly' | 'playful' | 'premium';

export interface BusinessProfile {
  businessName: string;
  industry: string;
  country: string;
  businessType: BusinessType;
  brandTone: BrandTone;
}

export interface Occasion {
  id: string;
  name: string;
  category?: string;
  date?: string;
  is_dynamic_date?: boolean;
  countries: string[]; // e.g., ["Global"] or ["Nigeria", "United States"]
  globalPriority: number; // 1-10
  recommendedIndustries: string[]; // e.g., ["Logistics & Delivery", "All"]
  targetBusinessTypes: BusinessType | 'All';
  compatibleBrandTones: BrandTone[] | 'All';
  mandatory: boolean;
}

export interface ScoredOccasion extends Occasion {
  score: number;
}

export interface RecommendationResult {
  mandatory: ScoredOccasion[];
  recommended: ScoredOccasion[];
  optional: ScoredOccasion[];
}
