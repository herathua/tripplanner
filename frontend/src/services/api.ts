import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Trip types
export interface Trip {
  id?: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  dateCreated?: string;
  lastUpdated?: string;
}

export interface CreateTripRequest {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
}

// Trip API functions
export const tripApi = {
  // Get all trips
  getAllTrips: async (): Promise<Trip[]> => {
    try {
      const response = await api.get('/trips');
      return response.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },

  // Get trip by ID
  getTripById: async (id: number): Promise<Trip> => {
    try {
      const response = await api.get(`/trips/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching trip ${id}:`, error);
      throw error;
    }
  },

  // Create new trip
  createTrip: async (tripData: CreateTripRequest): Promise<number> => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data; // Returns the created trip ID
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  },

  // Update trip
  updateTrip: async (id: number, tripData: Partial<Trip>): Promise<void> => {
    try {
      await api.put(`/trips/${id}`, tripData);
    } catch (error) {
      console.error(`Error updating trip ${id}:`, error);
      throw error;
    }
  },

  // Delete trip
  deleteTrip: async (id: number): Promise<void> => {
    try {
      await api.delete(`/trips/${id}`);
    } catch (error) {
      console.error(`Error deleting trip ${id}:`, error);
      throw error;
    }
  },
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;