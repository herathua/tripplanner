import { useState, useEffect, useCallback } from 'react';
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
import { Activity, DayItinerary } from '../services/itineraryService';

// Import services
import { tripService } from '../services/tripService';
import { expenseService, Expense as BackendExpense, ExpenseCategory, Currency, ExpenseStatus } from '../services/expenseService';

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
import { useAppDispatch } from '../store';
import { clearTripDetails } from '../store/slices/tripSlice';
import { addNotification } from '../store/slices/uiSlice';

const NewTrip = () => {
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
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tripDays, setTripDays] = useState<Array<{ date: Date; dayNumber: number }>>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Backend data
  const [tripId, setTripId] = useState<number | null>(null);
  const [itineraries, setItineraries] = useState<DayItinerary[]>([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hotel search hook
  const hotelSearch = useHotelSearch();
  
  // Initialize trip from URL parameters - use useCallback to prevent infinite re-renders
  const initializeTripFromParamsCallback = useCallback(() => {
    console.log('🔄 Initializing trip from URL params:', searchParams.toString());
    initializeTripFromParams(searchParams);
  }, [searchParams, initializeTripFromParams]);

  // Load existing trip from backend
  const loadExistingTrip = useCallback(async (id: number) => {
      console.log('📂 Loading existing trip with ID:', id);
      setIsLoading(true);
      
      try {
        // Step 1: Clear existing data to avoid cross-trip contamination
        console.log('🧹 Clearing existing trip data...');
        clearTrip();
        setTripId(null);
        setItineraries([]);
        setBackendActivities([]);
        setBackendExpenses([]);
        
        // Step 2: Load trip basic information
        console.log('📋 Loading trip basic information...');
        const trip = await tripService.getTripById(id);
        console.log('✅ Loaded trip:', trip);
        setTripId(id);
        
        // Step 3: Update TripContext with the loaded trip
        console.log('🔄 Updating TripContext with trip data...');
        await loadTrip(id);
        console.log('✅ TripContext updated');
        
        // Step 4: Itineraries are now loaded as part of the trip data (JSON-based)
        console.log('📅 Itineraries are loaded as part of trip data');
        setItineraries([]); // Clear itineraries since they're now in trip data
        
        // Step 5: Activities are now loaded as part of the trip data (JSON-based)
        console.log('🎯 Activities are loaded as part of trip data');
        setBackendActivities([]); // Clear backend activities since they're now in trip data
        
        // Step 6: Load expenses for this trip
        console.log('💰 Loading expenses...');
        const tripExpenses = await expenseService.getExpensesByTripId(id);
        console.log('✅ Loaded expenses:', tripExpenses.length, 'expenses');
        setBackendExpenses(tripExpenses);
        
        // Step 7: Generate trip days from trip dates
        if (trip.startDate && trip.endDate) {
          console.log('📅 Generating trip days...');
          const startDate = new Date(trip.startDate);
          const endDate = new Date(trip.endDate);
          const days = generateTripDays(startDate, endDate);
          setTripDays(days);
          console.log('✅ Generated', days.length, 'trip days');
        }
        
        console.log('🎉 Trip loading completed successfully!');
        
      } catch (error) {
        console.error('❌ Failed to load trip:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to load trip. Please try again.',
          duration: 5000,
        }));
      } finally {
        setIsLoading(false);
      }
    }, [clearTrip, loadTrip, dispatch]);

  useEffect(() => {
    // Reset initialization flag when search params change
    setIsInitialized(false);
  }, [searchParams]);

  useEffect(() => {
    if (isInitialized) return; // Prevent infinite loops
    
    const tripIdParam = searchParams.get('tripId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const budgetStr = searchParams.get('budget');
    const tripNameStr = searchParams.get('tripName');
    const tripDescriptionStr = searchParams.get('tripDescription');

    console.log('🔍 URL Params:', { tripIdParam, startDateStr, endDateStr, budgetStr, tripNameStr, tripDescriptionStr });

    if (tripIdParam) {
      // Load existing trip from backend
      console.log('📂 Loading existing trip with ID:', tripIdParam);
      loadExistingTrip(parseInt(tripIdParam));
      setIsInitialized(true);
    } else if (!startDateStr || !endDateStr || !budgetStr || !tripNameStr) {
      console.log('❌ Missing required parameters, redirecting to home');
      navigate('/');
      return;
    } else {
      // New trip - clear data and initialize
      console.log('🆕 Creating new trip with params');
      clearTrip();
      dispatch(clearTripDetails());
      initializeTripFromParamsCallback();
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const budget = parseFloat(budgetStr);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
        console.log('❌ Invalid dates, redirecting to home');
        navigate('/');
        return;
      }

      if (isNaN(budget) || budget <= 0) {
        console.log('❌ Invalid budget, redirecting to home');
        navigate('/');
        return;
      }

      // Generate trip days
      const days = generateTripDays(startDate, endDate);
      setTripDays(days);
      console.log('✅ Trip initialized successfully with', days.length, 'days');
      setIsInitialized(true);
    }
  }, [searchParams, initializeTripFromParamsCallback, loadExistingTrip, navigate, clearTrip, dispatch]);


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

    // Activity management with JSON-based architecture
    const handleAddActivity = async (activity: Omit<Activity, 'id'>) => {
      console.log('🎯 handleAddActivity called with:', activity);
      console.log('📊 Current state:', { tripId, selectedDay, editingActivity: !!editingActivity });
      
      try {
        if (editingActivity) {
          // Update existing activity in local state
          console.log('🔄 Updating existing activity:', editingActivity.id);
          
          // For now, we'll handle updates by removing the old activity and adding the new one
          // This is a simplified approach for the JSON-based architecture
          removeActivity(editingActivity.id!);
          addActivity({
            ...activity,
            dayNumber: selectedDay || 1
          });
          
          // Show success notification
          dispatch(addNotification({
            type: 'success',
            message: 'Activity updated successfully!',
            duration: 3000,
          }));
        } else {
          // Create new activity in local state
          console.log('🆕 Creating new activity for day:', selectedDay);
          
          const activityWithDay = {
            ...activity,
            dayNumber: selectedDay || 1
          };
          console.log('📝 Adding activity to local state:', activityWithDay);
          addActivity(activityWithDay);
          
          // Show success notification
          dispatch(addNotification({
            type: 'success',
            message: `${activity.name} added to Day ${selectedDay}!`,
            duration: 3000,
          }));
        }
      } catch (error) {
        console.error('❌ Failed to handle activity:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to save activity. Please try again.',
          duration: 5000,
        }));
      }
      
      setShowAddActivityModal(false);
      setEditingActivity(null);
    };

    const handleDeleteActivity = async (activityId: string) => {
      console.log('🗑️ Deleting activity:', activityId);
      
      // Remove from local state (activities are saved as JSON in trip)
      removeActivity(activityId);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: 'Activity deleted successfully!',
        duration: 3000,
      }));
    };

    const handleEditActivity = (activityToEdit: Activity) => {
      setEditingActivity(activityToEdit);
      setSelectedDay(activityToEdit.dayNumber || 1);
      setShowAddActivityModal(true);
    };

    // Expense management with backend integration
    const handleAddExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
      console.log('💰 Adding expense:', expense);
      console.log('📊 Current state:', { tripId, hasBackendExpenses: backendExpenses.length });
      
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
          
          console.log('💾 Sending expense to backend:', backendExpense);
          
          // Create expense in backend
          const newExpense = await expenseService.createExpense(backendExpense);
          console.log('✅ Created expense in backend:', newExpense);
          
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
          console.log('📝 Adding expense to local state');
          addExpense(expense);
          
          // Show success notification
          dispatch(addNotification({
            type: 'success',
            message: `$${expense.amount} ${expense.category} expense added!`,
            duration: 3000,
          }));
        }
      } catch (error) {
        console.error('❌ Failed to create expense:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to add expense. Please try again.',
          duration: 5000,
        }));
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
    if (!state.currentTrip) {
      alert('No trip data found. Please refresh the page and try again.');
      return;
    }
    
    console.log('💾 Saving trip with data:', {
      trip: state.currentTrip,
      places: state.places,
      activities: state.activities,
      expenses: state.expenses,
      tripId: tripId
    });
    
    try {
      if (tripId) {
        // Update existing trip
        console.log('🔄 Updating existing trip:', tripId);
        
        // Update trip basic info
        await tripService.updateTrip(tripId, {
          ...state.currentTrip,
          destination: state.currentTrip.destination || 'Unknown Destination'
        });
        
        // Places are already saved as part of the trip creation
        // No need to save them individually
        
        console.log('✅ Trip updated successfully');
        alert('Trip updated successfully!');
      } else {
        // Create new trip
        console.log('🆕 Creating new trip');
        const createdTrip = await saveTrip();
        console.log('✅ Trip created successfully:', createdTrip);
        
        // Activities and itineraries are already saved as JSON in the trip
        // No need for additional backend calls
        console.log('✅ Trip created with all data including activities and itineraries');
        
        alert('Trip saved successfully!');
      }
      
      navigate('/home');
    } catch (error: any) {
      console.error('❌ Error saving trip:', error);
      if (error.response?.data) {
        console.error('❌ Backend error response:', error.response.data);
        alert(`Failed to save trip: ${error.response.data}`);
      } else if (error.message) {
        console.error('❌ Error message:', error.message);
        alert(`Failed to save trip: ${error.message}`);
      } else {
        alert('Failed to save trip. Please try again.');
      }
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
        console.log('🗑️ Deleting day:', dayNumber);
        
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
                  console.log('🎯 Adding place to trip:', place);
                  
                  // Check if place already exists
                  const existingPlace = state.places.find(p => 
                    p.name === place.name && p.location === place.location
                  );
                  
                  if (existingPlace) {
                    console.log('⚠️ Place already exists in trip');
                    dispatch(addNotification({
                      type: 'warning',
                      message: `${place.name} is already in your trip!`,
                      duration: 3000,
                    }));
                    return;
                  }
                  
                  // Add the place to the trip context
                  console.log('📝 Adding place to context...');
                  addPlace(place);
                  
                  // Show success notification
                  dispatch(addNotification({
                    type: 'success',
                    message: `${place.name} has been added to your trip!`,
                    duration: 3000,
                  }));
                  
                  console.log('✅ Place added successfully. Total places:', state.places.length + 1);
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
                    console.log('🎯 Adding activity for day:', dayNumber);
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