import apiClient from '../config/api';

export interface Place {
  id?: number;
  name: string;
  location: string;
  description?: string;
  category: PlaceCategory;
  rating?: number;
  cost?: number;
  duration?: number;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export enum PlaceCategory {
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  ATTRACTION = 'ATTRACTION',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  CULTURAL = 'CULTURAL',
  NATURE = 'NATURE',
  TRANSPORT = 'TRANSPORT',
  OTHER = 'OTHER'
}

export const placeService = {
  // Get all places
  async getAllPlaces(): Promise<Place[]> {
    const response = await apiClient.get('/places');
    return response.data;
  },

  // Get place by ID
  async getPlaceById(id: number): Promise<Place> {
    const response = await apiClient.get(`/places/${id}`);
    return response.data;
  },

  // Create a new place
  async createPlace(place: Place): Promise<Place> {
    const response = await apiClient.post('/places', place);
    return response.data;
  },

  // Update place
  async updatePlace(id: number, place: Place): Promise<Place> {
    const response = await apiClient.put(`/places/${id}`, place);
    return response.data;
  },

  // Delete place
  async deletePlace(id: number): Promise<void> {
    await apiClient.delete(`/places/${id}`);
  },

  // Search places
  async searchPlaces(query: string): Promise<Place[]> {
    const response = await apiClient.get(`/places/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get places by category
  async getPlacesByCategory(category: PlaceCategory): Promise<Place[]> {
    const response = await apiClient.get(`/places/category/${category}`);
    return response.data;
  },

  // Get places by minimum rating
  async getPlacesByMinRating(minRating: number): Promise<Place[]> {
    const response = await apiClient.get(`/places/rating/${minRating}`);
    return response.data;
  },

  // Get places by trip ID
  async getPlacesByTripId(tripId: number): Promise<Place[]> {
    const response = await apiClient.get(`/places/trip/${tripId}`);
    return response.data;
  }
};
