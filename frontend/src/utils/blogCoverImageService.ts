import imageService from '../services/imageService';

export interface BlogCoverImage {
  url: string;
  alt: string;
  credit: string;
}

/**
 * Service to generate suitable cover images for blog posts
 * Uses Unsplash API to find relevant images based on blog content
 */
export class BlogCoverImageService {
  /**
   * Generate a cover image for a blog post based on title and tags
   * @param title - Blog post title
   * @param tags - Array of tags
   * @returns Promise with cover image data
   */
  static async generateCoverImage(title: string, tags: string[] = []): Promise<BlogCoverImage> {
    try {
      // Extract keywords from title and tags
      const keywords = this.extractKeywords(title, tags);
      
      // Try different search strategies
      const searchQueries = this.generateSearchQueries(keywords);
      
      for (const query of searchQueries) {
        try {
          const searchResult = await imageService.searchImages(query, 1, 5);
          
          if (searchResult.results.length > 0) {
            const image = searchResult.results[0];
            return {
              url: image.urls.full, // Use full resolution for cover images
              alt: image.alt_description || `${keywords.join(' ')} travel destination`,
              credit: `Photo by ${image.user.name} on Unsplash`
            };
          }
        } catch (error) {
          console.warn(`Search query "${query}" failed:`, error);
          continue;
        }
      }
      
      // Fallback to general travel images
      const fallbackImages = await imageService.getTravelDestinationImages(5);
      if (fallbackImages.length > 0) {
        const image = fallbackImages[0];
        return {
          url: image.urls.full,
          alt: 'Travel destination',
          credit: `Photo by ${image.user.name} on Unsplash`
        };
      }
      
      throw new Error('No suitable images found');
    } catch (error) {
      console.error('Error generating blog cover image:', error);
      // Return a default placeholder image
      return {
        url: '/src/assets/logo.png',
        alt: 'Travel blog cover',
        credit: 'Default image'
      };
    }
  }

  /**
   * Extract relevant keywords from title and tags
   * @param title - Blog post title
   * @param tags - Array of tags
   * @returns Array of keywords
   */
  private static extractKeywords(title: string, tags: string[]): string[] {
    const keywords: string[] = [];
    
    // Add tags as keywords
    keywords.push(...tags);
    
    // Extract location names and travel-related terms from title
    const titleWords = title.toLowerCase().split(/\s+/);
    const travelKeywords = [
      'travel', 'trip', 'journey', 'adventure', 'explore', 'visit', 'destination',
      'city', 'country', 'beach', 'mountain', 'forest', 'desert', 'island',
      'culture', 'food', 'restaurant', 'hotel', 'accommodation', 'guide',
      'tips', 'guide', 'itinerary', 'planning', 'budget', 'backpacking',
      'luxury', 'family', 'solo', 'couple', 'group', 'hiking', 'camping',
      'photography', 'nature', 'wildlife', 'history', 'architecture', 'art',
      'museum', 'temple', 'church', 'castle', 'palace', 'market', 'street'
    ];
    
    // Add travel-related words from title
    titleWords.forEach(word => {
      if (travelKeywords.includes(word) && !keywords.includes(word)) {
        keywords.push(word);
      }
    });
    
    // Add location names (capitalized words)
    titleWords.forEach(word => {
      if (word.length > 2 && word[0] === word[0].toUpperCase() && !keywords.includes(word)) {
        keywords.push(word);
      }
    });
    
    return keywords.slice(0, 5); // Limit to 5 keywords
  }

  /**
   * Generate multiple search queries to try
   * @param keywords - Array of keywords
   * @returns Array of search queries
   */
  private static generateSearchQueries(keywords: string[]): string[] {
    const queries: string[] = [];
    
    if (keywords.length === 0) {
      return ['travel destination', 'beautiful landscape', 'adventure travel'];
    }
    
    // Try different combinations
    if (keywords.length >= 2) {
      queries.push(`${keywords[0]} ${keywords[1]} travel`);
      queries.push(`${keywords[0]} ${keywords[1]} destination`);
    }
    
    if (keywords.length >= 1) {
      queries.push(`${keywords[0]} travel`);
      queries.push(`${keywords[0]} destination`);
      queries.push(`${keywords[0]} landscape`);
    }
    
    // Add general travel queries
    queries.push('travel destination', 'beautiful landscape', 'adventure travel');
    
    return queries;
  }

  /**
   * Get a seasonal cover image based on current date
   * @param title - Blog post title
   * @param tags - Array of tags
   * @returns Promise with seasonal cover image
   */
  static async getSeasonalCoverImage(title: string, tags: string[] = []): Promise<BlogCoverImage> {
    try {
      const season = this.getCurrentSeason();
      const keywords = this.extractKeywords(title, tags);
      
      const searchQuery = keywords.length > 0 
        ? `${keywords[0]} ${season} season travel`
        : `${season} travel destination`;
      
      const searchResult = await imageService.searchImages(searchQuery, 1, 5);
      
      if (searchResult.results.length > 0) {
        const image = searchResult.results[0];
        return {
          url: image.urls.full,
          alt: `${keywords[0] || 'Travel'} in ${season}`,
          credit: `Photo by ${image.user.name} on Unsplash`
        };
      }
      
      // Fallback to regular cover image
      return await this.generateCoverImage(title, tags);
    } catch (error) {
      console.error('Error getting seasonal cover image:', error);
      return await this.generateCoverImage(title, tags);
    }
  }

  /**
   * Get current season based on date
   * @returns Current season string
   */
  private static getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
}
