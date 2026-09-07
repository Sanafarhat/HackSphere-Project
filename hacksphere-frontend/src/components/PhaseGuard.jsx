import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useEvent } from '../context/EventContext';

const DEFAULT_FALLBACKS = {
  upcoming: '/',
  registration: '/dashboard',
  hacking: '/dashboard',
  judging: '/dashboard',
  inactive: '/',
};

const LoadingState = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500" />
  </div>
);

export const PhaseGuard = ({
  children,
  allowedPhases = ['registration', 'hacking', 'judging'],
  fallbackPath,
}) => {
  const { currentPhase, loading, event } = useEvent();
  const location = useLocation();

  if (loading) {
    return <LoadingState />;
  }

  if (!event) {
    return <Navigate to={fallbackPath || '/'} replace state={{ from: location }} />;
  }

  if (!allowedPhases.includes(currentPhase)) {
    const redirectTarget = fallbackPath || DEFAULT_FALLBACKS[currentPhase] || '/';
    return <Navigate to={redirectTarget} replace state={{ from: location }} />;
  }

  return children;
};

export default PhaseGuard;