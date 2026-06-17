// src/pages/ForgotPassword.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  KeyRound,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer.jsx";
import {
  forgotPasswordSendOTP,
  forgotPasswordVerifyOTP,
  forgotPasswordReset,
} from "../api.js";

export default function ForgotPassword() {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();

  // Step management: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [resetToken, setResetToken] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState("");

  // OTP input refs
  const otpRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or next empty
    const lastIndex = Math.min(pastedData.length - 1, 5);
    otpRefs.current[lastIndex]?.focus();
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPasswordSendOTP(email.trim());
      setMaskedEmail(response.maskedEmail || email);
      setSuccess("OTP sent successfully! Check your email.");
      setResendCooldown(60);
      setStep(2);
   } catch (err) {
  // Check if it's a "not found" error
  if (err.message?.includes("No account found")) {
    setError("No account found with this email. Please check the email or register first.");
  } else if (err.message?.includes("Admin accounts")) {
    setError("This is an admin account. Please use the admin login page to reset your password.");
  } else {
    setError(err.message || "Failed to send OTP. Please try again.");
  }
}finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPasswordVerifyOTP(email.trim(), otpString);
      setResetToken(response.resetToken);
      setSuccess("OTP verified successfully!");
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwords.new || !passwords.confirm) {
      setError("Please fill in both password fields");
      return;
    }

    if (passwords.new.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordReset(resetToken, passwords.new);
      setStep(4);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setLoading(true);
    try {
      await forgotPasswordSendOTP(email.trim());
      setSuccess("New OTP sent successfully!");
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    setError("");
    setSuccess("");
    if (step === 2) {
      setStep(1);
      setOtp(["", "", "", "", "", ""]);
    } else if (step === 3) {
      setStep(2);
      setPasswords({ new: "", confirm: "" });
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((stepNum) => (
        <React.Fragment key={stepNum}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= stepNum
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                : isDark
                ? "bg-gray-700 text-gray-400"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step > stepNum ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              stepNum
            )}
          </div>
          {stepNum < 3 && (
            <div
              className={`w-12 h-1 rounded-full transition-all ${
                step > stepNum
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                  : isDark
                  ? "bg-gray-700"
                  : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Step labels
  const stepLabels = ["Enter Email", "Verify OTP", "New Password"];

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen flex items-center justify-center px-4 pt-20 pb-10 ${
          isDark
            ? "bg-gray-900"
            : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-1/4 left-1/4 w-96 h-96 ${
              isDark ? "bg-indigo-600/10" : "bg-indigo-200/30"
            } rounded-full blur-3xl`}
          />
          <div
            className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${
              isDark ? "bg-purple-600/10" : "bg-purple-200/30"
            } rounded-full blur-3xl`}
          />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div
            className={`${
              isDark
                ? "bg-gray-800/90 border-gray-700"
                : "bg-white/90 border-gray-200"
            } backdrop-blur-xl border rounded-3xl shadow-2xl p-8 transition-all duration-500`}
          >
            {/* Back Button (Steps 2 & 3) */}
            {step > 1 && step < 4 && (
              <button
                onClick={handleBack}
                className={`flex items-center gap-2 text-sm mb-4 ${
                  isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                } transition-colors`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                {step === 4 ? (
                  <ShieldCheck className="w-8 h-8 text-white" />
                ) : (
                  <KeyRound className="w-8 h-8 text-white" />
                )}
              </div>
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                } mb-2`}
              >
                {step === 4 ? "Password Reset!" : "Reset Password"}
              </h2>
              <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {step === 1 && "Enter your email to receive a verification code"}
                {step === 2 && `Enter the OTP sent to ${maskedEmail}`}
                {step === 3 && "Create a strong new password"}
                {step === 4 && "Your password has been successfully reset"}
              </p>
            </div>

            {/* Step Indicator (not on success) */}
            {step < 4 && (
              <>
                <StepIndicator />
                <p
                  className={`text-center text-sm mb-6 ${
                    isDark ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  {stepLabels[step - 1]}
                </p>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && step < 4 && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Input */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-3 text-center`}
                  >
                    Enter 6-digit OTP
                  </label>
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
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
                          isDark
                            ? "bg-gray-700/50 border-gray-600 text-white focus:border-indigo-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-indigo-500"
                        } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                        disabled={loading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    Didn't receive the code?{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-indigo-500">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resend OTP
                      </button>
                    )}
                  </p>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                      value={passwords.new}
                      onChange={(e) => {
                        setPasswords({ ...passwords, new: e.target.value });
                        setError("");
                      }}
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                        isDark
                          ? "text-gray-500 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      } transition-colors`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Minimum 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                      value={passwords.confirm}
                      onChange={(e) => {
                        setPasswords({ ...passwords, confirm: e.target.value });
                        setError("");
                      }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                        isDark
                          ? "text-gray-500 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      } transition-colors`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h3
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    All Done!
                  </h3>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    Your password has been reset successfully. You can now login
                    with your new password.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Footer Links (not on success) */}
            {step < 4 && (
              <div className="mt-6 text-center">
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    Login
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Bottom Note */}
          <p
            className={`text-center mt-6 text-sm ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
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