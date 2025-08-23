import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearTripDetails } from '../../store/slices/tripSlice';
import { addNotification } from '../../store/slices/uiSlice';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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
    { name: 'Home', path: '/' },
    { name: 'Travel Guide', path: '/travel-guide' },
    { name: 'Location Search', path: '/location-search' },
    { name: 'Deals', path: '/deals' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-red-500">
                TripPlanner
              </Link>
            </div>

            {/* Centered Navigation */}
            <nav className="hidden md:flex justify-center flex-1">
              <div className="flex space-x-8">
                {navigation.map((item) => (
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
                ))}
              </div>
            </nav>

            {/* User Menu */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 