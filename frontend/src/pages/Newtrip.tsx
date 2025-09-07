// React core imports
import { useState, useEffect, useCallback } from 'react';

// UI component imports
import { 
  Menu, 
  X, 
  Edit2, 
  FileText, 
  ChevronRight,
  Trash2
} from 'lucide-react';

// Router imports
import { useSearchParams, useNavigate } from 'react-router-dom';

// Component imports
import TripSidebar from '../components/TripSidebar';
import { useTrip, Place, Expense } from '../contexts/TripContext';
import { Activity, DayItinerary } from '../services/itineraryService';

// Service imports for backend communication
import { tripService } from '../services/tripService';
import { expenseService, Expense as BackendExpense, ExpenseCategory, Currency, ExpenseStatus } from '../services/expenseService';

// Modal and form component imports
import Modal from '../components/modals/Modal';
import AddPlaceForm from '../components/forms/AddPlaceForm';
import AddActivityForm from '../components/forms/AddActivityForm';
import AddExpenseForm from '../components/forms/AddExpenseForm';
import HotelSearchModal from '../components/hotel/HotelSearchModal';

// Section component imports
import TripOverview from '../components/sections/TripOverview';
import PlacesSection from '../components/sections/PlacesSection';
import ItinerarySection from '../components/sections/ItinerarySection';
import BudgetSection from '../components/sections/BudgetSection';

// Utility and hook imports
import { useHotelSearch, HotelDestination } from '../hooks/useHotelSearch';
import { getCategoryIcon, getExpenseCategoryIcon } from '../utils/iconUtils';
import { formatDate, generateTripDays } from '../utils/dateUtils';

// Redux store imports
import { useAppDispatch } from '../store';
import { clearTripDetails } from '../store/slices/tripSlice';
import { addNotification } from '../store/slices/uiSlice';

/**
 * NewTrip Component
 * 
 * Main component for creating and editing trip plans. Handles both new trip creation
 * and loading existing trips from the backend. Manages trip data, activities, expenses,
 * and places through a combination of local state and backend integration.
 */
