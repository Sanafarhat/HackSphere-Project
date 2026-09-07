import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const DEFAULT_THEME = {
  title: 'HackSphere',
  description: '',
  logoUrl: '',
  primaryColor: '#b19cff',
  secondaryColor: '#f0d94d',
  currentPhase: 'inactive',
};

const EventContext = createContext(null);

const applyThemeToDocument = (event) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.style.setProperty('--primary-color', event?.primaryColor || DEFAULT_THEME.primaryColor);
  root.style.setProperty('--secondary-color', event?.secondaryColor || DEFAULT_THEME.secondaryColor);
};

export const EventProvider = ({ children }) => {
  const [event, setEvent] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActiveEvent = async () => {
    try {
      setError(null);
      const response = await axios.get('/api/events/active');
      const activeEvent = response.data?.event || DEFAULT_THEME;
      setEvent(activeEvent);
      return activeEvent;
    } catch (requestError) {
      setError(requestError);
      setEvent(DEFAULT_THEME);
      return DEFAULT_THEME;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveEvent();
  }, []);

  useEffect(() => {
    applyThemeToDocument(event);
  }, [event]);

  const value = useMemo(
    () => ({
      event,
      loading,
      error,
      currentPhase: event?.currentPhase || 'inactive',
      refreshEvent: loadActiveEvent,
    }),
    [event, loading, error]
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvent = () => {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error('useEvent must be used within EventProvider');
  }

  return context;
};

export default EventContext;