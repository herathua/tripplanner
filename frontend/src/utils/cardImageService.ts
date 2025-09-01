import imageService from '../services/imageService';

export interface CardImageOptions {
  destination?: string;
  activity?: string;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  type?: 'trip' | 'guide';
}

/**
 * Get a suitable image for trip or guide cards
 * This service automatically selects appropriate images based on context
 */
export class CardImageService {
  /**
   * Get a suitable image for a trip card
   * @param destination - The destination name (e.g., "Tokyo", "Paris")
   * @param activity - Optional activity type (e.g., "beach", "mountain", "city")
   * @returns Promise with image URL and metadata
   */
  static async getTripCardImage(destination: string, activity?: string): Promise<{
    url: string;
    alt: string;
    credit: string;
  }> {
    try {
      // Try to get destination-specific images first
      const searchQuery = activity 
        ? `${destination} ${activity} travel`
        : `${destination} travel destination`;
      
      const searchResult = await imageService.searchImages(searchQuery, 1, 5);
      
      if (searchResult.results.length > 0) {
        const image = searchResult.results[0];
        return {
          url: image.urls.regular,
          alt: image.alt_description || `${destination} travel destination`,
          credit: `Photo by ${image.user.name} on Unsplash`
        };
      }
      
      // Fallback to general travel images if destination-specific not found
      const fallbackImages = await imageService.getTravelDestinationImages(5);
      if (fallbackImages.length > 0) {
        const image = fallbackImages[0];
        return {
          url: image.urls.regular,
          alt: 'Travel destination',
          credit: `Photo by ${image.user.name} on Unsplash`
        };
      }
      
      throw new Error('No suitable images found');
    } catch (error) {
      console.error('Error getting trip card image:', error);
      // Return a default placeholder image
      return {
        url: '/src/assets/logo.png', // Your existing logo as fallback
        alt: 'Travel destination',
        credit: 'Default image'
      };
    }
  }

  /**
   * Get a suitable image for a guide card
   * @param destination - The destination name
   * @param guideType - Type of guide (e.g., "culture", "food", "adventure")
   * @returns Promise with image URL and metadata
   */
  static async getGuideCardImage(destination: string, guideType?: string): Promise<{
    url: string;
    alt: string;
    credit: string;
  }> {
    try {
      // Try to get guide-specific images
      const searchQuery = guideType 
        ? `${destination} ${guideType} guide`
        : `${destination} travel guide`;
      
      const searchResult = await imageService.searchImages(searchQuery, 1, 5);
      
      if (searchResult.results.length > 0) {
        const image = searchResult.results[0];
        return {
          url: image.urls.regular,
          alt: image.alt_description || `${destination} travel guide`,
          credit: `Photo by ${image.user.name} on Unsplash`
        };
      }
      
      // Fallback to destination images
      return await this.getTripCardImage(destination);
    } catch (error) {
      console.error('Error getting guide card image:', error);
      return {
        url: '/src/assets/logo.png',
        alt: 'Travel guide',
        credit: 'Default image'
      };
    }
  }

  /**
   * Get a seasonal image based on current date or specified season
   * @param destination - The destination name
   * @param season - Optional season, defaults to current season
   * @returns Promise with seasonal image
   */
  static async getSeasonalImage(destination: string, season?: string): Promise<{
    url: string;
    alt: string;
    credit: string;
  }> {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const searchQuery = `${destination} ${currentSeason} season`;
      
      const searchResult = await imageService.searchImages(searchQuery, 1, 5);
      
      if (searchResult.results.length > 0) {
        const image = searchResult.results[0];
        return {
          url: image.urls.regular,
          alt: `${destination} in ${currentSeason}`,
          credit: `Photo by ${image.user.name} on Unsplash`
        };
      }
      
      // Fallback to regular destination image
      return await this.getTripCardImage(destination);
    } catch (error) {
      console.error('Error getting seasonal image:', error);
      return await this.getTripCardImage(destination);
    }
  }

  /**
   * Get current season based on date
   * @returns Current season string
   */
  private static getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * Get multiple images for a carousel or gallery
   * @param destination - The destination name
   * @param count - Number of images (default: 3)
   * @returns Promise with array of images
   */
  static async getDestinationGallery(destination: string, count: number = 3): Promise<Array<{
    url: string;
    alt: string;
    credit: string;
  }>> {
    try {
      const searchResult = await imageService.searchImages(destination, 1, count);
      
      return searchResult.results.map(image => ({
        url: image.urls.regular,
        alt: image.alt_description || `${destination} travel destination`,
        credit: `Photo by ${image.user.name} on Unsplash`
      }));
    } catch (error) {
      console.error('Error getting destination gallery:', error);
      return [];
    }
  }
}

export default CardImageService;
