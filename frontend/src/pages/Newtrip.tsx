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
  Trash2
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const NewTrip = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tripDays, setTripDays] = useState<Array<{ date: Date; dayNumber: number }>>([]);
  const [tripName, setTripName] = useState("Trip to Sri Lanka");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tripBudget, setTripBudget] = useState(0);

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
  }, [searchParams, navigate]);

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

  const handleSaveTrip = () => {
    // TODO: Implement save functionality
    console.log('Saving trip...');
  };

  const handleAddActivity = (dayNumber: number) => {
    // TODO: Implement add activity functionality
    console.log(`Adding activity for day ${dayNumber}`);
  };

  const handleDeleteDay = (dayNumber: number) => {
    // TODO: Implement delete day functionality
    console.log(`Deleting day ${dayNumber}`);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-md z-50 transform transition-transform duration-300 w-80 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:fixed md:translate-x-0 flex flex-col`}
      >
        {/* Trip Header - Fixed at top */}
        <div className="sticky top-0 bg-white p-6 border-b z-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">TripTail</h2>
          </div>
          <div className="space-y-2">
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
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Trip Details
            </h4>
            <a href="#overview" className="flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
              <Map className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
              <span>Overview</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a href="#places" className="flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
              <MapPin className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
              <span>Places to Visit</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a href="#itinerary" className="flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
              <Calendar className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
              <span>Itinerary</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a href="#budgeting" className="flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
              <DollarSign className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
              <span>Budget</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
          </div>

          <div className="mt-8 space-y-1">
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Trip Tools
            </h4>
            <button className="w-full flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
              <Users className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
              <span>Share with Friends</span>
              <Share2 className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </button>
            <button className="w-full flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
              <FileText className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
              <span>Export Itinerary</span>
              <Download className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
            </button>
            <button className="w-full flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
              <Heart className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
              <span>Save to Favorites</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white p-4 border-t">
          <button className="w-full flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group">
            <Settings className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
            <span>Trip Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Scrollable with proper margin */}
      <div className="flex-1 md:ml-80 min-h-screen">
        {/* Header Section - Only visible on mobile */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40 md:hidden">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">{tripName}</h1>
            <button 
              onClick={() => setIsEditingName(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <button
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Desktop Header - Without sidebar control button */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40 hidden md:flex">
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
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSaveTrip}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Save Trip</span>
            </button>
          </div>
        </header>

        {/* Main Content Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Overview Section */}
          <section id="overview" className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <h3 className="text-lg font-semibold mb-4">Trip Duration</h3>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{tripDays.length} days</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <h3 className="text-lg font-semibold mb-4">Total Budget</h3>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>${tripBudget.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <h3 className="text-lg font-semibold mb-4">Places to Visit</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>0 places added</span>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Trip Map</h3>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126742.302!2d80.7718!3d7.8731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3f9f9!2sSri%20Lanka!5e0!3m2!1sen!2sus!4v1681234567890"
                  className="rounded-lg w-full h-[400px]"
                  allowFullScreen
                  title="Map of Sri Lanka"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </section>

          {/* Places to Visit Section */}
          <section id="places" className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Places to Visit</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Place</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white shadow-lg rounded-lg p-6 text-center text-gray-500 h-full flex items-center justify-center">
                No places added yet. Click "Add Place" to start planning your visits.
              </div>
            </div>
          </section>

          {/* Itinerary Section */}
          <section id="itinerary" className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Itinerary</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Day</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {tripDays.map(({ date, dayNumber }) => (
                <div key={dayNumber} className="bg-white shadow-lg rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-lg">Day {dayNumber}: {formatDate(date)}</h3>
                    <button 
                      onClick={() => handleDeleteDay(dayNumber)}
                      className="p-1 hover:bg-red-50 rounded text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>No activities planned yet</span>
                    </div>
                    <button 
                      onClick={() => handleAddActivity(dayNumber)}
                      className="text-blue-600 text-sm hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Activity</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Budgeting Section */}
          <section id="budgeting" className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Budget</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 bg-blue-50 rounded-lg h-full">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Budget</h3>
                  <p className="text-2xl font-semibold text-blue-600">${tripBudget.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-green-50 rounded-lg h-full">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Spent</h3>
                  <p className="text-2xl font-semibold text-green-600">$0</p>
                </div>
                <div className="p-6 bg-yellow-50 rounded-lg h-full">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Remaining</h3>
                  <p className="text-2xl font-semibold text-yellow-600">${tripBudget.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-center text-gray-500 p-6">
                No expenses added yet. Click "Add Expense" to start tracking your budget.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NewTrip;