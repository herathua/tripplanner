import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearTripDetails } from '../../store/slices/tripSlice';
import { addNotification } from '../../store/slices/uiSlice';
import FloatingAIAssistant from '../chatbot/FloatingAIAssistant';
import { useUserProfile } from '../../hooks/useUserProfile';
import logo from '../../assets/logo.png';

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

  // Add admin link if user is admin
  if (profile?.role === 'ADMIN' || user?.email?.includes('admin')) {
    navigation.push({ name: 'Admin Console', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 font-body">
      {/* Header */}
      <header className="glass-nav fixed top-0 left-0 right-0 z-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <img
                    src={logo}
                    alt="TripPlanner Logo"
                    title="TripPlanner"
                    className="object-contain h-10 w-auto transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold text-primary leading-none font-heading">TripPlanner</span>
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
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary transition-all duration-300 hover:scale-105 font-body"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 font-body ${
                        location.pathname === item.path
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-neutral-600 hover:text-primary'
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
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
                    title="User Management"
                  >
                    {profile?.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-primary/50 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-white/20 group-hover:ring-primary/50 transition-all duration-300">
                        <span className="text-sm font-medium text-white">
                          {profile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-neutral-700 group-hover:text-primary transition-colors duration-300 font-body">
                      {profile?.displayName || user?.displayName || user?.email || 'User'}
                    </span>
                  </button>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary transition-all duration-300 hover:scale-105 font-body"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 ml-4 text-sm font-medium text-neutral-600 hover:text-primary transition-all duration-300 hover:scale-105 font-body"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="glass-subtle rounded-2xl p-6">
          {children}
        </div>
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