import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Edit2, 
  FileText, 
  ChevronRight
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TripSidebar from '../components/TripSidebar';
import { useTrip, Place, Activity, Expense } from '../contexts/TripContext';

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

const NewTrip = () => {
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
    saveTrip 
  } = useTrip();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tripDays, setTripDays] = useState<Array<{ date: Date; dayNumber: number }>>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Modal states
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showHotelSearchModal, setShowHotelSearchModal] = useState(false);
  
  // Activity and place selection states
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Hotel search hook
  const hotelSearch = useHotelSearch();

  useEffect(() => {
    // Initialize trip from URL parameters using context
    initializeTripFromParams(searchParams);
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
      navigate('/');
      return;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      navigate('/');
      return;
    }

    // Generate array of days between start and end date
    const days = generateTripDays(startDate, endDate);
    setTripDays(days);

    // Load sample data for demonstration
    loadSampleData();
  }, [searchParams, navigate]); // Removed initializeTripFromParams from dependencies

  // Load sample data
  const loadSampleData = () => {
    samplePlaces.forEach(place => addPlace(place));
  };

  // Utility functions
  const calculateTotalSpent = () => state.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  // Place management
  const handleAddPlace = (place: Omit<Place, 'id'>) => {
    addPlace(place);
    setShowAddPlaceModal(false);
  };

  const handleDeletePlace = (placeId: string) => {
    removePlace(placeId);
    // Also remove activities associated with this place
    state.activities.forEach(activity => {
      if (activity.placeId === placeId) {
        removeActivity(activity.id);
      }
    });
  };

  // Activity management
  const handleAddActivity = (activity: Omit<Activity, 'id'>) => {
    addActivity(activity);
    setShowAddActivityModal(false);
  };

  const handleDeleteActivity = (activityId: string) => {
    removeActivity(activityId);
  };

  // Expense management
  const handleAddExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    addExpense(expense);
    setShowAddExpenseModal(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
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
    } catch (error) {
      alert('Failed to save trip. Please try again.');
    }
  };

  const handleDeleteDay = (dayNumber: number) => {
    if (confirm(`Are you sure you want to delete Day ${dayNumber}? This will remove all activities for this day.`)) {
      state.activities.forEach(activity => {
        if (activity.day === dayNumber) {
          removeActivity(activity.id);
        }
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isAnyModalOpen = showAddPlaceModal || showAddActivityModal || showAddExpenseModal || showHotelSearchModal;

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
            onClose={() => setShowAddActivityModal(false)}
            title="Add Activity"
          >
            <AddActivityForm 
              onSubmit={handleAddActivity} 
              onCancel={() => setShowAddActivityModal(false)}
              selectedDay={selectedDay || 1}
              places={state.places || []}
              selectedPlace={selectedPlace}
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
                onAddPlace={() => setShowAddPlaceModal(true)}
                onSearchHotels={() => setShowHotelSearchModal(true)}
                onAddToItinerary={(place) => {
                  setSelectedPlace(place);
                  setSelectedDay(1);
                  setShowAddActivityModal(true);
                }}
                onDeletePlace={handleDeletePlace}
                getCategoryIcon={getCategoryIcon}
              />

              <ItinerarySection
                tripDays={tripDays}
                activities={state.activities || []}
                onAddActivity={(dayNumber) => {
                  setSelectedDay(dayNumber);
                  setShowAddActivityModal(true);
                }}
                onDeleteActivity={handleDeleteActivity}
                onDeleteDay={handleDeleteDay}
                getCategoryIcon={getCategoryIcon}
                formatDate={formatDate}
              />

              <BudgetSection
                budget={state.currentTrip?.budget || 0}
                totalSpent={calculateTotalSpent()}
                expenses={state.expenses || []}
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