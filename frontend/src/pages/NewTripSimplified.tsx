import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Menu, X, Edit2, Trash2 } from 'lucide-react';
import { useTripManagement } from '../hooks/useTripManagement';
import { useTrip } from '../contexts/TripContext';
import TripCreationModal from '../components/modals/TripCreationModal';

// Import components
import Modal from '../components/modals/Modal';
import AddPlaceForm from '../components/forms/AddPlaceForm';
import AddActivityForm from '../components/forms/AddActivityForm';
import AddExpenseForm from '../components/forms/AddExpenseForm';
import TripSidebar from '../components/TripSidebar';
import TripOverview from '../components/sections/TripOverview';
import PlacesSection from '../components/sections/PlacesSection';
import ItinerarySection from '../components/sections/ItinerarySection';
import BudgetSection from '../components/sections/BudgetSection';

// Import utilities
import { getCategoryIcon, getExpenseCategoryIcon } from '../utils/iconUtils';
import { formatDate, generateTripDays } from '../utils/dateUtils';

const NewTrip: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripId = searchParams.get('tripId');
  
  // Use the new trip management hook
  const {
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
  } = useTripManagement();

  // Use existing trip context for places and local state
  const { state, addPlace, removePlace, addExpense, removeExpense } = useTrip();

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Modal states
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  
  // Form states
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [tripDays, setTripDays] = useState<Array<{ date: Date; dayNumber: number }>>([]);

  // Load trip data when component mounts
  useEffect(() => {
    if (tripId) {
      loadTrip(parseInt(tripId));
    } else {
      navigate('/');
    }
  }, [tripId, loadTrip, navigate]);

  // Generate trip days when trip data is loaded
  useEffect(() => {
    if (trip?.startDate && trip?.endDate) {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const days = generateTripDays(startDate, endDate);
      setTripDays(days);
    }
  }, [trip]);

  // Calculate total spent
  const calculateTotalSpent = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Convert backend expenses to frontend format
  const convertBackendExpensesToFrontend = (backendExpenses: any[]) => {
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
  const handleAddPlace = (place: any) => {
    addPlace(place);
    setShowAddPlaceModal(false);
  };

  const handleDeletePlace = (placeId: string) => {
    removePlace(placeId);
  };

  // Activity management
  const handleAddActivity = async (activity: any) => {
    if (tripId) {
      await createActivity(activity, parseInt(tripId), selectedDay);
    }
    setShowAddActivityModal(false);
    setEditingActivity(null);
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setSelectedDay(activity.dayNumber || 1);
    setShowAddActivityModal(true);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (tripId) {
      await deleteActivity(activityId, parseInt(tripId));
    }
  };

  // Expense management
  const handleAddExpense = async (expense: any) => {
    if (tripId) {
      await createExpense(expense, parseInt(tripId));
    } else {
      addExpense(expense);
    }
    setShowAddExpenseModal(false);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (tripId) {
      await deleteExpense(expenseId, parseInt(tripId));
    } else {
      removeExpense(expenseId);
    }
  };

  // Delete trip
  const handleDeleteTrip = async () => {
    if (!tripId) return;
    
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        // You would need to implement deleteTrip in the hook
        // await deleteTrip(parseInt(tripId));
        navigate('/');
      } catch (error) {
        console.error('Failed to delete trip:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading trip...</div>
      </div>
    );
  }

  const isAnyModalOpen = showAddPlaceModal || showAddActivityModal || showAddExpenseModal;

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
        </>
      ) : (
        <>
          <TripSidebar
            isSidebarOpen={isSidebarOpen}
            isMinimized={isMinimized}
            tripName={trip?.title || "Trip"}
            tripDays={tripDays}
            formatTripDuration={() => {
              if (tripDays.length > 0) {
                const start = tripDays[0].date;
                const end = tripDays[tripDays.length - 1].date;
                return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              }
              return '';
            }}
            setShowHotelSearchModal={() => {}}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            setIsMinimized={setIsMinimized}
          />

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${isMinimized ? 'md:ml-16' : 'md:ml-80'} min-h-screen`}>
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between p-4 bg-white shadow-md">
              <div className="flex items-center space-x-2">
                {isEditingName ? (
                  <input
                    type="text"
                    value={trip?.title || ""}
                    onChange={(e) => {/* Handle name update */}}
                    onBlur={() => setIsEditingName(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    className="text-2xl font-bold border-b border-blue-500 focus:outline-none focus:border-blue-600"
                    autoFocus
                  />
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{trip?.title || "Trip"}</h1>
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
                budget={trip?.budget || 0}
                totalSpent={calculateTotalSpent()}
                places={state.places || []}
                tripName={trip?.title || "Trip"}
                isMapFullscreen={false}
                onToggleMapFullscreen={() => {}}
                getCategoryIcon={getCategoryIcon}
              />

              <PlacesSection
                places={state.places || []}
                searchQuery=""
                onSearchChange={() => {}}
                onAddToItinerary={(place) => {
                  addPlace(place);
                }}
                onDeletePlace={handleDeletePlace}
                getCategoryIcon={getCategoryIcon}
              />

              <ItinerarySection
                tripDays={tripDays}
                activities={activities}
                itineraries={itineraries}
                selectedDay={selectedDay}
                onAddActivity={(dayNumber) => {
                  setSelectedDay(dayNumber);
                  setShowAddActivityModal(true);
                }}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
                onDeleteDay={() => {}}
                getCategoryIcon={getCategoryIcon}
                formatDate={formatDate}
              />

              <BudgetSection
                budget={trip?.budget || 0}
                totalSpent={calculateTotalSpent()}
                expenses={convertBackendExpensesToFrontend(expenses)}
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
