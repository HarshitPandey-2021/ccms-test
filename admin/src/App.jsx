// src/App.jsx - Mobile Responsive with Bottom Navigation
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Breadcrumb from "./components/Breadcrumb.jsx";
import BottomNavigation from "./components/BottomNavigation.jsx"; // ✅ NEW
import AuthInitializer from "./components/AuthInitializer.jsx";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts.js";
import { ToastProvider } from "./context/ToastContext.jsx";
import ManageStudents from "./pages/ManageStudents.jsx"; // ✅ ADD THIS IMPORT
import {
  initializeActivityLogger,
  logActivity,
  ACTIVITY_TYPES,
} from "./services/activityLogger.js";
import {
  getAdminToken,
  getAdminUser,
} from "./utils/tokenUtils.js";
import Dashboard from "./pages/Dashboard.jsx";
import Complaints from "./pages/Complaints.jsx";
import Analytics from "./pages/Analytics.jsx";
import ActivityLogs from "./pages/ActivityLogs.jsx";
import Profile from "./pages/Profile.jsx";

function getPageName(path) {
  const routes = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/complaints": "Complaints",
    "/analytics": "Analytics",
    "/activity-logs": "Activity Logs",
    "/profile": "Profile",
  };
  return routes[path] || "Unknown Page";
}

// ✅ Handle refresh 404 issue
function RouteHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const validRoutes = ['/', '/dashboard', '/complaints', '/analytics', '/activity-logs', '/profile', '/unauthorized'];
    const currentPath = window.location.pathname;
    
    if (!validRoutes.includes(currentPath)) {
      const token = getAdminToken();
      if (token) {
        console.log('🔄 Invalid route detected, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);
  
  return null;
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getAdminToken();
  const user = getAdminUser();

  const isAdmin = !!token && !!user && user.role === "admin";

  if (!isAdmin) {
    console.log("❌ ProtectedRoute: Not admin, redirecting to /unauthorized");
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  console.log("✅ ProtectedRoute: Admin verified");
  return children;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useKeyboardShortcuts();

  useEffect(() => {
    initializeActivityLogger();
    logActivity(ACTIVITY_TYPES.LOGIN, {
      page: "Admin Dashboard",
      action: "Admin panel opened",
      timestamp: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    const pageName = getPageName(location.pathname);
    logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
      page: pageName,
      path: location.pathname,
      action: "Navigated to page",
    });
  }, [location.pathname]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Handle responsive behavior
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Auto-open on desktop, closed on mobile
    }
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  return (
    <ToastProvider>
      <RouteHandler />
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
          {/* Navbar */}
          <Navbar toggleSidebar={toggleSidebar} />
          
          {/* Breadcrumb (hide on mobile) */}
          <div className="hidden md:block">
            <Breadcrumb />
          </div>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute>
                    <Complaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              {/* ✅ NEW ROUTE */}
<Route
  path="/students"
  element={
    <ProtectedRoute>
      <ManageStudents />
    </ProtectedRoute>
  }
/>
<Route
  path="/activity-logs"
  element={
    <ProtectedRoute>
      <ActivityLogs />
    </ProtectedRoute>
  }
/>
              <Route
                path="/activity-logs"
                element={
                  <ProtectedRoute>
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/unauthorized"
                element={
                  <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-900 p-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-white">
                      Unauthorized Access
                    </h1>
                    <p className="text-gray-400 mb-6 max-w-md text-sm sm:text-base">
                      You need to login as an admin from the main portal to access this panel.
                    </p>
                    <a
                      href="https://landing-test-liard-one.vercel.app/"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      Go to Home
                    </a>
                  </div>
                }
              />
              {/* Catch all invalid routes */}
              <Route 
                path="*" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* ✅ Bottom Navigation (Mobile Only) */}
          <BottomNavigation />
        </div>
      </div>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AuthInitializer>
        <AppContent />
      </AuthInitializer>
    </Router>
  );
}