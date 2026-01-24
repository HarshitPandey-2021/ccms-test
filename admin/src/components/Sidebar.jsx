// admin/src/components/Sidebar.jsx - Role-Based Navigation
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
  RiBuildingLine,
  RiAdminLine,
  RiShieldUserLine,
} from 'react-icons/ri';
import { getAdminUser, logoutAdmin } from '../utils/tokenUtils';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { success } = useToast();
  const adminUser = getAdminUser();

  // Get admin type (default to 'super' for backwards compatibility)
  const adminType = adminUser?.adminType || 'super';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // ✅ ROLE-BASED NAVIGATION - Different nav items for different admin types
  const getNavItems = () => {
    // Common items for all admins
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
      { path: '/complaints', label: 'Complaints', icon: RiFileListLine },
      { path: '/profile', label: 'Profile', icon: RiUserLine },
    ];

    // Super Admin sees everything
    if (adminType === 'super') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
        { path: '/complaints', label: 'Complaints', icon: RiFileListLine },
        { path: '/departments', label: 'Departments', icon: RiBuildingLine },
        { path: '/staff', label: 'Staff', icon: RiTeamLine },
        { path: '/analytics', label: 'Analytics', icon: RiBarChartLine },
        { path: '/students', label: 'Students', icon: RiTeamLine },
        { path: '/admin-management', label: 'Admin Management', icon: RiAdminLine }, // ✅ NEW
        { path: '/activity-logs', label: 'Activity Logs', icon: RiHistoryLine },
        { path: '/profile', label: 'Profile', icon: RiUserLine },
      ];
    }

    // Department Admin - limited access
    if (adminType === 'department') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
        { path: '/complaints', label: 'Complaints', icon: RiFileListLine },
        { path: '/staff', label: 'Staff', icon: RiTeamLine },
        { path: '/analytics', label: 'Analytics', icon: RiBarChartLine },
        { path: '/profile', label: 'Profile', icon: RiUserLine },
      ];
    }

    // Women's Cell / Academic / Anti-Ragging - focused access
    if (adminType === 'womens_cell' || adminType === 'academic' || adminType === 'anti_ragging') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
        { path: '/complaints', label: 'Complaints', icon: RiFileListLine },
        { path: '/analytics', label: 'Analytics', icon: RiBarChartLine },
        { path: '/profile', label: 'Profile', icon: RiUserLine },
      ];
    }

    // Default fallback
    return commonItems;
  };

  const navItems = getNavItems();

  // Get admin type badge color
  const getAdminBadge = () => {
    const badges = {
      super: { label: 'Super Admin', icon: RiShieldUserLine, color: 'bg-gradient-to-r from-purple-600 to-indigo-600' },
      department: { label: 'Department', icon: RiBuildingLine, color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
      womens_cell: { label: "Women's Cell", icon: RiShieldUserLine, color: 'bg-gradient-to-r from-pink-600 to-rose-600' },
      academic: { label: 'Academic', icon: RiTeamLine, color: 'bg-gradient-to-r from-green-600 to-emerald-600' },
      anti_ragging: { label: 'Anti-Ragging', icon: RiAdminLine, color: 'bg-gradient-to-r from-orange-600 to-amber-600' },
    };

    return badges[adminType] || badges.super;
  };

  const adminBadge = getAdminBadge();
  const BadgeIcon = adminBadge.icon;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
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
        {/* Logo/Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`p-1 rounded ${adminBadge.color}`}>
                  <BadgeIcon className="h-3 w-3 text-white" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {adminBadge.label}
                </p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                {adminUser?.name || 'Administrator'}
              </p>
            </div>
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

        {/* Navigation Links */}
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
              {adminBadge.label} Portal
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