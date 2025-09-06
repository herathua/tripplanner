import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import UserProfileDropdown from '../UserProfileDropdown';
import FloatingAIAssistant from '../chatbot/FloatingAIAssistant';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const toggleAIAssistant = () => {
    setIsAIAssistantOpen(!isAIAssistantOpen);
  };


  const navigation = [
    { name: 'Home', path: '/home' },
    { name: 'Travel Guide', path: '/travel-guide' },
    { name: 'AI Travel Assistant', path: '/location-search', action: toggleAIAssistant },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/src/assets/logo.png"
                  alt="TripPlanner Logo"
                  title="TripPlanner"
                  className="object-contain w-8 h-8"
                />
                <span className="text-2xl font-bold text-black-500">TripPlanner</span>
              </Link>
            </div>

            {/* Centered Navigation */}
            <nav className="justify-center flex-1 hidden md:flex">
              <div className="flex space-x-8">
                {navigation.map((item) => (
                  item.action ? (
                    <button
                      key={item.path}
                      onClick={item.action}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        location.pathname === item.path
                          ? 'text-red-500 border-b-2 border-red-500'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            </nav>

            {/* User Menu */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <UserProfileDropdown />
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 ml-4 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant 
        isOpen={isAIAssistantOpen} 
        onToggle={toggleAIAssistant} 
      />
    </div>
  );
};

export default MainLayout; 