import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes';
import { TripProvider } from './contexts/TripContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { useAppDispatch } from './store';
import { setUser, setLoading } from './store/slices/authSlice';
import { onAuthStateChange } from './config/firebase';
import './index.css';

// Component to initialize authentication state
const AuthInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    dispatch(setLoading(true));
    
    const unsubscribe = onAuthStateChange((user) => {
      dispatch(setUser(user));
      dispatch(setLoading(false));
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Show loading while auth state is being determined
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return null;
};

function App() {
  return (
    <Provider store={store}>
      <CurrencyProvider>
        <TripProvider>
          <Router>
            <AuthInitializer />
            <AppRoutes />
          </Router>
        </TripProvider>
      </CurrencyProvider>
    </Provider>
  );
}

export default App;
