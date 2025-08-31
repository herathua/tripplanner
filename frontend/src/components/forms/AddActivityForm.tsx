import React, { useState } from 'react';
import { Place } from '../../contexts/TripContext';
import { Activity, ActivityType, ActivityStatus } from '../../services/itineraryService';

interface AddActivityFormProps {
  onSubmit: (activity: Omit<Activity, 'id'>) => void;
  onCancel: () => void;
  selectedDay: number;
  places: Place[];
  selectedPlace?: Place | null;
  editingActivity?: Activity | null;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ 
  onSubmit, 
  onCancel, 
  selectedDay, 
  places, 
  selectedPlace,
  editingActivity
}) => {
  const [formData, setFormData] = useState({
    name: editingActivity?.name || selectedPlace?.name || '',
    description: editingActivity?.description || '',
    startTime: editingActivity?.startTime || '09:00',
    endTime: editingActivity?.endTime || '11:00',
    cost: editingActivity?.cost || selectedPlace?.cost || 0,
    durationHours: editingActivity?.durationHours || selectedPlace?.duration || 2,
    type: editingActivity?.type || ActivityType.SIGHTSEEING,
    status: editingActivity?.status || ActivityStatus.PLANNED,
    placeId: editingActivity?.placeId || selectedPlace?.id || undefined
  });

  const handlePlaceChange = (placeId: string) => {
    const place = places.find(p => p.id === placeId);
    if (place) {
      setFormData({
        ...formData,
        name: place.name,
        cost: place.cost,
        durationHours: place.duration,
        placeId: place.id
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the activity object matching the backend structure
    const activity: Omit<Activity, 'id'> = {
      name: formData.name,
      description: formData.description,
      startTime: formData.startTime,
      endTime: formData.endTime,
      cost: formData.cost,
      durationHours: formData.durationHours,
      type: formData.type,
      status: formData.status,
      placeId: formData.placeId
    };
    
    onSubmit(activity);
  };

  const activityTypeOptions = Object.values(ActivityType).map(type => ({
    value: type,
    label: type.charAt(0) + type.slice(1).toLowerCase()
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
        <select
          value={selectedDay}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
        >
          <option value={selectedDay}>Day {selectedDay}</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Day selection is handled automatically</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter activity name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Place (Optional)</label>
        <select
          value={formData.placeId || ''}
          onChange={(e) => handlePlaceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a place (optional)</option>
          {places.map(place => (
            <option key={place.id} value={place.id}>{place.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {activityTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={formData.durationHours}
            onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })}
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
          {editingActivity ? 'Update Activity' : 'Add Activity'}
        </button>
      </div>
    </form>
  );
};

export default AddActivityForm;
