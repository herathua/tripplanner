import { Activity, ActivityType, ActivityStatus, ItineraryData } from './itineraryService';

export const activityService = {
  // Generate a unique ID for local activities
  generateActivityId(): string {
    return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Create a new activity with default values
  createActivity(data: Partial<Activity>): Activity {
    return {
      id: this.generateActivityId(),
      name: data.name || '',
      description: data.description || '',
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      cost: data.cost || 0,
      durationHours: data.durationHours || 2,
      type: data.type || ActivityType.SIGHTSEEING,
      status: data.status || ActivityStatus.PLANNED,
      dayNumber: data.dayNumber || 1,
      placeId: data.placeId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // Update an activity
  updateActivity(activity: Activity, updates: Partial<Activity>): Activity {
    return {
      ...activity,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  },

  // Validate activity data
  validateActivity(activity: Activity): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!activity.name || activity.name.trim() === '') {
      errors.push('Activity name is required');
    }

    if (!activity.type) {
      errors.push('Activity type is required');
    }

    if (!activity.status) {
      errors.push('Activity status is required');
    }

    if (activity.dayNumber < 1) {
      errors.push('Day number must be at least 1');
    }

    if (activity.cost && activity.cost < 0) {
      errors.push('Cost cannot be negative');
    }

    if (activity.durationHours && activity.durationHours < 0) {
      errors.push('Duration cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Filter activities by various criteria
  filterActivities(activities: Activity[], filters: {
    type?: ActivityType;
    status?: ActivityStatus;
    dayNumber?: number;
    minCost?: number;
    maxCost?: number;
  }): Activity[] {
    return activities.filter(activity => {
      if (filters.type && activity.type !== filters.type) return false;
      if (filters.status && activity.status !== filters.status) return false;
      if (filters.dayNumber && activity.dayNumber !== filters.dayNumber) return false;
      if (filters.minCost !== undefined && (activity.cost || 0) < filters.minCost) return false;
      if (filters.maxCost !== undefined && (activity.cost || 0) > filters.maxCost) return false;
      return true;
    });
  },

  // Calculate total cost for activities
  calculateTotalCost(activities: Activity[]): number {
    return activities.reduce((total, activity) => total + (activity.cost || 0), 0);
  },

  // Get activities by day
  getActivitiesByDay(activities: Activity[], dayNumber: number): Activity[] {
    return activities.filter(activity => activity.dayNumber === dayNumber);
  },

  // Sort activities by time
  sortActivitiesByTime(activities: Activity[]): Activity[] {
    return [...activities].sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  }
};