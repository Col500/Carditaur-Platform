import { BusinessProfile, RecommendationResult } from './types';
import { recommendOccasions } from './algorithm';

export class RecommendationService {
  /**
   * Generates occasion recommendations for a given business profile.
   * 
   * @param profile The business profile to generate recommendations for
   * @param maxResults The maximum number of recommendations to return (default 15)
   * @returns RecommendationResult containing mandatory, recommended, and optional groups
   */
  static getRecommendations(profile: BusinessProfile, maxResults: number = 15): RecommendationResult {
    return recommendOccasions(profile, maxResults);
  }
}
