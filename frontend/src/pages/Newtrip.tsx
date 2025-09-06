import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, 
  X, 
  Edit2, 
  FileText, 
  ChevronRight,
  Trash2
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TripSidebar from '../components/TripSidebar';
import { useTrip, Place, Expense } from '../contexts/TripContext';
import { Activity } from '../services/itineraryService';

// Import services
import { tripService } from '../services/tripService';
import { itineraryService, Itinerary } from '../services/itineraryService';
import { activityService } from '../services/activityService';
import { locationService } from '../services/locationService';
import { expenseService, Expense as BackendExpense, ExpenseCategory, Currency, ExpenseStatus } from '../services/expenseService';
import { placeService, Place as BackendPlace } from '../services/placeService';

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
      saveTrip,
      loadTrip,
      clearTrip
    } = useTrip();
    
    console.log('✅ useTrip hook executed successfully');
    console.log('✅ useAppDispatch executed successfully');
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [searchParams] = useSearchParams();
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
      if (state.places.length === 0) {
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
      const tripIdParam = searchParams.get('tripId');

      console.log('URL Parameters:', { startDateStr, endDateStr, tripIdParam });

      if (tripIdParam) {
        console.log('Loading existing trip with ID:', tripIdParam);
        // Load existing trip from backend
        loadExistingTrip(parseInt(tripIdParam));
      } else if (!startDateStr || !endDateStr) {
        console.log('No tripId and missing start/end dates, navigating to home');
        navigate('/');
        return;
      }

      if (startDateStr && endDateStr && !tripIdParam) {
        console.log('New trip - generating trip days');
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
          console.log('Invalid dates, navigating to home');
          navigate('/');
          return;
        }

        // Clear any existing places to start fresh
        const placesToRemove = [...state.places];
        placesToRemove.forEach(place => {
          if (place.id) {
            removePlace(place.id);
          }
        });
        console.log('Cleared places for new trip');

        // Generate array of days between start and end date
        const days = generateTripDays(startDate, endDate);
        setTripDays(days);
        console.log('Trip days generated:', days.length);

        // Start with clean trip data
        loadSampleData();
      }
    }, []); // Only run once on mount

    // Load existing trip from backend
    const loadExistingTrip = async (id: number) => {
      console.log('loadExistingTrip called with ID:', id);
      setIsLoading(true);
      try {
        const trip = await tripService.getTripById(id);
        console.log('Loaded trip:', trip);
        setTripId(id);
        console.log('Set tripId to:', id);
        
        // Update TripContext with the loaded trip
        await loadTrip(id);
        console.log('Updated TripContext with trip data');
        
        // Clear only places from context to avoid showing places from other trips
        // We need to clear places but keep the trip data for saving
        const placesToRemove = [...state.places];
        placesToRemove.forEach(place => {
          if (place.id) {
            removePlace(place.id);
          }
        });
        console.log('Cleared places from context to avoid cross-trip data');
        
        // Load itineraries for this trip
        const tripItineraries = await itineraryService.getItinerariesByTripId(id);
        console.log('Loaded itineraries:', tripItineraries);
        setItineraries(tripItineraries);
        
        // Load activities for this trip
        const tripActivities = await activityService.getActivitiesByTripId(id);
        console.log('Loaded activities:', tripActivities);
        console.log('Activities count:', tripActivities.length);
        setBackendActivities(tripActivities as Activity[]);
        
        // Load expenses for this trip
        const tripExpenses = await expenseService.getExpensesByTripId(id);
        console.log('Loaded expenses:', tripExpenses);
        console.log('Expenses count:', tripExpenses.length);
        setBackendExpenses(tripExpenses);
        
        // Places are now loaded automatically with the trip data in TripContext
        console.log('Places will be loaded automatically with trip data');
        
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
      if (tripId) {
        // Use backend expenses
        return backendExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      } else {
        // Use local expenses
        return state.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      }
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

    // Place management
    const handleAddPlace = (place: Omit<Place, 'id'>) => {
      addPlace(place);
      setShowAddPlaceModal(false);
    };

    const handleDeletePlace = (placeId: string) => {
      removePlace(placeId);
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

    const handleSaveTrip = async () => {
      if (!state.currentTrip) return;
      
      try {
        await saveTrip();
        alert('Trip saved successfully!');
        // Navigate back to homepage after saving
        navigate('/home');
      } catch (error) {
        alert('Failed to save trip. Please try again.');
      }
    };

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

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
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
                places={state.places || []}
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
            <TripSidebar
              isSidebarOpen={isSidebarOpen}
              isMinimized={isMinimized}
              tripName={state.currentTrip?.title || "Trip"}
              tripDays={tripDays}
              formatTripDuration={() => {
                if (tripDays.length > 0) {
                  const start = tripDays[0].date;
                  const end = tripDays[tripDays.length - 1].date;
                  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                }
                return '';
              }}
              setShowHotelSearchModal={setShowHotelSearchModal}
              toggleSidebar={toggleSidebar}
              setIsMinimized={setIsMinimized}
            />

            {/* External toggle button (desktop) */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="fixed z-50 items-center justify-center hidden w-8 h-8 bg-white rounded-full shadow-md md:flex hover:bg-gray-50"
              title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
              style={{ top: '1.5rem', left: isMinimized ? '4rem' : '20rem', transform: 'translateX(50%)' }}
            >
              <ChevronRight className={`w-4 h-4 text-gray-500 transform transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
            </button>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isMinimized ? 'md:ml-16' : 'md:ml-80'} min-h-screen`}>
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
                <button
                  className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  onClick={toggleSidebar}
                >
                  {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
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
                  <button 
                    onClick={handleSaveTrip}
                    className="flex items-center px-6 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Save Trip</span>
                  </button>
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
                  places={state.places || []}
                  tripName={state.currentTrip?.title || "Trip"}
                  isMapFullscreen={isMapFullscreen}
                  onToggleMapFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
                  getCategoryIcon={getCategoryIcon}
                />

                               <PlacesSection
                 places={state.places || []}
                 searchQuery={searchQuery}
                 onSearchChange={setSearchQuery}
                 onAddToItinerary={(place) => {
                   console.log('🎯 onAddToItinerary called with place:', place);
                   
                   // Add the place directly to the trip context
                   // This will automatically pin it on the map and display it as a card
                   console.log('📝 Calling addPlace...');
                   addPlace(place);
                   console.log('✅ addPlace completed');
                   
                   // Show success notification
                   console.log('🔔 Adding success notification...');
                   dispatch(addNotification({
                     type: 'success',
                     message: `${place.name} has been added to your trip!`,
                     duration: 3000,
                   }));
                   console.log('✅ Notification added');
                   
                   // Log current state to verify place was added
                   console.log('📊 Current places in context:', state.places);
                 }}
                 onDeletePlace={handleDeletePlace}
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
                  budget={state.currentTrip?.budget || 0}
                  totalSpent={calculateTotalSpent()}
                  expenses={tripId ? convertBackendExpensesToFrontend(backendExpenses) : state.expenses || []}
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