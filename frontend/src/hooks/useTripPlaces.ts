import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/slices/uiSlice';
import apiClient from '../config/api';

export interface Place {
  id?: string;
  tripId: number;
  name: string;
  location: string;
  description?: string;
  category: string;
  rating: number;
  photos: string[];
  coordinates: { lat: number; lng: number };
  cost: number;
  duration: number;
}

// ✅ Helper function to map frontend categories to backend enum values
const mapCategoryToBackendEnum = (frontendCategory: string): string => {
  const categoryMap: { [key: string]: string } = {
    'city': 'OTHER',
    'attraction': 'ATTRACTION',
    'restaurant': 'RESTAURANT',
    'hotel': 'HOTEL',
    'transport': 'TRANSPORT',
    'shopping': 'SHOPPING',
    'entertainment': 'ENTERTAINMENT',
    'cultural': 'CULTURAL',
    'nature': 'NATURE',
    'sports': 'SPORTS',
    'religious': 'RELIGIOUS',
    'historical': 'HISTORICAL',
    'other': 'OTHER'
  };
  
  const normalizedCategory = frontendCategory.toLowerCase();
  return categoryMap[normalizedCategory] || 'OTHER';
};

export const useTripPlaces = (tripId: number | null) => {
  const dispatch = useAppDispatch();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadPlaces = useCallback(async () => {
    if (!tripId) return;
    
    setIsLoading(true);
    try {
      console.log(`🔍 Loading places for trip ${tripId}...`);
      const response = await apiClient.get(`/trips/${tripId}/places`);
      console.log(`✅ Loaded ${response.data.length} places for trip ${tripId}:`, response.data);
      
      // ✅ Transform backend place data to frontend format with proper filtering
      const frontendPlaces = response.data
        .filter((backendPlace: any) => {
          // ✅ Ensure we only process places for this trip
          const placeTripId = backendPlace.trip?.id || backendPlace.tripId;
          return placeTripId === tripId;
        })
        .map((backendPlace: any) => ({
          id: backendPlace.id?.toString(),
          tripId: tripId, // ✅ Always use current tripId
          name: backendPlace.name,
          location: backendPlace.location,
          description: backendPlace.description || '',
          category: backendPlace.category?.toLowerCase() || 'other',
          rating: parseInt(backendPlace.rating?.toString() || '4'),
          photos: backendPlace.photos || [],
          coordinates: {
            lat: parseFloat(backendPlace.latitude?.toString() || '0'),
            lng: parseFloat(backendPlace.longitude?.toString() || '0')
          },
          cost: parseFloat(backendPlace.cost?.toString() || '0'),
          duration: parseFloat(backendPlace.duration?.toString() || '2')
        }));
      
      console.log(`🔄 Transformed to frontend format:`, frontendPlaces);
      console.log(`📍 Coordinate validation:`, frontendPlaces.map((p: Place) => ({
        name: p.name,
        lat: p.coordinates.lat,
        lng: p.coordinates.lng,
        validLat: !isNaN(p.coordinates.lat) && p.coordinates.lat >= -90 && p.coordinates.lat <= 90,
        validLng: !isNaN(p.coordinates.lng) && p.coordinates.lng >= -180 && p.coordinates.lng <= 180
      })));
      
      setPlaces(frontendPlaces);
    } catch (error) {
      console.error('Failed to load places:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load places',
        duration: 5000
      }));
    } finally {
      setIsLoading(false);
    }
  }, [tripId, dispatch]);

  const createPlace = useCallback(async (place: Omit<Place, 'id' | 'tripId'>) => {
    if (!tripId) return;
    
    setIsCreating(true);
    try {
      console.log(`🏗️ Creating place for trip ${tripId}:`, place);
      
      // ✅ Validate required fields
      if (!place.name || !place.location) {
        throw new Error('Name and location are required');
      }
      
      // ✅ Validate coordinates
      const lat = parseFloat(place.coordinates.lat.toString());
      const lng = parseFloat(place.coordinates.lng.toString());
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates provided');
      }
      
      // ✅ Transform frontend place data to backend format with strict validation
      const backendPlace = {
        name: place.name.trim(),
        location: place.location.trim(),
        description: place.description?.trim() || '',
        category: mapCategoryToBackendEnum(place.category),
        rating: Math.max(1, Math.min(5, Math.round(place.rating || 4))), // ✅ Ensure integer rating 1-5
        cost: Math.max(0, Math.round((place.cost || 0) * 100) / 100), // ✅ Ensure non-negative cost with 2 decimal places
        duration: Math.max(0.1, Math.round((place.duration || 2.0) * 10) / 10), // ✅ Ensure positive duration with 1 decimal place
        latitude: Math.round(lat * 1000000) / 1000000, // ✅ Ensure 6 decimal places max
        longitude: Math.round(lng * 1000000) / 1000000, // ✅ Ensure 6 decimal places max
        photos: place.photos || [],
        // ✅ Don't include tripId - backend will set the trip relationship
      };
      
      console.log(`📤 Sending to backend:`, backendPlace);
      console.log(`📊 Payload validation:`, {
        name: !!backendPlace.name,
        location: !!backendPlace.location,
        category: backendPlace.category,
        rating: backendPlace.rating,
        cost: backendPlace.cost,
        duration: backendPlace.duration,
        latitude: backendPlace.latitude,
        longitude: backendPlace.longitude,
        nameLength: backendPlace.name.length,
        locationLength: backendPlace.location.length,
        ratingValid: backendPlace.rating >= 1 && backendPlace.rating <= 5,
        costValid: backendPlace.cost >= 0,
        durationValid: backendPlace.duration > 0,
        latValid: backendPlace.latitude >= -90 && backendPlace.latitude <= 90,
        lngValid: backendPlace.longitude >= -180 && backendPlace.longitude <= 180
      });
      
      const response = await apiClient.post(`/trips/${tripId}/places`, backendPlace);
      console.log(`✅ Created place for trip ${tripId}:`, response.data);
      
      // ✅ Transform backend response to frontend format
      const frontendPlace = {
        id: response.data.id?.toString(),
        tripId: tripId,
        name: response.data.name,
        location: response.data.location,
        description: response.data.description,
        category: response.data.category?.toLowerCase() || 'other',
        rating: response.data.rating,
        photos: response.data.photos || [],
        coordinates: {
          lat: parseFloat(response.data.latitude?.toString() || '0'),
          lng: parseFloat(response.data.longitude?.toString() || '0')
        },
        cost: parseFloat(response.data.cost?.toString() || '0'),
        duration: parseFloat(response.data.duration?.toString() || '2')
      };
      
      console.log(`🔄 Transformed frontend place:`, frontendPlace);
      setPlaces(prev => [...prev, frontendPlace]);
      
      dispatch(addNotification({
        type: 'success',
        message: 'Place added successfully!',
        duration: 3000
      }));
    } catch (error: any) {
      console.error('Failed to create place:', error);
      
      // ✅ Log detailed error information
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
        
        // ✅ Log specific validation errors
        if (error.response.data && typeof error.response.data === 'object') {
          console.error('Validation errors:', error.response.data);
          
          // ✅ Log individual field errors
          if (error.response.data.fieldErrors && Array.isArray(error.response.data.fieldErrors)) {
            console.error('Field validation errors:');
            error.response.data.fieldErrors.forEach((fieldError: any, index: number) => {
              console.error(`  ${index + 1}. Field: ${fieldError.field}, Message: ${fieldError.message}, Rejected Value: ${fieldError.rejectedValue}`);
            });
          }
        }
      }
      
      dispatch(addNotification({
        type: 'error',
        message: `Failed to add place: ${error.message || 'Unknown error'}`,
        duration: 5000
      }));
    } finally {
      setIsCreating(false);
    }
  }, [tripId, dispatch]);

  const deletePlace = useCallback(async (placeId: string) => {
    if (!tripId) return;
    
    try {
      console.log(`🗑️ Deleting place ${placeId} from trip ${tripId}...`);
      await apiClient.delete(`/trips/${tripId}/places/${placeId}`);
      console.log(`✅ Deleted place ${placeId} from trip ${tripId}`);
      setPlaces(prev => prev.filter(p => p.id !== placeId));
      
      dispatch(addNotification({
        type: 'success',
        message: 'Place deleted successfully!',
        duration: 3000
      }));
    } catch (error) {
      console.error('Failed to delete place:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete place',
        duration: 5000
      }));
    }
  }, [tripId, dispatch]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  return {
    places,
    isLoading,
    isCreating,
    createPlace,
    deletePlace,
    loadPlaces
  };
};