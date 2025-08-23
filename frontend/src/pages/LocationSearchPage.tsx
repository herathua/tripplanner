import React, { useState, useEffect, useRef, Suspense } from 'react';
import { MapPin, Search, Globe } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Lazy load Leaflet components
const MapComponent = React.lazy(() => import('../components/MapComponent'));

interface AutocompleteSuggestion {
  destination: {
    destId: string;
    destType: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    nbHotels: number;
  };
  displayInfo: {
    title: string;
    subTitle: string;
    labelComponents: Array<{
      type: string;
      name: string;
    }>;
    absoluteImageUrl: string | null;
  };
}

const LocationSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<AutocompleteSuggestion | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Map settings
  const defaultCenter: [number, number] = [0, 0];
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch suggestions
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://booking-com-api5.p.rapidapi.com/accomodation/autocomplete?languagecode=en&limit=4&query=${searchQuery}&currency_code=USD`,
        {
          headers: {
            'X-Rapidapi-Key': 'bbefbd0c2cmsh32738304eae9dfap19a055jsn132ee598d744',
            'X-Rapidapi-Host': 'booking-com-api5.p.rapidapi.com'
          }
        }
      );

      const data = await response.json();
      
      if (data.success && data.data?.data?.autoCompleteSuggestions?.results) {
        setSuggestions(data.data.data.autoCompleteSuggestions.results);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setError('Failed to fetch suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    debouncedFetchSuggestions(value);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    setSelectedLocation(suggestion);
    setQuery(suggestion.displayInfo.title);
    setShowSuggestions(false);
    
    // Update map center
    const newCenter: [number, number] = [
      suggestion.destination.latitude,
      suggestion.destination.longitude
    ];
    setMapCenter(newCenter);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Explore Locations</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing places around the world. Search for any location and explore it on our interactive map.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Search Section */}
          <div className="relative" ref={suggestionsRef}>
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for a city, landmark, or destination..."
                className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 group-hover:border-blue-200"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors duration-200" />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</div>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl max-h-96 overflow-y-auto border border-gray-100">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-3">
                      {suggestion.displayInfo.absoluteImageUrl ? (
                        <img
                          src={suggestion.displayInfo.absoluteImageUrl}
                          alt={suggestion.displayInfo.title}
                          className="w-14 h-14 rounded-lg object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-blue-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {suggestion.displayInfo.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {suggestion.displayInfo.subTitle}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {suggestion.destination.nbHotels} hotels
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {suggestion.destination.destType.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showSuggestions && query && !isLoading && suggestions.length === 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg p-4 text-gray-500 text-center border border-gray-100">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                No locations found
              </div>
            )}

            {/* Selected Location Details */}
            {selectedLocation && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 w-24">Name:</span>
                    <span className="text-gray-900">{selectedLocation.displayInfo.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 w-24">Location:</span>
                    <span className="text-gray-900">{selectedLocation.displayInfo.subTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 w-24">Type:</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {selectedLocation.destination.destType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 w-24">Hotels:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {selectedLocation.destination.nbHotels} available
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px] border border-gray-100">
            <Suspense fallback={
              <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading map...</p>
                </div>
              </div>
            }>
              <MapComponent
                center={mapCenter}
                selectedLocation={selectedLocation}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSearchPage; 