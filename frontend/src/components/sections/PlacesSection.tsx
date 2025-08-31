import React, { useState, useEffect } from 'react';
import { Plus, Search, Camera as CameraIcon, Star, Trash2, MapPin, Hotel, Globe } from 'lucide-react';
import { Place } from '../../contexts/TripContext';
import { locationService } from '../../services/locationService';

interface PlaceSearchSuggestionsProps {
  searchQuery: string;
  onSelectPlace: (place: Omit<Place, 'id'>) => void;
}

interface SearchResult {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
  country: string;
  region: string;
  coordinates: { lat: number; lng: number };
}

const PlaceSearchSuggestions: React.FC<PlaceSearchSuggestionsProps> = ({
  searchQuery,
  onSelectPlace
}) => {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchPlaces = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await locationService.searchLocations(searchQuery, 'en', 3);
        
        if (response.success && response.data?.data?.autoCompleteSuggestions?.results) {
          const results = response.data.data.autoCompleteSuggestions.results;
          
          const transformedSuggestions: SearchResult[] = results.map((result: any) => ({
            id: result.destination.destId,
            name: result.displayInfo.title,
            location: result.displayInfo.subTitle,
            image: result.displayInfo.absoluteImageUrl,
            type: result.destination.destType,
            country: result.displayInfo.labelComponents.find((comp: any) => comp.type === 'COUNTRY')?.name || '',
            region: result.displayInfo.labelComponents.find((comp: any) => comp.type === 'REGION')?.name || '',
            coordinates: {
              lat: result.destination.latitude,
              lng: result.destination.longitude
            }
          }));

          setSuggestions(transformedSuggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Error searching places:', err);
        setError('Failed to search places');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectPlace = (suggestion: SearchResult) => {
    const newPlace: Omit<Place, 'id'> = {
      name: suggestion.name,
      location: suggestion.location,
      description: `${suggestion.type} in ${suggestion.region}, ${suggestion.country}`,
      category: suggestion.type.toLowerCase(),
      rating: 4, // Default rating
      photos: suggestion.image ? [suggestion.image] : [],
      coordinates: suggestion.coordinates,
      cost: 0, // Will be updated when user adds details
      duration: 2 // Default duration
    };
    
    onSelectPlace(newPlace);
    setSuggestions([]); // Clear suggestions after selection
  };

  if (!searchQuery || searchQuery.length < 2) return null;

  return (
    <div className="mb-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>Searching for "{searchQuery}"...</span>
          </div>
        </div>
        
        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm">Searching places...</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-red-500">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {!isLoading && !error && suggestions.length > 0 && (
          <div className="divide-y divide-gray-100">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                onClick={() => handleSelectPlace(suggestion)}
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    {suggestion.image ? (
                      <img 
                        src={suggestion.image} 
                        alt={suggestion.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <CameraIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {suggestion.location}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                        {suggestion.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {suggestion.country}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && !error && suggestions.length === 0 && searchQuery.length >= 2 && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No places found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface PlacesSectionProps {
  places: Place[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchHotels: () => void;
  onAddToItinerary: (place: Place) => void;
  onDeletePlace: (placeId: string) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
}

const PlacesSection: React.FC<PlacesSectionProps> = ({
  places,
  searchQuery,
  onSearchChange,
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

  const handleSelectSearchPlace = (place: Omit<Place, 'id'>) => {
    // Add the selected place to the places list
    // This will be handled by the parent component
    onAddToItinerary(place as Place);
    onSearchChange(''); // Clear search after selection
  };

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

      {/* Place Search Suggestions */}
      <PlaceSearchSuggestions 
        searchQuery={searchQuery}
        onSelectPlace={handleSelectSearchPlace}
      />
      
      {!places.length ? (
        <div className="flex items-center justify-center h-full p-6 text-center text-gray-500 bg-white rounded-lg shadow-lg">
          <div>
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No places added yet</p>
            <p className="text-sm text-gray-400 mb-4">Search for places above to start planning your visits</p>
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
                    onClick={() => place.id && onDeletePlace(place.id)}
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
