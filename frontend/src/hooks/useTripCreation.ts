import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addNotification } from '../store/slices/uiSlice';
import apiClient from '../config/api';
import { useCurrency } from '../contexts/CurrencyContext';

export interface TripFormData {
  title: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: string;
}

export interface TripCreationResult {
  isLoading: boolean;
  error: string | null;
  createTrip: (formData: TripFormData) => Promise<void>;
  clearError: () => void;
}

export const useTripCreation = (): TripCreationResult => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { currentCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (formData: TripFormData) => {
    console.log('=== CREATE TRIP CALLED ===');
    console.log('Form data:', formData);
    console.log('User:', user);
    console.log('User UID:', user?.uid);
    
    const { title, destination, startDate, endDate, budget } = formData;
    
    if (!startDate || !endDate || !title.trim() || !destination.trim()) {
      console.log('Validation failed: missing required fields');
      setError('Please fill in all required fields');
      return;
    }

    if (!user?.uid) {
      console.log('Validation failed: user not authenticated');
      setError('User not authenticated');
      return;
    }

    console.log('Validation passed, starting trip creation...');
    setIsLoading(true);
    setError(null);
    
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    const budgetValue = parseFloat(budget.replace(/[^0-9.-]+/g, ''));

    // Validate budget
    if (isNaN(budgetValue) || budgetValue <= 0) {
      setError('Please enter a valid budget amount');
      setIsLoading(false);
      return;
    }

    try {
      // Create trip data structure matching backend requirements
      const tripData = {
        title: title.trim(),
        destination: destination.trim(),
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        budget: budgetValue,
        currency: currentCurrency,
        description: destination.trim(),
        itineraryData: {
          days: [
            {
              dayNumber: 1,
              date: formattedStartDate,
              activities: []
            }
          ]
        },
        status: "PLANNING",
        visibility: "PRIVATE",
        places: [],
        expenses: []
      };

      console.log('Sending trip data to backend:', JSON.stringify(tripData, null, 2));

      // Send POST request to backend using configured API client with Firebase UID
      const url = `/trips?firebaseUid=${user.uid}`;
      console.log('Making API call to:', url);
      console.log('API client base URL:', apiClient.defaults.baseURL);
      
      const response = await apiClient.post(url, tripData);
      console.log('API response received:', response);
      const createdTrip = response.data;
      console.log('Trip created successfully:', createdTrip);

      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: 'Trip created successfully!',
        duration: 3000
      }));

      // Redirect to trip planning page with the created trip ID
      navigate(`/new-trip?tripId=${createdTrip.id}`);

    } catch (error) {
      console.error('=== ERROR CREATING TRIP ===');
      console.error('Error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error response:', (error as any)?.response);
      console.error('Error status:', (error as any)?.response?.status);
      console.error('Error data:', (error as any)?.response?.data);
      
      setError(error instanceof Error ? error.message : 'Failed to create trip. Please try again.');
      dispatch(addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create trip. Please try again.',
        duration: 5000
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    createTrip,
    clearError
  };
};
