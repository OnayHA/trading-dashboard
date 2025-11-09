/**
 * PositionsTicker Component
 * Horizontal scrolling ticker showing active positions P&L
 */
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import api from '../../../services/api';

export function PositionsTicker() {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    loadPositions();
    const interval = setInterval(loadPositions, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  const loadPositions = async () => {
    try {
      const response = await api.get('/api/positions/active');
      setPositions(response.data);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const totalPnL = positions.reduce((sum, p) => sum + p.unrealized_pnl, 0);

  if (positions.length === 0) {
    return (
      <div className="bg-gray-800 text-white px-6 py-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">No hay posiciones abiertas</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white px-6 py-2 overflow-hidden">
      <div className="flex items-center gap-6 animate-marquee">
        {/* Total P&L */}
        <div className="flex items-center gap-2 font-semibold">
          {totalPnL >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
            Total: {formatCurrency(totalPnL)}
          </span>
        </div>

        {/* Positions */}
        {positions.map((position) => (
          <div key={position.id} className="flex items-center gap-2 text-sm">
            <span className="font-medium">{position.ticker}</span>
            <span className="text-gray-400">{position.option_type}</span>
            <span className={position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
              {formatCurrency(position.unrealized_pnl)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
