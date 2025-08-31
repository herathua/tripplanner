import React, { useState } from 'react';
import { Expense } from '../../contexts/TripContext';

interface TripDay {
  date: Date;
  dayNumber: number;
}

interface AddExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onCancel: () => void;
  tripDays: TripDay[];
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onSubmit, onCancel, tripDays }) => {
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

export default AddExpenseForm;
