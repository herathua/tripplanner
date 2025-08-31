import apiClient from '../config/api';

export interface LocationSearchResult {
  destination: {
    destId: string;
    destType: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    nbHotels: number;
  };
  displayInfo: {
    title: string;
    subTitle: string;
    labelComponents: Array<{
      type: string;
      name: string;
    }>;
    absoluteImageUrl: string;
  };
}

export interface LocationSearchResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    data: {
      autoCompleteSuggestions: {
        results: LocationSearchResult[];
      };
    };
  };
}

export const locationService = {
  // Search locations using Booking.com API
  async searchLocations(query: string, languageCode: string = 'en', limit: number = 3): Promise<LocationSearchResponse> {
    const response = await apiClient.get('/locations/search', {
      params: {
        query,
        languageCode,
        limit
      }
    });
    return response.data;
  },

  // Transform search results to a simpler format for the frontend
  transformSearchResults(results: LocationSearchResult[]) {
    return results.map(result => ({
      id: result.destination.destId,
      name: result.displayInfo.title,
      location: result.displayInfo.subTitle,
      type: result.destination.destType,
      countryCode: result.destination.countryCode,
      coordinates: {
        lat: result.destination.latitude,
        lng: result.destination.longitude
      },
      imageUrl: result.displayInfo.absoluteImageUrl,
      hotelCount: result.destination.nbHotels
    }));
  }
};
