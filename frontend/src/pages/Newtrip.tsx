import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, 
  X, 
  Edit2, 
  FileText, 
  ChevronRight,
  Trash2,
  Save
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTrip, Place, Expense } from '../contexts/TripContext';
import { useTripPlaces } from '../hooks/useTripPlaces'; // ✅ Import trip-specific places hook
import { Activity } from '../services/itineraryService';
import apiClient from '../config/api';

// Import services
import { tripService } from '../services/tripService';
import { itineraryService, Itinerary } from '../services/itineraryService';
import { activityService } from '../services/activityService';
import { locationService } from '../services/locationService';
import { expenseService, Expense as BackendExpense, ExpenseCategory, Currency, ExpenseStatus } from '../services/expenseService';
import { tripPlanService, TripPlanDTO, DayPlanDTO, PlaceDTO as TripPlanPlaceDTO, ActivityDTO as TripPlanActivityDTO, ExpenseDTO as TripPlanExpenseDTO } from '../services/tripPlanService';

// Import extracted components
import Modal from '../components/modals/Modal';
import AddPlaceForm from '../components/forms/AddPlaceForm';
import AddActivityForm from '../components/forms/AddActivityForm';
import AddExpenseForm from '../components/forms/AddExpenseForm';
import HotelSearchModal from '../components/hotel/HotelSearchModal';
import TripOverview from '../components/sections/TripOverview';
import PlacesSection from '../components/sections/PlacesSection';
import ItinerarySection from '../components/sections/ItinerarySection';
import BudgetSection from '../components/sections/BudgetSection';

// Import utilities and hooks
import { useHotelSearch, HotelDestination } from '../hooks/useHotelSearch';
import { getCategoryIcon, getExpenseCategoryIcon } from '../utils/iconUtils';
import { formatDate, generateTripDays } from '../utils/dateUtils';
import { samplePlaces } from '../data/sampleData';
import { useAppDispatch, useAppSelector } from '../store';
import { setTripDetails, clearTripDetails } from '../store/slices/tripSlice';
import { addNotification } from '../store/slices/uiSlice';

