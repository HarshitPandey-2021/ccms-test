// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginApi } from "../api.js";
import { useDarkMode } from "../context/DarkModeContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer.jsx";

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_URL || "http://localhost:5173";
const USER_APP_URL = import.meta.env.VITE_STUDENT_URL || "http://localhost:3001";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function LoginPage() {
  const { isDark } = useDarkMode();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function buildUserAuthUrl(token, refreshToken, user) {
    const payload = {
      token,
      refreshToken: refreshToken || null,
      user,
      timestamp: Date.now(),
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    const base = USER_APP_URL.replace(/\/+$/, "");
    return `${base}/?auth=${encoded}`;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const resp = await loginApi(form.email.trim(), form.password, form.role);

      if (!resp || !resp.user || !resp.token) {
        setError("Invalid response from server.");
        return;
      }

      const { user, token, refreshToken } = resp;

      if (user.role === "admin") {
        const adminUser = {
          id: user.id || user._id?.toString() || user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        const codeResp = await fetch(`${API_BASE}/auth/admin-session-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            refreshToken: refreshToken || null,
            user: adminUser,
          }),
        });

        if (!codeResp.ok) {
          setError("Failed to create admin session. Please try again.");
          return;
        }

        const { code } = await codeResp.json();
        const adminUrl = `${ADMIN_APP_URL}?code=${code}`;
        window.location.href = adminUrl;
        return;
      }

      if (user.role === "student") {
        const studentUser = {
          id: user.id || user._id?.toString() || user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          roll: user.roll || null,
        };
        const url = buildUserAuthUrl(token, refreshToken || null, studentUser);
        window.location.href = url;
        return;
      }

      setError(`Unsupported role: ${user.role}`);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen flex items-center justify-center px-4 pt-20 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-200/30'} rounded-full blur-3xl`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDark ? 'bg-purple-600/10' : 'bg-purple-200/30'} rounded-full blur-3xl`} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className={`${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} backdrop-blur-xl border rounded-3xl shadow-2xl p-8 transition-all duration-500 hover:shadow-3xl`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Welcome Back
              </h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Login to access your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                      isDark
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                    } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                    onChange={handleChange}
                    value={form.email}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${
                      isDark
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                    } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                    onChange={handleChange}
                    value={form.password}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                  Login as
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "student", label: "Student", icon: "👨‍🎓" },
                    { value: "admin", label: "Admin", icon: "👨‍💼" },
                  ].map((role) => (
                    <label
                      key={role.value}
                      className={`flex-1 cursor-pointer ${
                        form.role === role.value
                          ? isDark
                            ? 'bg-indigo-600 border-indigo-500'
                            : 'bg-indigo-600 border-indigo-500'
                          : isDark
                          ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                          : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                      } border-2 rounded-xl p-3 transition-all`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={form.role === role.value}
                        onChange={handleChange}
                        disabled={loading}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">{role.icon}</span>
                        <span className={`font-medium ${form.role === role.value ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {role.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 space-y-3 text-center">
              {/* Forgot Password Link */}
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                <Link
                  to="/forgot-password"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </p>
              
              {/* Register Link */}
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                New user?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <p className={`text-center mt-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            🔒 Your data is protected with industry-standard encryption
          </p>
        </div>
      </div>
      <Footer />

      {/* Custom Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
}