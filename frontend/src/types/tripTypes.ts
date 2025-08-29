// Trip-related types and interfaces

export interface Place {
  id: string;
  name: string;
  location: string;
  description: string;
  category: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'shopping';
  rating: number;
  photos: string[];
  coordinates: { lat: number; lng: number };
  cost: number;
  duration: number; // in hours
  dayNumber?: number;
}

export interface HotelDestination {
  dest_id: string;
  name: string;
  label: string;
  country: string;
  region: string;
  city_name: string;
  dest_type: string;
  latitude: number;
  longitude: number;
  image_url: string;
  hotels: number;
  nr_hotels: number;
  cc1: string;
  type: string;
  roundtrip: string;
  lc: string;
  city_ufi?: number;
}

export interface Activity {
  id: string;
  dayNumber: number;
  time: string;
  placeId: string;
  placeName: string;
  description: string;
  cost: number;
  duration: number;
  type: 'sightseeing' | 'dining' | 'transport' | 'accommodation' | 'shopping';
}

export interface Expense {
  id: string;
  dayNumber: number;
  category: 'accommodation' | 'food' | 'transport' | 'activities' | 'shopping' | 'other';
  description: string;
  amount: number;
  date: Date;
}
