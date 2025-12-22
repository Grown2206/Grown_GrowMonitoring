import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Plants } from './pages/Plants';
import { Irrigation } from './pages/Irrigation';
import { Relays } from './pages/Relays';
import { Sensors } from './pages/Sensors';
import { Automation } from './pages/Automation';
import { Schedules } from './pages/Schedules';
import { Harvests } from './pages/Harvests';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Simulation } from './pages/Simulation';
import { VPDCalculator } from './pages/VPDCalculator';
import { PhotoGallery } from './pages/PhotoGallery';
import { Notifications } from './pages/Notifications';
import { GPIOManager } from './pages/GPIOManager';
import { CircularProgress, Box } from '@mui/material';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
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
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
