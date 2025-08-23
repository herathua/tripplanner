import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from './store';
import MainLayout from './components/layout/MainLayout';
import { Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const PlanningPage = React.lazy(() => import('./pages/PlanningPage'));
const TravelGuidePage = React.lazy(() => import('./pages/TravelGuidePage'));
const LocationSearchPage = React.lazy(() => import('./pages/LocationSearchPage'));
const DealsPage = React.lazy(() => import('./pages/DealsPage'));
const NewTripPage = React.lazy(() => import('./pages/Newtrip'));
const ChatBotPage = React.lazy(() => import('./pages/ChatBotPage'));

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { tripDetails } = useAppSelector((state) => state.trips);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if trying to access trip planning page without trip details
  if (location.pathname === '/new-trip' && (!tripDetails || !tripDetails.isConfigured)) {
    return <Navigate to="/" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Public Route component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Loading component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/travel-guide"
          element={
            <MainLayout>
              <TravelGuidePage />
            </MainLayout>
          }
        />
        <Route
          path="/location-search"
          element={
            <MainLayout>
              <LocationSearchPage />
            </MainLayout>
          }
        />
        <Route
          path="/deals"
          element={
            <MainLayout>
              <DealsPage />
            </MainLayout>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planning"
          element={
            <ProtectedRoute>
              <PlanningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-trip"
          element={
            <ProtectedRoute>
              <NewTripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat-bot"
          element={
            <ProtectedRoute>
              <ChatBotPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes; 