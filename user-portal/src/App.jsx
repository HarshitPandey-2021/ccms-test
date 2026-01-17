// user-portal/src/App.jsx - ADD AUTH CHECK ON ROUTE CHANGE

import React, { useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Profile from "./pages/Profile";
import EditComplaint from "./pages/EditComplaint";
import { AuthContext } from "./context/AuthContext";
import "./index.css";

// ✅ ENHANCED Protected Route with Navigation Block
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Check auth on every route change
    if (!isAuthenticated) {
      // Clear any remaining data
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login
      window.location.replace("https://landing-test-liard-one.vercel.app/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">
            Session Required
          </div>
          <p className="text-slate-400 mb-4 text-sm">
            Your session has expired or you are not logged in.
          </p>
          <a
            href="https://landing-test-liard-one.vercel.app/login"
            className="inline-flex items-center px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
          >
            Go to Login Portal
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default function App() {
  return (
    <Layout>
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
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/submit"
          element={
            <ProtectedRoute>
              <SubmitComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/my-complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/complaints/:id"
          element={
            <ProtectedRoute>
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/complaints/:id/edit"
          element={
            <ProtectedRoute>
              <EditComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">
                  Page Not Found
                </div>
                <p className="text-slate-400 mb-4 text-sm">
                  The page you are looking for does not exist.
                </p>
                <a
                  href="/user/dashboard"
                  className="inline-flex items-center px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
}