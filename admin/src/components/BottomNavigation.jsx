// src/components/BottomNavigation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  RiDashboardLine,
  RiFileListLine,
  RiBarChartLine,
  RiHistoryLine,
  RiUserLine,
} from 'react-icons/ri';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
    { path: '/complaints', icon: RiFileListLine, label: 'Complaints' },
    { path: '/analytics', icon: RiBarChartLine, label: 'Analytics' },
    { path: '/activity-logs', icon: RiHistoryLine, label: 'Logs' },
    { path: '/profile', icon: RiUserLine, label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon
                className={`h-6 w-6 transition-transform ${
                  active ? 'scale-110' : ''
                }`}
              />
              <span
                className={`text-xs mt-1 font-medium ${
                  active ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                {label}
              </span>
              {active && (
                <div className="absolute bottom-0 w-12 h-1 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}