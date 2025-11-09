/**
 * Market Status Utilities
 * Calculate market open/close status and time remaining
 */

/**
 * Calculate market status based on NY time
 */
export const calculateMarketStatus = (nyTime = new Date()) => {
  const day = nyTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = nyTime.getHours();
  const minute = nyTime.getMinutes();
  const totalMinutes = hour * 60 + minute;

  // Weekend
  if (day === 0 || day === 6) {
    return {
      state: 'closed',
      timeUntil: day === 6 ? 'el lunes' : 'mañana lunes',
      isOpen: false,
    };
  }

  // Premarket: before 9:30 AM (570 minutes)
  if (totalMinutes < 570) {
    const minutesUntilOpen = 570 - totalMinutes;
    const hours = Math.floor(minutesUntilOpen / 60);
    const mins = minutesUntilOpen % 60;
    return {
      state: 'premarket',
      timeUntil: `${hours}h ${mins}m`,
      isOpen: false,
    };
  }

  // Market open: 9:30 AM - 4:00 PM (960 minutes)
  if (totalMinutes >= 570 && totalMinutes < 960) {
    const minutesUntilClose = 960 - totalMinutes;
    const hours = Math.floor(minutesUntilClose / 60);
    const mins = minutesUntilClose % 60;
    return {
      state: 'open',
      timeUntil: `${hours}h ${mins}m`,
      isOpen: true,
    };
  }

  // After hours
  return {
    state: 'closed',
    timeUntil: 'mañana',
    isOpen: false,
  };
};

/**
 * Get NY time from local time
 */
export const getNYTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
};
