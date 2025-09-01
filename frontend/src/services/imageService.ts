import { unsplashClient } from '../config/api';

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download: string;
  };
  width: number;
  height: number;
  color: string;
  likes: number;
}

export interface ImageSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

class ImageService {
  /**
   * Search for images by query
   * @param query - Search term
   * @param page - Page number (default: 1)
   * @param perPage - Images per page (default: 20, max: 30)
   * @returns Promise with search results
   */
  async searchImages(
    query: string, 
    page: number = 1, 
    perPage: number = 20
  ): Promise<ImageSearchResult> {
    try {
      const response = await unsplashClient.get('/search/photos', {
        params: {
          query,
          page,
          per_page: Math.min(perPage, 30), // Unsplash max is 30
          orientation: 'landscape', // Better for travel/landscape images
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error searching images:', error);
      throw new Error(`Failed to search images for "${query}"`);
    }
  }

  /**
   * Get random images (great for backgrounds, hero sections)
   * @param count - Number of images (default: 10, max: 30)
   * @param query - Optional search term for random images
   * @returns Promise with random images
   */
  async getRandomImages(count: number = 10, query?: string): Promise<UnsplashImage[]> {
    try {
      const params: any = {
        count: Math.min(count, 30), // Unsplash max is 30
      };

      if (query) {
        params.query = query;
      }

      const response = await unsplashClient.get('/photos/random', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting random images:', error);
      throw new Error('Failed to get random images');
    }
  }

  /**
   * Get images by collection (curated collections)
   * @param collectionId - Collection ID
   * @param page - Page number (default: 1)
   * @param perPage - Images per page (default: 20, max: 30)
   * @returns Promise with collection images
   */
  async getCollectionImages(
    collectionId: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<ImageSearchResult> {
    try {
      const response = await unsplashClient.get(`/collections/${collectionId}/photos`, {
        params: {
          page,
          per_page: Math.min(perPage, 30),
        },
      });

      return {
        total: response.data.length,
        total_pages: 1, // Collections don't provide pagination info
        results: response.data,
      };
    } catch (error) {
      console.error('Error getting collection images:', error);
      throw new Error(`Failed to get collection images for ID: ${collectionId}`);
    }
  }

  /**
   * Get popular travel destinations images
   * @param count - Number of images (default: 15)
   * @returns Promise with travel destination images
   */
  async getTravelDestinationImages(count: number = 15): Promise<UnsplashImage[]> {
    try {
      const response = await unsplashClient.get('/photos/random', {
        params: {
          query: 'travel destination landscape',
          count: Math.min(count, 30),
          orientation: 'landscape',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting travel destination images:', error);
      throw new Error('Failed to get travel destination images');
    }
  }

  /**
   * Get city-specific images
   * @param cityName - Name of the city
   * @param count - Number of images (default: 10)
   * @returns Promise with city images
   */
  async getCityImages(cityName: string, count: number = 10): Promise<UnsplashImage[]> {
    try {
      const response = await unsplashClient.get('/photos/random', {
        params: {
          query: `${cityName} city landscape`,
          count: Math.min(count, 30),
          orientation: 'landscape',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting city images:', error);
      throw new Error(`Failed to get images for ${cityName}`);
    }
  }

  /**
   * Get weather-appropriate images
   * @param weatherType - Type of weather (sunny, rainy, snowy, etc.)
   * @param count - Number of images (default: 8)
   * @returns Promise with weather-appropriate images
   */
  async getWeatherImages(weatherType: string, count: number = 8): Promise<UnsplashImage[]> {
    try {
      const response = await unsplashClient.get('/photos/random', {
        params: {
          query: `${weatherType} weather landscape`,
          count: Math.min(count, 30),
          orientation: 'landscape',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting weather images:', error);
      throw new Error(`Failed to get ${weatherType} weather images`);
    }
  }

  /**
   * Get image statistics (downloads, views, likes)
   * @param imageId - Image ID
   * @returns Promise with image statistics
   */
  async getImageStats(imageId: string): Promise<any> {
    try {
      const response = await unsplashClient.get(`/photos/${imageId}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error getting image stats:', error);
      throw new Error(`Failed to get stats for image: ${imageId}`);
    }
  }

  /**
   * Trigger image download (required by Unsplash for tracking)
   * @param imageId - Image ID
   * @returns Promise indicating success
   */
  async triggerDownload(imageId: string): Promise<void> {
    try {
      await unsplashClient.get(`/photos/${imageId}/download`);
    } catch (error) {
      console.error('Error triggering download:', error);
      // Don't throw error for download tracking
    }
  }

  /**
   * Get image by ID
   * @param imageId - Image ID
   * @returns Promise with image details
   */
  async getImageById(imageId: string): Promise<UnsplashImage> {
    try {
      const response = await unsplashClient.get(`/photos/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting image by ID:', error);
      throw new Error(`Failed to get image with ID: ${imageId}`);
    }
  }
}

export default new ImageService();
