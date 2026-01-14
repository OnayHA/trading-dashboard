/**
 * Login Page
 * Authentication page for the dashboard
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../shared/Input/Input';
import { Button } from '../../shared/Button/Button';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <Activity className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Trading Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Inicia sesión para continuar
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            type="text"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            disabled={loading}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!username || !password || loading}
            className="w-full"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* Help */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-1">Credenciales por defecto:</p>
          <p className="text-sm text-blue-700">Usuario: <code className="bg-blue-100 px-1 rounded">admin</code></p>
          <p className="text-sm text-blue-700">Contraseña: <code className="bg-blue-100 px-1 rounded">admin</code></p>
        </div>
      </div>
    </div>
  );
}
