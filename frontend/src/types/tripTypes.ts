export interface Trip {
  id?: number;
  title: string;
  destination?: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string or LocalDate format
  budget?: number;
  user?: number[];
  itineraryItems?: number[];
}

export interface CreateTripRequest {
  title: string;
  destination?: string;
  startDate: string;
  endDate: string;
  budget?: number;
}

export interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
  budget: number;
  isConfigured: boolean;
  tripName: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}