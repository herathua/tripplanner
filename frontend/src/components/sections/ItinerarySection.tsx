import React from 'react';
import { Plus, Calendar, Trash2, Edit } from 'lucide-react';
import { Activity, DayItinerary } from '../../services/itineraryService';

interface TripDay {
  date: Date;
  dayNumber: number;
}

interface ItinerarySectionProps {
  tripDays: TripDay[];
  activities: Activity[];
  itineraries: DayItinerary[];
  selectedDay?: number; // Add selectedDay prop
  onAddActivity: (dayNumber: number) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onDeleteDay: (dayNumber: number) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
  formatDate: (date: Date) => string;
}

const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  tripDays,
  activities,
  itineraries,
  selectedDay, // Add selectedDay parameter
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onDeleteDay,
  getCategoryIcon,
  formatDate
}) => {
  // Helper function to get activities for a specific day
  const getActivitiesForDay = (dayNumber: number) => {
    console.log(`🔍 Getting activities for day ${dayNumber}:`, {
      totalActivities: activities.length,
      activities: activities.map(a => ({ id: a.id, name: a.name, dayNumber: a.dayNumber }))
    });
    
    // Filter activities by dayNumber (new JSON-based architecture)
    const dayActivities = activities.filter(activity => activity.dayNumber === dayNumber);
    
    if (dayActivities.length > 0) {
      console.log(`✅ Found ${dayActivities.length} activities for day ${dayNumber}`);
      return dayActivities;
    }
    
    console.log(`❌ No activities found for day ${dayNumber}`);
    return [];
  };

  // Helper function to format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5); // Extract HH:MM from ISO time string
  };

  // Helper function to get activity display name
  const getActivityDisplayName = (activity: Activity) => {
    return activity.name || 'Unnamed Activity';
  };

  // Helper function to get activity duration
  const getActivityDuration = (activity: Activity) => {
    if (activity.durationHours) {
      return `${activity.durationHours}h`;
    }
    if (activity.startTime && activity.endTime) {
      const start = new Date(`2000-01-01T${activity.startTime}`);
      const end = new Date(`2000-01-01T${activity.endTime}`);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return `${Math.round(diffHours)}h`;
    }
    return '--h';
  };

  return (
    <section id="itinerary" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Itinerary</h2>
        <button 
          onClick={() => onAddActivity(1)}
          className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {tripDays.map(({ date, dayNumber }) => {
          const dayActivities = getActivitiesForDay(dayNumber);
          return (
            <div key={dayNumber} className="p-6 bg-white rounded-lg shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium">Day {dayNumber}: {formatDate(date)}</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onAddActivity(dayNumber)}
                    className="p-2 text-blue-600 rounded hover:bg-blue-50"
                    title={`Add activity for day ${dayNumber}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {dayActivities.length > 0 && (
                    <button 
                      onClick={() => onDeleteDay(dayNumber)}
                      className="p-2 text-red-500 rounded hover:bg-red-50"
                      title={`Clear all activities for day ${dayNumber}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {dayActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No activities planned yet</p>
                  <button 
                    onClick={() => onAddActivity(dayNumber)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add your first activity
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayActivities
                    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                    .map(activity => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-600">
                          {formatTime(activity.startTime)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getCategoryIcon(activity.type.toLowerCase())}
                            <h4 className="font-medium">{getActivityDisplayName(activity)}</h4>
                            <span className="text-sm text-gray-500">({getActivityDuration(activity)})</span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 font-medium">
                              ${activity.cost || 0}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                activity.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                activity.status === 'PLANNED' ? 'bg-blue-100 text-blue-800' :
                                activity.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.status}
                              </span>
                              <button 
                                onClick={() => onEditActivity(activity)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit activity"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => onDeleteActivity(activity.id || '')}
                                className="text-red-500 hover:text-red-700"
                                title="Remove activity"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ItinerarySection;