const NewTrip = () => {
  console.log('🚀 NewTrip component is rendering!');
  console.log('Current URL:', window.location.href);
  
  try {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const tripIdParam = searchParams.get('tripId'); // ✅ Renamed to avoid conflict
    
    const { 
      state, 
      initializeTripFromParams, 
      addPlace, 
      removePlace, 
      addActivity, 
      removeActivity, 
      addExpense, 
      removeExpense, 
      updateTripName, 
      clearTrip,
      getPlacesForTrip, // ✅ Get trip-specific places helper
      loadTrip // ✅ Add loadTrip function
    } = useTrip();
    
    // ✅ Use trip-specific places hook
    const {
      places: tripPlaces,
      isLoading: placesLoading,
      isCreating: isCreatingPlace,
      createPlace,
      deletePlace
    } = useTripPlaces(tripIdParam ? parseInt(tripIdParam) : null);
    
    console.log('✅ useTrip hook executed successfully');
    console.log('✅ useAppDispatch executed successfully');
    
    const navigate = useNavigate();
    const [tripDays, setTripDays] = useState<Array<{ date: Date; dayNumber: number }>>([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    console.log('✅ All useState hooks executed successfully');
    
    // Backend data
    const [tripId, setTripId] = useState<number | null>(null);
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [backendActivities, setBackendActivities] = useState<Activity[]>([]);
    const [backendExpenses, setBackendExpenses] = useState<BackendExpense[]>([]);
    
    // Modal states
    const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
    const [showAddActivityModal, setShowAddActivityModal] = useState(false);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [showHotelSearchModal, setShowHotelSearchModal] = useState(false);
    
    // Edit activity state
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    
    // Activity and place selection states
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    // Hotel search hook
    const hotelSearch = useHotelSearch();
    
    console.log('✅ All hooks and state initialized successfully');
    
    // Initialize trip from URL parameters - use useCallback to prevent infinite re-renders
    const initializeTripFromParamsCallback = useCallback(() => {
      console.log('🔄 initializeTripFromParamsCallback called');
      initializeTripFromParams(searchParams);
    }, [searchParams, initializeTripFromParams]);

    useEffect(() => {
      console.log('NewTrip useEffect triggered');
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      // Only clear trip data once when component first mounts
      // Don't clear on every render as it causes infinite loops
      const currentTripPlaces = tripIdParam ? getPlacesForTrip(parseInt(tripIdParam)) : [];
      if (currentTripPlaces.length === 0) {
        console.log('Clearing existing trip data...');
        clearTrip();
        dispatch(clearTripDetails());
        console.log('Trip data cleared successfully');
      }
      
      // Initialize trip from URL parameters using context
      console.log('Initializing trip from params...');
      initializeTripFromParamsCallback();
      
      const startDateStr = searchParams.get('startDate');
      const endDateStr = searchParams.get('endDate');
      const tripIdFromUrl = searchParams.get('tripId');

      console.log('URL Parameters:', { startDateStr, endDateStr, tripIdFromUrl });

      if (tripIdFromUrl) {
        console.log('Loading existing trip with ID:', tripIdFromUrl);
        // Load existing trip from backend
        loadExistingTrip(parseInt(tripIdFromUrl));
      } else if (!startDateStr || !endDateStr) {
        console.log('No tripId and missing start/end dates, navigating to home');
        navigate('/');
        return;
      }

      if (startDateStr && endDateStr && !tripIdFromUrl) {
        console.log('New trip - generating trip days');
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
          console.log('Invalid dates, navigating to home');
          navigate('/');
          return;
        }

        // Generate array of days between start and end date
        const days = generateTripDays(startDate, endDate);
        setTripDays(days);
        console.log('Trip days generated:', days.length);

        // Start with clean trip data
        loadSampleData();
      }
    }, []); // Only run once on mount

    // Note: Removed auto-update useEffect to prevent infinite loops
    // Budget is now calculated dynamically in the UI without modifying the stored budget

    // Load existing trip from backend
    const loadExistingTrip = async (id: number) => {
      console.log('loadExistingTrip called with ID:', id);
      setIsLoading(true);
      try {
        const trip = await tripService.getTripById(id);
        console.log('Loaded trip:', trip);
        setTripId(id);
        console.log('Set tripId to:', id);
        
        // Load itineraries for this trip
        const tripItineraries = await itineraryService.getItinerariesByTripId(id);
        console.log('Loaded itineraries:', tripItineraries);
        setItineraries(tripItineraries);
        
        // Load activities for this trip
        const tripActivities = await activityService.getActivitiesByTripId(id);
        console.log('Loaded activities:', tripActivities);
        setBackendActivities(tripActivities as Activity[]);
        
        // Load expenses for this trip
        const tripExpenses = await expenseService.getExpensesByTripId(id);
        console.log('Loaded expenses:', tripExpenses);
        setBackendExpenses(tripExpenses);
        
        // Update context with trip data using the context's loadTrip function
        console.log('Updating trip context with loaded data:', trip);
        await loadTrip(id);
        
        // Generate trip days from trip dates
        if (trip.startDate && trip.endDate) {
          const startDate = new Date(trip.startDate);
          const endDate = new Date(trip.endDate);
          const days = generateTripDays(startDate, endDate);
          setTripDays(days);
        }
        
      } catch (error) {
        console.error('Failed to load trip:', error);
        alert('Failed to load trip. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Load sample data
    const loadSampleData = () => {
      // Don't load sample data - start with clean trip
      console.log('Starting with clean trip - no sample data loaded');
    };

    // Utility functions
    const calculateTotalSpent = () => {
      let expenseTotal = 0;
      let activityTotal = 0;
      
      if (tripId) {
        // Use backend expenses
        expenseTotal = backendExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        // Use backend activities
        activityTotal = backendActivities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
      } else {
        // Use local expenses
        expenseTotal = state.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
        // Use local activities
        activityTotal = state.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
      }
      
      return expenseTotal + activityTotal;
    };

    // Calculate total budget (just the manual budget set by user)
    const calculateTotalBudget = () => {
      return state.currentTrip?.budget || 0;
    };

    // Convert backend expenses to frontend format
    const convertBackendExpensesToFrontend = (backendExpenses: BackendExpense[]): Expense[] => {
      return backendExpenses.map(expense => ({
        id: expense.id?.toString(),
        dayNumber: expense.dayNumber,
        category: expense.category.toLowerCase(),
        description: expense.description,
        amount: expense.amount,
        date: expense.expenseDate
      }));
    };

  // ✅ Place management with trip-specific logic
  const handleAddPlace = async (place: Omit<Place, 'id'>) => {
    console.log('🎯 handleAddPlace called with place:', place);
    console.log('🎯 Current tripIdParam:', tripIdParam);
    
    if (tripIdParam) {
      // Use backend API for trip-specific places
      console.log('📝 Creating place via backend API for trip:', tripIdParam);
      try {
        await createPlace(place);
        console.log('✅ Place created via backend API');
      } catch (error) {
        console.error('❌ Failed to create place via backend API:', error);
        throw error; // Re-throw to show error notification
      }
    } else {
      // Fallback to local state
      console.log('📝 Adding place to local context...');
      addPlace(place, tripIdParam ? parseInt(tripIdParam) : undefined);
      console.log('✅ Place added to local context');
    }
    
    setShowAddPlaceModal(false);
  };

  // ✅ Save trip functionality
  const handleSaveTrip = async () => {
    if (!tripIdParam) {
      console.warn('⚠️ No tripId available for saving');
      return;
    }

    try {
      console.log('💾 Saving trip with ID:', tripIdParam);
      
      // Prepare trip data for update with proper data types
      const tripData = {
        title: state.currentTrip?.title || "Trip",
        destination: state.currentTrip?.destination || "",
        startDate: state.currentTrip?.startDate || new Date().toISOString().split('T')[0], // ✅ Keep as string for LocalDate conversion
        endDate: state.currentTrip?.endDate || new Date().toISOString().split('T')[0], // ✅ Keep as string for LocalDate conversion
        budget: state.currentTrip?.budget || 0, // ✅ Backend will convert to BigDecimal
        description: state.currentTrip?.description || "",
        status: state.currentTrip?.status || "PLANNING", // ✅ Enum value
        visibility: state.currentTrip?.visibility || "PRIVATE" // ✅ Enum value
      };

      // ✅ Validate required fields
      if (!tripData.title || tripData.title.trim() === '') {
        throw new Error('Trip title is required');
      }
      if (!tripData.destination || tripData.destination.trim() === '') {
        throw new Error('Trip destination is required');
      }
      if (!tripData.startDate) {
        throw new Error('Start date is required');
      }
      if (!tripData.endDate) {
        throw new Error('End date is required');
      }
      if (tripData.budget < 0) {
        throw new Error('Budget must be non-negative');
      }

      console.log('📤 Sending trip update:', tripData);
      console.log('📊 Trip data validation:', {
        title: !!tripData.title,
        destination: !!tripData.destination,
        startDate: !!tripData.startDate,
        endDate: !!tripData.endDate,
        budget: tripData.budget,
        status: tripData.status,
        visibility: tripData.visibility
      });
      
      // Update trip via API
      const response = await apiClient.put(`/trips/${tripIdParam}`, tripData);
      console.log('✅ Trip saved successfully:', response.data);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: 'Trip saved successfully!',
        duration: 3000
      }));
      
      // Redirect to homepage
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Failed to save trip:', error);
      
      // ✅ Log detailed error information
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      }
      
      dispatch(addNotification({
        type: 'error',
        message: `Failed to save trip: ${error.response?.data || error.message || 'Unknown error'}`,
        duration: 5000
      }));
    }
  };

  // ✅ Unified save trip plan functionality
  const handleSaveTripPlan = async () => {
    if (!tripIdParam) {
      console.warn('⚠️ No tripId available for saving');
      return;
    }

    try {
      console.log('💾 Saving unified trip plan with ID:', tripIdParam);
      console.log('📊 Current trip state:', state.currentTrip);
      console.log('📊 Trip state title:', state.currentTrip?.title);
      console.log('📊 Trip state destination:', state.currentTrip?.destination);
      
      // Convert frontend data to unified trip plan format
      const tripPlan: TripPlanDTO = {
        tripId: parseInt(tripIdParam),
        title: state.currentTrip?.title || "Trip",
        destination: state.currentTrip?.destination || "Unknown Destination", // ✅ Provide default destination
        startDate: state.currentTrip?.startDate || new Date().toISOString().split('T')[0],
        endDate: state.currentTrip?.endDate || new Date().toISOString().split('T')[0],
        budget: state.currentTrip?.budget || 0,
        description: state.currentTrip?.description || "",
        
        // Convert places
        places: (tripPlaces || []).map(place => {
          // Map frontend category to backend enum
          const categoryMap: { [key: string]: string } = {
            'attraction': 'ATTRACTION',
            'restaurant': 'RESTAURANT',
            'hotel': 'HOTEL',
            'transport': 'TRANSPORT',
            'shopping': 'SHOPPING',
            'entertainment': 'ENTERTAINMENT',
            'cultural': 'CULTURAL',
            'nature': 'NATURE',
            'sports': 'SPORTS',
            'religious': 'RELIGIOUS',
            'historical': 'HISTORICAL',
            'other': 'OTHER'
          };
          
          return {
            name: place.name,
            location: place.location,
            description: place.description,
            category: categoryMap[place.category.toLowerCase()] || 'OTHER',
            rating: place.rating,
            cost: place.cost,
            duration: place.duration,
            latitude: place.coordinates?.lat,
            longitude: place.coordinates?.lng,
            photos: place.photos || []
          };
        }),
        
        // Convert days with activities
        days: tripDays.map(day => {
          const dayActivities = backendActivities.filter(activity => {
            const activityItinerary = itineraries.find(i => i.id === activity.itineraryId);
            return activityItinerary?.dayNumber === day.dayNumber;
          });
          
          return {
            dayNumber: day.dayNumber,
            date: day.date.toISOString().split('T')[0],
            notes: '',
            activities: dayActivities.map(activity => {
              // Map frontend activity type to backend enum
              const typeMap: { [key: string]: string } = {
                'sightseeing': 'SIGHTSEEING',
                'restaurant': 'RESTAURANT',
                'hotel': 'HOTEL',
                'transport': 'TRANSPORT',
                'shopping': 'SHOPPING',
                'entertainment': 'ENTERTAINMENT',
                'other': 'OTHER'
              };
              
              // Map frontend activity status to backend enum
              const statusMap: { [key: string]: string } = {
                'planned': 'PLANNED',
                'confirmed': 'CONFIRMED',
                'cancelled': 'CANCELLED',
                'completed': 'COMPLETED'
              };
              
              return {
                name: activity.name,
                description: activity.description,
                startTime: activity.startTime,
                endTime: activity.endTime,
                cost: activity.cost,
                durationHours: activity.durationHours,
                type: (typeMap[activity.type?.toLowerCase()] || 'OTHER') as any,
                status: (statusMap[activity.status?.toLowerCase()] || 'PLANNED') as any,
                tripId: parseInt(tripIdParam),
                itineraryId: activity.itineraryId,
                dayNumber: day.dayNumber,
                placeId: activity.placeId
              };
            })
          };
        }),
        
        // Convert expenses
        expenses: backendExpenses.map(expense => {
          // Map frontend expense category to backend enum
          const categoryMap: { [key: string]: string } = {
            'accommodation': 'ACCOMMODATION',
            'food': 'FOOD',
            'transport': 'TRANSPORT',
            'activities': 'ACTIVITIES',
            'shopping': 'SHOPPING',
            'other': 'OTHER'
          };
          
          // Map frontend expense status to backend enum
          const statusMap: { [key: string]: string } = {
            'pending': 'PENDING',
            'paid': 'PAID',
            'refunded': 'REFUNDED'
          };
          
          // Map frontend currency to backend enum
          const currencyMap: { [key: string]: string } = {
            'usd': 'USD',
            'eur': 'EUR',
            'gbp': 'GBP',
            'jpy': 'JPY',
            'krw': 'KRW'
          };
          
          return {
            dayNumber: expense.dayNumber,
            expenseDate: expense.expenseDate,
            category: (categoryMap[expense.category?.toLowerCase()] || 'OTHER') as any,
            description: expense.description,
            amount: expense.amount,
            currency: (currencyMap[expense.currency?.toLowerCase()] || 'USD') as any,
            receiptUrl: expense.receiptUrl,
            paymentMethod: expense.paymentMethod,
            vendor: expense.vendor,
            location: expense.location,
            notes: expense.notes,
            reimbursable: expense.reimbursable,
            reimbursed: expense.reimbursed,
            reimbursementReference: expense.reimbursementReference,
            status: (statusMap[expense.status?.toLowerCase()] || 'PENDING') as any,
            tripId: parseInt(tripIdParam)
          };
        })
      };

      console.log('📤 Sending unified trip plan:', tripPlan);
      
      // Save unified trip plan
      const savedPlan = await tripPlanService.saveTripPlan(parseInt(tripIdParam), tripPlan);
      console.log('✅ Unified trip plan saved successfully:', savedPlan);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: 'Trip plan saved successfully!',
        duration: 3000
      }));
      
      // Redirect to home page
      setTimeout(() => {
        navigate('/home');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Failed to save trip plan:', error);
      
      // ✅ Log detailed error information
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      }
      
      dispatch(addNotification({
        type: 'error',
        message: `Failed to save trip plan: ${error.response?.data || error.message || 'Unknown error'}`,
        duration: 5000
      }));
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    console.log('🗑️ handleDeletePlace called with placeId:', placeId);
    
    if (tripIdParam) {
      // Use backend API for trip-specific places
      console.log('📝 Deleting place via backend API for trip:', tripIdParam);
      await deletePlace(placeId);
      console.log('✅ Place deleted via backend API');
    } else {
      // Fallback to local state
      console.log('📝 Removing place from local context...');
      removePlace(placeId, tripIdParam ? parseInt(tripIdParam) : 0);
      console.log('✅ Place removed from local context');
    }
    
    // Also remove activities associated with this place
    state.activities.forEach(activity => {
      if (activity.placeId === placeId && activity.id) {
        removeActivity(activity.id);
      }
    });
  };

    // Activity management with backend integration
    const handleAddActivity = async (activity: Omit<Activity, 'id'>) => {
      console.log('handleAddActivity called with:', activity);
      console.log('tripId:', tripId);
      console.log('selectedDay:', selectedDay);
      
      if (editingActivity) {
        // Update existing activity
        try {
          if (tripId) {
            // Update in backend
            const updatedActivity = await activityService.updateActivity(parseInt(editingActivity.id!.toString()), activity);
            console.log('Updated activity:', updatedActivity);
            
            // Update local state
            setBackendActivities(prev => 
              prev.map(a => a.id === editingActivity.id ? updatedActivity : a)
            );
          } else {
            // Update in local state
            const updatedActivity = { ...editingActivity, ...activity };
            // Note: You might need to update the context to handle activity updates
            console.log('Updated activity in local state:', updatedActivity);
          }
        } catch (error) {
          console.error('Failed to update activity:', error);
          alert('Failed to update activity. Please try again.');
        }
      } else {
        // Create new activity
        if (tripId) {
          try {
            console.log('Creating activity for trip:', tripId);
            
            // Find or create itinerary for the selected day
            let itinerary = itineraries.find(i => i.dayNumber === selectedDay);
            console.log('Found existing itinerary:', itinerary);
            
            if (!itinerary) {
              console.log('Creating new itinerary for day:', selectedDay);
              // Create new itinerary for this day
              const tripDays = generateTripDays(
                new Date(state.currentTrip?.startDate || new Date()),
                new Date(state.currentTrip?.endDate || new Date())
              );
              const dayDate = tripDays.find(d => d.dayNumber === selectedDay)?.date;
              
              if (dayDate) {
                const newItinerary = await itineraryService.createItinerary({
                  dayNumber: selectedDay || 1,
                  date: dayDate.toISOString().split('T')[0],
                  tripId: tripId,
                  notes: ''
                });
                console.log('Created new itinerary:', newItinerary);
                itinerary = newItinerary;
                setItineraries(prev => [...prev, newItinerary]);
              }
            }

            if (itinerary) {
              console.log('Creating activity with itinerary:', itinerary.id);
              // Create activity with backend
              const newActivity = await activityService.createActivity({
                ...activity,
                tripId: tripId,
                itineraryId: itinerary.id!
              } as Activity);
              
              console.log('Created activity:', newActivity);
              // Add to local state
              addActivity(newActivity);
              setBackendActivities(prev => [...prev, newActivity]);
            }
          } catch (error) {
            console.error('Failed to create activity:', error);
            alert('Failed to create activity. Please try again.');
          }
        } else {
          console.log('No tripId, using local state fallback');
          // Fallback to local state if no tripId
          // Add day information to the activity for local state
          const activityWithDay = {
            ...activity,
            dayNumber: selectedDay || 1 // Use selectedDay or default to day 1
          };
          console.log('Adding activity with day info:', activityWithDay);
          addActivity(activityWithDay);
        }
      }
      
      setShowAddActivityModal(false);
      setEditingActivity(null);
    };

    const handleDeleteActivity = async (activityId: string) => {
      if (tripId) {
        try {
          // Delete from backend
          await activityService.deleteActivity(parseInt(activityId));
          setBackendActivities(prev => prev.filter(a => a.id?.toString() !== activityId));
        } catch (error) {
          console.error('Failed to delete activity:', error);
          alert('Failed to delete activity. Please try again.');
        }
      }
      
      // Remove from local state
      removeActivity(activityId);
    };

    const handleEditActivity = (activity: Activity) => {
      setEditingActivity(activity);
      setSelectedDay(activity.itineraryId ? 
        itineraries.find(i => i.id === activity.itineraryId)?.dayNumber || 1 : 1);
      setShowAddActivityModal(true);
    };

    // Expense management with backend integration
    const handleAddExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
      if (tripId) {
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
            expenseDate: new Date().toISOString().split('T')[0], // Today's date
            category: categoryMap[expense.category] || ExpenseCategory.OTHER,
            description: expense.description,
            amount: parseFloat(expense.amount.toString()), // Ensure it's a number
            currency: Currency.USD,
            status: ExpenseStatus.PAID,
            tripId: tripId
          };
          
          console.log('Sending expense to backend:', backendExpense);
          console.log('Trip ID being sent:', tripId);
          console.log('Amount type:', typeof backendExpense.amount);
          console.log('Amount value:', backendExpense.amount);
          
          // Create expense in backend
          const newExpense = await expenseService.createExpense(backendExpense);
          console.log('Created expense:', newExpense);
          
          // Add to local state
          setBackendExpenses(prev => [...prev, newExpense]);
        } catch (error) {
          console.error('Failed to create expense:', error);
          alert('Failed to create expense. Please try again.');
        }
      } else {
        // Fallback to local state if no tripId
        addExpense(expense);
      }
      
      setShowAddExpenseModal(false);
    };

    const handleDeleteExpense = async (expenseId: string) => {
      if (tripId) {
        try {
          // Delete from backend
          await expenseService.deleteExpense(parseInt(expenseId));
          setBackendExpenses(prev => prev.filter(e => e.id?.toString() !== expenseId));
        } catch (error) {
          console.error('Failed to delete expense:', error);
          alert('Failed to delete expense. Please try again.');
        }
      }
      
      // Remove from local state
      removeExpense(expenseId);
    };

    // Hotel search functionality
    const addHotelAsPlace = (hotel: HotelDestination) => {
      const newPlace: Omit<Place, 'id'> = {
        name: hotel.name,
        location: `${hotel.city_name}, ${hotel.country}`,
        description: `${hotel.dest_type} in ${hotel.region}, ${hotel.country}. ${hotel.hotels} hotels available.`,
        category: 'hotel',
        rating: 4, // Default rating
        photos: hotel.image_url ? [hotel.image_url] : [],
        coordinates: { lat: hotel.latitude, lng: hotel.longitude },
        cost: 0, // Will be updated when user adds details
        duration: 24 // Hotel stays are typically 24 hours
      };
      
      addPlace(newPlace);
      setShowHotelSearchModal(false);
      hotelSearch.clearSearch();
    };

    // Removed old save trip functionality - now handled in HomePage modal

    const handleDeleteTrip = async () => {
      if (!tripId) return;
      
      if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
        try {
          await tripService.deleteTrip(tripId);
          alert('Trip deleted successfully!');
          navigate('/');
        } catch (error) {
          alert('Failed to delete trip. Please try again.');
        }
      }
    };

    const handleDeleteDay = async (dayNumber: number) => {
      if (confirm(`Are you sure you want to delete Day ${dayNumber}? This will remove all activities for this day.`)) {
        if (tripId) {
          try {
            // Find itinerary for this day
            const itinerary = itineraries.find(i => i.dayNumber === dayNumber);
            if (itinerary) {
              // Delete itinerary (this will cascade delete activities)
              await itineraryService.deleteItinerary(itinerary.id!);
              setItineraries(prev => prev.filter(i => i.id !== itinerary.id));
              setBackendActivities(prev => prev.filter(a => a.itineraryId !== itinerary.id));
            }
          } catch (error) {
            console.error('Failed to delete day:', error);
            alert('Failed to delete day. Please try again.');
          }
        }
        
        // Remove from local state - for backend activities, this is handled by the backend
        // For local activities, we need to filter by day number if available
        if (!tripId) {
          state.activities.forEach(activity => {
            // For local activities, we might need to check a different property
            // Since the new Activity interface doesn't have 'day', we'll skip this for now
            // removeActivity(activity.id);
          });
        }
      }
    };


    const isAnyModalOpen = showAddPlaceModal || showAddActivityModal || showAddExpenseModal || showHotelSearchModal;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading trip...</div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen bg-gray-100">
        {isAnyModalOpen ? (
          <>
            <Modal
              isOpen={showAddPlaceModal}
              onClose={() => setShowAddPlaceModal(false)}
              title="Add New Place"
            >
              <AddPlaceForm 
                onSubmit={handleAddPlace} 
                onCancel={() => setShowAddPlaceModal(false)} 
              />
            </Modal>

            <Modal
              isOpen={showAddActivityModal}
              onClose={() => {
                setShowAddActivityModal(false);
                setEditingActivity(null);
              }}
              title={editingActivity ? "Edit Activity" : "Add Activity"}
            >
              <AddActivityForm 
                onSubmit={handleAddActivity} 
                onCancel={() => {
                  setShowAddActivityModal(false);
                  setEditingActivity(null);
                }}
                selectedDay={selectedDay || 1}
                places={tripPlaces || []}
                selectedPlace={selectedPlace}
                editingActivity={editingActivity}
              />
            </Modal>

            <Modal
              isOpen={showAddExpenseModal}
              onClose={() => setShowAddExpenseModal(false)}
              title="Add Expense"
            >
              <AddExpenseForm 
                onSubmit={handleAddExpense} 
                onCancel={() => setShowAddExpenseModal(false)}
                tripDays={tripDays}
              />
            </Modal>

            <HotelSearchModal
              isOpen={showHotelSearchModal}
              onClose={() => {
                setShowHotelSearchModal(false);
                hotelSearch.clearSearch();
              }}
              searchQuery={hotelSearch.searchQuery}
              onSearchQueryChange={hotelSearch.setSearchQuery}
              onSearch={() => hotelSearch.searchHotels(hotelSearch.searchQuery)}
              isSearching={hotelSearch.isSearching}
              destinations={hotelSearch.destinations}
              onAddHotel={addHotelAsPlace}
            />
          </>
        ) : (
          <>


            {/* Main Content */}
            <div className="flex-1 min-h-screen">
              {/* Mobile Header */}
              <header className="top-0 z-40 flex items-center justify-between p-4 bg-white shadow-md md:hidden">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold">{state.currentTrip?.title || "Trip"}</h1>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="p-1 rounded hover:bg-gray-100"
                    title="Edit trip name"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </header>

              {/* Desktop Header */}
              <header className="sticky top-0 z-40 flex items-center justify-between hidden p-4 bg-white shadow-md md:flex">
                <div className="flex items-center space-x-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={state.currentTrip?.title || ""}
                      onChange={(e) => updateTripName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      className="text-2xl font-bold border-b border-blue-500 focus:outline-none focus:border-blue-600"
                      autoFocus
                    />
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">{state.currentTrip?.title || "Trip"}</h1>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {/* Save Trip Button */}
                  <button 
                    onClick={handleSaveTripPlan}
                    className="flex items-center px-6 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Trip Plan</span>
                  </button>
                  
                  {/* Delete Trip Button */}
                  {tripId && (
                    <button 
                      onClick={handleDeleteTrip}
                      className="flex items-center px-6 py-2 space-x-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Trip</span>
                    </button>
                  )}
                </div>
              </header>

              {/* Main Content Sections */}
              <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <TripOverview
                  tripDays={tripDays}
                  budget={state.currentTrip?.budget || 0}
                  totalSpent={calculateTotalSpent()}
                  places={tripPlaces || []} // ✅ Use trip-specific places
                  tripName={state.currentTrip?.title || "Trip"}
                  isMapFullscreen={isMapFullscreen}
                  onToggleMapFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
                  getCategoryIcon={getCategoryIcon}
                />

                <PlacesSection
                  places={tripPlaces || []} // ✅ Use trip-specific places
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onAddToItinerary={handleAddPlace} // ✅ Use trip-specific handler
                  onDeletePlace={handleDeletePlace} // ✅ Use trip-specific handler
                  getCategoryIcon={getCategoryIcon}
                />

                <ItinerarySection
                  tripDays={tripDays}
                  activities={tripId ? backendActivities : state.activities || []}
                  itineraries={itineraries}
                  selectedDay={selectedDay}
                  onAddActivity={(dayNumber) => {
                    setSelectedDay(dayNumber);
                    setShowAddActivityModal(true);
                  }}
                  onEditActivity={handleEditActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onDeleteDay={handleDeleteDay}
                  getCategoryIcon={getCategoryIcon}
                  formatDate={formatDate}
                />

                <BudgetSection
                  budget={calculateTotalBudget()}
                  totalSpent={calculateTotalSpent()}
                  expenses={tripId ? convertBackendExpensesToFrontend(backendExpenses) : state.expenses || []}
                  activities={tripId ? backendActivities : state.activities || []}
                  onAddExpense={() => setShowAddExpenseModal(true)}
                  onDeleteExpense={handleDeleteExpense}
                  getExpenseCategoryIcon={getExpenseCategoryIcon}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error('NewTrip component encountered an error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg text-red-500">
          An unexpected error occurred. Please try again later.
        </div>
      </div>
    );
  }
};

export default NewTrip;