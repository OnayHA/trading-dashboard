/**
 * Formatting utilities
 * Functions for formatting numbers, dates, currencies, etc.
 */
import { format, formatDistance, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format currency value
 */
export const formatCurrency = (value, showSign = true) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  if (showSign && value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 2, showSign = true) => {
  const formatted = Math.abs(value).toFixed(decimals);

  if (showSign && value > 0) {
    return `+${formatted}%`;
  }
  if (value < 0) {
    return `-${formatted}%`;
  }
  return `${formatted}%`;
};

/**
 * Format number with commas
 */
export const formatNumber = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  return format(new Date(date), formatStr);
};

/**
 * Format time
 */
export const formatTime = (date, formatStr = 'HH:mm:ss') => {
  return format(new Date(date), formatStr);
};

/**
 * Format datetime
 */
export const formatDateTime = (date, formatStr = 'MMM dd, yyyy HH:mm') => {
  return format(new Date(date), formatStr);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Get class name for P&L value
 */
export const getPnLClassName = (value) => {
  if (value > 0) return 'text-positive';
  if (value < 0) return 'text-negative';
  return 'text-gray-600';
};
