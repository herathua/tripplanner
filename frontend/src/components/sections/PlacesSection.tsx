import React from 'react';
import { Plus, Search, Camera as CameraIcon, Star, Trash2, MapPin, Hotel } from 'lucide-react';
import { Place } from '../../contexts/TripContext';

interface PlacesSectionProps {
  places: Place[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddPlace: () => void;
  onSearchHotels: () => void;
  onAddToItinerary: (place: Place) => void;
  onDeletePlace: (placeId: string) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
}

const PlacesSection: React.FC<PlacesSectionProps> = ({
  places,
  searchQuery,
  onSearchChange,
  onAddPlace,
  onSearchHotels,
  onAddToItinerary,
  onDeletePlace,
  getCategoryIcon
}) => {
  const filteredPlaces = places.filter(place => 
    searchQuery === '' || 
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="places" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Places to Visit</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onSearchHotels}
            className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Hotel className="w-4 h-4" />
            <span>Search Hotels</span>
          </button>
          <button 
            onClick={onAddPlace}
            className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Place</span>
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search places by name, location, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {!places.length ? (
        <div className="flex items-center justify-center h-full p-6 text-center text-gray-500 bg-white rounded-lg shadow-lg">
          <div>
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No places added yet</p>
            <p className="text-sm text-gray-400 mb-4">Click "Add Place" to start planning your visits</p>
            <button 
              onClick={onAddPlace}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              Add Your First Place
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlaces.map(place => (
            <div key={place.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {place.photos.length > 0 ? (
                  <img 
                    src={place.photos[0]} 
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {place.category}
                  </span>
                </div>
                <div className="absolute top-2 left-2 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-white">{place.rating}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{place.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{place.location}</p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{place.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>${place.cost}</span>
                  <span>{place.duration}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => onAddToItinerary(place)}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Add to Itinerary
                  </button>
                  <button 
                    onClick={() => onDeletePlace(place.id)}
                    className="p-1 text-red-500 rounded hover:bg-red-50"
                    title="Delete place"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PlacesSection;
