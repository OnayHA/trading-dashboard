/**
 * Market Status Utilities
 * Calculate market open/close status and time remaining
 * Using America/Chicago timezone
 */

/**
 * Calculate market status based on Chicago time
 */
export const calculateMarketStatus = (chicagoTime = new Date()) => {
  const day = chicagoTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = chicagoTime.getHours();
  const minute = chicagoTime.getMinutes();
  const second = chicagoTime.getSeconds();
  const totalSeconds = hour * 3600 + minute * 60 + second;

  const MARKET_OPEN = 8.5 * 3600;  // 8:30 AM in seconds = 30600
  const MARKET_CLOSE = 15 * 3600;  // 3:00 PM in seconds = 54000

  // Weekend
  if (day === 0 || day === 6) {
    return {
      state: 'closed',
      timeUntil: day === 6 ? 'Abre el lunes' : 'Abre mañana lunes',
      countdown: null,
      isOpen: false,
    };
  }

  // Before market open (before 8:30 AM Chicago)
  if (totalSeconds < MARKET_OPEN) {
    const secondsUntilOpen = MARKET_OPEN - totalSeconds;
    const hours = Math.floor(secondsUntilOpen / 3600);
    const mins = Math.floor((secondsUntilOpen % 3600) / 60);
    const secs = secondsUntilOpen % 60;
    return {
      state: 'premarket',
      timeUntil: 'Mercado Cerrado',
      countdown: `Abre en ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      isOpen: false,
    };
  }

  // Market open: 8:30 AM - 3:00 PM Chicago
  if (totalSeconds >= MARKET_OPEN && totalSeconds < MARKET_CLOSE) {
    const secondsUntilClose = MARKET_CLOSE - totalSeconds;
    const hours = Math.floor(secondsUntilClose / 3600);
    const mins = Math.floor((secondsUntilClose % 3600) / 60);
    const secs = secondsUntilClose % 60;
    return {
      state: 'open',
      timeUntil: 'Mercado Abierto',
      countdown: `Cierra en ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      isOpen: true,
    };
  }

  // After hours
  return {
    state: 'closed',
    timeUntil: 'Mercado Cerrado',
    countdown: 'Abre mañana',
    isOpen: false,
  };
};

/**
 * Get Chicago time from local time
 */
export const getChicagoTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
};

// Export getNYTime as alias for backwards compatibility
export const getNYTime = getChicagoTime;
