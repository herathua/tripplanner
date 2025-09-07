import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Trip, tripService } from '../services/tripService';
import { Activity, ItineraryData, itineraryService } from '../services/itineraryService';
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
  itineraryData: ItineraryData;
}

interface TripContextType {
  state: TripState;
  createTrip: (trip: Trip) => Promise<void>;
  loadTrip: (id: number) => Promise<void>;
  saveTrip: () => Promise<Trip | null>;
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
  itineraryData: { days: [] },
};

// Action types
type TripAction =
  | { type: 'SET_CURRENT_TRIP'; payload: Trip }
  | { type: 'SET_ITINERARY_DATA'; payload: ItineraryData }
  | { type: 'ADD_PLACE'; payload: Place }
  | { type: 'REMOVE_PLACE'; payload: string }
  | { type: 'CLEAR_PLACES' }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'REMOVE_ACTIVITY'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string }
  | { type: 'CLEAR_EXPENSES' }
  | { type: 'UPDATE_TRIP_NAME'; payload: string }
  | { type: 'UPDATE_TRIP_BUDGET'; payload: number }
  | { type: 'CLEAR_TRIP' };

// Reducer
const tripReducer = (state: TripState, action: TripAction): TripState => {
  switch (action.type) {
    case 'SET_CURRENT_TRIP':
      return {
        ...state,
        currentTrip: action.payload,
      };
    case 'SET_ITINERARY_DATA':
      console.log('🔄 SET_ITINERARY_DATA action:', action.payload);
      const activities = action.payload.days.flatMap(day => day.activities);
      console.log('🎯 Extracted activities:', activities);
      return {
        ...state,
        itineraryData: action.payload,
        // Update activities from itinerary data
        activities: activities,
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
    case 'CLEAR_PLACES':
      return {
        ...state,
        places: [],
      };
    case 'ADD_ACTIVITY':
      console.log('🔄 ADD_ACTIVITY action:', action.payload);
      console.log('📊 Current activities before add:', state.activities.length);
      console.log('🎯 Activity ID being added:', action.payload.id);
      
      // Check if activity with same ID already exists
      const existingActivity = state.activities.find(a => a.id === action.payload.id);
      if (existingActivity) {
        console.log('⚠️ Activity with same ID already exists, skipping duplicate');
        return state;
      }
      
      const newActivities = [...state.activities, action.payload];
      console.log('📊 New activities count:', newActivities.length);
      
      return {
        ...state,
        activities: newActivities,
        // Update itinerary data
        itineraryData: itineraryService.addActivityToDay(state.itineraryData, action.payload.dayNumber, action.payload),
      };
    case 'REMOVE_ACTIVITY':
      // Find the activity to get its day number
      const activityToRemove = state.activities.find(activity => activity.id === action.payload);
      const dayNumber = activityToRemove?.dayNumber || 1;
      
      return {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload),
        // Update itinerary data
        itineraryData: itineraryService.removeActivityFromDay(state.itineraryData, dayNumber, action.payload),
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
    case 'CLEAR_EXPENSES':
      return {
        ...state,
        expenses: [],
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
    case 'CLEAR_TRIP':
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

// Helper function to map frontend expense categories to backend expense categories
const mapExpenseCategoryToBackend = (frontendCategory: string): string => {
  const expenseCategoryMap: { [key: string]: string } = {
    'accommodation': 'ACCOMMODATION',
    'food': 'FOOD',
    'transport': 'TRANSPORT',
    'activities': 'ACTIVITIES',
    'shopping': 'SHOPPING',
    'entertainment': 'ENTERTAINMENT',
    'insurance': 'INSURANCE',
    'health': 'HEALTH',
    'visas': 'VISAS',
    'fees': 'FEES',
    'tips': 'TIPS',
    'other': 'OTHER'
  };
  
  return expenseCategoryMap[frontendCategory.toLowerCase()] || 'OTHER';
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
      console.log('🔄 Loading trip:', trip);
      console.log('📊 Trip itineraryData:', trip.itineraryData);
      dispatch({ type: 'SET_CURRENT_TRIP', payload: trip });
      
      // Clear existing data first
      dispatch({ type: 'CLEAR_PLACES' });
      dispatch({ type: 'CLEAR_EXPENSES' });
      
      // Load itinerary data from JSON
      if (trip.itineraryData) {
        console.log('📅 Parsing itinerary data...');
        const itineraryData = itineraryService.parseItineraryData(trip.itineraryData);
        console.log('✅ Parsed itinerary data:', itineraryData);
        console.log('🎯 Activities found:', itineraryData.days.flatMap(day => day.activities));
        dispatch({ type: 'SET_ITINERARY_DATA', payload: itineraryData });
      } else {
        console.log('⚠️ No itinerary data found in trip');
      }
      
      // Load places if they exist
      if (trip.places && trip.places.length > 0) {
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

      // Load expenses if they exist
      if (trip.expenses && trip.expenses.length > 0) {
        trip.expenses.forEach((expense: any) => {
          const contextExpense: Expense = {
            id: expense.id?.toString() || Math.random().toString(36).substr(2, 9),
            dayNumber: expense.dayNumber || 1,
            date: expense.expenseDate || new Date().toISOString().split('T')[0],
            category: expense.category || 'OTHER',
            description: expense.description || '',
            amount: expense.amount || 0
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
    if (!state.currentTrip) return null;
    
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
        // Include itinerary data as JSON string
        itineraryData: itineraryService.stringifyItineraryData(state.itineraryData),
        expenses: state.expenses.map(expense => ({
          dayNumber: expense.dayNumber,
          expenseDate: expense.date,
          category: mapExpenseCategoryToBackend(expense.category),
          description: expense.description,
          amount: expense.amount
        }))
      };
      
      if (state.currentTrip.id) {
        const updatedTrip = await tripService.updateTrip(state.currentTrip.id, tripData);
        return updatedTrip;
      } else {
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }
        const createdTrip = await tripService.createTrip(tripData, user.uid);
        dispatch({ type: 'SET_CURRENT_TRIP', payload: createdTrip });
        return createdTrip;
      }
    } catch (error: any) {
      console.error('Error saving trip:', error);
      if (error.response?.data) {
        console.error('Backend error response:', error.response.data);
        throw new Error(`Backend error: ${error.response.data}`);
      }
      throw error;
    }
  };

  // Initialize trip from URL parameters
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
      id: 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), // Generate a string ID
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
