import React, { useState } from 'react';
import { Activity, Place } from '../../contexts/TripContext';

interface AddActivityFormProps {
  onSubmit: (activity: Omit<Activity, 'id'>) => void;
  onCancel: () => void;
  selectedDay: number;
  places: Place[];
  selectedPlace?: Place | null;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ 
  onSubmit, 
  onCancel, 
  selectedDay, 
  places, 
  selectedPlace 
}) => {
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
        <input
          type="text"
          placeholder="Enter activity type (e.g. Sightseeing, Dining, etc.)"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
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

export default AddActivityForm;
