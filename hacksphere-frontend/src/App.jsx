import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import PhaseGuard from './components/PhaseGuard';
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
        <EventProvider>
          <Navigation />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/register"
              element={
                <PhaseGuard allowedPhases={['upcoming', 'registration', 'inactive']} fallbackPath="/login">
                  <RegisterPage />
                </PhaseGuard>
              }
            />
            <Route path="/payment" element={<PaymentPage />} />
            <Route
              path="/join"
              element={
                <PhaseGuard allowedPhases={['upcoming', 'registration']} fallbackPath="/dashboard">
                  <JoinPage />
                </PhaseGuard>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PhaseGuard allowedPhases={['inactive', 'upcoming', 'registration', 'hacking', 'judging']} fallbackPath="/">
                    <DashboardPage />
                  </PhaseGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-team"
              element={
                <ProtectedRoute>
                  <PhaseGuard allowedPhases={['inactive', 'upcoming', 'registration']} fallbackPath="/dashboard">
                    <FindTeamPage />
                  </PhaseGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommended-teams"
              element={
                <ProtectedRoute>
                  <PhaseGuard allowedPhases={['inactive', 'upcoming', 'registration']} fallbackPath="/dashboard">
                    <RecommendedTeamsPage />
                  </PhaseGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-members"
              element={
                <ProtectedRoute>
                  <PhaseGuard allowedPhases={['inactive', 'upcoming', 'registration']} fallbackPath="/dashboard">
                    <FindMembersPage />
                  </PhaseGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommended-members"
              element={
                <ProtectedRoute>
                  <PhaseGuard allowedPhases={['inactive', 'upcoming', 'registration']} fallbackPath="/dashboard">
                    <RecommendedMembersPage />
                  </PhaseGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/validate-idea"
              element={
                <ProtectedRoute>
                  <PhaseGuard allowedPhases={['inactive', 'upcoming', 'registration', 'hacking']} fallbackPath="/dashboard">
                    <IdeaValidatorPage />
                  </PhaseGuard>
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
                  <PhaseGuard allowedPhases={['registration', 'hacking', 'judging']} fallbackPath="/dashboard">
                    <LeaderboardPage />
                  </PhaseGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/submission"
              element={
                <ProtectedRoute>
                  <PhaseGuard allowedPhases={['hacking']} fallbackPath="/dashboard">
                    <SubmissionPage />
                  </PhaseGuard>
                </ProtectedRoute>
              }
            />
            <Route path="/gallery" element={<ProjectGallery />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
