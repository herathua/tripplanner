import React, { useState } from 'react';
import { Heart, X, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch } from '../store';
import { setTripDetails } from '../store/slices/tripSlice';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState<string>('');

  const handlePlanNewTrip = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDates = () => {
    if (startDate && endDate && tripName.trim()) {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      const budgetValue = parseFloat(budget.replace(/[^0-9.-]+/g, ''));
      
      dispatch(setTripDetails({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        budget: budgetValue,
        isConfigured: true,
        tripName: tripName.trim()
      }));

      navigate(`/new-trip?startDate=${formattedStartDate}&endDate=${formattedEndDate}&budget=${budgetValue}&tripName=${encodeURIComponent(tripName.trim())}`);
      setIsModalOpen(false);
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

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDates}
                    disabled={!startDate || !endDate || !budget || !tripName.trim()}
                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Confirm
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
            <button className="bg-white text-gray-800 px-4 py-1.5 rounded-full text-sm border">
              Create new guide
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center p-4 space-x-4 bg-white rounded-lg">
              <img 
                src="https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg" 
                alt="Sri Lanka Guide" 
                className="object-cover w-16 h-16 rounded-lg"
              />
              <div>
                <h3 className="font-semibold">Sri Lanka</h3>
                <p className="text-sm text-gray-600">Guide</p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Explore</h2>
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