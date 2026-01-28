// src/components/common/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Home,
  BookOpen
} from "lucide-react";
import { useDarkMode } from "../../context/DarkModeContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();
  const location = useLocation();

  // Page detection
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isJourneyPage = location.pathname === "/journey";
  const isHowItWorksPage = location.pathname === "/how-it-works";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Dynamic navbar background based on scroll and theme
  const getNavbarBg = () => {
    if (scrolled) {
      return isDark
        ? "bg-gray-800/95 backdrop-blur-xl shadow-xl shadow-black/20 border-b border-gray-700/50"
        : "bg-white/90 backdrop-blur-xl shadow-lg shadow-teal-500/10 border-b border-teal-100";
    }
    return isDark
      ? "bg-gray-800/80 backdrop-blur-md border-b border-gray-700/30"
      : "bg-white/70 backdrop-blur-md border-b border-teal-100/50";
  };

  // Button styles
  const secondaryButtonClass = `flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
    isDark
      ? "bg-gray-700/80 hover:bg-gray-600 border border-gray-600 text-gray-200 hover:text-white"
      : "bg-white hover:bg-teal-50 border border-teal-200 text-teal-700 hover:text-teal-900 shadow-sm hover:shadow"
  }`;

  const primaryButtonClass = `flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm shadow-md hover:shadow-lg ${
    isDark
      ? "bg-white hover:bg-gray-100 text-gray-900"
      : "bg-teal-600 hover:bg-teal-700 text-white"
  }`;

  const accentButtonClass = `flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-300 hover:via-orange-400 hover:to-pink-400 text-white rounded-xl font-semibold transition-all text-sm shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavbarBg()}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`p-0.5 rounded-full ${isDark ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-teal-500 to-cyan-600'}`}>
            <img
              src="/images/logo.png"
              alt="University Logo"
              className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-white"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className={`text-sm md:text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              UNIVERSITY OF LUCKNOW
            </span>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-teal-600"}`}>
              Campus Complaint Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            className={`p-2.5 rounded-xl transition-all ${
              isDark
                ? "bg-gray-700/80 hover:bg-gray-600 text-yellow-400 border border-gray-600"
                : "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Home Button */}
          {(isAuthPage || isJourneyPage || isHowItWorksPage) && (
            <Link to="/">
              <button className={secondaryButtonClass}>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </Link>
          )}

          {/* How It Works */}
          {isLandingPage && (
            <Link to="/how-it-works">
              <button className={secondaryButtonClass}>
                <BookOpen className="w-4 h-4" />
                <span>How It Works</span>
              </button>
            </Link>
          )}

          {/* The Journey */}
          {(isLandingPage || isHowItWorksPage) && (
            <Link to="/journey">
              <button className={`${secondaryButtonClass} ${
                isDark 
                  ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/50 text-indigo-300" 
                  : "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300 text-teal-700"
              }`}>
                <Sparkles className="w-4 h-4" />
                <span>The Journey</span>
              </button>
            </Link>
          )}

          {/* Login */}
          <Link to="/login">
            <button className={primaryButtonClass}>
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </Link>

          {/* Sign Up */}
          <Link to="/signup">
            <button className={accentButtonClass}>
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2.5 rounded-xl transition-all ${
            isDark
              ? "text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-teal-50 border border-teal-200"
          }`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`px-4 py-4 space-y-3 ${
          isDark
            ? "bg-gray-800/98 backdrop-blur-xl border-t border-gray-700"
            : "bg-white/98 backdrop-blur-xl border-t border-teal-100"
        }`}>
          {/* Dark Mode Toggle Mobile */}
          <button
            onClick={toggle}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-yellow-400 border border-gray-600"
                : "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* Home */}
          {(isAuthPage || isJourneyPage || isHowItWorksPage) && (
            <Link to="/" className="block">
              <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200"
                  : "bg-white hover:bg-teal-50 border border-teal-200 text-teal-700"
              }`}>
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
            </Link>
          )}

          {/* How It Works */}
          {isLandingPage && (
            <Link to="/how-it-works" className="block">
              <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200"
                  : "bg-white hover:bg-teal-50 border border-teal-200 text-teal-700"
              }`}>
                <BookOpen className="w-5 h-5" />
                <span>How It Works</span>
              </button>
            </Link>
          )}

          {/* The Journey */}
          {(isLandingPage || isHowItWorksPage) && (
            <Link to="/journey" className="block">
              <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/50 text-indigo-300"
                  : "bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-300 text-teal-700"
              }`}>
                <Sparkles className="w-5 h-5" />
                <span>The Journey ✨</span>
              </button>
            </Link>
          )}

          {/* Login */}
          <Link to="/login" className="block">
            <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
              isDark
                ? "bg-white hover:bg-gray-100 text-gray-900"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}>
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
          </Link>

          {/* Sign Up */}
          <Link to="/signup" className="block">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white rounded-xl font-semibold transition-all shadow-md">
              <UserPlus className="w-5 h-5" />
              <span>Sign Up Free</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;