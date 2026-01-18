// src/pages/SignupPage.jsx - WITH WHITELIST + OTP VERIFICATION

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestRegistrationOTP, verifyOTPAndRegister, resendOTP } from "../api.js";

export default function SignupPage() {
  const navigate = useNavigate();
  
  // Steps: 1 = Form, 2 = OTP Verification
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    roll: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  
  // Student info from whitelist (received after roll verification)
  const [studentInfo, setStudentInfo] = useState(null);
  
  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Resend timer
  const [resendTimer, setResendTimer] = useState(0);
  
  // Countdown effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setErrorDetails("");
  }

  // OTP Input Handlers
  function handleOtpChange(index, value) {
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      otpRefs.current[5]?.focus();
    }
  }

  function isStrongPassword(pwd) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pwd);
  }

  // Step 1: Verify Roll Number & Request OTP
  async function handleRequestOTP(e) {
    e.preventDefault();
    setError("");
    setErrorDetails("");
    setSuccess("");

    // Validation
    if (!form.roll.trim()) {
      return setError("Roll number is required");
    }
    if (!form.email.trim()) {
      return setError("Email is required");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (!isStrongPassword(form.password)) {
      return setError(
        "Password must be at least 8 characters with a number and uppercase letter"
      );
    }

    setLoading(true);
    try {
      const response = await requestRegistrationOTP(
        form.email.trim(), 
        "", // Name comes from whitelist now
        form.roll.trim()
      );
      
      // Save student info from response
      setStudentInfo({
        name: response.studentName,
        greeting: response.greeting,
        subtitle: response.subtitle,
        batch: response.batch,
      });
      
      setSuccess(response.greeting || "Verification code sent!");
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.message || "Failed to verify roll number");
      setErrorDetails(err.details || "");
      
      // Special handling for already registered
      if (err.errorType === "ALREADY_REGISTERED" && err.registeredEmail) {
        setErrorDetails(`${err.details}\n${err.registeredEmail}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP & Register
  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError("");
    setErrorDetails("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return setError("Please enter the complete 6-digit code");
    }

    setLoading(true);
    try {
      const response = await verifyOTPAndRegister({
        email: form.email.trim(),
        otp: otpString,
        password: form.password,
        phone: form.phone.trim() || null,
      });

      // Save tokens
      localStorage.setItem("token", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(response.user));

      setSuccess(response.message || "Account created successfully!");
      
      // Show success for a moment then redirect
      setTimeout(() => {
        // Redirect to student dashboard
        const USER_APP_URL = import.meta.env.VITE_STUDENT_URL || "http://localhost:3001";
        
        const payload = {
          token: response.token,
          refreshToken: response.refreshToken || null,
          user: response.user,
          timestamp: Date.now(),
        };
        
        const encoded = encodeURIComponent(JSON.stringify(payload));
        window.location.href = `${USER_APP_URL}/?auth=${encoded}`;
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Invalid verification code");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOTP() {
    if (resendTimer > 0) return;
    
    setError("");
    setErrorDetails("");
    setLoading(true);
    try {
      await resendOTP(form.email.trim(), form.roll.trim());
      setSuccess("New verification code sent!");
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend code");
      if (err.waitTime) {
        setResendTimer(err.waitTime);
      }
    } finally {
      setLoading(false);
    }
  }

  // Go back to form
  function handleBackToForm() {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setErrorDetails("");
    setSuccess("");
    setStudentInfo(null);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, rgba(192,38,211,0.15), rgba(14,165,233,0.12), rgba(0,128,128,0.10))",
      }}
    >
      <div
        className="p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.75))",
        }}
      >
        {/* Header */}
        <h2
          className="text-3xl font-bold text-center mb-2"
          style={{
            background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {step === 1 ? "Student Registration" : "Verify Email"}
        </h2>
        
        {/* Subtitle based on step */}
        {step === 1 && (
          <p className="text-center text-gray-600 text-sm mb-4">
            Only University of Lucknow B.Tech AI students can register
          </p>
        )}
        
        {step === 2 && studentInfo && (
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-gray-800">
              {studentInfo.greeting}
            </p>
            <p className="text-sm text-gray-600">
              {studentInfo.subtitle}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Code sent to <strong>{form.email}</strong>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            <p className="font-medium">{error}</p>
            {errorDetails && (
              <p className="text-red-500 text-xs mt-1 whitespace-pre-line">
                {errorDetails}
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-center text-sm">
            {success}
          </div>
        )}

        {/* ==================== STEP 1: REGISTRATION FORM ==================== */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4 text-gray-800">
            
            {/* Roll Number - FIRST and REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                name="roll"
                placeholder="e.g., 2310013155001"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#c026d3] focus:border-transparent outline-none transition-all font-mono"
                onChange={handleChange}
                value={form.roll}
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your official university roll number
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="your.email@gmail.com"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent outline-none transition-all"
                onChange={handleChange}
                value={form.email}
                required
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent outline-none transition-all"
                onChange={handleChange}
                value={form.phone}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="Create a strong password"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#c026d3] focus:border-transparent outline-none transition-all"
                onChange={handleChange}
                value={form.password}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                8+ characters with uppercase & number
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent outline-none transition-all"
                onChange={handleChange}
                value={form.confirmPassword}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-6"
              style={{
                background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Verifying Roll Number...
                </span>
              ) : (
                "Verify & Continue →"
              )}
            </button>

            <p className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold hover:underline"
                style={{ color: "#c026d3" }}
              >
                Login here
              </Link>
            </p>
          </form>
        )}

        {/* ==================== STEP 2: OTP VERIFICATION ==================== */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            
            {/* Verified Badge */}
            <div className="text-center">
              <div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-2"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(14,165,233,0.1))",
                }}
              >
                <span className="text-4xl">✉️</span>
              </div>
              
              {studentInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 inline-block">
                  <p className="text-green-700 text-sm font-medium">
                    ✓ Verified: {studentInfo.name}
                  </p>
                  <p className="text-green-600 text-xs">
                    {studentInfo.batch}
                  </p>
                </div>
              )}
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#c026d3] focus:ring-2 focus:ring-[#c026d3]/20 outline-none transition-all"
                  style={{
                    background: digit ? "linear-gradient(135deg, rgba(192,38,211,0.05), rgba(14,165,233,0.05))" : "white"
                  }}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend code in{" "}
                  <span className="font-semibold" style={{ color: "#c026d3" }}>
                    {resendTimer}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm font-medium hover:underline disabled:opacity-50"
                  style={{ color: "#0ea5e9" }}
                >
                  Didn't receive code? Resend
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full text-white py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: "linear-gradient(90deg,#c026d3,#0ea5e9,#008080)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating Your Account...
                </span>
              ) : (
                "Verify & Create Account 🎉"
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={handleBackToForm}
              disabled={loading}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              ← Back to Form
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            🔒 Only B.Tech AI students (2023-2027 batches) can register
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">
            Contact your CR if you face any issues
          </p>
        </div>
      </div>
    </div>
  );
}