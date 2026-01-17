// admin/src/components/Navbar.jsx - WITH CONFIRM DIALOG
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiMenuFoldLine, RiLogoutBoxRLine, RiShieldUserLine } from "react-icons/ri";
import DarkModeToggle from "./DarkModeToggle";
import Tooltip from "./Tooltip";
import NotificationPanel from "./NotificationPanel";
import ConfirmDialog from "./ConfirmDialog";
import { getAdminUser, logoutAdmin } from "../utils/tokenUtils";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const adminUser = getAdminUser();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logoutAdmin();
    localStorage.removeItem("dashboard-welcome-seen");
    window.location.href = "https://landing-test-liard-one.vercel.app/login";
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-indigo-700 to-indigo-800 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Side - Menu + Branding */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden flex-shrink-0 rounded-lg p-2 text-white hover:bg-white/10 active:bg-white/20 transition-all"
              aria-label="Toggle sidebar"
            >
              <RiMenuFoldLine className="h-6 w-6" />
            </button>

            {/* Branding */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo/Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <RiShieldUserLine className="h-6 w-6 text-yellow-300" />
              </div>
              
              {/* Text */}
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base font-bold truncate">CCMS Admin</h1>
                <p className="text-xs text-indigo-200 dark:text-gray-400 truncate">
                  University of Lucknow
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Mobile Actions (Icons Only) */}
            <div className="flex items-center gap-2 md:hidden">
              <Tooltip text="Notifications">
                <NotificationPanel />
              </Tooltip>
              <Tooltip text="Toggle theme">
                <DarkModeToggle />
              </Tooltip>
              <Tooltip text="Logout">
                <button
                  onClick={handleLogoutClick}
                  className="rounded-lg p-2 text-white hover:bg-white/10 active:bg-white/20 transition-all"
                  aria-label="Logout"
                >
                  <RiLogoutBoxRLine className="h-6 w-6" />
                </button>
              </Tooltip>
            </div>

            {/* Desktop Actions (Full) */}
            <div className="hidden md:flex items-center gap-4">
              <Tooltip text="Notifications">
                <NotificationPanel />
              </Tooltip>

              <Tooltip text="Toggle dark mode">
                <DarkModeToggle />
              </Tooltip>

              {/* Divider */}
              <div className="h-8 w-px bg-white/20" />

              {/* Profile Button */}
              <Tooltip text="View profile">
                <button
                  onClick={() => navigate("/profile")}
                  className="text-right hover:bg-white/10 px-3 py-2 rounded-lg transition-all group"
                >
                  <p className="text-sm font-semibold group-hover:text-indigo-200 transition-colors truncate max-w-[150px]">
                    {adminUser?.name || "Test Admin"}
                  </p>
                  <p className="text-xs text-indigo-200 dark:text-gray-400 truncate max-w-[150px]">
                    Administrator • UoL
                  </p>
                </button>
              </Tooltip>

              {/* Logout Button */}
              <Tooltip text="Sign out">
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all"
                >
                  <RiLogoutBoxRLine className="h-5 w-5" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </Tooltip>
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
        message="Are you sure you want to logout? You'll be redirected to the login page."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default Navbar;