import React from 'react';
import { Calendar, Clock, Map, MapPin, DollarSign, ChevronRight, Users, Share2, Hotel } from 'lucide-react';

interface TripSidebarProps {
  isSidebarOpen: boolean;
  isMinimized: boolean;
  tripName: string;
  tripDays: Array<{ date: Date; dayNumber: number }>;
  formatTripDuration: () => string;
  setShowHotelSearchModal: (show: boolean) => void;
  toggleSidebar: () => void;
  setIsMinimized: (min: boolean) => void;
}

const TripSidebar: React.FC<TripSidebarProps> = ({
  isSidebarOpen,
  isMinimized,
  tripName,
  tripDays,
  formatTripDuration,
  setShowHotelSearchModal,
  toggleSidebar,
  setIsMinimized
}) => (
  <aside
    className={`fixed top-0 left-0 h-screen bg-white shadow-md z-50 transform transition-all duration-300 
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isMinimized ? 'w-16' : 'w-80'}
      md:fixed md:translate-x-0 flex flex-col`}
  >
    {/* Navigation - Scrollable */}
    <nav className={`flex-1 ${isMinimized ? 'p-2' : 'p-4'} overflow-y-auto`}>
      <div className="space-y-1">
        <h4 className={`px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${isMinimized ? 'hidden' : 'block'}`}>Trip Details</h4>
        <a href="#overview" className={`flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Overview">
          <Map className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
          <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Overview</span>
          <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
        </a>
        <a href="#places" className={`flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Places to Visit">
          <MapPin className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
          <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Places to Visit</span>
          <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
        </a>
        <button 
          onClick={() => setShowHotelSearchModal(true)}
          className={`flex items-center w-full px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} 
          title="Search Hotels"
        >
          <Hotel className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
          <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Search Hotels</span>
          <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
        </button>
        <a href="#itinerary" className={`flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Itinerary">
          <Calendar className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
          <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Itinerary</span>
          <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
        </a>
        <a href="#budgeting" className={`flex items-center px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Budget">
          <DollarSign className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
          <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Budget</span>
          <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
        </a>
      </div>
      <div className="mt-8 space-y-1">
        <h4 className={`px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${isMinimized ? 'hidden' : 'block'}`}>Trip Tools</h4>
        <button className={`flex items-center w-full px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group ${isMinimized ? 'justify-center' : ''}`} title="Share with Friends">
          <Users className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
          <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>Share with Friends</span>
          <Share2 className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 ${isMinimized ? 'hidden' : 'block'}`} />
        </button>
      </div>
    </nav>
  </aside>
);

export default TripSidebar;
