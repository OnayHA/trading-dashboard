/**
 * LockScreen Component
 * Full-screen overlay when user locks the dashboard
 */
import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../shared/Input/Input';
import { Button } from '../../shared/Button/Button';

export function LockScreen() {
  const { user, unlock, isLocked } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLocked) return null;

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await unlock(password);
      if (success) {
        setPassword('');
      } else {
        setError('Contraseña incorrecta');
        setPassword('');
      }
    } catch (err) {
      setError('Error al desbloquear');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <Lock className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Pantalla Bloqueada
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Ingresa tu contraseña para continuar
        </p>

        {/* User Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-500">Usuario</p>
          <p className="text-lg font-semibold text-gray-900">{user?.username}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={loading}
            error={error}
          />

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!password || loading}
            className="w-full"
          >
            {loading ? 'Desbloqueando...' : 'Desbloquear'}
          </Button>
        </form>

        {/* Hint */}
        <p className="mt-6 text-xs text-center text-gray-500">
          Presiona Ctrl+L para bloquear la pantalla
        </p>
      </div>
    </div>
  );
}
