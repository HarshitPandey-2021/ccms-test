// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ConfirmDialog from "../common/ConfirmDialog";
import {
  RiDashboardLine,
  RiFileListLine,
  RiAddCircleLine,
  RiUserLine,
  RiCloseLine,
  RiLogoutBoxLine,
  RiGraduationCapLine,
} from "react-icons/ri";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { path: "/user/dashboard", label: "Dashboard", icon: RiDashboardLine },
    { path: "/user/submit", label: "Submit Complaint", icon: RiAddCircleLine },
    { path: "/user/my-complaints", label: "My Complaints", icon: RiFileListLine },
    { path: "/user/profile", label: "Profile", icon: RiUserLine },
  ];

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    window.location.href = "https://landing-test-liard-one.vercel.app/login";
  };

  const closeMobileMenu = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:fixed
          top-0 md:top-16 left-0 z-40
          w-64 h-full md:h-[calc(100vh-4rem)]
          bg-white dark:bg-gray-800
          shadow-xl md:shadow-none
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Mobile Header - Only show on mobile */}
        <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <RiGraduationCapLine className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Student Portal</h1>
                <p className="text-xs text-indigo-200">University of Lucknow</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <RiCloseLine className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
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

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/user/dashboard"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md scale-105"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
          >
            <RiLogoutBoxLine className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
              CCMS v1.0.0
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
              Student Portal
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
        message="Are you sure you want to logout? You'll need to login again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default Sidebar;