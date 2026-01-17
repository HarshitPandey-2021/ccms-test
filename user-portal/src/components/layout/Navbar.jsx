// src/components/layout/Navbar.jsx - WITH CONFIRM DIALOG
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import DarkModeToggle from "../common/DarkModeToggle";
import ConfirmDialog from "../common/ConfirmDialog";
import {
  RiMenuLine,
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* LEFT: Menu + Branding */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-all flex-shrink-0"
                aria-label="Toggle menu"
              >
                <RiMenuLine className="h-6 w-6" />
              </button>

              {/* Branding - Clickable */}
              <button
                onClick={() => navigate("/user/dashboard")}
                className="flex items-center gap-2 sm:gap-3 min-w-0 group"
              >
                {/* Logo */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <RiGraduationCapLine className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" />
                </div>

                {/* Text */}
                <div className="hidden xs:block min-w-0">
                  <h1 className="text-sm sm:text-base font-bold truncate group-hover:text-indigo-200 transition-colors">
                    Student Portal
                  </h1>
                  <p className="text-xs text-indigo-200 dark:text-gray-400 truncate hidden sm:block">
                    University of Lucknow
                  </p>
                </div>
              </button>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Dark Mode Toggle */}
              <div className="p-1">
                <DarkModeToggle />
              </div>

              {/* Desktop: User Profile */}
              <button
                onClick={() => navigate("/user/profile")}
                className="hidden md:flex items-center gap-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold truncate max-w-[120px] lg:max-w-[150px]">
                    {user?.name || "Student"}
                  </p>
                  <p className="text-xs text-indigo-200 truncate">
                    {user?.rollNo || "Student"}
                  </p>
                </div>
              </button>

              {/* Mobile: Avatar Only */}
              <button
                onClick={() => navigate("/user/profile")}
                className="md:hidden w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 hover:scale-110 transition-transform shadow-lg"
                aria-label="Go to profile"
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </button>

              {/* Desktop: Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-all"
                title="Logout"
              >
                <RiLogoutBoxRLine className="h-5 w-5" />
                <span className="hidden lg:inline text-sm font-medium">Logout</span>
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