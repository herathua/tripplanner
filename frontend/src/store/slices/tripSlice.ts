import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface TripDay {
  date: string;
  activities: Array<{
    id: string;
    name: string;
    location: string;
    startTime: string;
    endTime: string;
    description?: string;
  }>;
}

export interface TripDetails {
  startDate: string;
  endDate: string;
  budget: number;
  isConfigured: boolean;
  tripName: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  days: TripDay[];
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface TripState {
  currentTrip: Trip | null;
  trips: Trip[];
  tripDetails: TripDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: TripState = {
  currentTrip: null,
  trips: [],
  tripDetails: null,
  loading: false,
  error: null,
};

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setCurrentTrip: (state, action: PayloadAction<Trip | null>) => {
      state.currentTrip = action.payload;
    },
    setTrips: (state, action: PayloadAction<Trip[]>) => {
      state.trips = action.payload;
    },
    setTripDetails: (state, action: PayloadAction<TripDetails>) => {
      state.tripDetails = action.payload;
    },
    clearTripDetails: (state) => {
      state.tripDetails = null;
    },
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.trips.push(action.payload);
    },
    updateTrip: (state, action: PayloadAction<Trip>) => {
      const index = state.trips.findIndex(trip => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = action.payload;
      }
      if (state.currentTrip?.id === action.payload.id) {
        state.currentTrip = action.payload;
      }
    },
    deleteTrip: (state, action: PayloadAction<string>) => {
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
      if (state.currentTrip?.id === action.payload) {
        state.currentTrip = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateTripDay: (state, action: PayloadAction<{ tripId: string; day: TripDay }>) => {
      const { tripId, day } = action.payload;
      const trip = state.trips.find(t => t.id === tripId);
      if (trip) {
        const dayIndex = trip.days.findIndex(d => d.date === day.date);
        if (dayIndex !== -1) {
          trip.days[dayIndex] = day;
        } else {
          trip.days.push(day);
        }
        if (state.currentTrip?.id === tripId) {
          state.currentTrip = { ...trip };
        }
      }
    },
  },
});

export const {
  setCurrentTrip,
  setTrips,
  setTripDetails,
  clearTripDetails,
  addTrip,
  updateTrip,
  deleteTrip,
  setLoading,
  setError,
  updateTripDay,
} = tripSlice.actions;

export default tripSlice.reducer; 