import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes';
import { TripProvider } from './contexts/TripContext';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <TripProvider>
        <Router>
          <AppRoutes />
        </Router>
      </TripProvider>
    </Provider>
  );
}

export default App;
