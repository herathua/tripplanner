import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Trip, TripStatus, TripVisibility, tripService } from '../services/tripService';
import { Activity, ActivityType, ActivityStatus } from '../services/itineraryService';

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
  | { type: 'UPDATE_TRIP_BUDGET'; payload: number };

// Reducer
const tripReducer = (state: TripState, action: TripAction): TripState => {
  switch (action.type) {
    case 'SET_CURRENT_TRIP':
      return {
        ...state,
        currentTrip: action.payload,
      };
    case 'ADD_PLACE':
      return {
        ...state,
        places: [...state.places, action.payload],
      };
    case 'REMOVE_PLACE':
      return {
        ...state,
        places: state.places.filter(place => place.id !== action.payload),
      };
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [...state.activities, action.payload],
      };
    case 'REMOVE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload),
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };
    case 'REMOVE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    case 'UPDATE_TRIP_NAME':
      return {
        ...state,
        currentTrip: state.currentTrip ? { ...state.currentTrip, title: action.payload } : null,
      };
    case 'UPDATE_TRIP_BUDGET':
      return {
        ...state,
        currentTrip: state.currentTrip ? { ...state.currentTrip, budget: action.payload } : null,
      };
    default:
      return state;
  }
};

// Create context
const TripContext = createContext<TripContextType | undefined>(undefined);

// Provider component
export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // API functions
  const createTrip = async (trip: Trip) => {
    try {
      const createdTrip = await tripService.createTrip(trip);
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
        await tripService.createTrip(state.currentTrip);
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
    const newPlace: Place = {
      ...place,
      id: Math.random().toString(36).substr(2, 9),
    };
    dispatch({ type: 'ADD_PLACE', payload: newPlace });
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
