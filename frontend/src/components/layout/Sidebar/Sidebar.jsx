/**
 * Sidebar Component
 * Navigation sidebar with menu items
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  TrendingUp,
  History,
  FileText,
} from 'lucide-react';

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/risk-settings',
    label: 'Ajustes de Riesgo',
    icon: Settings,
  },
  {
    path: '/manual-trades',
    label: 'Operaciones Manuales',
    icon: TrendingUp,
  },
  {
    path: '/history',
    label: 'Historial',
    icon: History,
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
