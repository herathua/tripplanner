import React from 'react';
import LocationSearchDebugger from '../components/debug/LocationSearchDebugger';
import MapPinDebugger from '../components/debug/MapPinDebugger';

const APITestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <LocationSearchDebugger />
        <MapPinDebugger />
      </div>
    </div>
  );
};

export default APITestPage;