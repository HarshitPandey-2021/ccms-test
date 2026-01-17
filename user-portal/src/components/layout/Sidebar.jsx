// src/components/layout/Sidebar.jsx - WITH CONFIRM DIALOG
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ConfirmDialog from "../common/ConfirmDialog";
import {
  RiDashboardLine,
  RiDashboardFill,
  RiFileListLine,
  RiFileListFill,
  RiAddCircleLine,
  RiAddCircleFill,
  RiUserLine,
  RiUserFill,
  RiCloseLine,
  RiLogoutBoxRLine,
  RiShieldUserLine,
} from "react-icons/ri";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const navItems = [
    {
      path: "/user/dashboard",
      icon: RiDashboardLine,
      activeIcon: RiDashboardFill,
      label: "Dashboard",
    },
    {
      path: "/user/submit",
      icon: RiAddCircleLine,
      activeIcon: RiAddCircleFill,
      label: "Submit Complaint",
    },
    {
      path: "/user/my-complaints",
      icon: RiFileListLine,
      activeIcon: RiFileListFill,
      label: "My Complaints",
    },
    {
      path: "/user/profile",
      icon: RiUserLine,
      activeIcon: RiUserFill,
      label: "Profile",
    },
  ];

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    window.location.href = "https://landing-test-liard-one.vercel.app/login";
  };

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.path === "/user/dashboard"}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <item.activeIcon className="h-5 w-5 flex-shrink-0" />
          ) : (
            <item.icon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          )}
          <span className="font-semibold truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col z-30">
      {/* User Info Card */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate text-sm">
              {user?.name || "Student"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.rollNo || user?.email || "Student"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
        >
          <RiLogoutBoxRLine className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );

  // Mobile Sidebar (Drawer)
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <RiShieldUserLine className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="font-bold text-white">Student Portal</h2>
              <p className="text-xs text-indigo-200">University of Lucknow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <RiCloseLine className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                {user?.name || "Student"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.rollNo || user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[calc(100vh-280px)]">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <RiLogoutBoxRLine className="h-5 w-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You'll need to login again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default Sidebar; 