/**
 * useMarketStatus Hook
 * Tracks market open/close status
 */
import { useState, useEffect } from 'react';
import { calculateMarketStatus, getNYTime } from '../utils/marketStatus';

export function useMarketStatus() {
  const [status, setStatus] = useState({
    state: 'loading',
    timeUntil: '',
    isOpen: false,
  });

  useEffect(() => {
    const updateStatus = () => {
      const nyTime = getNYTime();
      const calculated = calculateMarketStatus(nyTime);
      setStatus(calculated);
    };

    // Update immediately
    updateStatus();

    // Update every minute
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
