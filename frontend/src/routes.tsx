import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from './store';
import MainLayout from './components/layout/MainLayout';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const PlanningPage = React.lazy(() => import('./pages/PlanningPage'));
const TravelGuidePage = React.lazy(() => import('./pages/TravelGuidePage'));

const NewTripPage = React.lazy(() => import('./pages/Newtrip'));
const ChatBotPage = React.lazy(() => import('./pages/ChatBotPage'));
const GuidPage = React.lazy(() => import('./pages/GuidPage'));
const CorsTestPage = React.lazy(() => import('./pages/CorsTestPage'));
const ApiTestPage = React.lazy(() => import('./pages/ApiTestPage'));
const ImageTestPage = React.lazy(() => import('./pages/ImageTestPage'));
const BlogBlockEditor = React.lazy(() => import('./pages/BlogBlockEditor'));
const BlogPostViewer = React.lazy(() => import('./pages/BlogPostViewer'));
const SimpleBlogList = React.lazy(() => import('./pages/SimpleBlogList'));
const EnhancedBlogEditor = React.lazy(() => import('./pages/EnhancedBlogEditor'));
const EnhancedBlogViewer = React.lazy(() => import('./pages/EnhancedBlogViewer'));
const BlogManagementDashboard = React.lazy(() => import('./pages/BlogManagementDashboard'));
const SupabaseDebugger = React.lazy(() => import('./components/SupabaseDebugger'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));


// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { tripDetails } = useAppSelector((state) => state.trips);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access to new-trip page even without trip details
  // Trip details will be set during the navigation process
  if (location.pathname === '/new-trip') {
    return <MainLayout>{children}</MainLayout>;
  }

  // Check if trying to access trip planning page without trip details
  if (location.pathname === '/planning' && (!tripDetails || !tripDetails.isConfigured)) {
    return <Navigate to="/home" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Public Route component (only for unauthenticated users)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
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
        {/* Public Routes - Accessible to everyone */}
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/landing"
          element={<LandingPage />}
        />
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
              <ChatBotPage />
            </MainLayout>
          }
        />


        <Route
          path="/guide/new"
          element={
            <MainLayout>
              <GuidPage />
            </MainLayout>
          }
        />
        <Route
          path="/guide/:id"
          element={
            <MainLayout>
              <GuidPage />
            </MainLayout>
          }
        />
        <Route
          path="/cors-test"
          element={
            <MainLayout>
              <CorsTestPage />
            </MainLayout>
          }
        />
        <Route
          path="/api-test"
          element={
            <MainLayout>
              <ApiTestPage />
            </MainLayout>
          }
        />
        <Route
          path="/image-test"
          element={
            <MainLayout>
              <ImageTestPage />
            </MainLayout>
          }
        />
        <Route
          path="/blog"
          element={
            <MainLayout>
              <SimpleBlogList />
            </MainLayout>
          }
        />
        <Route
          path="/blog/new"
          element={
            <MainLayout>
              <EnhancedBlogEditor />
            </MainLayout>
          }
        />
        <Route
          path="/blog/:id/edit"
          element={
            <MainLayout>
              <EnhancedBlogEditor />
            </MainLayout>
          }
        />
        <Route
          path="/blog/manage"
          element={
            <MainLayout>
              <BlogManagementDashboard />
            </MainLayout>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <MainLayout>
              <EnhancedBlogViewer />
            </MainLayout>
          }
        />
        <Route
          path="/supabase-debug"
          element={
            <MainLayout>
              <SupabaseDebugger />
            </MainLayout>
          }
        />
        <Route
          path="/blog-old/new"
          element={
            <MainLayout>
              <BlogBlockEditor />
            </MainLayout>
          }
        />
        <Route
          path="/blog-old/:slug"
          element={
            <MainLayout>
              <BlogPostViewer />
            </MainLayout>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/home"
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
        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <UserManagement />
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