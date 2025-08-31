import { useState } from 'react';
import { locationService } from '../services/locationService';

export interface HotelDestination {
  id: string;
  name: string;
  city_name: string;
  country: string;
  region: string;
  dest_type: string;
  hotels: number;
  latitude: number;
  longitude: number;
  image_url: string;
}

export const useHotelSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<HotelDestination[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = async (query: string) => {
    if (!query.trim()) {
      setDestinations([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Use our backend location search API instead of direct external API
      // Limit to 3 results as requested
      const response = await locationService.searchLocations(query, 'en', 3);
      
      if (response.success && response.data?.data?.autoCompleteSuggestions?.results) {
        const results = response.data.data.autoCompleteSuggestions.results;
        
        // Transform the results to match our HotelDestination interface
        const transformedDestinations: HotelDestination[] = results.map((result: any) => ({
          id: result.destination.destId,
          name: result.displayInfo.title,
          city_name: result.displayInfo.labelComponents.find((comp: any) => comp.type === 'CITY')?.name || '',
          country: result.displayInfo.labelComponents.find((comp: any) => comp.type === 'COUNTRY')?.name || '',
          region: result.displayInfo.labelComponents.find((comp: any) => comp.type === 'REGION')?.name || '',
          dest_type: result.destination.destType,
          hotels: result.destination.nbHotels,
          latitude: result.destination.latitude,
          longitude: result.destination.longitude,
          image_url: result.displayInfo.absoluteImageUrl
        }));

        setDestinations(transformedDestinations);
      } else {
        setDestinations([]);
        setError('No results found');
      }
    } catch (err) {
      console.error('Error searching hotels:', err);
      setError('Failed to search hotels. Please try again.');
      setDestinations([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDestinations([]);
    setError(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    destinations,
    isSearching,
    error,
    searchHotels,
    clearSearch
  };
};
