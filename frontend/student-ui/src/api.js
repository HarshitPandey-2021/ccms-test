// src/api.js - COMPLETE WITH WHITELIST + OTP FUNCTIONS

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function handleResponse(res) {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Create error with extra details
    const error = new Error(data?.message || `Request failed with status ${res.status}`);
    error.errorType = data?.errorType || null;
    error.details = data?.details || null;
    error.registeredEmail = data?.registeredEmail || null;
    error.waitTime = data?.waitTime || null;
    throw error;
  }

  return data;
}

// ==================== AUTH FUNCTIONS ====================

export async function loginApi(email, password, role) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  });

  return handleResponse(res);
}

// Legacy signup (without OTP) - Keep for backwards compatibility
export async function signupApi(name, roll, email, password, role) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, roll, email, password, role }),
  });

  return handleResponse(res);
}

// ==================== ✅ NEW: WHITELIST + OTP REGISTRATION ====================

// Step 1: Verify Roll Number & Request OTP
export async function requestRegistrationOTP(email, name, rollNo) {
  const res = await fetch(`${API_BASE}/auth/register/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      email: email.trim().toLowerCase(), 
      name: name?.trim() || "",
      rollNo: rollNo.trim()
    }),
  });

  return handleResponse(res);
}

// Step 2: Verify OTP and complete registration
export async function verifyOTPAndRegister(userData) {
  const res = await fetch(`${API_BASE}/auth/register/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userData.email?.trim().toLowerCase(),
      otp: userData.otp?.trim(),
      password: userData.password,
      phone: userData.phone?.trim() || null,
    }),
  });

  return handleResponse(res);
}

// Resend OTP (also requires rollNo for verification)
export async function resendOTP(email, rollNo) {
  const res = await fetch(`${API_BASE}/auth/register/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      email: email.trim().toLowerCase(),
      rollNo: rollNo.trim()
    }),
  });

  return handleResponse(res);
}

// ==================== PUBLIC API ====================

// Get public stats for landing page
export async function getLandingStatsApi() {
  try {
    const res = await fetch(`${API_BASE}/complaints/public/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(res);
  } catch (error) {
    console.error("Failed to fetch landing stats:", error);
    // Return fallback values if API fails
    return {
      totalResolved: 1200,
      avgResponseTime: "24 Hrs",
      satisfactionRate: 95,
    };
  }
}