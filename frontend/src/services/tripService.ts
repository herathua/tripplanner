import apiClient from '../config/api';

export interface Trip {
  id?: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  description?: string;
  status?: TripStatus;
  visibility?: TripVisibility;
  createdAt?: string;
  updatedAt?: string;
}

export enum TripStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TripVisibility {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
  PUBLIC = 'PUBLIC'
}

export const tripService = {
  // Get all trips
  async getAllTrips(): Promise<Trip[]> {
    const response = await apiClient.get('/trips');
    return response.data;
  },

  // Get trip by ID
  async getTripById(id: number): Promise<Trip> {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  },

  // Create a new trip
  async createTrip(trip: Trip): Promise<Trip> {
    console.log('Sending trip data to backend:', JSON.stringify(trip, null, 2));
    const response = await apiClient.post('/trips', trip);
    return response.data;
  },

  // Update trip
  async updateTrip(id: number, trip: Trip): Promise<Trip> {
    const response = await apiClient.put(`/trips/${id}`, trip);
    return response.data;
  },

  // Delete a trip
  async deleteTrip(id: number): Promise<void> {
    await apiClient.delete(`/trips/${id}`);
  },

  // Search trips
  async searchTrips(query: string): Promise<Trip[]> {
    const response = await apiClient.get(`/trips/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get trips by status
  async getTripsByStatus(status: TripStatus): Promise<Trip[]> {
    const response = await apiClient.get(`/trips/status/${status}`);
    return response.data;
  }
};
