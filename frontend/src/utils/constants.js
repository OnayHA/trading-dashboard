/**
 * Application constants
 */

export const SIGNAL_TYPES = {
  ELITE_2: { label: 'ELITE 2', color: 'purple', priority: 1 },
  ELITE_1: { label: 'ELITE 1', color: 'blue', priority: 2 },
  NORMAL_1: { label: 'NORMAL 1', color: 'gray', priority: 3 },
};

export const OPTION_TYPES = {
  CALL: { label: 'Call', color: 'green' },
  PUT: { label: 'Put', color: 'red' },
  STOCK: { label: 'Stock', color: 'blue' },
};

export const POSITION_STATUS = {
  OPEN: { label: 'Abierta', color: 'green' },
  CLOSED: { label: 'Cerrada', color: 'gray' },
};

export const SYSTEM_STATUS = {
  operational: { label: 'Operativo', color: 'green', icon: '✓' },
  degraded: { label: 'Degradado', color: 'yellow', icon: '⚠' },
  error: { label: 'Error', color: 'red', icon: '✗' },
};

export const MARKET_STATUS = {
  open: { label: 'Abierto', color: 'green' },
  premarket: { label: 'Pre-mercado', color: 'yellow' },
  closed: { label: 'Cerrado', color: 'red' },
};

export const HOLD_TYPES = {
  intraday: { label: 'Intraday', description: 'Cerrar al final del día' },
  multi_day: { label: 'Multi-día', description: 'Mantener varios días' },
  smart: { label: 'Inteligente', description: 'Según estrategia' },
  until_targets: { label: 'Hasta targets', description: 'Hasta alcanzar objetivos' },
};

export const CLOSE_REASONS = {
  TARGET_1: 'Target 1 alcanzado',
  TARGET_2: 'Target 2 alcanzado',
  STOP_LOSS: 'Stop Loss activado',
  EOD: 'Fin del día',
  MAX_DAYS: 'Máximo de días alcanzado',
  MANUAL: 'Cierre manual',
  TRAILING_STOP: 'Trailing stop',
};

export const DEFAULT_CAPITAL = 50000;

export const KEYBOARD_SHORTCUTS = {
  LOCK_SCREEN: { key: 'l', ctrl: true, description: 'Bloquear pantalla' },
};
