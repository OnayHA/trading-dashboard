/**
 * User Profile Modal
 * Modal for updating user profile (username, password, phone)
 */
import React, { useState, useEffect } from 'react';
import { X, User, Lock, Phone, AlertCircle } from 'lucide-react';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import api from '../../../services/api';

export function UserProfileModal({ isOpen, onClose, currentUser, onUpdate }) {
  const [formData, setFormData] = useState({
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      // Load current user data
      loadUserProfile();
    }
  }, [isOpen, currentUser]);

  const loadUserProfile = async () => {
    try {
      const response = await api.get(`/auth/profile?username=${currentUser.username}`);
      setFormData({
        newUsername: response.data.username,
        newPassword: '',
        confirmPassword: '',
        phone: response.data.phone || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        current_username: currentUser.username,
      };

      // Check if username actually changed
      const usernameChanged = formData.newUsername && formData.newUsername !== currentUser.username;
      const phoneChanged = formData.phone !== (currentUser.phone || '');

      // Only include fields that actually changed
      if (usernameChanged) {
        updateData.new_username = formData.newUsername;
      }

      if (formData.newPassword) {
        updateData.new_password = formData.newPassword;
      }

      if (phoneChanged) {
        updateData.phone = formData.phone;
      }

      // If nothing changed, don't send request
      if (!usernameChanged && !formData.newPassword && !phoneChanged) {
        setError('No hay cambios para guardar');
        setLoading(false);
        return;
      }

      console.log('Sending update:', updateData);

      const response = await api.put('/auth/profile', updateData);

      setSuccess('Perfil actualizado correctamente');

      // Update localStorage immediately
      localStorage.setItem('user', JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        phone: response.data.phone,
      }));

      // If username or password changed, update token and reload page
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Notify parent component
      if (onUpdate) {
        onUpdate({
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone,
        });
      }

      // If credentials changed, reload page to ensure everything syncs
      if (usernameChanged || formData.newPassword) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Just close modal if only phone changed
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1000);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.detail || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Usuario
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="newUsername"
              value={formData.newUsername}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nuevo nombre de usuario"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña <span className="text-gray-400 text-xs">(dejar vacío para no cambiar)</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nueva contraseña"
            />
          </div>
        </div>

        {/* Confirm Password */}
        {formData.newPassword && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirmar contraseña"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
