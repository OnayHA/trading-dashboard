/**
 * App Component
 * Main application with routing and layout
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header/Header';
import { Sidebar } from './components/layout/Sidebar/Sidebar';
import { LockScreen } from './components/layout/LockScreen/LockScreen';
import { PositionsTicker } from './components/layout/PositionsTicker/PositionsTicker';
import { Login } from './components/pages/Login/Login';
import { Dashboard } from './components/pages/Dashboard/Dashboard';
import { RiskSettings } from './components/pages/RiskSettings/RiskSettings';
import { ManualTrades } from './components/pages/ManualTrades/ManualTrades';
import { TradeHistory } from './components/pages/TradeHistory/TradeHistory';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <LockScreen />

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <Header />

        {/* Positions Ticker */}
        <PositionsTicker />

        {/* Main Layout */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/risk-settings" element={<RiskSettings />} />
              <Route path="/manual-trades" element={<ManualTrades />} />
              <Route path="/history" element={<TradeHistory />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
