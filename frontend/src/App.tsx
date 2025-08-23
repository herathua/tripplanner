import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from './store';
import { useAppDispatch } from './store';
import { setUser } from './store/slices/authSlice';
import { onAuthStateChange } from './config/firebase';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationContainer from './components/common/NotificationContainer';
import AppRoutes from './routes';

// Auth listener component
const AuthListener: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      dispatch(setUser(user));
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return null;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AuthListener />
            <NotificationContainer />
            <AppRoutes />
          </div>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
