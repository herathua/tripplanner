import React from 'react';
import { Search, Hotel, X } from 'lucide-react';

interface HotelDestination {
  dest_id: string;
  name: string;
  label: string;
  dest_type: string;
  region: string;
  city_name: string;
  country: string;
  hotels: number;
  latitude: number;
  longitude: number;
  image_url?: string;
}

interface HotelSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  destinations: HotelDestination[];
  onAddHotel: (hotel: HotelDestination) => void;
}

const HotelSearchModal: React.FC<HotelSearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  isSearching,
  destinations,
  onAddHotel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Search Hotels & Destinations</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 rounded hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for hotels, cities, or destinations..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={onSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Searching for hotels...</span>
          </div>
        )}

        {!isSearching && destinations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Search Results</h4>
            {destinations.map((hotel) => (
              <div key={hotel.dest_id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => onAddHotel(hotel)}>
                <div className="flex-shrink-0 w-16 h-16">
                  {hotel.image_url ? (
                    <img 
                      src={hotel.image_url} 
                      alt={hotel.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <Hotel className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900 truncate">{hotel.name}</h5>
                  <p className="text-sm text-gray-500">{hotel.label}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-400 capitalize">{hotel.dest_type}</span>
                    <span className="text-xs text-blue-600">{hotel.hotels} hotels</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isSearching && destinations.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-500">
            <Hotel className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No destinations found for "{searchQuery}"</p>
            <p className="text-sm">Try searching for a different location</p>
          </div>
        )}

        {!isSearching && destinations.length === 0 && !searchQuery && (
          <div className="text-center py-8 text-gray-500">
            <Hotel className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Search for hotels and destinations</p>
            <p className="text-sm">Enter a city, hotel name, or destination to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelSearchModal;
