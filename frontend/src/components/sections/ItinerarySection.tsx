import React from 'react';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { Activity } from '../../contexts/TripContext';

interface TripDay {
  date: Date;
  dayNumber: number;
}

interface ItinerarySectionProps {
  tripDays: TripDay[];
  activities: Activity[];
  onAddActivity: (dayNumber: number) => void;
  onDeleteActivity: (activityId: string) => void;
  onDeleteDay: (dayNumber: number) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
  formatDate: (date: Date) => string;
}

const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  tripDays,
  activities,
  onAddActivity,
  onDeleteActivity,
  onDeleteDay,
  getCategoryIcon,
  formatDate
}) => {
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
          const dayActivities = activities.filter(a => a.dayNumber === dayNumber);
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
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(activity => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-600">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getCategoryIcon(activity.type)}
                            <h4 className="font-medium">{activity.placeName}</h4>
                            <span className="text-sm text-gray-500">({activity.duration}h)</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 font-medium">${activity.cost}</span>
                            <button 
                              onClick={() => onDeleteActivity(activity.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
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
