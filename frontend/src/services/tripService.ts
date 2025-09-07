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
  places?: any[]; // Include places in the trip interface
  expenses?: any[]; // Include expenses in the trip interface
  itineraryData?: string; // Include itinerary data as JSON string
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
  async createTrip(trip: Trip, firebaseUid?: string): Promise<Trip> {
    console.log('Sending trip data to backend:', JSON.stringify(trip, null, 2));
    const url = firebaseUid ? `/trips?firebaseUid=${firebaseUid}` : '/trips';
    console.log('Making request to URL:', url);
    try {
      const response = await apiClient.post(url, trip);
      console.log('✅ Trip created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating trip:', error);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        console.error('❌ Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('❌ No response received:', error.request);
      } else {
        console.error('❌ Error setting up request:', error.message);
      }
      throw error;
    }
  },

  // Update trip
  async updateTrip(id: number, trip: Trip): Promise<Trip> {
    const response = await apiClient.put(`/trips/${id}`, trip);
    return response.data;
  },

  // Delete a trip
  async deleteTrip(id: number): Promise<void> {
    console.log('🗑️ Attempting to delete trip with ID:', id);
    try {
      await apiClient.delete(`/trips/${id}`);
      console.log('✅ Trip deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting trip:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<any> {
    console.log('🏥 Testing backend connectivity...');
    try {
      const response = await apiClient.get('/trips/health');
      console.log('✅ Backend is accessible:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Backend is not accessible:', error);
      throw error;
    }
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
  },

  // Get upcoming trips by user Firebase UID with paging
  async getUpcomingTripsByUser(firebaseUid: string, page = 0, size = 3) {
    const response = await apiClient.get(`/trips/user/${firebaseUid}/upcoming`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get all trips by user Firebase UID with paging
  async getAllTripsByUser(firebaseUid: string, page = 0, size = 10) {
    const response = await apiClient.get(`/trips/user/${firebaseUid}/all`, {
      params: { page, size }
    });
    return response.data;
  }
};
