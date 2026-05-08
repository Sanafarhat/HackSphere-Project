import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FindTeamPage from './pages/FindTeamPage';
import FindMembersPage from './pages/FindMembersPage';
import IdeaValidatorPage from './pages/IdeaValidatorPage';
import JoinPage from './pages/JoinPage';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/join" element={<JoinPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-team"
            element={
              <ProtectedRoute>
                <FindTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-members"
            element={
              <ProtectedRoute>
                <FindMembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validate-idea"
            element={
              <ProtectedRoute>
                <IdeaValidatorPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
