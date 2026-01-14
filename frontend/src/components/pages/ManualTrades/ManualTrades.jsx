/**
 * Manual Trades Page
 * Execute manual trades
 */
import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/Card/Card';
import { Input } from '../../shared/Input/Input';
import { Button } from '../../shared/Button/Button';
import api from '../../../services/api';

export function ManualTrades() {
  const [formData, setFormData] = useState({
    ticker: 'SPY',
    type: 'call',
    contracts: 10,
    delta: 0.35,
    dte: 7,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmed = confirm(
      `¿Ejecutar operación manual?\n\n` +
      `Ticker: ${formData.ticker}\n` +
      `Tipo: ${formData.type.toUpperCase()}\n` +
      `Contratos: ${formData.contracts}`
    );

    if (!confirmed) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/api/manual/execute', {
        ...formData,
        hold_type: 'until_targets',
        monitor_enabled: true,
        target_1_pct: 20,
        target_2_pct: 40,
        stop_loss_pct: 15,
        partial_close_t1: 50,
        trailing_stop_enabled: true,
      });

      setResult(response.data);

      // Reset form after success
      setTimeout(() => {
        setResult(null);
      }, 5000);
    } catch (error) {
      console.error('Error executing manual trade:', error);
      alert('Error al ejecutar la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Operaciones Manuales</h1>
        <p className="text-gray-600 mt-1">Ejecuta operaciones manualmente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Entrada Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ticker"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                placeholder="SPY"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.type === 'call' ? 'primary' : 'secondary'}
                    onClick={() => setFormData({ ...formData, type: 'call' })}
                    className="flex-1"
                  >
                    Call
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'put' ? 'primary' : 'secondary'}
                    onClick={() => setFormData({ ...formData, type: 'put' })}
                    className="flex-1"
                  >
                    Put
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Delta"
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="0.95"
                  value={formData.delta}
                  onChange={(e) => setFormData({ ...formData, delta: parseFloat(e.target.value) })}
                />

                <Input
                  label="DTE"
                  type="number"
                  min="1"
                  value={formData.dte}
                  onChange={(e) => setFormData({ ...formData, dte: parseInt(e.target.value) })}
                />
              </div>

              <Input
                label="Contratos"
                type="number"
                min="1"
                value={formData.contracts}
                onChange={(e) => setFormData({ ...formData, contracts: parseInt(e.target.value) })}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Ejecutando...' : '🚀 Ejecutar Operación'}
              </Button>
            </form>

            {result && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold text-green-900">{result.message}</p>
                <p className="text-sm text-green-700 mt-1">
                  Entry: ${result.entry_price} • Costo: ${result.cost.toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Monitor Automático</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Target 1: +20% (cierra 50%)</li>
                  <li>• Target 2: +40% (cierra 50%)</li>
                  <li>• Stop Loss: -15%</li>
                  <li>• Trailing stop después de T2</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Notas</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Delta determina el strike automáticamente</li>
                  <li>• DTE: Días hasta expiración</li>
                  <li>• El monitor se activa automáticamente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
