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
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/src/assets/logo.png"
                  alt="Itinero Logo"
                  title="Itinero"
                  className="object-contain w-8 h-8"
                />
                <span className="text-2xl font-bold text-black-500">Itinero</span>
              </Link>
            </div>

            {/* Centered Navigation */}
            <nav className="justify-center flex-1 hidden md:flex">
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
                  className="px-4 py-2 ml-4 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign out
                </button>
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
    </div>
  );
};

export default MainLayout; 