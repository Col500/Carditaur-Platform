import { BusinessProfile, Occasion, ScoredOccasion, RecommendationResult } from './types';
import { OCCASIONS_DATASET } from './dataset';

const WEIGHTS = {
  COUNTRY_MATCH: 15, // High priority if the country is explicitly listed, or "Global"
  INDUSTRY_MATCH: 10,
  MANDATORY_BONUS: 20,
  BUSINESS_TYPE_MATCH: 8,
  BRAND_TONE_MATCH: 5,
};

function calculateScore(occasion: Occasion, profile: BusinessProfile): number {
  let score = 0;

  // 1. Country Match
  if (occasion.countries.includes("Global") || occasion.countries.includes(profile.country)) {
    score += WEIGHTS.COUNTRY_MATCH;
  }

  // 2. Industry Match
  if (occasion.recommendedIndustries.includes("All") || occasion.recommendedIndustries.includes(profile.industry)) {
    score += WEIGHTS.INDUSTRY_MATCH;
  }

  // 3. Business Type Match
  if (occasion.targetBusinessTypes === "All" || occasion.targetBusinessTypes === "Both" || occasion.targetBusinessTypes === profile.businessType) {
    score += WEIGHTS.BUSINESS_TYPE_MATCH;
  } else if (profile.businessType === "Both") {
    // If the business targets both, it can participate in B2B or B2C specific occasions
    score += WEIGHTS.BUSINESS_TYPE_MATCH; 
  }

  // 4. Brand Tone Match
  if (occasion.compatibleBrandTones === "All" || occasion.compatibleBrandTones.includes(profile.brandTone)) {
    score += WEIGHTS.BRAND_TONE_MATCH;
  }

  // 5. Global Priority (base point additive)
  score += occasion.globalPriority;

  // 6. Mandatory Bonus
  if (occasion.mandatory) {
    score += WEIGHTS.MANDATORY_BONUS;
  }

  return score;
}

export function recommendOccasions(profile: BusinessProfile, maxResults: number = 15): RecommendationResult {
  const scoredOccasions: ScoredOccasion[] = [];

  for (const occasion of OCCASIONS_DATASET) {
    // Rule: Reject irrelevant occasions (e.g., specific to another country)
    const isGlobal = occasion.countries.includes("Global");
    const isCountryMatch = occasion.countries.includes(profile.country);
    
    if (!isGlobal && !isCountryMatch) {
      continue; // Skip irrelevant country
    }

    const score = calculateScore(occasion, profile);
    scoredOccasions.push({ ...occasion, score });
  }

  // Rank remaining occasions by score (descending)
  scoredOccasions.sort((a, b) => b.score - a.score);

  // Grouping results into: Mandatory, Recommended, Optional
  const mandatory: ScoredOccasion[] = [];
  const recommended: ScoredOccasion[] = [];
  const optional: ScoredOccasion[] = [];

  const topOccasions = scoredOccasions.slice(0, Math.max(12, Math.min(maxResults, 18))); // ensure between 12-18

  // Always include mandatory first, then the rest
  for (const occ of topOccasions) {
    if (occ.mandatory) {
      mandatory.push(occ);
    } else if (occ.score >= WEIGHTS.COUNTRY_MATCH + WEIGHTS.INDUSTRY_MATCH + occ.globalPriority) {
      // Considered strongly recommended if matches core attributes well
      recommended.push(occ);
    } else {
      optional.push(occ);
    }
  }

  // If there are mandatory occasions that somehow didn't make the top slice, we might need to push them in, 
  // but since they have the highest bonus, they will naturally be at the top of the sorted list.

  return { mandatory, recommended, optional };
}
