import React, { useState, useEffect } from 'react';
import { Heart, X, DollarSign, Plus, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch, useAppSelector } from '../store';
import { setTripDetails } from '../store/slices/tripSlice';
import GuideCard from '../components/GuideCard';
import { tripService, TripStatus, TripVisibility } from '../services/tripService';
import { blogService, BlogPost } from '../services/blogService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAppSelector((state) => state.auth.user);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [tripPage, setTripPage] = useState(0);
  const [tripTotalPages, setTripTotalPages] = useState(1);
  const tripsPerPage = 3;
  
  // User guides state
  const [userGuides, setUserGuides] = useState<BlogPost[]>([]);
  const [publishedGuides, setPublishedGuides] = useState<BlogPost[]>([]);
  const [guidePage, setGuidePage] = useState(0);
  const [guideTotalPages, setGuideTotalPages] = useState(1);
  const guidesPerPage = 3;

  // Load user trips
  useEffect(() => {
    if (user && user.uid) {
      console.log('Loading trips for user:', user.uid);
      tripService.getUpcomingTripsByUser(user.uid, tripPage, tripsPerPage).then((data) => {
        console.log('Trips data received:', data);
        setUpcomingTrips(data.content || []);
        setTripTotalPages(data.totalPages || 1);
      }).catch(error => {
        console.error('Error loading trips:', error);
        console.error('Error details:', error.response?.data);
      });
    }
  }, [user, tripPage]);

  // Load user guides
  useEffect(() => {
    if (user && user.uid) {
      // Load user's own guides
      blogService.getUserBlogPosts(user.uid, guidePage, guidesPerPage).then((data) => {
        setUserGuides(data.content || []);
        setGuideTotalPages(data.totalPages || 1);
      }).catch(error => {
        console.error('Error loading user guides:', error);
      });

             // Load published guides from all users
       blogService.getPublishedBlogPosts(0, 3).then((data) => {
         setPublishedGuides(data.content || []);
       }).catch(error => {
         console.error('Error loading published guides:', error);
       });
    }
  }, [user, guidePage]);

  const handlePlanNewTrip = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDates = async () => {
    if (startDate && endDate && tripName.trim()) {
      setIsLoading(true);
      setError(null);
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      const budgetValue = parseFloat(budget.replace(/[^0-9.-]+/g, ''));

      console.log('Trip data being prepared:', {
        title: tripName.trim(),
        destination: tripDescription.trim(),
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        budget: budgetValue,
        budgetOriginal: budget
      });

      // Validate budget
      if (isNaN(budgetValue) || budgetValue <= 0) {
        setError('Please enter a valid budget amount');
        return;
      }

      // Set trip details in Redux store for the trip planning page
      dispatch(setTripDetails({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        budget: budgetValue,
        isConfigured: true,
        tripName: tripName.trim(),
        tripDescription: tripDescription.trim()
      }));

      // Navigate to the new trip page without creating the trip yet
      const navigationUrl = `/new-trip?startDate=${formattedStartDate}&endDate=${formattedEndDate}&budget=${budgetValue}&tripName=${encodeURIComponent(tripName.trim())}&tripDescription=${encodeURIComponent(tripDescription.trim())}`;
      console.log('Navigating to:', navigationUrl);
      navigate(navigationUrl);
      setIsModalOpen(false);
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove any non-digit characters
    const number = value.replace(/\D/g, '');
    // Format with commas and add dollar sign
    return number ? `$${parseInt(number).toLocaleString()}` : '';
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setBudget(value);
  };

  // Guide management functions
  const handleEditGuide = (guide: BlogPost) => {
    navigate(`/blog/${guide.id}/edit`);
  };

  const handleDeleteGuide = async (guideId: number) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      try {
        await blogService.deleteBlogPost(guideId, user?.uid || '');
        // Refresh guides
        if (user && user.uid) {
          const data = await blogService.getUserBlogPosts(user.uid, guidePage, guidesPerPage);
          setUserGuides(data.content || []);
        }
      } catch (error) {
        console.error('Error deleting guide:', error);
        alert('Failed to delete guide');
      }
    }
  };

  // Trip management functions
  const handleEditTrip = (trip: any) => {
    navigate(`/new-trip?tripId=${trip.id}`);
  };

  const handleViewTrip = (trip: any) => {
    navigate(`/new-trip?tripId=${trip.id}`);
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripService.deleteTrip(tripId);
        // Refresh trips
        if (user && user.uid) {
          const data = await tripService.getUpcomingTripsByUser(user.uid, tripPage, tripsPerPage);
          setUpcomingTrips(data.content || []);
        }
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip');
      }
    }
  };

  const handleCreateNewGuide = () => {
    navigate('/blog/new');
  };

  const handleViewAllGuides = () => {
    navigate('/guides');
  };

  const handleViewAllTrips = () => {
    navigate('/trips');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      {/* Removed navigation links and bell icon */}

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Upcoming Trips Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Upcoming Trips</h2>
            <div className="flex space-x-3">
              <button
                className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm hover:bg-gray-200 flex items-center"
                onClick={handleViewAllTrips}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <button
                className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-red-600 flex items-center"
                onClick={handlePlanNewTrip}
              >
                <Plus className="w-4 h-4 mr-1" />
                Plan new trip
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips.length === 0 && (
              <div className="col-span-3 text-center text-gray-500">No upcoming trips found.</div>
            )}
            {upcomingTrips.map((trip, idx) => (
              <div key={trip.id || idx} className="overflow-hidden border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={trip.image || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg'}
                    alt={trip.title}
                    className="object-cover w-full h-48"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trip.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      trip.status === 'PLANNING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trip.status || 'PLANNING'}
                    </span>
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <div 
                    className="cursor-pointer mb-3"
                    onClick={() => handleViewTrip(trip)}
                  >
                    <h3 className="mb-2 font-semibold text-lg hover:text-blue-600 transition-colors">{trip.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="font-medium">{trip.destination}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{trip.startDate} - {trip.endDate}</span>
                      {trip.budget && (
                        <span className="font-medium text-green-600">
                          ${trip.budget.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Trip action buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTrip(trip);
                      }}
                      className="flex-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip.id);
                      }}
                      className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Paging Controls */}
          {tripTotalPages > 1 && (
            <div className="flex justify-center mt-4">
              {tripPage > 0 && (
                <button
                  className="px-4 py-2 mr-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setTripPage(tripPage - 1)}
                >
                  Show less
                </button>
              )}
              {tripPage < tripTotalPages - 1 && (
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setTripPage(tripPage + 1)}
                >
                  Show more
                </button>
              )}
            </div>
          )}
        </section>

        {/* Date Selection Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Select Trip Details</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Trip Name
                  </label>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="Enter trip name (e.g., Summer Vacation 2024)"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Give your trip a memorable name
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={tripDescription}
                    onChange={(e) => setTripDescription(e.target.value)}
                    placeholder="Describe your trip (optional)"
                    rows={3}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Add a brief description of your trip
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    className="w-full p-2 border rounded-md"
                    placeholderText="Select start date"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || undefined}
                    className="w-full p-2 border rounded-md"
                    placeholderText="Select end date"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Expected Budget
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={budget ? formatCurrency(budget) : ''}
                      onChange={handleBudgetChange}
                      placeholder="Enter your budget"
                      className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your total budget for the trip
                  </p>
                </div>

                {error && (
                  <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDates}
                    disabled={!startDate || !endDate || !budget || !tripName.trim() || isLoading}
                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                                         {isLoading ? (
                       <>
                         <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         Planning...
                       </>
                     ) : (
                       'Start Planning'
                     )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Your Guides Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Guides</h2>
            <div className="flex space-x-3">
              <button
                className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm hover:bg-gray-200 flex items-center"
                onClick={handleViewAllGuides}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-600 flex items-center"
                onClick={handleCreateNewGuide}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create new guide
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userGuides.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <div className="text-gray-500 mb-4">No guides created yet.</div>
                <button
                  onClick={handleCreateNewGuide}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Create Your First Guide
                </button>
              </div>
            ) : (
              userGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  isOwnGuide={true}
                  onEdit={handleEditGuide}
                  onDelete={handleDeleteGuide}
                />
              ))
            )}
          </div>

          {/* Paging Controls for Guides */}
          {guideTotalPages > 1 && (
            <div className="flex justify-center mt-4">
              {guidePage > 0 && (
                <button
                  className="px-4 py-2 mr-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setGuidePage(guidePage - 1)}
                >
                  Show less
                </button>
              )}
              {guidePage < guideTotalPages - 1 && (
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setGuidePage(guidePage + 1)}
                >
                  Show more
                </button>
              )}
            </div>
          )}
        </section>

        {/* Published Guides Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Popular Guides</h2>
            <button
              className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm hover:bg-gray-200 flex items-center"
              onClick={handleViewAllGuides}
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedGuides.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No published guides available.
              </div>
            ) : (
              publishedGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  isOwnGuide={false}
                />
              ))
            )}
          </div>
        </section>

        
      </main>
    </div>
  );
};

export default HomePage;