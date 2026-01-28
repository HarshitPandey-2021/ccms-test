// src/pages/SignupPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, Phone, Hash, AlertCircle, CheckCircle, Eye, EyeOff, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { requestRegistrationOTP, verifyOTPAndRegister, resendOTP } from "../api.js";
import { useDarkMode } from "../context/DarkModeContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer.jsx";

const getStudentGreeting = (rollNo, studentName, batch) => {
  const year = rollNo.substring(0, 2);
  const endYear = batch.split("-")[1];
  const firstName = studentName.split(" ")[0];

  let batchType = "";
  let emoji = "";

  if (year === "22") {
    batchType = "senior";
    emoji = "📚";
  } else if (year === "23") {
    batchType = "";
    emoji = "🎓";
  } else if (year === "24") {
    batchType = "lateral entry";
    emoji = "🚀";
  }

  const greeting = batchType
    ? `Let me guess... You're ${firstName}, ${batchType} student from B.Tech AI ${endYear} batch? ${emoji}`
    : `Let me guess... You're ${firstName} from B.Tech AI ${endYear} batch? ${emoji}`;

  return greeting;
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    roll: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [studentInfo, setStudentInfo] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  function handleOtpChange(index, value) {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

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

  async function handleRequestOTP(e) {
    e.preventDefault();
    setError("");
    setErrorDetails("");
    setSuccess("");

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
      return setError("Password must be at least 8 characters with a number and uppercase letter");
    }

    setLoading(true);
    try {
      const response = await requestRegistrationOTP(form.email.trim(), "", form.roll.trim());

      setStudentInfo({
        name: response.studentName,
        greeting: response.greeting,
        subtitle: response.subtitle,
        batch: response.batch,
      });

      const customGreeting = getStudentGreeting(form.roll.trim(), response.studentName, response.batch);

      setSuccess(customGreeting);
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.message || "Failed to verify roll number");
      setErrorDetails(err.details || "");

      if (err.errorType === "ALREADY_REGISTERED" && err.registeredEmail) {
        setErrorDetails(`${err.details}\n${err.registeredEmail}`);
      }
    } finally {
      setLoading(false);
    }
  }

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

      localStorage.setItem("token", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(response.user));

      setSuccess(response.message || "Account created successfully! 🎉");

      setTimeout(() => {
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

  function handleBackToForm() {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setErrorDetails("");
    setSuccess("");
    setStudentInfo(null);
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen flex items-center justify-center px-4 py-8 pt-20 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-200/30'} rounded-full blur-3xl`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDark ? 'bg-purple-600/10' : 'bg-purple-200/30'} rounded-full blur-3xl`} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className={`${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} backdrop-blur-xl border rounded-3xl shadow-2xl p-8 transition-all duration-500`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step === 1 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'} mb-4 shadow-lg transition-all`}>
                {step === 1 ? <UserPlus className="w-8 h-8 text-white" /> : <Mail className="w-8 h-8 text-white" />}
              </div>
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                {step === 1 ? "Student Registration" : "Verify Email"}
              </h2>
              {step === 1 && (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  For University of Lucknow students only
                </p>
              )}
              {step === 2 && studentInfo && (
                <div className="text-center">
                  <p className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {studentInfo.greeting}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {studentInfo.subtitle}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                    Code sent to <strong>{form.email}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className={`${isDark ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-300 text-red-700'} border-2 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 animate-shake`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{error}</p>
                  {errorDetails && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-red-500' : 'text-red-600'} whitespace-pre-line`}>
                      {errorDetails}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className={`${isDark ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-300 text-green-700'} border-2 px-4 py-3 rounded-xl mb-6 text-center animate-fadeIn`}>
                <CheckCircle className="w-5 h-5 inline-block mr-2" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            {/* STEP 1: REGISTRATION FORM */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                {/* Roll Number */}
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      name="roll"
                      placeholder="e.g., 2310013155037"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 font-mono ${
                        isDark
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                      onChange={handleChange}
                      value={form.roll}
                      required
                      autoFocus
                    />
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                    Enter your official university roll number
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      name="email"
                      type="email"
                      placeholder="your.email@gmail.com"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                        isDark
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                      onChange={handleChange}
                      value={form.email}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Phone Number <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                        isDark
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                      onChange={handleChange}
                      value={form.phone}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${
                        isDark
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                      onChange={handleChange}
                      value={form.password}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                    8+ characters with uppercase & number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${
                        isDark
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                      onChange={handleChange}
                      value={form.confirmPassword}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Roll Number...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Verify & Continue →</span>
                    </>
                  )}
                </button>

                {/* Footer */}
                <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-6`}>
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                    Login here
                  </Link>
                </p>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 text-center`}>
                    Enter 6-Digit Code
                  </label>
                  <div className="flex justify-center gap-2 mb-4">
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
                        className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl ${
                          isDark
                            ? 'bg-gray-700/50 border-gray-600 text-white focus:border-indigo-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                        } focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    📬 Check your inbox{" "}
                    <span className="text-orange-500 font-medium">(and spam folder! 🙈)</span>
                  </p>
                </div>

                {/* Resend Timer */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      Resend code in{" "}
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {resendTimer}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Resend Code
                    </button>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Your Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Verify & Create Account 🎉</span>
                    </>
                  )}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBackToForm}
                  disabled={loading}
                  className={`w-full py-3 border-2 ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700/30'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Form
                </button>
              </form>
            )}

            {/* Bottom Note */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Having trouble? Contact your Class Representative
              </p>
            </div>
          </div>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  );
}