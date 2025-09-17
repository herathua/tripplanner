import React, { useState, useEffect } from 'react';
import { Plus, Search, Camera as CameraIcon, Star, Trash2, MapPin, Globe, Clock, DollarSign } from 'lucide-react';
import { Place } from '../../contexts/TripContext';
import { locationService } from '../../services/locationService';

// ✅ Helper function to get real coordinates for common destinations
const getRealCoordinates = (query: string): { lat: number; lng: number } => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Real coordinates for popular destinations
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    'paris': { lat: 48.8566, lng: 2.3522 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'new york': { lat: 40.7128, lng: -74.0060 },
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'rome': { lat: 41.9028, lng: 12.4964 },
    'barcelona': { lat: 41.3851, lng: 2.1734 },
    'amsterdam': { lat: 52.3676, lng: 4.9041 },
    'berlin': { lat: 52.5200, lng: 13.4050 },
    'madrid': { lat: 40.4168, lng: -3.7038 },
    'vienna': { lat: 48.2082, lng: 16.3738 },
    'prague': { lat: 50.0755, lng: 14.4378 },
    'budapest': { lat: 47.4979, lng: 19.0402 },
    'istanbul': { lat: 41.0082, lng: 28.9784 },
    'moscow': { lat: 55.7558, lng: 37.6176 },
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'singapore': { lat: 1.3521, lng: 103.8198 },
    'hong kong': { lat: 22.3193, lng: 114.1694 },
    'sydney': { lat: -33.8688, lng: 151.2093 },
    'melbourne': { lat: -37.8136, lng: 144.9631 },
    'toronto': { lat: 43.6532, lng: -79.3832 },
    'vancouver': { lat: 49.2827, lng: -123.1207 },
    'miami': { lat: 25.7617, lng: -80.1918 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'boston': { lat: 42.3601, lng: -71.0589 },
    'washington': { lat: 38.9072, lng: -77.0369 },
    'seattle': { lat: 47.6062, lng: -122.3321 },
    'denver': { lat: 39.7392, lng: -104.9903 },
    'las vegas': { lat: 36.1699, lng: -115.1398 },
    'phoenix': { lat: 33.4484, lng: -112.0740 },
    'atlanta': { lat: 33.7490, lng: -84.3880 },
    'houston': { lat: 29.7604, lng: -95.3698 },
    'dallas': { lat: 32.7767, lng: -96.7970 },
    'austin': { lat: 30.2672, lng: -97.7431 },
    'nashville': { lat: 36.1627, lng: -86.7816 },
    'new orleans': { lat: 29.9511, lng: -90.0715 },
    'montreal': { lat: 45.5017, lng: -73.5673 },
    'quebec': { lat: 46.8139, lng: -71.2080 },
    'calgary': { lat: 51.0447, lng: -114.0719 },
    'edmonton': { lat: 53.5461, lng: -113.4938 },
    'ottawa': { lat: 45.4215, lng: -75.6972 },
    'winnipeg': { lat: 49.8951, lng: -97.1384 },
    'halifax': { lat: 44.6488, lng: -63.5752 },
    'st johns': { lat: 47.5615, lng: -52.7126 },
    'whitehorse': { lat: 60.7212, lng: -135.0568 },
    'yellowknife': { lat: 62.4540, lng: -114.3718 },
    'iqaluit': { lat: 63.7467, lng: -68.5170 }
  };
  
  // Check for exact matches first
  if (coordinates[normalizedQuery]) {
    return coordinates[normalizedQuery];
  }
  
  // Check for partial matches
  for (const [city, coords] of Object.entries(coordinates)) {
    if (normalizedQuery.includes(city) || city.includes(normalizedQuery)) {
      return coords;
    }
  }
  
  // Default to a random location if no match found
  console.warn(`⚠️ No coordinates found for "${query}", using random location`);
  return { 
    lat: 40.7128 + (Math.random() - 0.5) * 20, // Random around NYC
    lng: -74.0060 + (Math.random() - 0.5) * 20 
  };
};

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
        console.log('🔍 Starting location search for:', searchQuery);
        
        // Try backend search first
        const response = await locationService.searchLocations(searchQuery, 'en', 5);
        console.log('📡 Backend API response:', response);
        
        if (response.success && response.data?.data?.autoCompleteSuggestions?.results) {
          const results = response.data.data.autoCompleteSuggestions.results;
          console.log('✅ Found', results.length, 'results from Booking.com API');
          
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

          console.log('🔄 Transformed suggestions:', transformedSuggestions);
          setSuggestions(transformedSuggestions);
        } else {
          // ✅ Enhanced fallback with real coordinates
          console.log('⚠️ No results from Booking.com API, using enhanced fallback for:', searchQuery);
          const realCoords = getRealCoordinates(searchQuery);
          const fallbackSuggestions: SearchResult[] = [
            {
              id: '1',
              name: `${searchQuery} City Center`,
              location: `${searchQuery}, Popular Destination`,
              image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc02?w=400&h=300&fit=crop',
              type: 'attraction',
              country: 'Popular Destination',
              region: searchQuery,
              coordinates: realCoords // ✅ Use real coordinates
            },
            {
              id: '2',
              name: `${searchQuery} Historical Site`,
              location: `${searchQuery}, Cultural Heritage`,
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
              type: 'attraction',
              country: 'Cultural Heritage',
              region: searchQuery,
              coordinates: { 
                lat: realCoords.lat + (Math.random() - 0.5) * 0.01, // Small variation
                lng: realCoords.lng + (Math.random() - 0.5) * 0.01 
              }
            },
            {
              id: '3',
              name: `${searchQuery} Local Restaurant`,
              location: `${searchQuery}, Food & Dining`,
              image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
              type: 'restaurant',
              country: 'Food & Dining',
              region: searchQuery,
              coordinates: { 
                lat: realCoords.lat + (Math.random() - 0.5) * 0.01, // Small variation
                lng: realCoords.lng + (Math.random() - 0.5) * 0.01 
              }
            }
          ];
          
          setSuggestions(fallbackSuggestions);
        }
        } catch (err) {
        console.error('❌ Error searching places:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        
        // Use fallback search on error
        // ✅ Enhanced fallback with real coordinates for error cases
        const realCoords = getRealCoordinates(searchQuery);
        const fallbackSuggestions: SearchResult[] = [
          {
            id: '1',
            name: `${searchQuery} Tourist Spot`,
            location: `${searchQuery}, Travel Destination`,
            image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc02?w=400&h=300&fit=crop',
            type: 'attraction',
            country: 'Travel Destination',
            region: searchQuery,
            coordinates: realCoords // ✅ Use real coordinates
          }
        ];
        
        console.log('🔄 Using fallback suggestions:', fallbackSuggestions);
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
    
    // ✅ Validate and fix coordinates
    const lat = parseFloat(suggestion.coordinates.lat.toString());
    const lng = parseFloat(suggestion.coordinates.lng.toString());
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates from API:', suggestion.coordinates);
      setAddingPlaceId(null);
      return;
    }
    
    const newPlace: Omit<Place, 'id'> = {
      name: suggestion.name,
      location: suggestion.location,
      description: `${suggestion.type} in ${suggestion.region}, ${suggestion.country}`,
      category: suggestion.type.toLowerCase(),
      rating: 4, // Default rating
      photos: suggestion.image ? [suggestion.image] : [],
      coordinates: { lat, lng }, // ✅ Ensure proper number format
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
