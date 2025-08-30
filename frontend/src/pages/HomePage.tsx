import React, { useState } from 'react';
import { Heart, X, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch } from '../store';
import { setTripDetails } from '../store/slices/tripSlice';
import GuideCard from '../components/GuideCard';
import tripService from '../services/tripService';
import { CreateTripRequest } from '../types/tripTypes';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState<string>('');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Mock guides data
  const [guides] = useState([
    {
      name: 'Sri Lanka Adventure',
      destination: 'Sri Lanka',
      image: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
      description: 'A comprehensive guide to exploring the best of Sri Lanka, including beaches, temples, and wildlife.'
    },
    {
      name: 'Paris in Spring',
      destination: 'Paris, France',
      image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg',
      description: 'Discover the romance of Paris in springtime with this curated guide to must-see sights and hidden gems.'
    },
    {
      name: 'Tokyo Food Tour',
      destination: 'Tokyo, Japan',
      image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
      description: 'Experience the culinary delights of Tokyo with this food-focused travel guide.'
    }
  ]);

  // Sample guides for modal (mocked for now)
  const sampleGuides = [
    {
      id: '1',
      name: 'Sri Lanka Adventure',
      destination: 'Sri Lanka',
      image: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
      description: 'A comprehensive guide to exploring the best of Sri Lanka, including beaches, temples, and wildlife.'
    },
    {
      id: '2',
      name: 'Paris in Spring',
      destination: 'Paris, France',
      image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg',
      description: 'Discover the romance of Paris in springtime with this curated guide to must-see sights and hidden gems.'
    }
  ];

  const handlePlanNewTrip = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDates = async () => {
    if (startDate && endDate && tripName.trim()) {
      setIsCreatingTrip(true);
      setCreateError(null);
      
      try {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        const budgetValue = parseFloat(budget.replace(/[^0-9.-]+/g, ''));
        
        // Create trip request object
        const tripRequest: CreateTripRequest = {
          title: tripName.trim(),
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          budget: budgetValue || 0
        };

        // Call backend API to create trip
        const createdTripId = await tripService.createTrip(tripRequest);
        
        // Update Redux store
        dispatch(setTripDetails({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          budget: budgetValue,
          isConfigured: true,
          tripName: tripName.trim()
        }));

        // Navigate to trip planning page with the created trip ID
        navigate(`/new-trip?startDate=${formattedStartDate}&endDate=${formattedEndDate}&budget=${budgetValue}&tripName=${encodeURIComponent(tripName.trim())}&tripId=${createdTripId}`);
        setIsModalOpen(false);
        
        // Reset form
        setTripName('');
        setStartDate(null);
        setEndDate(null);
        setBudget('');
        
      } catch (error) {
        console.error('Failed to create trip:', error);
        setCreateError('Failed to create trip. Please try again.');
      } finally {
        setIsCreatingTrip(false);
      }
    }
  };

  const handleCreateGuideClick = () => setIsGuideModalOpen(true);
  const handleCloseGuideModal = () => setIsGuideModalOpen(false);

  const handleSampleGuideClick = (id: string) => {
    setIsGuideModalOpen(false);
    navigate(`/guide/${id}?edit=1`);
  };

  const handleNewGuideClick = () => {
    setIsGuideModalOpen(false);
    navigate('/guide/new?edit=1');
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
            <h2 className="text-xl font-semibold">Recently viewed and upcoming</h2>
            <button
              className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm"
              onClick={handlePlanNewTrip}
            >
              Plan new trip
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Trip Card */}
            <div className="overflow-hidden border rounded-lg shadow-sm">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg" 
                  alt="Sri Lanka Waterfall" 
                  className="object-cover w-full h-48"
                />
                <Heart className="absolute w-6 h-6 text-white top-3 right-3" />
              </div>
              <div className="p-4">
                <h3 className="mb-2 font-semibold">Trip to Sri Lanka</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Sep 28 - Oct 13, 2024</span>
                  <span className="mx-2">•</span>
                  <span>4 places</span>
                </div>
              </div>
            </div>
          </div>
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

                {/* Error Message */}
                {createError && (
                  <div className="p-3 mt-4 text-red-700 bg-red-100 border border-red-400 rounded">
                    {createError}
                  </div>
                )}

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setCreateError(null);
                    }}
                    disabled={isCreatingTrip}
                    className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDates}
                    disabled={!startDate || !endDate || !budget || !tripName.trim() || isCreatingTrip}
                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreatingTrip ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
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
              onClick={handleCreateGuideClick}
            >
              Create new guide
            </button>
          </div>
          {/* Guide Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {guides.map((guide, idx) => (
              <GuideCard
                key={idx}
                name={guide.name}
                destination={guide.destination}
                image={guide.image}
                description={guide.description}
                onView={() => alert(`Viewing guide: ${guide.name}`)}
              />
            ))}
          </div>
        </section>

        {/* Create Guide Modal */}
        {isGuideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={handleCloseGuideModal}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Create New Guide</h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Use a Sample Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sampleGuides.map((guide) => (
                    <div
                      key={guide.id}
                      className="cursor-pointer border rounded-lg p-3 flex flex-col hover:shadow-lg transition"
                      onClick={() => handleSampleGuideClick(guide.id)}
                    >
                      <img src={guide.image} alt={guide.name} className="h-24 w-full object-cover rounded mb-2" />
                      <h4 className="font-semibold text-gray-900">{guide.name}</h4>
                      <p className="text-sm text-gray-500 mb-1">{guide.destination}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{guide.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <button
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleNewGuideClick}
                >
                  + Create New Guide
                </button>
              </div>
            </div>
          </div>
        )}

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