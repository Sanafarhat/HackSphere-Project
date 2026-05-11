import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import DashboardPage from './pages/DashboardPage';
import FindTeamPage from './pages/FindTeamPage';
import FindMembersPage from './pages/FindMembersPage';
import RecommendedTeamsPage from './pages/RecommendedTeamsPage';
import RecommendedMembersPage from './pages/RecommendedMembersPage';
import IdeaValidatorPage from './pages/IdeaValidatorPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import JoinPage from './pages/JoinPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SubmissionPage from './pages/SubmissionPage';
import ProjectGallery from './pages/ProjectGallery';
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
          <Route path="/payment" element={<PaymentPage />} />
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
            path="/recommended-teams"
            element={
              <ProtectedRoute>
                <RecommendedTeamsPage />
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
            path="/recommended-members"
            element={
              <ProtectedRoute>
                <RecommendedMembersPage />
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

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="/admin-login" element={<AdminLogin />} />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submission"
            element={
              <ProtectedRoute>
                <SubmissionPage />
              </ProtectedRoute>
            }
          />
          <Route path="/gallery" element={<ProjectGallery />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
