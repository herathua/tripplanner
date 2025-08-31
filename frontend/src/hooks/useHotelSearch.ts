import { useState } from 'react';

export interface HotelDestination {
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

export const useHotelSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<HotelDestination[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchHotels = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
          try {
            const response = JSON.parse(this.responseText);
            if (response.status && response.data) {
              setDestinations(response.data);
            } else {
              setDestinations([]);
            }
          } catch (error) {
            console.error('Error parsing hotel search response:', error);
            setDestinations([]);
          }
          setIsSearching(false);
        }
      });

      xhr.open('GET', `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`);
      xhr.setRequestHeader('x-rapidapi-key', 'bbefbd0c2cmsh32738304eae9dfap19a055jsn132ee598d744');
      xhr.setRequestHeader('x-rapidapi-host', 'booking-com15.p.rapidapi.com');
      xhr.send();
    } catch (error) {
      console.error('Error searching hotels:', error);
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDestinations([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    destinations,
    isSearching,
    searchHotels,
    clearSearch
  };
};