const NewTrip = () => {
  // Redux dispatch for notifications and state management
  const dispatch = useAppDispatch();
  
  // Trip context hooks for managing trip data
  const { 
    state, 
    initializeTripFromParams, 
    addPlace, 
    removePlace, 
    addActivity, 
    updateActivity,
    removeActivity, 
    addExpense, 
    removeExpense, 
    updateTripName, 
    saveTrip,
    loadTrip,
    clearTrip
  } = useTrip();
  
  // UI state management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  
  // Router and URL parameter management
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Trip data state
  const [tripDays, setTripDays] = useState<Array<{ date: Date; dayNumber: number }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Backend data state - stores data fetched from the server
  const [tripId, setTripId] = useState<number | null>(null);
  const [itineraries, setItineraries] = useState<DayItinerary[]>([]);
  const [backendExpenses, setBackendExpenses] = useState<BackendExpense[]>([]);
  
  // Modal visibility states
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showHotelSearchModal, setShowHotelSearchModal] = useState(false);
  
  // Activity editing state
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  // Selection and search states
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Hotel search functionality hook
  const hotelSearch = useHotelSearch();
  
  /**
   * Initialize trip from URL parameters
   * Uses useCallback to prevent infinite re-renders when dependencies change
   */
  const initializeTripFromParamsCallback = useCallback(() => {
    initializeTripFromParams(searchParams);
  }, [searchParams, initializeTripFromParams]);

  /**
   * Load existing trip from backend
   * Handles the complete process of loading a saved trip including:
   * - Clearing existing data to prevent contamination
   * - Fetching trip basic information
   * - Loading trip context data
   * - Fetching associated expenses
   * - Generating trip days from dates
   */
  const loadExistingTrip = useCallback(async (id: number) => {
      setIsLoading(true);
      
      try {
        // Step 1: Clear existing data to avoid cross-trip contamination
        clearTrip();
        setTripId(null);
        setItineraries([]);
        setBackendExpenses([]);
        
        // Step 2: Load trip basic information from backend
        const trip = await tripService.getTripById(id);
        setTripId(id);
        
        // Step 3: Update TripContext with the loaded trip data
        await loadTrip(id);
        
        // Step 4: Clear itineraries since they're now stored as JSON in trip data
        setItineraries([]);
        
        // Step 5: Activities are now stored as JSON in trip data
        
        // Step 6: Load expenses for this trip from backend
        const tripExpenses = await expenseService.getExpensesByTripId(id);
        setBackendExpenses(tripExpenses);
        
        // Step 7: Generate trip days from trip start and end dates
        if (trip.startDate && trip.endDate) {
          const startDate = new Date(trip.startDate);
          const endDate = new Date(trip.endDate);
          const days = generateTripDays(startDate, endDate);
          setTripDays(days);
        }
        
      } catch (error) {
        // Show error notification to user
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to load trip. Please try again.',
          duration: 5000,
        }));
      } finally {
        setIsLoading(false);
      }
    }, [clearTrip, loadTrip, dispatch]);

  /**
   * Reset initialization flag when search parameters change
   * This ensures the component re-initializes when URL parameters change
   */
  useEffect(() => {
    setIsInitialized(false);
  }, [searchParams]);

  /**
   * Main initialization effect
   * Handles both new trip creation and existing trip loading based on URL parameters
   * Prevents infinite loops by checking isInitialized flag
   */
  useEffect(() => {
    if (isInitialized) return; // Prevent infinite loops
    
    // Extract URL parameters
    const tripIdParam = searchParams.get('tripId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const budgetStr = searchParams.get('budget');
    const tripNameStr = searchParams.get('tripName');

    if (tripIdParam) {
      // Load existing trip from backend using the provided ID
      loadExistingTrip(parseInt(tripIdParam));
      setIsInitialized(true);
    } else if (!startDateStr || !endDateStr || !budgetStr || !tripNameStr) {
      // Missing required parameters for new trip - redirect to home
      navigate('/');
      return;
    } else {
      // Create new trip with provided parameters
      clearTrip();
      dispatch(clearTripDetails());
      initializeTripFromParamsCallback();
      
      // Parse and validate dates
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const budget = parseFloat(budgetStr);
      
      // Validate date range
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
        navigate('/');
        return;
      }

      // Validate budget
      if (isNaN(budget) || budget <= 0) {
        navigate('/');
        return;
      }

      // Generate trip days from the date range
      const days = generateTripDays(startDate, endDate);
      setTripDays(days);
      setIsInitialized(true);
    }
  }, [searchParams, initializeTripFromParamsCallback, loadExistingTrip, navigate, clearTrip, dispatch]);


  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Calculate total amount spent on the trip
   * Uses backend expenses if tripId exists, otherwise uses local expenses
   */
  const calculateTotalSpent = () => {
    if (tripId) {
      // Use backend expenses for saved trips
      return backendExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    } else {
      // Use local expenses for new trips
      return state.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    }
  };

  /**
   * Convert backend expense format to frontend format
   * Maps backend expense structure to match frontend component expectations
   */
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

  // ============================================================================
  // PLACE MANAGEMENT FUNCTIONS
  // ============================================================================

  /**
   * Handle adding a new place to the trip
   * Adds the place to the trip context and closes the modal
   */
  const handleAddPlace = (place: Omit<Place, 'id'>) => {
    addPlace(place);
    setShowAddPlaceModal(false);
  };

  /**
   * Handle deleting a place from the trip
   * Removes the place and all associated activities
   */
  const handleDeletePlace = (placeId: string) => {
    removePlace(placeId);
    // Also remove activities associated with this place
    state.activities.forEach(activity => {
      if (activity.placeId === placeId && activity.id) {
        removeActivity(activity.id);
      }
    });
  };

  // ============================================================================
  // ACTIVITY MANAGEMENT FUNCTIONS
  // ============================================================================

  /**
   * Handle adding or updating an activity
   * Supports both creating new activities and editing existing ones
   * Uses JSON-based architecture for storing activities in trip data
   */
  const handleAddActivity = async (activity: Omit<Activity, 'id'>) => {
    try {
      if (editingActivity) {
        // Update existing activity in local state
        const updatedActivity = {
          ...editingActivity,
          ...activity,
          dayNumber: selectedDay || 1
        };
        updateActivity(updatedActivity);
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: 'Activity updated successfully!',
          duration: 3000,
        }));
      } else {
        // Create new activity in local state
        const activityWithDay = {
          ...activity,
          dayNumber: selectedDay || 1
        };
        addActivity(activityWithDay);
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: `${activity.name} added to Day ${selectedDay}!`,
          duration: 3000,
        }));
      }
    } catch (error) {
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to save activity. Please try again.',
        duration: 5000,
      }));
    }
    
    // Close modal and reset editing state
    setShowAddActivityModal(false);
    setEditingActivity(null);
  };

  /**
   * Handle deleting an activity
   * Removes the activity from local state (activities are saved as JSON in trip)
   */
  const handleDeleteActivity = async (activityId: string) => {
    // Remove from local state
    removeActivity(activityId);
    
    // Show success notification
    dispatch(addNotification({
      type: 'success',
      message: 'Activity deleted successfully!',
      duration: 3000,
    }));
  };

  /**
   * Handle editing an existing activity
   * Sets the activity to edit and opens the activity modal
   */
  const handleEditActivity = (activityToEdit: Activity) => {
    setEditingActivity(activityToEdit);
    setSelectedDay(activityToEdit.dayNumber || 1);
    setShowAddActivityModal(true);
  };

  // ============================================================================
  // EXPENSE MANAGEMENT FUNCTIONS
  // ============================================================================

  /**
   * Handle adding a new expense
   * Integrates with backend for saved trips, falls back to local state for new trips
   */
  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
    try {
      if (tripId) {
        // Convert frontend category to backend format
        const categoryMap: { [key: string]: ExpenseCategory } = {
          'accommodation': ExpenseCategory.ACCOMMODATION,
          'food': ExpenseCategory.FOOD,
          'transport': ExpenseCategory.TRANSPORT,
          'activities': ExpenseCategory.ACTIVITIES,
          'shopping': ExpenseCategory.SHOPPING,
          'entertainment': ExpenseCategory.ENTERTAINMENT,
          'other': ExpenseCategory.OTHER
        };
        
        // Convert frontend expense to backend format
        const backendExpense: Omit<BackendExpense, 'id'> = {
          dayNumber: expense.dayNumber || 1,
          expenseDate: new Date().toISOString().split('T')[0], // Today's date
          category: categoryMap[expense.category.toLowerCase()] || ExpenseCategory.OTHER,
          description: expense.description,
          amount: parseFloat(expense.amount.toString()), // Ensure it's a number
          currency: Currency.USD,
          status: ExpenseStatus.PAID,
          tripId: tripId
        };
        
        // Create expense in backend
        const newExpense = await expenseService.createExpense(backendExpense);
        
        // Add to local state
        setBackendExpenses(prev => [...prev, newExpense]);
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: `$${expense.amount} ${expense.category} expense added!`,
          duration: 3000,
        }));
      } else {
        // Fallback to local state if no tripId
        addExpense(expense);
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: `$${expense.amount} ${expense.category} expense added!`,
          duration: 3000,
        }));
      }
    } catch (error) {
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to add expense. Please try again.',
        duration: 5000,
      }));
    }
    
    setShowAddExpenseModal(false);
  };

  /**
   * Handle deleting an expense
   * Removes from both backend and local state
   */
  const handleDeleteExpense = async (expenseId: string) => {
    if (tripId) {
      try {
        // Delete from backend
        await expenseService.deleteExpense(parseInt(expenseId));
        setBackendExpenses(prev => prev.filter(e => e.id?.toString() !== expenseId));
      } catch (error) {
        alert('Failed to delete expense. Please try again.');
      }
    }
    
    // Remove from local state
    removeExpense(expenseId);
  };

  // ============================================================================
  // HOTEL SEARCH FUNCTIONALITY
  // ============================================================================

  /**
   * Add a hotel from search results as a place to the trip
   * Converts hotel destination data to place format and adds to trip
   */
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

  // ============================================================================
  // TRIP SAVE AND DELETE FUNCTIONS
  // ============================================================================

  /**
   * Handle saving the trip to backend
   * Updates existing trips or creates new ones based on tripId
   */
  const handleSaveTrip = async () => {
    if (!state.currentTrip) {
      alert('No trip data found. Please refresh the page and try again.');
      return;
    }
    
    try {
      if (tripId) {
        // Update existing trip
        await tripService.updateTrip(tripId, {
          ...state.currentTrip,
          destination: state.currentTrip.destination || 'Unknown Destination'
        });
        
        // Places are already saved as part of the trip creation
        // No need to save them individually
        
        alert('Trip updated successfully!');
      } else {
        // Create new trip
        await saveTrip();
        
        // Activities and itineraries are already saved as JSON in the trip
        // No need for additional backend calls
        
        alert('Trip saved successfully!');
      }
      
      navigate('/home');
    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.data) {
        alert(`Failed to save trip: ${error.response.data}`);
      } else if (error.message) {
        alert(`Failed to save trip: ${error.message}`);
      } else {
        alert('Failed to save trip. Please try again.');
      }
    }
  };

  /**
   * Handle deleting the entire trip
   * Requires confirmation and removes the trip from backend
   */
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

  /**
   * Handle deleting a specific day from the trip
   * Removes all activities associated with that day
   */
  const handleDeleteDay = async (dayNumber: number) => {
    if (confirm(`Are you sure you want to delete Day ${dayNumber}? This will remove all activities for this day.`)) {
      // Remove all activities for this day from local state
      // Activities are now managed as JSON in the trip data
      state.activities.forEach(activityToCheck => {
        if (activityToCheck.dayNumber === dayNumber) {
          removeActivity(activityToCheck.id!);
        }
      });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: `Day ${dayNumber} deleted successfully!`,
        duration: 3000,
      }));
    }
  };

  // ============================================================================
  // UI HELPER FUNCTIONS
  // ============================================================================

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Check if any modal is currently open
  const isAnyModalOpen = showAddPlaceModal || showAddActivityModal || showAddExpenseModal || showHotelSearchModal;

  // Show loading state while trip data is being fetched
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
                selectedPlace={null}
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
                  // Check if place already exists in the trip
                  const existingPlace = state.places.find(p => 
                    p.name === place.name && p.location === place.location
                  );
                  
                  if (existingPlace) {
                    // Show warning if place already exists
                    dispatch(addNotification({
                      type: 'warning',
                      message: `${place.name} is already in your trip!`,
                      duration: 3000,
                    }));
                    return;
                  }
                  
                  // Add the place to the trip context
                  addPlace(place);
                  
                  // Show success notification
                  dispatch(addNotification({
                    type: 'success',
                    message: `${place.name} has been added to your trip!`,
                    duration: 3000,
                  }));
                }}
                 onDeletePlace={handleDeletePlace}
                 getCategoryIcon={getCategoryIcon}
               />

                <ItinerarySection
                  tripDays={tripDays}
                  activities={state.activities || []}
                  itineraries={itineraries}
                  selectedDay={selectedDay}
                  onAddActivity={(dayNumber) => {
                    // Set the selected day and open the activity modal
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
};

export default NewTrip;