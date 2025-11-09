/**
 * useKeyboardShortcut Hook
 * Handles keyboard shortcuts
 */
import { useEffect } from 'react';

export function useKeyboardShortcut(key, callback, options = {}) {
  const {
    ctrl = false,
    alt = false,
    shift = false,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const matchesModifiers =
        (!ctrl || e.ctrlKey || e.metaKey) &&
        (!alt || e.altKey) &&
        (!shift || e.shiftKey);

      if (matchesModifiers && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ctrl, alt, shift, enabled]);
}
