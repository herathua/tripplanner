import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearTripDetails } from '../../store/slices/tripSlice';
import { addNotification } from '../../store/slices/uiSlice';
import FloatingAIAssistant from '../chatbot/FloatingAIAssistant';
import { useUserProfile } from '../../hooks/useUserProfile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const { profile } = useUserProfile(user);

  const toggleAIAssistant = () => {
    setIsAIAssistantOpen(!isAIAssistantOpen);
  };

  const handleUserAvatarClick = () => {
    navigate('/user-management');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(clearTripDetails());
      dispatch(addNotification({
        type: 'success',
        message: 'Successfully logged out',
        duration: 3000,
      }));
      navigate('/login');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to logout',
        duration: 3000,
      }));
    }
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

            {/* Centered Navigation - Removed Trip and Login links */}
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
                <div className="flex items-center space-x-4">
                  {/* User Avatar Button */}
                  <button
                    onClick={handleUserAvatarClick}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="User Management"
                  >
                    {profile?.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {profile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {profile?.displayName || user?.displayName || user?.email || 'User'}
                    </span>
                  </button>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </div>
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