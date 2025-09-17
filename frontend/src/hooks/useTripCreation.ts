import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addNotification } from '../store/slices/uiSlice';
import apiClient from '../config/api';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (formData: TripFormData) => {
    const { title, destination, startDate, endDate, budget } = formData;
    
    if (!startDate || !endDate || !title.trim() || !destination.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

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
      const response = await apiClient.post(url, tripData);
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
      console.error('Error creating trip:', error);
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
