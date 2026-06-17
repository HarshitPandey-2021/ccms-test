// src/App.jsx - UPDATED with Forgot Password route
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';  // ✅ ADD THIS
import HowItWorks from './pages/HowItWorks.jsx';
import JourneyPage from './pages/JourneyPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DarkModeProvider } from './context/DarkModeContext.jsx';
import Loader from './components/Loader.jsx';

function LogoutHandler() {
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }, []);

  return <Loader message="Logging out..." />;
}

function AppContent() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Show loader on route change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return <Loader message="Loading page..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/journey" element={<JourneyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />  {/* ✅ ADD THIS */}
      <Route path="/logout" element={<LogoutHandler />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;