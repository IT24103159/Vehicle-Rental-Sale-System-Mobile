import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AppLayout from './components/AppLayout';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isSignedIn, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard/profile" />;
  }

  return children;
};

const AppRoutes = () => {
  const { isSignedIn, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isSignedIn ? <Navigate to={isAdmin ? '/dashboard/users' : '/dashboard/profile'} /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isSignedIn ? <Navigate to={isAdmin ? '/dashboard/users' : '/dashboard/profile'} /> : <SignupPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={isAdmin ? 'users' : 'profile'} />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />
        <Route path="profile" element={<ProfileSettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to={isSignedIn ? (isAdmin ? '/dashboard/users' : '/dashboard/profile') : '/login'} />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
