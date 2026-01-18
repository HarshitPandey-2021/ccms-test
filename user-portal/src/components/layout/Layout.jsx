// src/components/layout/Layout.jsx - FIXED STRUCTURE

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNavigation from "./BottomNavigation";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navbar - Sticky at top, z-40 */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Content Wrapper */}
      <div className="flex relative">
        {/* Sidebar - z-50 on mobile when open, z-30 on desktop */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content - Proper spacing for sidebar and bottom nav */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)] transition-all duration-200">
          {/* Content with padding for bottom navigation on mobile */}
          <div className="pb-20 md:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) - z-30 */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;