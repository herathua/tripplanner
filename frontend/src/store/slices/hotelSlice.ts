import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Hotel {
  id: string;
  name: string;
  location: {
    city: string;
    country: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  price: {
    amount: number;
    currency: string;
  };
  amenities: string[];
  images: string[];
  description: string;
  availableRooms: number;
  checkIn: string;
  checkOut: string;
}

export interface HotelBooking {
  id: string;
  hotelId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface HotelState {
  searchResults: Hotel[];
  selectedHotel: Hotel | null;
  bookings: HotelBooking[];
  filters: {
    priceRange: [number, number];
    rating: number;
    amenities: string[];
    location: string;
  };
  loading: boolean;
  error: string | null;
}

const initialState: HotelState = {
  searchResults: [],
  selectedHotel: null,
  bookings: [],
  filters: {
    priceRange: [0, 1000],
    rating: 0,
    amenities: [],
    location: '',
  },
  loading: false,
  error: null,
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setSearchResults: (state, action: PayloadAction<Hotel[]>) => {
      state.searchResults = action.payload;
    },
    setSelectedHotel: (state, action: PayloadAction<Hotel | null>) => {
      state.selectedHotel = action.payload;
    },
    setBookings: (state, action: PayloadAction<HotelBooking[]>) => {
      state.bookings = action.payload;
    },
    addBooking: (state, action: PayloadAction<HotelBooking>) => {
      state.bookings.push(action.payload);
    },
    updateBooking: (state, action: PayloadAction<HotelBooking>) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    },
    deleteBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Partial<HotelState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSearchResults,
  setSelectedHotel,
  setBookings,
  addBooking,
  updateBooking,
  deleteBooking,
  setFilters,
  resetFilters,
  setLoading,
  setError,
} = hotelSlice.actions;

export default hotelSlice.reducer; 