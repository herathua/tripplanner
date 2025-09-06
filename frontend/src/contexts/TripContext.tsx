import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Trip, TripStatus, TripVisibility, tripService } from '../services/tripService';
import { Activity, ActivityType, ActivityStatus } from '../services/itineraryService';
import { useAppSelector } from '../store';

export interface Place {
  id?: string;
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

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date?: string;
  dayNumber?: number;
}

interface TripState {
  currentTrip: Trip | null;
  places: Place[];
  activities: Activity[];
  expenses: Expense[];
}

interface TripContextType {
  state: TripState;
  createTrip: (trip: Trip) => Promise<void>;
  loadTrip: (id: number) => Promise<void>;
  saveTrip: () => Promise<void>;
  addPlace: (place: Omit<Place, 'id'>) => void;
  removePlace: (placeId: string) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  removeActivity: (activityId: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  removeExpense: (expenseId: string) => void;
  updateTripName: (name: string) => void;
  updateTripBudget: (budget: number) => void;
  initializeTripFromParams: (params: URLSearchParams) => void;
  clearTrip: () => void;
}

// Initial state
const initialState: TripState = {
  currentTrip: null,
  places: [],
  activities: [],
  expenses: [],
};

// Action types
type TripAction =
  | { type: 'SET_CURRENT_TRIP'; payload: Trip }
  | { type: 'ADD_PLACE'; payload: Place }
  | { type: 'REMOVE_PLACE'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'REMOVE_ACTIVITY'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string }
  | { type: 'UPDATE_TRIP_NAME'; payload: string }
  | { type: 'UPDATE_TRIP_BUDGET'; payload: number }
  | { type: 'CLEAR_TRIP' };

// Reducer
const tripReducer = (state: TripState, action: TripAction): TripState => {
  console.log('🔄 TripContext reducer called with action:', action.type, action.type === 'CLEAR_TRIP' ? 'no payload' : action.payload);
  
  switch (action.type) {
    case 'SET_CURRENT_TRIP':
      console.log('📝 Setting current trip:', action.payload);
      return {
        ...state,
        currentTrip: action.payload,
      };
    case 'ADD_PLACE':
      console.log('📍 Adding place to context:', action.payload);
      const newState = {
        ...state,
        places: [...state.places, action.payload],
      };
      console.log('✅ New state after adding place:', newState);
      return newState;
    case 'REMOVE_PLACE':
      console.log('🗑️ Removing place:', action.payload);
      return {
        ...state,
        places: state.places.filter(place => place.id !== action.payload),
      };
    case 'ADD_ACTIVITY':
      console.log('🎯 Adding activity:', action.payload);
      return {
        ...state,
        activities: [...state.activities, action.payload],
      };
    case 'REMOVE_ACTIVITY':
      console.log('🗑️ Removing activity:', action.payload);
      return {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload),
      };
    case 'ADD_EXPENSE':
      console.log('💰 Adding expense:', action.payload);
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };
    case 'REMOVE_EXPENSE':
      console.log('🗑️ Removing expense:', action.payload);
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    case 'UPDATE_TRIP_NAME':
      console.log('✏️ Updating trip name:', action.payload);
      return {
        ...state,
        currentTrip: state.currentTrip ? { ...state.currentTrip, title: action.payload } : null,
      };
    case 'UPDATE_TRIP_BUDGET':
      console.log('💰 Updating trip budget:', action.payload);
      return {
        ...state,
        currentTrip: state.currentTrip ? { ...state.currentTrip, budget: action.payload } : null,
      };
    case 'CLEAR_TRIP':
      console.log('🧹 Clearing trip state');
      return initialState;
    default:
      return state;
  }
};

// Create context
const TripContext = createContext<TripContextType | undefined>(undefined);

// Helper function to map frontend categories to backend categories
const mapCategoryToBackend = (frontendCategory: string): string => {
  const categoryMap: { [key: string]: string } = {
    'hotel': 'HOTEL',
    'restaurant': 'RESTAURANT',
    'attraction': 'ATTRACTION',
    'transport': 'TRANSPORT',
    'shopping': 'SHOPPING',
    'entertainment': 'ENTERTAINMENT',
    'cultural': 'CULTURAL',
    'nature': 'NATURE',
    'sports': 'SPORTS',
    'religious': 'RELIGIOUS',
    'historical': 'HISTORICAL',
    'region': 'OTHER', // Map region to OTHER
    'other': 'OTHER'
  };
  
  return categoryMap[frontendCategory.toLowerCase()] || 'OTHER';
};

