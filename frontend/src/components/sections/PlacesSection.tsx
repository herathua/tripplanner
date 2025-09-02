import React, { useState, useEffect } from 'react';
import { Plus, Search, Camera as CameraIcon, Star, Trash2, MapPin, Globe, Clock, DollarSign } from 'lucide-react';
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
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);

  useEffect(() => {
    const searchPlaces = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try backend search first
        const response = await locationService.searchLocations(searchQuery, 'en', 5);
        
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
          // Fallback to simple search with mock data
          console.log('Using fallback search for:', searchQuery);
          const fallbackSuggestions: SearchResult[] = [
            {
              id: '1',
              name: `${searchQuery} City Center`,
              location: `${searchQuery}, Popular Destination`,
              image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc02?w=400&h=300&fit=crop',
              type: 'attraction',
              country: 'Popular Destination',
              region: searchQuery,
              coordinates: { lat: 7.8731 + Math.random() * 0.1, lng: 80.7718 + Math.random() * 0.1 }
            },
            {
              id: '2',
              name: `${searchQuery} Historical Site`,
              location: `${searchQuery}, Cultural Heritage`,
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
              type: 'attraction',
              country: 'Cultural Heritage',
              region: searchQuery,
              coordinates: { lat: 7.8731 + Math.random() * 0.1, lng: 80.7718 + Math.random() * 0.1 }
            },
            {
              id: '3',
              name: `${searchQuery} Local Restaurant`,
              location: `${searchQuery}, Food & Dining`,
              image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
              type: 'restaurant',
              country: 'Food & Dining',
              region: searchQuery,
              coordinates: { lat: 7.8731 + Math.random() * 0.1, lng: 80.7718 + Math.random() * 0.1 }
            }
          ];
          
          setSuggestions(fallbackSuggestions);
        }
      } catch (err) {
        console.error('Error searching places:', err);
        // Use fallback search on error
        const fallbackSuggestions: SearchResult[] = [
          {
            id: '1',
            name: `${searchQuery} Tourist Spot`,
            location: `${searchQuery}, Travel Destination`,
            image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc02?w=400&h=300&fit=crop',
            type: 'attraction',
            country: 'Travel Destination',
            region: searchQuery,
            coordinates: { lat: 7.8731 + Math.random() * 0.1, lng: 80.7718 + Math.random() * 0.1 }
          }
        ];
        
        setSuggestions(fallbackSuggestions);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectPlace = async (suggestion: SearchResult) => {
    setAddingPlaceId(suggestion.id);
    
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
    
    try {
      await onSelectPlace(newPlace);
      setSuggestions([]); // Clear suggestions after selection
    } finally {
      setAddingPlaceId(null);
    }
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
                className="p-3 hover:bg-gray-50 transition-colors"
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
                    <button
                      onClick={() => handleSelectPlace(suggestion)}
                      className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to trip"
                      disabled={addingPlaceId === suggestion.id}
                    >
                      {addingPlaceId === suggestion.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
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
  onAddToItinerary: (place: Place) => void;
  onDeletePlace: (placeId: string) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
}

const PlacesSection: React.FC<PlacesSectionProps> = ({
  places,
  searchQuery,
  onSearchChange,
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
    console.log('🎯 handleSelectSearchPlace called with:', place);
    
    // Add the selected place to the places list
    // This will be handled by the parent component
    onAddToItinerary(place as Place);
    onSearchChange(''); // Clear search after selection
  };

  // Test function to add a sample place
  const addTestPlace = () => {
    const testPlace: Omit<Place, 'id'> = {
      name: 'Test Location',
      location: 'Test City, Test Country',
      description: 'This is a test place to verify functionality',
      category: 'attraction',
      rating: 5,
      photos: [],
      coordinates: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka coordinates
      cost: 0,
      duration: 2
    };
    
    console.log('🧪 Adding test place:', testPlace);
    onAddToItinerary(testPlace as Place);
  };

  return (
    <section id="places" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Places to Visit</h2>
        <button
          onClick={addTestPlace}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🧪 Add Test Place
        </button>
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
            <div key={place.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
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
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{place.name}</h3>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {place.location}
                </p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{place.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${place.cost}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {place.duration}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => onAddToItinerary(place)}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    Add to Itinerary
                  </button>
                  <button 
                    onClick={() => place.id && onDeletePlace(place.id)}
                    className="p-1 text-red-500 rounded hover:bg-red-50 transition-colors"
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
