/**
 * Trade History Page
 * View historical trades
 */
import React, { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/Card/Card';
import { Input } from '../../shared/Input/Input';
import { Button } from '../../shared/Button/Button';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import api from '../../../services/api';

export function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ticker: 'all',
    strategy: 'all',
  });

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/trades/history', { params: filters });
      setTrades(response.data);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/trades/export', {
        params: filters,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting trades:', error);
    }
  };

  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winners = trades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = trades.length > 0 ? (winners / trades.length) * 100 : 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Operaciones</h1>
          <p className="text-gray-600 mt-1">{trades.length} operaciones</p>
        </div>
        <Button variant="primary" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">P&L Total</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatCurrency(totalPnL)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Win Rate</p>
            <p className="text-2xl font-bold text-gray-900">{winRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">{winners}W / {trades.length - winners}L</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Trades</p>
            <p className="text-2xl font-bold text-gray-900">{trades.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Operaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ticker</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Strike</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Entry</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Exit</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">P&L</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estrategia</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm">{formatDateTime(trade.entry_time, 'MMM dd, HH:mm')}</td>
                    <td className="py-3 px-4 font-semibold">{trade.ticker}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.option_type === 'CALL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.option_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">${trade.strike}</td>
                    <td className="py-3 px-4">${trade.entry_price?.toFixed(2)}</td>
                    <td className="py-3 px-4">${trade.exit_price?.toFixed(2)}</td>
                    <td className={`py-3 px-4 font-semibold ${(trade.pnl || 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatCurrency(trade.pnl || 0)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{trade.strategy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
