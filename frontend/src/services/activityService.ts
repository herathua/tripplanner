import apiClient from '../config/api';
import { Activity, ActivityType, ActivityStatus } from './itineraryService';

export const activityService = {
  // Get all activities for a trip
  async getActivitiesByTripId(tripId: number): Promise<Activity[]> {
    const response = await apiClient.get(`/activities/trip/${tripId}`);
    return response.data;
  },

  // Get activities for a specific itinerary
  async getActivitiesByItineraryId(itineraryId: number): Promise<Activity[]> {
    const response = await apiClient.get(`/activities/itinerary/${itineraryId}`);
    return response.data;
  },

  // Get activity by ID
  async getActivityById(id: number): Promise<Activity> {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  // Create a new activity
  async createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const response = await apiClient.post('/activities', activity);
    return response.data;
  },

  // Update activity
  async updateActivity(id: number, activity: Partial<Activity>): Promise<Activity> {
    const response = await apiClient.put(`/activities/${id}`, activity);
    return response.data;
  },

  // Delete activity
  async deleteActivity(id: number): Promise<void> {
    await apiClient.delete(`/activities/${id}`);
  },

  // Get activities by trip and status
  async getActivitiesByTripAndStatus(tripId: number, status: ActivityStatus): Promise<Activity[]> {
    const response = await apiClient.get(`/activities/trip/${tripId}/status/${status}`);
    return response.data;
  },

  // Get activities by trip and type
  async getActivitiesByTripAndType(tripId: number, type: ActivityType): Promise<Activity[]> {
    const response = await apiClient.get(`/activities/trip/${tripId}/type/${type}`);
    return response.data;
  }
};
