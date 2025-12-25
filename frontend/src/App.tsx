import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CircularProgress, Box } from '@mui/material';

// Eager load critical pages
import { Login } from './pages/Login';
import { DashboardEnhanced } from './pages/DashboardEnhanced';

// Lazy load Hub pages (consolidated)
const PlantsHub = lazy(() => import('./pages/PlantsHub').then(m => ({ default: m.PlantsHub })));
const SensorsHub = lazy(() => import('./pages/SensorsHub').then(m => ({ default: m.SensorsHub })));
const ControlHub = lazy(() => import('./pages/ControlHub').then(m => ({ default: m.ControlHub })));
const AutomationHub = lazy(() => import('./pages/AutomationHub').then(m => ({ default: m.AutomationHub })));
const AnalyticsHub = lazy(() => import('./pages/AnalyticsHub').then(m => ({ default: m.AnalyticsHub })));
const NotificationsHub = lazy(() => import('./pages/NotificationsHub').then(m => ({ default: m.NotificationsHub })));
const ToolsHub = lazy(() => import('./pages/ToolsHub').then(m => ({ default: m.ToolsHub })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

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

      {/* Main Dashboard */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardEnhanced />
          </PrivateRoute>
        }
      />

      {/* Consolidated Hubs */}
      <Route
        path="/plants"
        element={
          <PrivateRoute>
            <PlantsHub />
          </PrivateRoute>
        }
      />
      <Route
        path="/sensors"
        element={
          <PrivateRoute>
            <SensorsHub />
          </PrivateRoute>
        }
      />
      <Route
        path="/control"
        element={
          <PrivateRoute>
            <ControlHub />
          </PrivateRoute>
        }
      />
      <Route
        path="/automation"
        element={
          <PrivateRoute>
            <AutomationHub />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <AnalyticsHub />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <NotificationsHub />
          </PrivateRoute>
        }
      />
      <Route
        path="/tools"
        element={
          <PrivateRoute>
            <ToolsHub />
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

      {/* Redirect old routes to new hubs */}
      <Route path="/journal" element={<Navigate to="/plants" replace />} />
      <Route path="/gallery" element={<Navigate to="/plants" replace />} />
      <Route path="/harvests" element={<Navigate to="/plants" replace />} />
      <Route path="/relays" element={<Navigate to="/control" replace />} />
      <Route path="/irrigation" element={<Navigate to="/control" replace />} />
      <Route path="/gpio" element={<Navigate to="/control" replace />} />
      <Route path="/devices" element={<Navigate to="/control" replace />} />
      <Route path="/sensor-groups" element={<Navigate to="/sensors" replace />} />
      <Route path="/virtual-sensors" element={<Navigate to="/sensors" replace />} />
      <Route path="/schedules" element={<Navigate to="/automation" replace />} />
      <Route path="/alerts" element={<Navigate to="/notifications" replace />} />
      <Route path="/reports" element={<Navigate to="/notifications" replace />} />
      <Route path="/vpd" element={<Navigate to="/tools" replace />} />
      <Route path="/simulation" element={<Navigate to="/tools" replace />} />
      <Route path="/analytics-advanced" element={<Navigate to="/analytics" replace />} />
      <Route path="/comparison" element={<Navigate to="/analytics" replace />} />
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
                <OfflineIndicator />
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
