import api from './api';
import { Trip, CreateTripRequest } from '../types/tripTypes';

export const tripService = {
  // Get all trips
  getAllTrips: async (): Promise<Trip[]> => {
    const response = await api.get<Trip[]>('/trips');
    return response.data;
  },

  // Get trip by ID
  getTripById: async (id: number): Promise<Trip> => {
    const response = await api.get<Trip>(`/trips/${id}`);
    return response.data;
  },

  // Create new trip
  createTrip: async (tripData: CreateTripRequest): Promise<number> => {
    const response = await api.post<number>('/trips', tripData);
    return response.data;
  },

  // Update trip
  updateTrip: async (id: number, tripData: Partial<Trip>): Promise<number> => {
    const response = await api.put<number>(`/trips/${id}`, tripData);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (id: number): Promise<void> => {
    await api.delete(`/trips/${id}`);
  },
};

export default tripService;