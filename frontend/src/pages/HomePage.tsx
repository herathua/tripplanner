import React, { useState } from 'react';
import { Heart, X, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch, useAppSelector } from '../store';
import { setTripDetails } from '../store/slices/tripSlice';
import GuideCard from '../components/GuideCard';
import { tripService } from '../services';

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

  React.useEffect(() => {
    if (user && user.uid) {
      tripService.getUpcomingTripsByUser(user.uid, tripPage, tripsPerPage).then((data) => {
        setUpcomingTrips(data.content || []);
        setTripTotalPages(data.totalPages || 1);
      });
    }
  }, [user, tripPage]);

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

      // Send trip details to backend using service
      try {
        const createdTrip = await tripService.createTrip({
          title: tripName.trim(),
          destination: tripDescription.trim(), // Using description as destination for now
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          budget: budgetValue
        });
        
        console.log('Trip created successfully:', createdTrip);
        console.log('Trip ID:', createdTrip.id);
        console.log('Trip object keys:', Object.keys(createdTrip));
        
        dispatch(setTripDetails({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          budget: budgetValue,
          isConfigured: true,
          tripName: tripName.trim(),
          tripDescription: tripDescription.trim()
        }));

        // Navigate to the new trip page with the trip ID
        const navigationUrl = `/new-trip?startDate=${formattedStartDate}&endDate=${formattedEndDate}&budget=${budgetValue}&tripName=${encodeURIComponent(tripName.trim())}&tripDescription=${encodeURIComponent(tripDescription.trim())}&tripId=${createdTrip.id}`;
        console.log('Navigating to:', navigationUrl);
        navigate(navigationUrl);
        setIsModalOpen(false);
      } catch (error: any) {
        console.error('Failed to create trip:', error);
        console.error('Error response:', error.response?.data);
        setError(`Failed to create trip: ${error.response?.data || error.message}`);
      } finally {
        setIsLoading(false);
      }
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      {/* Removed navigation links and bell icon */}

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Recently Viewed Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Upcoming Trips</h2>
            <button
              className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm"
              onClick={handlePlanNewTrip}
            >
              Plan new trip
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips.length === 0 && (
              <div className="col-span-3 text-center text-gray-500">No upcoming trips found.</div>
            )}
            {upcomingTrips.map((trip, idx) => (
              <div key={trip.id || idx} className="overflow-hidden border rounded-lg shadow-sm">
                <div className="relative">
                  <img
                    src={trip.image || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg'}
                    alt={trip.title}
                    className="object-cover w-full h-48"
                  />
                  <Heart className="absolute w-6 h-6 text-white top-3 right-3" />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 font-semibold">{trip.title}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>{trip.startDate} - {trip.endDate}</span>
                    <span className="mx-2">•</span>
                    <span>{trip.destination}</span>
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
                        Creating...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Your Guides Section */}
        <section className="p-6 mb-12 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your guides</h2>
            <button
              className="bg-white text-gray-800 px-4 py-1.5 rounded-full text-sm border"
              onClick={() => navigate('/guide/new')}
            >
              Create new guide
            </button>
          </div>
          {/* You can add a list of user's guides here if needed */}
        </section>

        {/* Saved  Section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Saved </h2>
          <h3 className="mb-6 text-lg font-medium">Popular destinations</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Destination Cards */}
            {['Taiwan', 'Seoul', 'Dubai'].map((city, index) => (
              <div key={index} className="overflow-hidden border rounded-lg shadow-sm">
                <div className="relative">
                  <img 
                    src={`https://images.pexels.com/photos/${2166553 + index}/pexels-photo-${2166553 + index}.jpeg`}
                    alt={city} 
                    className="object-cover w-full h-48"
                  />
                  <Heart className="absolute w-6 h-6 text-white top-3 right-3" />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 font-semibold">{city}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>4.8</span>
                    <span className="mx-2">•</span>
                    <span>256 reviews</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;