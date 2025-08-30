import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  MapPin, 
  Calendar, 
  Map, 
  DollarSign, 
  Settings, 
  Share2, 
  Download,
  ChevronRight,
  Clock,
  Users,
  FileText,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  Camera,
  Navigation,
  Car,
  Plane,
  Train,
  Bus,
  Utensils,
  Bed,
  ShoppingBag,
  Camera as CameraIcon
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tripApi, CreateTripRequest } from '../services/api';

// Types
interface Place {
  id: string;
  name: string;
  location: string;
  description: string;
  category: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'shopping';
  rating: number;
  photos: string[];
  coordinates: { lat: number; lng: number };
  cost: number;
  duration: number; // in hours
  dayNumber?: number;
}

interface Activity {
  id: string;
  dayNumber: number;
  time: string;
  placeId: string;
  placeName: string;
  description: string;
  cost: number;
  duration: number;
  type: 'sightseeing' | 'dining' | 'transport' | 'accommodation' | 'shopping';
}

interface Expense {
  id: string;
  dayNumber: number;
  category: 'accommodation' | 'food' | 'transport' | 'activities' | 'shopping' | 'other';
  description: string;
  amount: number;
  date: Date;
}

const NewTrip = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tripDays, setTripDays] = useState<Array<{ date: Date; dayNumber: number }>>([]);
  const [tripName, setTripName] = useState("Trip to Sri Lanka");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tripBudget, setTripBudget] = useState(0);
  
  // New state for enhanced functionality
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  useEffect(() => {
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const budgetStr = searchParams.get('budget');

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

    // Set budget from URL parameter
    if (budgetStr) {
      const budget = parseInt(budgetStr.replace(/\D/g, ''));
      if (!isNaN(budget)) {
        setTripBudget(budget);
      }
    }

    // Generate array of days between start and end date
    const days: Array<{ date: Date; dayNumber: number }> = [];
    let currentDate = new Date(startDate);
    let dayNumber = 1;

    while (currentDate <= endDate) {
      days.push({
        date: new Date(currentDate),
        dayNumber: dayNumber
      });
      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber++;
    }

    setTripDays(days);

    // Load sample data for demonstration
    loadSampleData();
  }, [searchParams, navigate]);

  // Load sample data
  const loadSampleData = () => {
    const samplePlaces: Place[] = [
      {
        id: '1',
        name: 'Sigiriya Rock Fortress',
        location: 'Dambulla, Sri Lanka',
        description: 'Ancient palace and fortress complex built on top of a massive rock column. A UNESCO World Heritage site with stunning views and fascinating history.',
        category: 'attraction',
        rating: 5,
        photos: [],
        coordinates: { lat: 7.9570, lng: 80.7603 },
        cost: 30,
        duration: 4
      },
      {
        id: '2',
        name: 'Temple of the Tooth',
        location: 'Kandy, Sri Lanka',
        description: 'Sacred Buddhist temple housing the relic of the tooth of Buddha. A beautiful example of Kandyan architecture.',
        category: 'attraction',
        rating: 4,
        photos: [],
        coordinates: { lat: 7.2935, lng: 80.6414 },
        cost: 15,
        duration: 2
      },
      {
        id: '3',
        name: 'Galle Fort',
        location: 'Galle, Sri Lanka',
        description: 'Historic fortification built by the Portuguese in the 16th century. Features colonial architecture and stunning ocean views.',
        category: 'attraction',
        rating: 4,
        photos: [],
        coordinates: { lat: 6.0535, lng: 80.2210 },
        cost: 0,
        duration: 3
      }
    ];

    setPlaces(samplePlaces);
  };

  // Utility functions
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attraction': return <Camera className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'hotel': return <Bed className="w-4 h-4" />;
      case 'transport': return <Car className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getExpenseCategoryIcon = (category: string) => {
    switch (category) {
      case 'accommodation': return <Bed className="w-4 h-4" />;
      case 'food': return <Utensils className="w-4 h-4" />;
      case 'transport': return <Car className="w-4 h-4" />;
      case 'activities': return <Camera className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const calculateTotalSpent = () => expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const calculateRemainingBudget = () => tripBudget - calculateTotalSpent();

  // Place management
  const addPlace = (place: Omit<Place, 'id'>) => {
    const newPlace = { ...place, id: generateId() };
    setPlaces([...places, newPlace]);
    setShowAddPlaceModal(false);
  };

  const deletePlace = (placeId: string) => {
    setPlaces(places.filter(p => p.id !== placeId));
    setActivities(activities.filter(a => a.placeId !== placeId));
  };

  // Activity management
  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity = { ...activity, id: generateId() };
    setActivities([...activities, newActivity]);
    setShowAddActivityModal(false);
  };

  const deleteActivity = (activityId: string) => {
    setActivities(activities.filter(a => a.id !== activityId));
  };

  // Expense management
  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense = { 
      ...expense, 
      id: generateId(),
      date: new Date()
    };
    setExpenses([...expenses, newExpense]);
    setShowAddExpenseModal(false);
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
  };

  // Export functionality
  const exportToPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  const exportToCalendar = () => {
    // TODO: Implement calendar export
    console.log('Exporting to calendar...');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTripDuration = () => {
    if (tripDays.length > 0) {
      const start = tripDays[0].date;
      const end = tripDays[tripDays.length - 1].date;
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return '';
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveTrip = async () => {
    if (!tripDays.length) {
      alert('No trip dates available');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const tripData: CreateTripRequest = {
        title: tripName,
        destination: 'Sri Lanka', // You can make this dynamic
        startDate: tripDays[0].date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: tripDays[tripDays.length - 1].date.toISOString().split('T')[0],
        budget: tripBudget
      };

      // Save to backend
      const tripId = await tripApi.createTrip(tripData);
      
      // Also save detailed data to localStorage for now (you can extend the backend later)
      const detailedTripData = {
        id: tripId,
        name: tripName,
        startDate: tripDays[0]?.date,
        endDate: tripDays[tripDays.length - 1]?.date,
        budget: tripBudget,
        places,
        activities,
        expenses,
        createdAt: new Date()
      };
      
      localStorage.setItem(`trip_${tripId}`, JSON.stringify(detailedTripData));
      console.log('Trip saved with ID:', tripId);
      
      // Show success notification
      alert(`Trip saved successfully! Trip ID: ${tripId}`);
      
      // Optionally navigate to a trip list page or stay on current page
      // navigate(`/trip/${tripId}`);
      
    } catch (error) {
      console.error('Error saving trip:', error);
      setSaveError('Failed to save trip. Please try again.');
      alert('Failed to save trip. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddActivity = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowAddActivityModal(true);
  };

  const handleDeleteDay = (dayNumber: number) => {
    if (confirm(`Are you sure you want to delete Day ${dayNumber}? This will remove all activities for this day.`)) {
      setActivities(activities.filter(a => a.dayNumber !== dayNumber));
      // Note: We don't actually delete the day, just its activities
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-md z-50 transform transition-all duration-300 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMinimized ? 'w-16' : 'w-80'}
          md:fixed md:translate-x-0 flex flex-col`}
      >
        {/* Trip Header - Fixed at top */}
        <div className="sticky top-0 z-10 p-6 bg-white border-b">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <img
                src="/src/assets/logo.png"
                alt="TripTail Logo"
                title="TripTail"
                className={`w-8 h-8 flex-shrink-0 object-contain transition-all duration-300 ${isMinimized ? 'mx-auto' : ''}`}
              />
              <h2 className={`text-lg font-bold transition-all duration-300 ${
                isMinimized ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'
              }`}>Itinero</h2>
            </div>
          </div>
          <div className={`space-y-2 ${isMinimized ? 'hidden' : 'block'}`}>
            <h3 className="font-semibold text-gray-900">Trip to Sri Lanka</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatTripDuration()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>{tripDays.length} days</span>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className={`flex-1 ${isMinimized ? 'p-2' : 'p-4'} overflow-y-auto`}>
          <div className="space-y-1">
            <h4 className={`px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${isMinimized ? 'hidden' : 'block'}`}>
              Trip Details
            </h4>
            <a href="#overview" className={`flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Overview">
              <Map className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Overview</span>
              <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
            </a>
            <a href="#places" className={`flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Places to Visit">
              <MapPin className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Places to Visit</span>
              <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
            </a>
            <a href="#itinerary" className={`flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Itinerary">
              <Calendar className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Itinerary</span>
              <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
            </a>
            <a href="#budgeting" className={`flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Budget">
              <DollarSign className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Budget</span>
              <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
            </a>
          </div>

          <div className="mt-8 space-y-1">
            <h4 className={`px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${isMinimized ? 'hidden' : 'block'}`}>
              Trip Tools
            </h4>
            <button className={`flex items-center w-full px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Share with Friends">
              <Users className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Share with Friends</span>
              <Share2 className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
            </button>
            <button className={`flex items-center w-full px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Export Itinerary">
              <FileText className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Export Itinerary</span>
              <Download className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
            </button>
            <button 
              onClick={exportToPDF}
              className={`flex items-center w-full px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} 
              title="Export to PDF"
            >
              <FileText className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Export to PDF</span>
            </button>
            <button 
              onClick={exportToCalendar}
              className={`flex items-center w-full px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} 
              title="Export to Calendar"
            >
              <Calendar className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Export to Calendar</span>
            </button>
            <button className={`flex items-center w-full px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Save to Favorites">
              <Heart className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Save to Favorites</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer - Fixed at bottom */}
        <div className="sticky bottom-0 p-4 bg-white border-t">
          <button className="flex items-center w-full px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group" title="Trip Settings">
            <Settings className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
            <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Trip Settings</span>
          </button>
        </div>
      </aside>

      {/* external toggle button (desktop) placed at the right edge of the sidebar */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="fixed z-50 items-center justify-center hidden w-8 h-8 bg-white rounded-full shadow-md md:flex hover:bg-gray-50"
        title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
        style={{ top: '1.5rem', left: isMinimized ? '4rem' : '20rem', transform: 'translateX(50%)' }}
      >
        <ChevronRight className={`w-4 h-4 text-gray-500 transform transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
      </button>

      {/* Main Content - Scrollable with proper margin */}
      <div className={`flex-1 transition-all duration-300 ${isMinimized ? 'md:ml-16' : 'md:ml-80'} min-h-screen`}>
        {/* Header Section - Only visible on mobile */}
        <header className="sticky top-0 z-40 flex items-center justify-between p-4 bg-white shadow-md md:hidden">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">{tripName}</h1>
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

        {/* Desktop Header - Without sidebar control button */}
        <header className="sticky top-0 z-40 flex items-center justify-between hidden p-4 bg-white shadow-md md:flex">
          <div className="flex items-center space-x-2">
            {isEditingName ? (
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-2xl font-bold border-b border-blue-500 focus:outline-none focus:border-blue-600"
                autoFocus
              />
            ) : (
              <>
                <h1 className="text-2xl font-bold">{tripName}</h1>
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
            {saveError && (
              <div className="text-red-600 text-sm">{saveError}</div>
            )}
            <button 
              onClick={handleSaveTrip}
              disabled={isSaving}
              className={`flex items-center px-6 py-2 space-x-2 text-white rounded-lg ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Save Trip</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Sections */}
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Overview Section */}
          <section id="overview" className="mb-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="h-full p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold">Trip Duration</h3>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{tripDays.length} days</span>
                </div>
              </div>
              <div className="h-full p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold">Total Budget</h3>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>${tripBudget.toLocaleString()}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Spent: ${calculateTotalSpent().toLocaleString()} | Remaining: ${calculateRemainingBudget().toLocaleString()}
                </div>
              </div>
              <div className="h-full p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold">Places to Visit</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{places.length} places added</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {places.length > 0 ? `${places.filter(p => p.category === 'attraction').length} attractions, ${places.filter(p => p.category === 'restaurant').length} restaurants` : 'No places added yet'}
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Trip Map</h3>
                <button
                  onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                  className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                  title={isMapFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  <Navigation className="w-5 h-5" />
                </button>
              </div>
              <div className={`${isMapFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
                {isMapFullscreen && (
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Trip Map - {tripName}</h3>
                    <button
                      onClick={() => setIsMapFullscreen(false)}
                      className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className={`${isMapFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[400px]'}`}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126742.302!2d80.7718!3d7.8731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3f9f9!2sSri%20Lanka!5e0!3m2!1sen!2sus!4v1681234567890"
                    className="rounded-lg w-full h-full"
                    allowFullScreen
                    title="Map of Sri Lanka"
                    loading="lazy"
                  ></iframe>
                </div>
                {places.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Places on Map:</h4>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {places.map(place => (
                        <div key={place.id} className="flex items-center space-x-2 text-sm">
                          {getCategoryIcon(place.category)}
                          <span className="truncate">{place.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Places to Visit Section */}
          <section id="places" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Places to Visit</h2>
              <button 
                onClick={() => setShowAddPlaceModal(true)}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Place</span>
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search places by name, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {places.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6 text-center text-gray-500 bg-white rounded-lg shadow-lg">
                <div>
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No places added yet</p>
                  <p className="text-sm text-gray-400 mb-4">Click "Add Place" to start planning your visits</p>
                  <button 
                    onClick={() => setShowAddPlaceModal(true)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Add Your First Place
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {places
                  .filter(place => 
                    searchQuery === '' || 
                    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    place.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    place.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(place => (
                  <div key={place.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="relative h-48 bg-gray-200">
                      {place.photos.length > 0 ? (
                        <img 
                          src={place.photos[0]} 
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <CameraIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                          {place.category}
                        </span>
                      </div>
                      <div className="absolute top-2 left-2 flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-white">{place.rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{place.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{place.location}</p>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{place.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>${place.cost}</span>
                        <span>{place.duration}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => {
                            setSelectedPlace(place);
                            setShowAddActivityModal(true);
                          }}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          Add to Itinerary
                        </button>
                        <button 
                          onClick={() => deletePlace(place.id)}
                          className="p-1 text-red-500 rounded hover:bg-red-50"
                          title="Delete place"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Itinerary Section */}
          <section id="itinerary" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Itinerary</h2>
              <button 
                onClick={() => {
                  setSelectedDay(1);
                  setShowAddActivityModal(true);
                }}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {tripDays.map(({ date, dayNumber }) => {
                const dayActivities = activities.filter(a => a.dayNumber === dayNumber);
                return (
                  <div key={dayNumber} className="p-6 bg-white rounded-lg shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium">Day {dayNumber}: {formatDate(date)}</h3>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedDay(dayNumber);
                            setShowAddActivityModal(true);
                          }}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50"
                          title={`Add activity for day ${dayNumber}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {dayActivities.length > 0 && (
                          <button 
                            onClick={() => handleDeleteDay(dayNumber)}
                            className="p-2 text-red-500 rounded hover:bg-red-50"
                            title={`Clear all activities for day ${dayNumber}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {dayActivities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No activities planned yet</p>
                        <button 
                          onClick={() => {
                            setSelectedDay(dayNumber);
                            setShowAddActivityModal(true);
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add your first activity
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayActivities
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map(activity => (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-600">
                                {activity.time}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {getCategoryIcon(activity.type)}
                                  <h4 className="font-medium">{activity.placeName}</h4>
                                  <span className="text-sm text-gray-500">({activity.duration}h)</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-green-600 font-medium">${activity.cost}</span>
                                  <button 
                                    onClick={() => deleteActivity(activity.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Budgeting Section */}
          <section id="budgeting" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Budget</h2>
              <button 
                onClick={() => setShowAddExpenseModal(true)}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                <div className="h-full p-6 rounded-lg bg-blue-50">
                  <h3 className="mb-2 text-sm font-medium text-gray-600">Total Budget</h3>
                  <p className="text-2xl font-semibold text-blue-600">${tripBudget.toLocaleString()}</p>
                </div>
                <div className="h-full p-6 rounded-lg bg-green-50">
                  <h3 className="mb-2 text-sm font-medium text-gray-600">Spent</h3>
                  <p className="text-2xl font-semibold text-green-600">${calculateTotalSpent().toLocaleString()}</p>
                </div>
                <div className="h-full p-6 rounded-lg bg-yellow-50">
                  <h3 className="mb-2 text-sm font-medium text-gray-600">Remaining</h3>
                  <p className="text-2xl font-semibold text-yellow-600">${calculateRemainingBudget().toLocaleString()}</p>
                </div>
              </div>
              
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No expenses added yet</p>
                  <p className="text-sm text-gray-400 mb-4">Click "Add Expense" to start tracking your budget</p>
                  <button 
                    onClick={() => setShowAddExpenseModal(true)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Add Your First Expense
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Expense Breakdown</h4>
                  {['accommodation', 'food', 'transport', 'activities', 'shopping', 'other'].map(category => {
                    const categoryExpenses = expenses.filter(e => e.category === category);
                    const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                    
                    if (categoryTotal === 0) return null;
                    
                    return (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getExpenseCategoryIcon(category)}
                            <span className="font-medium capitalize">{category}</span>
                          </div>
                          <span className="font-semibold text-gray-900">${categoryTotal.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                          {categoryExpenses.map(expense => (
                            <div key={expense.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">Day {expense.dayNumber}</span>
                                <span className="text-gray-900">{expense.description}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">${expense.amount.toLocaleString()}</span>
                                <button 
                                  onClick={() => deleteExpense(expense.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Add Place Modal */}
      {showAddPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Place</h3>
              <button 
                onClick={() => setShowAddPlaceModal(false)}
                className="p-1 text-gray-400 rounded hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddPlaceForm onSubmit={addPlace} onCancel={() => setShowAddPlaceModal(false)} />
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Activity</h3>
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="p-1 text-gray-400 rounded hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddActivityForm 
              onSubmit={addActivity} 
              onCancel={() => setShowAddActivityModal(false)}
              selectedDay={selectedDay || 1}
              places={places}
              selectedPlace={selectedPlace}
            />
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Expense</h3>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 text-gray-400 rounded hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddExpenseForm 
              onSubmit={addExpense} 
              onCancel={() => setShowAddExpenseModal(false)}
              tripDays={tripDays}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Form Components
const AddPlaceForm: React.FC<{
  onSubmit: (place: Omit<Place, 'id'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    category: 'attraction' as Place['category'],
    rating: 5,
    cost: 0,
    duration: 2,
    photos: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      coordinates: { lat: 0, lng: 0 } // Default coordinates
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Place Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Sigiriya Rock Fortress"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Dambulla, Sri Lanka"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as Place['category'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="attraction">Attraction</option>
          <option value="restaurant">Restaurant</option>
          <option value="hotel">Hotel</option>
          <option value="transport">Transport</option>
          <option value="shopping">Shopping</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
          <input
            type="number"
            min="0"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what makes this place special..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className={`p-1 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Place
        </button>
      </div>
    </form>
  );
};

const AddActivityForm: React.FC<{
  onSubmit: (activity: Omit<Activity, 'id'>) => void;
  onCancel: () => void;
  selectedDay: number;
  places: Place[];
  selectedPlace?: Place | null;
}> = ({ onSubmit, onCancel, selectedDay, places, selectedPlace }) => {
  const [formData, setFormData] = useState({
    dayNumber: selectedDay,
    time: '09:00',
    placeId: selectedPlace?.id || '',
    placeName: selectedPlace?.name || '',
    description: '',
    cost: selectedPlace?.cost || 0,
    duration: selectedPlace?.duration || 2,
    type: 'sightseeing' as Activity['type']
  });

  const handlePlaceChange = (placeId: string) => {
    const place = places.find(p => p.id === placeId);
    if (place) {
      setFormData({
        ...formData,
        placeId: place.id,
        placeName: place.name,
        cost: place.cost,
        duration: place.duration
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
        <select
          value={formData.dayNumber}
          onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
            <option key={day} value={day}>Day {day}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <input
          type="time"
          required
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Place</label>
        <select
          value={formData.placeId}
          onChange={(e) => handlePlaceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a place</option>
          {places.map(place => (
            <option key={place.id} value={place.id}>{place.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Activity['type'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="sightseeing">Sightseeing</option>
          <option value="dining">Dining</option>
          <option value="transport">Transport</option>
          <option value="accommodation">Accommodation</option>
          <option value="shopping">Shopping</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
          <input
            type="number"
            min="0"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the activity..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Activity
        </button>
      </div>
    </form>
  );
};

const AddExpenseForm: React.FC<{
  onSubmit: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onCancel: () => void;
  tripDays: Array<{ date: Date; dayNumber: number }>;
}> = ({ onSubmit, onCancel, tripDays }) => {
  const [formData, setFormData] = useState({
    dayNumber: 1,
    category: 'other' as Expense['category'],
    description: '',
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
        <select
          value={formData.dayNumber}
          onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {tripDays.map(({ dayNumber, date }) => (
            <option key={dayNumber} value={dayNumber}>
              Day {dayNumber}: {date.toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="accommodation">Accommodation</option>
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="activities">Activities</option>
          <option value="shopping">Shopping</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Hotel booking, Lunch, Taxi fare"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Expense
        </button>
      </div>
    </form>
  );
};

export default NewTrip;