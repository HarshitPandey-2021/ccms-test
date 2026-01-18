// admin/src/components/BottomNavigation.jsx - FIXED Z-INDEX

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  RiDashboardLine,
  RiFileListLine,
  RiTeamLine,
  RiBarChartLine,
  RiUserLine,
} from 'react-icons/ri';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: RiDashboardLine, label: 'Home' },
    { path: '/complaints', icon: RiFileListLine, label: 'Cases' },
    { path: '/students', icon: RiTeamLine, label: 'Students' },
    { path: '/analytics', icon: RiBarChartLine, label: 'Stats' },
    { path: '/profile', icon: RiUserLine, label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    // ✅ Changed z-50 to z-30 (below sidebar z-50)
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 shadow-lg safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform ${
                  active ? 'scale-110' : ''
                }`}
              />
              <span
                className={`text-[10px] mt-0.5 font-medium ${
                  active ? 'font-semibold' : ''
                }`}
              >
                {label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}