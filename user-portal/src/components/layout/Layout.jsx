// src/components/layout/Layout.jsx
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

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navbar - Sticky at top */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Content Wrapper */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)] transition-all duration-200">
          <div className="pb-20 md:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;