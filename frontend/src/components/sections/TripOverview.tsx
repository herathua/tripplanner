import React from 'react';
import { Clock, DollarSign, MapPin, Navigation } from 'lucide-react';
import TripMap from '../TripMap';
import { Place } from '../../contexts/TripContext';

interface TripDay {
  date: Date;
  dayNumber: number;
}

interface TripOverviewProps {
  tripDays: TripDay[];
  budget: number;
  totalSpent: number;
  places: Place[];
  tripName: string;
  isMapFullscreen: boolean;
  onToggleMapFullscreen: () => void;
  getCategoryIcon: (category: string) => React.ReactNode;
}

const TripOverview: React.FC<TripOverviewProps> = ({
  tripDays,
  budget,
  totalSpent,
  places,
  tripName,
  isMapFullscreen,
  onToggleMapFullscreen,
  getCategoryIcon
}) => {
  const remainingBudget = budget - totalSpent;

  return (
    <section id="overview" className="mb-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="h-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold">Trip Duration</h3>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>{tripDays.length} days</span>
          </div>
        </div>
        <div className="h-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold">Total Budget</h3>
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-5 h-5 mr-2" />
            <span>${budget.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Spent: ${totalSpent.toLocaleString()} | Remaining: ${remainingBudget.toLocaleString()}
          </div>
        </div>
        <div className="h-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold">Places to Visit</h3>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{places.length} places added</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {places.length ? `${places.filter(p => p.category === 'attraction').length} attractions, ${places.filter(p => p.category === 'restaurant').length} restaurants` : 'No places added yet'}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Trip Map</h3>
          <button
            onClick={onToggleMapFullscreen}
            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
            title={isMapFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
        <div className={`${isMapFullscreen ? 'fixed inset-0 z-101 bg-white' : ''}`}>
          <TripMap 
            places={places}
            tripName={tripName}
            isFullscreen={isMapFullscreen}
          />
          {places.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Places on Map:</h4>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {places.map(place => (
                  <div key={place.id} className="flex items-center space-x-2 text-sm">
                    {getCategoryIcon(place.category)}
                    <span className="truncate">{place.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Attractions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Restaurants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Hotels</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Transport</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Shopping</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TripOverview;
