/**
 * useMarketStatus Hook
 * Tracks market open/close status
 * Updates every second for real-time countdown
 */
import { useState, useEffect } from 'react';
import { calculateMarketStatus, getChicagoTime } from '../utils/marketStatus';

export function useMarketStatus() {
  const [status, setStatus] = useState({
    state: 'loading',
    timeUntil: '',
    countdown: null,
    isOpen: false,
  });

  useEffect(() => {
    const updateStatus = () => {
      const chicagoTime = getChicagoTime();
      const calculated = calculateMarketStatus(chicagoTime);
      setStatus(calculated);
    };

    // Update immediately
    updateStatus();

    // Update every second for real-time countdown
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
