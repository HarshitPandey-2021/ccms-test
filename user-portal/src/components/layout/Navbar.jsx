// src/components/layout/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import DarkModeToggle from "../common/DarkModeToggle";
import ConfirmDialog from "../common/ConfirmDialog";
import {
  RiMenuFoldLine,
  RiLogoutBoxRLine,
  RiGraduationCapLine,
} from "react-icons/ri";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    window.location.href = "https://landing-test-liard-one.vercel.app/login";
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Side - Menu + Branding */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="md:hidden flex-shrink-0 rounded-lg p-2 text-white hover:bg-white/10 active:bg-white/20 transition-all"
              aria-label="Toggle sidebar"
            >
              <RiMenuFoldLine className="h-6 w-6" />
            </button>

            {/* Branding */}
            <button
              onClick={() => navigate("/user/dashboard")}
              className="flex items-center gap-3 min-w-0 group"
            >
              {/* Logo/Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <RiGraduationCapLine className="h-6 w-6 text-yellow-300" />
              </div>

              {/* Text */}
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base font-bold truncate group-hover:text-indigo-200 transition-colors">
                  Student Portal
                </h1>
                <p className="text-xs text-indigo-200 dark:text-gray-400 truncate">
                  University of Lucknow
                </p>
              </div>
            </button>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Mobile Actions (Icons Only) */}
            <div className="flex items-center gap-2 md:hidden">
              <DarkModeToggle />
              
              {/* Mobile Avatar */}
              <button
                onClick={() => navigate("/user/profile")}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 hover:scale-110 transition-transform shadow-lg"
                aria-label="Go to profile"
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </button>

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="rounded-lg p-2 text-white hover:bg-white/10 active:bg-white/20 transition-all"
                aria-label="Logout"
              >
                <RiLogoutBoxRLine className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop Actions (Full) */}
            <div className="hidden md:flex items-center gap-4">
              <DarkModeToggle />

              {/* Divider */}
              <div className="h-8 w-px bg-white/20" />

              {/* Profile Button */}
              <button
                onClick={() => navigate("/user/profile")}
                className="flex items-center gap-3 text-right hover:bg-white/10 px-3 py-2 rounded-lg transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold group-hover:text-indigo-200 transition-colors truncate max-w-[150px]">
                    {user?.name || "Student"}
                  </p>
                  <p className="text-xs text-indigo-200 dark:text-gray-400 truncate max-w-[150px]">
                    {user?.rollNo || "Student"}
                  </p>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all"
              >
                <RiLogoutBoxRLine className="h-5 w-5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

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

export default Navbar;