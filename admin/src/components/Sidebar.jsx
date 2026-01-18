// admin/src/components/Sidebar.jsx - FIXED MOBILE POSITIONING

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  RiDashboardLine,
  RiFileListLine,
  RiBarChartLine,
  RiHistoryLine,
  RiUserLine,
  RiLogoutBoxLine,
  RiCloseLine,
  RiTeamLine,
} from 'react-icons/ri';
import { getAdminUser, logoutAdmin } from '../utils/tokenUtils';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { success } = useToast();
  const adminUser = getAdminUser();

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logoutAdmin();
    success('👋 Logged out successfully!');
  };

  const closeMobileMenu = () => {
    if (isMobile && toggleSidebar) {
      toggleSidebar();
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { path: '/complaints', label: 'Complaints', icon: RiFileListLine },
    { path: '/analytics', label: 'Analytics', icon: RiBarChartLine },
    { path: '/students', label: 'Students', icon: RiTeamLine },
    { path: '/activity-logs', label: 'Activity Logs', icon: RiHistoryLine },
    { path: '/profile', label: 'Profile', icon: RiUserLine },
  ];

  return (
    <>
      {/* Mobile Backdrop - z-40 (below sidebar) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - z-50 on mobile (above navbar when open) */}
      <aside
        className={`
          fixed md:static 
          inset-y-0 left-0
          z-50 md:z-30
          w-64 
          bg-white dark:bg-gray-800 
          shadow-xl md:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
          pt-0 md:pt-0
        `}
      >
        {/* Logo/Header - Visible on mobile when sidebar is open */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {adminUser?.name || 'Administrator'}
              </p>
            </div>
            {/* Mobile Close Button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="flex-shrink-0 ml-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <RiCloseLine className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links - Scrollable area with proper padding */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'scale-110' : ''}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
          >
            <RiLogoutBoxLine className="h-5 w-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 p-4 pb-20 md:pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
              CCMS v1.0.0
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
              Admin Portal
            </p>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You'll be redirected to the login page."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default Sidebar;