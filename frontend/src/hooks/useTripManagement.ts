import { useState, useCallback } from 'react';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/slices/uiSlice';
import { tripService } from '../services/tripService';
import { activityService } from '../services/activityService';
import { expenseService } from '../services/expenseService';
import { itineraryService } from '../services/itineraryService';
import { Activity } from '../services/itineraryService';
import { Expense as BackendExpense, ExpenseCategory, Currency, ExpenseStatus } from '../services/expenseService';
import { Expense } from '../contexts/TripContext';

export interface TripManagementResult {
  // Trip data
  trip: any | null;
  activities: Activity[];
  expenses: BackendExpense[];
  itineraries: any[];
  
  // Loading states
  isLoading: boolean;
  isCreatingActivity: boolean;
  isCreatingExpense: boolean;
  
  // Actions
  loadTrip: (tripId: number) => Promise<void>;
  createActivity: (activity: Omit<Activity, 'id'>, tripId: number, selectedDay: number) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'id' | 'date'>, tripId: number) => Promise<void>;
  deleteActivity: (activityId: string, tripId: number) => Promise<void>;
  deleteExpense: (expenseId: string, tripId: number) => Promise<void>;
}

export const useTripManagement = (): TripManagementResult => {
  const dispatch = useAppDispatch();
  
  // State
  const [trip, setTrip] = useState<any | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<BackendExpense[]>([]);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);

  // Load trip data
  const loadTrip = useCallback(async (tripId: number) => {
    setIsLoading(true);
    try {
      // Load trip details
      const tripData = await tripService.getTripById(tripId);
      setTrip(tripData);
      
      // Load related data in parallel
      const [tripItineraries, tripActivities, tripExpenses] = await Promise.all([
        itineraryService.getItinerariesByTripId(tripId),
        activityService.getActivitiesByTripId(tripId),
        expenseService.getExpensesByTripId(tripId)
      ]);
      
      setItineraries(tripItineraries);
      setActivities(tripActivities as Activity[]);
      setExpenses(tripExpenses);
      
    } catch (error) {
      console.error('Failed to load trip:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load trip. Please try again.',
        duration: 5000
      }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Create activity
  const createActivity = useCallback(async (
    activity: Omit<Activity, 'id'>, 
    tripId: number, 
    selectedDay: number
  ) => {
    setIsCreatingActivity(true);
    try {
      // Find or create itinerary for the selected day
      let itinerary = itineraries.find(i => i.dayNumber === selectedDay);
      
      if (!itinerary) {
        // Create new itinerary for this day
        const newItinerary = await itineraryService.createItinerary({
          dayNumber: selectedDay,
          date: new Date().toISOString().split('T')[0], // Use current date as fallback
          tripId: tripId,
          notes: ''
        });
        itinerary = newItinerary;
        setItineraries(prev => [...prev, newItinerary]);
      }

      // Create activity
      const newActivity = await activityService.createActivity({
        ...activity,
        tripId: tripId,
        itineraryId: itinerary.id!
      } as Activity);
      
      setActivities(prev => [...prev, newActivity]);
      
      dispatch(addNotification({
        type: 'success',
        message: 'Activity created successfully!',
        duration: 3000
      }));
      
    } catch (error) {
      console.error('Failed to create activity:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to create activity. Please try again.',
        duration: 5000
      }));
    } finally {
      setIsCreatingActivity(false);
    }
  }, [itineraries, dispatch]);

  // Create expense
  const createExpense = useCallback(async (
    expense: Omit<Expense, 'id' | 'date'>, 
    tripId: number
  ) => {
    setIsCreatingExpense(true);
    try {
      // Convert frontend category to backend format
      const categoryMap: { [key: string]: ExpenseCategory } = {
        'accommodation': ExpenseCategory.ACCOMMODATION,
        'food': ExpenseCategory.FOOD,
        'transport': ExpenseCategory.TRANSPORT,
        'activities': ExpenseCategory.ACTIVITIES,
        'shopping': ExpenseCategory.SHOPPING,
        'other': ExpenseCategory.OTHER
      };
      
      // Convert frontend expense to backend format
      const backendExpense: Omit<BackendExpense, 'id'> = {
        dayNumber: expense.dayNumber || 1,
        expenseDate: new Date().toISOString().split('T')[0],
        category: categoryMap[expense.category] || ExpenseCategory.OTHER,
        description: expense.description,
        amount: parseFloat(expense.amount.toString()),
        currency: Currency.USD,
        status: ExpenseStatus.PAID,
        tripId: tripId
      };
      
      const newExpense = await expenseService.createExpense(backendExpense);
      setExpenses(prev => [...prev, newExpense]);
      
      dispatch(addNotification({
        type: 'success',
        message: 'Expense created successfully!',
        duration: 3000
      }));
      
    } catch (error) {
      console.error('Failed to create expense:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to create expense. Please try again.',
        duration: 5000
      }));
    } finally {
      setIsCreatingExpense(false);
    }
  }, [dispatch]);

  // Delete activity
  const deleteActivity = useCallback(async (activityId: string, tripId: number) => {
    try {
      await activityService.deleteActivity(parseInt(activityId));
      setActivities(prev => prev.filter(a => a.id?.toString() !== activityId));
      
      dispatch(addNotification({
        type: 'success',
        message: 'Activity deleted successfully!',
        duration: 3000
      }));
      
    } catch (error) {
      console.error('Failed to delete activity:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete activity. Please try again.',
        duration: 5000
      }));
    }
  }, [dispatch]);

  // Delete expense
  const deleteExpense = useCallback(async (expenseId: string, tripId: number) => {
    try {
      await expenseService.deleteExpense(parseInt(expenseId));
      setExpenses(prev => prev.filter(e => e.id?.toString() !== expenseId));
      
      dispatch(addNotification({
        type: 'success',
        message: 'Expense deleted successfully!',
        duration: 3000
      }));
      
    } catch (error) {
      console.error('Failed to delete expense:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete expense. Please try again.',
        duration: 5000
      }));
    }
  }, [dispatch]);

  return {
    trip,
    activities,
    expenses,
    itineraries,
    isLoading,
    isCreatingActivity,
    isCreatingExpense,
    loadTrip,
    createActivity,
    createExpense,
    deleteActivity,
    deleteExpense
  };
};
