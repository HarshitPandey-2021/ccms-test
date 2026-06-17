// user-portal/src/api.js - COMPLETE UPDATED FILE
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ============================================
// TOKEN MANAGEMENT
// ============================================

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const buffer = 5 * 60 * 1000;
    return expiryTime - now < buffer;
  } catch {
    return true;
  }
}

async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      return data.token;
    }
    return null;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // ✅ Use relative path for redirect
    window.location.href = "/login";
    return null;
  }
}

async function getAuthHeaders() {
  let token = localStorage.getItem("token");

  if (isTokenExpired(token)) {
    token = await refreshAccessToken();
    if (!token) {
      return { "Content-Type": "application/json" };
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apiCall(url, options = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      return res;
    }
    const retryHeaders = await getAuthHeaders();
    return fetch(url, {
      ...options,
      headers: { ...retryHeaders, ...(options.headers || {}) },
    });
  }

  return res;
}

async function handleResponse(res) {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "student" }),
  });
  return handleResponse(res);
}

export async function register(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

export async function getProfile() {
  try {
    const res = await apiCall(`${API_BASE}/profile`);
    return handleResponse(res);
  } catch {
    return null;
  }
}

export async function updateProfile(data) {
  const res = await apiCall(`${API_BASE}/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ✅ FIXED: Change Password Function
export async function changePassword(passwordData) {
  try {
    let token = localStorage.getItem("token");
    
    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
      if (!token) throw new Error("Authentication failed. Please login again.");
    }

    // ✅ Correct endpoint: /auth/change-password
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    });

    return handleResponse(res);
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
}

export async function getMyStats() {
  try {
    const res = await apiCall(`${API_BASE}/profile/stats`);
    return handleResponse(res);
  } catch {
    return { total: 0, pending: 0, inProgress: 0, resolved: 0 };
  }
}

// ============================================
// COMPLAINT FUNCTIONS
// ============================================

export async function getMyComplaints() {
  try {
    const res = await apiCall(`${API_BASE}/complaints/mine`);
    return handleResponse(res);
  } catch {
    return [];
  }
}

export async function getComplaintById(id) {
  try {
    const res = await apiCall(`${API_BASE}/complaints/${id}`);
    return handleResponse(res);
  } catch {
    return null;
  }
}

export async function submitComplaintWithFiles(formData) {
  try {
    let token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
      if (!token) throw new Error("Authentication failed");
    }

    const res = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(res);
  } catch (error) {
    throw error;
  }
}

export const submitComplaint = submitComplaintWithFiles;

export async function updateComplaint(id, formData) {
  try {
    let token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
      if (!token) throw new Error("Authentication failed");
    }

    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(res);
  } catch (error) {
    throw error;
  }
}

export async function submitFeedback(complaintId, feedbackData) {
  try {
    let token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      token = await refreshAccessToken();
      if (!token) throw new Error("Authentication failed");
    }

    const res = await fetch(`${API_BASE}/complaints/${complaintId}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedbackData),
    });

    return handleResponse(res);
  } catch (error) {
    throw error;
  }
}

// ============================================
// DEPARTMENT FUNCTIONS
// ============================================

export async function getDepartments() {
  try {
    const res = await apiCall(`${API_BASE}/departments`);
    return handleResponse(res);
  } catch {
    return [];
  }
}

// ============================================
// PDF UTILITIES
// ============================================

export function getViewablePdfUrl(url) {
  if (!url) return null;
  if (url.includes("raw/upload")) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;
  }
  return url;
}

export async function viewPdf(url) {
  if (!url) throw new Error("No PDF URL provided");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
    return blobUrl;
  } catch (error) {
    const viewerUrl = getViewablePdfUrl(url);
    if (viewerUrl && viewerUrl !== url) {
      window.open(viewerUrl, "_blank");
      return viewerUrl;
    }
    throw error;
  }
}

export async function downloadPdf(url, filename = "document.pdf") {
  if (!url) throw new Error("No PDF URL provided");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);

    return true;
  } catch (error) {
    throw error;
  }
}

// ============================================
// FORGOT PASSWORD FUNCTIONS (NEW)
// ============================================

// Step 1: Send OTP for password reset
export async function forgotPasswordSendOTP(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  return handleResponse(res);
}

// Step 2: Verify OTP
export async function forgotPasswordVerifyOTP(email, otp) {
  const res = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      email: email.trim().toLowerCase(),
      otp: otp.trim()
    }),
  });

  return handleResponse(res);
}

// Step 3: Reset password with token
export async function forgotPasswordReset(resetToken, newPassword) {
  const res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      resetToken,
      newPassword
    }),
  });

  return handleResponse(res);
}

// ============================================
// DEFAULT EXPORT
// ============================================

const api = {
  // Auth
  login,
  register,
  
  // Profile
  getProfile,
  updateProfile,
  changePassword,
  getMyStats,
  
  // Complaints
  getMyComplaints,
  getComplaintById,
  submitComplaintWithFiles,
  submitComplaint,
  updateComplaint,
  submitFeedback,
  
  // Departments
  getDepartments,
  
  // PDF
  getViewablePdfUrl,
  viewPdf,
  downloadPdf,
  
  // Forgot Password
  forgotPasswordSendOTP,
  forgotPasswordVerifyOTP,
  forgotPasswordReset,
};

export default api;