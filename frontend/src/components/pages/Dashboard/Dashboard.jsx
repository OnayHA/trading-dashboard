/**
 * Dashboard Page
 * Main dashboard with positions, metrics, and recent signals
 */
import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/Card/Card';
import { Button } from '../../shared/Button/Button';
import { formatCurrency } from '../../../utils/formatters';
import api from '../../../services/api';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';

export function Dashboard() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/api/positions/active');
      setPositions(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (positionId) => {
    if (confirm('¿Cerrar esta posición?')) {
      try {
        await api.post(`/api/positions/close/${positionId}`);
        loadDashboardData();
      } catch (error) {
        console.error('Error closing position:', error);
      }
    }
  };

  const handleCloseAll = async () => {
    if (confirm('¿Cerrar TODAS las posiciones? Esta acción no se puede deshacer.')) {
      try {
        await api.post('/api/positions/close-all');
        loadDashboardData();
      } catch (error) {
        console.error('Error closing all positions:', error);
      }
    }
  };

  const totalPnL = positions.reduce((sum, p) => sum + p.unrealized_pnl, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Posiciones Abiertas</p>
                <p className="text-3xl font-bold text-gray-900">{positions.length}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">P&L No Realizado</p>
                <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(totalPnL)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">P&L Diario</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
              <Target className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <ErrorBoundary>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Posiciones Activas ({positions.length})</CardTitle>
            {positions.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleCloseAll}>
                🚨 Cerrar Todas
              </Button>
            )}
          </CardHeader>

          <CardContent>
            {positions.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay posiciones abiertas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ticker</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Strike</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Contratos</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Entry</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actual</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">P&L</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Días</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr key={position.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-semibold">{position.ticker}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            position.option_type === 'CALL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {position.option_type}
                          </span>
                        </td>
                        <td className="py-3 px-4">${position.strike}</td>
                        <td className="py-3 px-4">{position.contracts}</td>
                        <td className="py-3 px-4">${position.entry_price.toFixed(2)}</td>
                        <td className="py-3 px-4">${position.current_price.toFixed(2)}</td>
                        <td className={`py-3 px-4 font-semibold ${position.unrealized_pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {formatCurrency(position.unrealized_pnl)}
                        </td>
                        <td className="py-3 px-4">{position.days_held}</td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleClosePosition(position.id)}
                          >
                            Cerrar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  );
}
