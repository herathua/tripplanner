import apiClient from '../config/api';

export interface Itinerary {
  id?: number;
  dayNumber: number;
  date: string;
  notes?: string;
  tripId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id?: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
  durationHours?: number;
  type: ActivityType;
  status: ActivityStatus;
  tripId?: number;
  itineraryId?: number;
  dayNumber?: number; // Add dayNumber for local state activities
  placeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum ActivityType {
  SIGHTSEEING = 'SIGHTSEEING',
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  TRANSPORT = 'TRANSPORT',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER'
}

export enum ActivityStatus {
  PLANNED = 'PLANNED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export const itineraryService = {
  // Get all itineraries for a trip
  async getItinerariesByTripId(tripId: number): Promise<Itinerary[]> {
    const response = await apiClient.get(`/itineraries/trip/${tripId}`);
    return response.data;
  },

  // Get itinerary by ID
  async getItineraryById(id: number): Promise<Itinerary> {
    const response = await apiClient.get(`/itineraries/${id}`);
    return response.data;
  },

  // Create a new itinerary
  async createItinerary(itinerary: Itinerary): Promise<Itinerary> {
    const response = await apiClient.post('/itineraries', itinerary);
    return response.data;
  },

  // Update itinerary
  async updateItinerary(id: number, itinerary: Itinerary): Promise<Itinerary> {
    const response = await apiClient.put(`/itineraries/${id}`, itinerary);
    return response.data;
  },

  // Delete itinerary
  async deleteItinerary(id: number): Promise<void> {
    await apiClient.delete(`/itineraries/${id}`);
  }
};
