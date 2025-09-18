import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useTripCreation, TripFormData } from '../../hooks/useTripCreation';

interface TripCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TripCreationModal: React.FC<TripCreationModalProps> = ({ isOpen, onClose }) => {
  const { isLoading, error, createTrip, clearError } = useTripCreation();
  
  const [formData, setFormData] = useState<TripFormData>({
    title: '',
    destination: '',
    startDate: null,
    endDate: null,
    budget: ''
  });

  // Debug form data changes
  React.useEffect(() => {
    console.log('Form data updated:', formData);
    console.log('Button disabled state:', {
      hasTitle: !!formData.title.trim(),
      hasDestination: !!formData.destination.trim(),
      hasStartDate: !!formData.startDate,
      hasEndDate: !!formData.endDate,
      hasBudget: !!formData.budget,
      isLoading: isLoading,
      buttonDisabled: !formData.startDate || !formData.endDate || !formData.budget || !formData.title.trim() || !formData.destination.trim() || isLoading
    });
  }, [formData, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION ===');
    console.log('Form data at submission:', formData);
    console.log('Form validation:', {
      hasTitle: !!formData.title.trim(),
      hasDestination: !!formData.destination.trim(),
      hasStartDate: !!formData.startDate,
      hasEndDate: !!formData.endDate,
      hasBudget: !!formData.budget,
      isLoading: isLoading
    });
    
    clearError();
    await createTrip(formData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      destination: '',
      startDate: null,
      endDate: null,
      budget: ''
    });
    clearError();
    onClose();
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number ? `$${parseInt(number).toLocaleString()}` : '';
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    console.log('Budget changed:', value);
    setFormData(prev => ({ ...prev, budget: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Create New Trip</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Trip Name *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter trip name (e.g., Summer Vacation 2024)"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Give your trip a memorable name
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Destination *
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="Where are you going? (e.g., Paris, France)"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter your destination
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Start Date *
            </label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date: Date | null) => {
                console.log('Start date changed:', date);
                setFormData(prev => ({ ...prev, startDate: date }));
              }}
              selectsStart
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={new Date()}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select start date"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              End Date *
            </label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date: Date | null) => {
                console.log('End date changed:', date);
                setFormData(prev => ({ ...prev, endDate: date }));
              }}
              selectsEnd
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={formData.startDate || undefined}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select end date"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Expected Budget *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.budget ? formatCurrency(formData.budget) : ''}
                onChange={handleBudgetChange}
                placeholder="Enter your budget"
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
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
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#87CEEB', color: '#1f2937', borderColor: '#87CEEB' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.startDate || !formData.endDate || !formData.budget || !formData.title.trim() || !formData.destination.trim() || isLoading}
              className="px-6 py-3 text-white rounded-md hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center transition-colors"
              style={{ backgroundColor: '#4169E1' }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripCreationModal;
