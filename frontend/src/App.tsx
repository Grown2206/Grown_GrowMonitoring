import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { CircularProgress, Box } from '@mui/material';

// Eager load critical pages
import { Login } from './pages/Login';
import { DashboardEnhanced } from './pages/DashboardEnhanced';

// Lazy load other pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Plants = lazy(() => import('./pages/Plants').then(m => ({ default: m.Plants })));
const Irrigation = lazy(() => import('./pages/Irrigation').then(m => ({ default: m.Irrigation })));
const Relays = lazy(() => import('./pages/Relays').then(m => ({ default: m.Relays })));
const Sensors = lazy(() => import('./pages/Sensors').then(m => ({ default: m.Sensors })));
const Automation = lazy(() => import('./pages/Automation').then(m => ({ default: m.Automation })));
const Schedules = lazy(() => import('./pages/Schedules').then(m => ({ default: m.Schedules })));
const Harvests = lazy(() => import('./pages/Harvests').then(m => ({ default: m.Harvests })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const AnalyticsAdvanced = lazy(() => import('./pages/AnalyticsAdvanced').then(m => ({ default: m.AnalyticsAdvanced })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Simulation = lazy(() => import('./pages/Simulation').then(m => ({ default: m.Simulation })));
const VPDCalculator = lazy(() => import('./pages/VPDCalculator').then(m => ({ default: m.VPDCalculator })));
const PhotoGallery = lazy(() => import('./pages/PhotoGallery').then(m => ({ default: m.PhotoGallery })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const AlertManagement = lazy(() => import('./pages/AlertManagement').then(m => ({ default: m.AlertManagement })));
const GPIOManager = lazy(() => import('./pages/GPIOManager').then(m => ({ default: m.GPIOManager })));
const DeviceManagement = lazy(() => import('./pages/DeviceManagement').then(m => ({ default: m.DeviceManagement })));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return user ? (
    <Layout>
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        }
      >
        {children}
      </Suspense>
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardEnhanced />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard-classic"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/plants"
        element={
          <PrivateRoute>
            <Plants />
          </PrivateRoute>
        }
      />
      <Route
        path="/irrigation"
        element={
          <PrivateRoute>
            <Irrigation />
          </PrivateRoute>
        }
      />
      <Route
        path="/relays"
        element={
          <PrivateRoute>
            <Relays />
          </PrivateRoute>
        }
      />
      <Route
        path="/sensors"
        element={
          <PrivateRoute>
            <Sensors />
          </PrivateRoute>
        }
      />
      <Route
        path="/automation"
        element={
          <PrivateRoute>
            <Automation />
          </PrivateRoute>
        }
      />
      <Route
        path="/schedules"
        element={
          <PrivateRoute>
            <Schedules />
          </PrivateRoute>
        }
      />
      <Route
        path="/harvests"
        element={
          <PrivateRoute>
            <Harvests />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <Analytics />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics-advanced"
        element={
          <PrivateRoute>
            <AnalyticsAdvanced />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path="/simulation"
        element={
          <PrivateRoute>
            <Simulation />
          </PrivateRoute>
        }
      />
      <Route
        path="/vpd"
        element={
          <PrivateRoute>
            <VPDCalculator />
          </PrivateRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <PrivateRoute>
            <PhotoGallery />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <PrivateRoute>
            <AlertManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/devices"
        element={
          <PrivateRoute>
            <DeviceManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/gpio"
        element={
          <PrivateRoute>
            <GPIOManager />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