// Provider component
export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  const user = useAppSelector((state) => state.auth.user);

  // API functions
  const createTrip = async (trip: Trip) => {
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      const createdTrip = await tripService.createTrip(trip, user.uid);
      dispatch({ type: 'SET_CURRENT_TRIP', payload: createdTrip });
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  };

  const loadTrip = async (id: number) => {
    try {
      const trip = await tripService.getTripById(id);
      dispatch({ type: 'SET_CURRENT_TRIP', payload: trip });
      
      // Load places if they exist in the trip data
      if (trip.places && trip.places.length > 0) {
        console.log('Loading places from trip data:', trip.places);
        trip.places.forEach((place: any) => {
          const contextPlace: Place = {
            id: place.id?.toString() || Math.random().toString(36).substr(2, 9),
            name: place.name,
            location: place.location,
            description: place.description || '',
            category: place.category,
            rating: place.rating || 5,
            cost: place.cost || 0,
            duration: place.duration || 2,
            coordinates: { 
              lat: place.latitude || 0, 
              lng: place.longitude || 0 
            },
            photos: place.photos || []
          };
          dispatch({ type: 'ADD_PLACE', payload: contextPlace });
        });
      }

      // Activities are loaded separately via itinerary service in Newtrip.tsx

      // Load expenses if they exist in the trip data
      if (trip.expenses && trip.expenses.length > 0) {
        console.log('Loading expenses from trip data:', trip.expenses);
        trip.expenses.forEach((expense: any) => {
          const contextExpense: Expense = {
            id: expense.id?.toString() || Math.random().toString(36).substr(2, 9),
            dayNumber: expense.dayNumber || 1,
            expenseDate: expense.expenseDate || new Date().toISOString().split('T')[0],
            category: expense.category || 'OTHER',
            description: expense.description || '',
            amount: expense.amount || 0,
            currency: expense.currency || 'USD',
            receiptUrl: expense.receiptUrl,
            paymentMethod: expense.paymentMethod,
            vendor: expense.vendor,
            location: expense.location,
            notes: expense.notes,
            reimbursable: expense.reimbursable || false,
            reimbursed: expense.reimbursed || false,
            reimbursementReference: expense.reimbursementReference,
            status: expense.status || 'PAID'
          };
          dispatch({ type: 'ADD_EXPENSE', payload: contextExpense });
        });
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      throw error;
    }
  };

  const saveTrip = async () => {
    if (!state.currentTrip) return;
    
    try {
      // Create trip data with places, activities, and expenses included
      const tripData = {
        ...state.currentTrip,
        // Ensure destination is not empty
        destination: state.currentTrip.destination || 'Unknown Destination',
        places: state.places.map(place => ({
          name: place.name,
          location: place.location || 'Unknown Location',
          description: place.description,
          category: mapCategoryToBackend(place.category),
          rating: place.rating,
          cost: place.cost,
          duration: place.duration,
          latitude: place.coordinates.lat,
          longitude: place.coordinates.lng,
          photos: place.photos
        })),
        // Activities are handled separately via itinerary service
        // They will be loaded when the trip is loaded
        expenses: state.expenses.map(expense => ({
          dayNumber: expense.dayNumber,
          expenseDate: expense.expenseDate,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          currency: expense.currency,
          receiptUrl: expense.receiptUrl,
          paymentMethod: expense.paymentMethod,
          vendor: expense.vendor,
          location: expense.location,
          notes: expense.notes,
          reimbursable: expense.reimbursable,
          reimbursed: expense.reimbursed,
          reimbursementReference: expense.reimbursementReference,
          status: expense.status
        }))
      };
      
      if (state.currentTrip.id) {
        await tripService.updateTrip(state.currentTrip.id, tripData);
      } else {
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }
        await tripService.createTrip(tripData, user.uid);
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      throw error;
    }
  };

  // Initialize trip from URL parameters (from HomePage)
  const initializeTripFromParams = useCallback((params: URLSearchParams) => {
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    const budget = params.get('budget');
    const tripName = params.get('tripName');
    const tripDescription = params.get('tripDescription');

    if (startDate && endDate && budget && tripName) {
      const trip: Trip = {
        title: tripName,
        destination: tripDescription || '',
        startDate,
        endDate,
        budget: parseFloat(budget),
      };
      
      dispatch({ type: 'SET_CURRENT_TRIP', payload: trip });
    }
  }, [dispatch]);

  // Local state management functions
  const addPlace = (place: Omit<Place, 'id'>) => {
    console.log('🏗️ addPlace called with:', place);
    const newPlace: Place = {
      ...place,
      id: Math.random().toString(36).substr(2, 9),
    };
    console.log('🆔 Generated new place with ID:', newPlace.id);
    console.log('📤 Dispatching ADD_PLACE action...');
    dispatch({ type: 'ADD_PLACE', payload: newPlace });
    console.log('✅ ADD_PLACE action dispatched');
  };

  const removePlace = (placeId: string) => {
    dispatch({ type: 'REMOVE_PLACE', payload: placeId });
  };

  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
  };

  const removeActivity = (activityId: string) => {
    dispatch({ type: 'REMOVE_ACTIVITY', payload: activityId });
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(), // Convert Date object to ISO string
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const removeExpense = (expenseId: string) => {
    dispatch({ type: 'REMOVE_EXPENSE', payload: expenseId });
  };

  const updateTripName = (name: string) => {
    dispatch({ type: 'UPDATE_TRIP_NAME', payload: name });
  };

  const updateTripBudget = (budget: number) => {
    dispatch({ type: 'UPDATE_TRIP_BUDGET', payload: budget });
  };

  const clearTrip = () => {
    console.log('Clearing trip state - starting fresh');
    dispatch({ type: 'CLEAR_TRIP' });
  };

  const value: TripContextType = {
    state,
    createTrip,
    loadTrip,
    saveTrip,
    addPlace,
    removePlace,
    addActivity,
    removeActivity,
    addExpense,
    removeExpense,
    updateTripName,
    updateTripBudget,
    initializeTripFromParams,
    clearTrip,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

// Custom hook to use the context
export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
