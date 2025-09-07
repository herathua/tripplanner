import apiClient from '../config/api';

export interface Activity {
  id?: string; // Use string ID for local activities
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
  durationHours?: number;
  type: ActivityType;
  status: ActivityStatus;
  dayNumber: number;
  placeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DayItinerary {
  dayNumber: number;
  date: string;
  notes?: string;
  activities: Activity[];
}

export interface ItineraryData {
  days: DayItinerary[];
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
  // Parse itinerary data from JSON string
  parseItineraryData(jsonString: string): ItineraryData {
    try {
      if (!jsonString || jsonString.trim() === '') {
        return { days: [] };
      }
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing itinerary data:', error);
      return { days: [] };
    }
  },

  // Convert itinerary data to JSON string
  stringifyItineraryData(itineraryData: ItineraryData): string {
    try {
      return JSON.stringify(itineraryData);
    } catch (error) {
      console.error('Error stringifying itinerary data:', error);
      return '{"days":[]}';
    }
  },

  // Get itinerary data from trip
  async getItineraryFromTrip(tripId: number): Promise<ItineraryData> {
    try {
      const response = await apiClient.get(`/trips/${tripId}`);
      const trip = response.data;
      return this.parseItineraryData(trip.itineraryData || '{}');
    } catch (error) {
      console.error('Error fetching itinerary from trip:', error);
      return { days: [] };
    }
  },

  // Update itinerary data in trip
  async updateItineraryInTrip(tripId: number, itineraryData: ItineraryData): Promise<void> {
    try {
      const jsonString = this.stringifyItineraryData(itineraryData);
      await apiClient.put(`/trips/${tripId}`, {
        itineraryData: jsonString
      });
    } catch (error) {
      console.error('Error updating itinerary in trip:', error);
      throw error;
    }
  },

  // Helper methods for managing activities
  addActivityToDay(itineraryData: ItineraryData, dayNumber: number, activity: Activity): ItineraryData {
    const day = itineraryData.days.find(d => d.dayNumber === dayNumber);
    if (day) {
      // Check if activity with same ID already exists
      const existingActivity = day.activities.find(a => a.id === activity.id);
      if (!existingActivity) {
        day.activities.push(activity);
      } else {
        console.log('⚠️ Activity with same ID already exists in day, skipping duplicate');
      }
    } else {
      // Create new day if it doesn't exist
      itineraryData.days.push({
        dayNumber,
        date: new Date().toISOString().split('T')[0], // Default to today
        activities: [activity]
      });
    }
    return itineraryData;
  },

  removeActivityFromDay(itineraryData: ItineraryData, dayNumber: number, activityId: string): ItineraryData {
    const day = itineraryData.days.find(d => d.dayNumber === dayNumber);
    if (day) {
      day.activities = day.activities.filter(a => a.id !== activityId);
    }
    return itineraryData;
  },

  updateActivityInDay(itineraryData: ItineraryData, dayNumber: number, activityId: string, updatedActivity: Activity): ItineraryData {
    const day = itineraryData.days.find(d => d.dayNumber === dayNumber);
    if (day) {
      const index = day.activities.findIndex(a => a.id === activityId);
      if (index !== -1) {
        day.activities[index] = { ...updatedActivity, id: activityId };
      }
    }
    return itineraryData;
  },

  getActivitiesForDay(itineraryData: ItineraryData, dayNumber: number): Activity[] {
    const day = itineraryData.days.find(d => d.dayNumber === dayNumber);
    return day ? day.activities : [];
  },

  getAllActivities(itineraryData: ItineraryData): Activity[] {
    return itineraryData.days.flatMap(day => day.activities);
  }
};