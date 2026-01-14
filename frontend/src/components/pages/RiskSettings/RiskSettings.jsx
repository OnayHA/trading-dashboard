/**
 * Risk Settings Page
 * Configure risk parameters and kill switch
 */
import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/Card/Card';
import { Toggle } from '../../shared/Toggle/Toggle';
import { Button } from '../../shared/Button/Button';
import api from '../../../services/api';

export function RiskSettings() {
  const [liveTradingEnabled, setLiveTradingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/api/config/global');
      setLiveTradingEnabled(response.data.live_trading_enabled);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleKillSwitch = async (enabled) => {
    const confirmed = !enabled || confirm(
      enabled
        ? '¿Activar trading en vivo? El sistema ejecutará órdenes automáticamente.'
        : '¿Desactivar trading en vivo? El sistema solo generará señales pero NO ejecutará órdenes.'
    );

    if (confirmed) {
      setLoading(true);
      try {
        await api.post('/api/system/kill-switch', { enabled });
        setLiveTradingEnabled(enabled);
      } catch (error) {
        console.error('Error toggling kill switch:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ajustes de Riesgo</h1>
        <p className="text-gray-600 mt-1">Configuración de parámetros de riesgo y control</p>
      </div>

      {/* Kill Switch */}
      <Card>
        <CardHeader>
          <CardTitle>Control Maestro de Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-6 rounded-lg ${liveTradingEnabled ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {liveTradingEnabled ? (
                  <Activity className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h3 className={`text-lg font-bold ${liveTradingEnabled ? 'text-green-900' : 'text-red-900'}`}>
                    {liveTradingEnabled ? 'Trading EN VIVO' : 'Trading PAUSADO'}
                  </h3>
                  <p className={`text-sm ${liveTradingEnabled ? 'text-green-700' : 'text-red-700'}`}>
                    {liveTradingEnabled
                      ? 'El sistema ejecuta órdenes automáticamente'
                      : 'Solo genera señales, no ejecuta órdenes'}
                  </p>
                </div>
              </div>

              <Toggle
                checked={liveTradingEnabled}
                onCheckedChange={handleKillSwitch}
                disabled={loading}
                className="scale-150"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Cuando el trading está pausado, el sistema continúa generando señales
              y monitoreando posiciones existentes, pero NO ejecutará nuevas órdenes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Other Settings Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de Riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Delta Range</p>
                <p className="text-sm text-gray-600">0.25 - 0.45</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">DTE Range</p>
                <p className="text-sm text-gray-600">3 - 14 días</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Pérdida Diaria Máxima</p>
                <p className="text-sm text-gray-600">$1,000</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Máximo de Operaciones Abiertas</p>
                <p className="text-sm text-gray-600">15</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
