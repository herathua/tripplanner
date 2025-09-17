import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Trip, TripStatus, TripVisibility, tripService } from '../services/tripService';
import { Activity, ActivityType, ActivityStatus } from '../services/itineraryService';
import { useAppSelector } from '../store';

export interface Place {
  id?: string;
  tripId?: number; // ✅ Add tripId to Place interface
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
  placesByTrip: { [tripId: number]: Place[] }; // ✅ Store places by tripId
  activities: Activity[];
  expenses: Expense[];
}

interface TripContextType {
  state: TripState;
  createTrip: (trip: Trip) => Promise<void>;
  loadTrip: (id: number) => Promise<void>;
  saveTrip: () => Promise<void>;
  addPlace: (place: Omit<Place, 'id'>, tripId?: number) => void; // ✅ Updated signature
  removePlace: (placeId: string, tripId: number) => void; // ✅ Updated signature
  getPlacesForTrip: (tripId: number) => Place[]; // ✅ New helper function
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
  placesByTrip: {}, // ✅ Initialize empty object for trip-specific places
  activities: [],
  expenses: [],
};

// Action types
type TripAction =
  | { type: 'SET_CURRENT_TRIP'; payload: Trip }
  | { type: 'ADD_PLACE'; payload: Place }
  | { type: 'REMOVE_PLACE'; payload: { placeId: string; tripId: number } } // ✅ Updated payload structure
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
      const place = action.payload;
      const tripId = place.tripId;
      
      if (!tripId) {
        console.warn('⚠️ Place missing tripId, cannot add to context');
        return state;
      }
      
      const currentPlaces = state.placesByTrip[tripId] || [];
      const newState = {
        ...state,
        placesByTrip: {
          ...state.placesByTrip,
          [tripId]: [...currentPlaces, place]
        },
      };
      console.log('✅ New state after adding place:', newState);
      return newState;
    case 'REMOVE_PLACE':
      console.log('🗑️ Removing place:', action.payload);
      const { placeId, tripId: removeTripId } = action.payload as { placeId: string; tripId: number };
      
      if (!removeTripId) {
        console.warn('⚠️ Remove place missing tripId');
        return state;
      }
      
      const tripPlaces = state.placesByTrip[removeTripId] || [];
      return {
        ...state,
        placesByTrip: {
          ...state.placesByTrip,
          [removeTripId]: tripPlaces.filter(place => place.id !== placeId)
        },
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
    } catch (error) {
      console.error('Error loading trip:', error);
      throw error;
    }
  };

  const saveTrip = async () => {
    if (!state.currentTrip) return;
    
    try {
      if (state.currentTrip.id) {
        await tripService.updateTrip(state.currentTrip.id, state.currentTrip);
      } else {
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }
        await tripService.createTrip(state.currentTrip, user.uid);
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
  const addPlace = (place: Omit<Place, 'id'>, tripId?: number) => {
    console.log('🏗️ addPlace called with:', place, 'tripId:', tripId);
    const newPlace: Place = {
      ...place,
      id: Math.random().toString(36).substr(2, 9),
      tripId: tripId, // ✅ Include tripId
    };
    console.log('🆔 Generated new place with ID:', newPlace.id);
    console.log('📤 Dispatching ADD_PLACE action...');
    dispatch({ type: 'ADD_PLACE', payload: newPlace });
    console.log('✅ ADD_PLACE action dispatched');
  };

  const removePlace = (placeId: string, tripId: number) => {
    dispatch({ type: 'REMOVE_PLACE', payload: { placeId, tripId } });
  };

  // ✅ Helper function to get places for a specific trip
  const getPlacesForTrip = (tripId: number): Place[] => {
    return state.placesByTrip[tripId] || [];
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
    getPlacesForTrip, // ✅ Add new helper function
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
