// api.js
import {
  getAdminToken,
  getAdminRefreshToken,
  logoutAdmin,
} from "./utils/tokenUtils.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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
    const refreshToken = getAdminRefreshToken();
    if (!refreshToken) return null;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
      return data.token;
    }

    return null;
  } catch {
    logoutAdmin();
    
    // ✅ FIXED: Use relative path (works in any environment)
    window.location.href = "/login";
    return null;
  }
}
async function getAuthHeaders() {
  let token = getAdminToken();

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

  let res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      return res;
    }

    const retryHeaders = await getAuthHeaders();
    res = await fetch(url, {
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
    const message =
      data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ============================================
// COMPLAINTS
// ============================================

export async function getAllComplaints() {
  try {
    let res = await apiCall(`${API_BASE}/complaints/admin/all`);
    if (res.status === 404) {
      res = await apiCall(`${API_BASE}/complaints`);
    }

    const data = await handleResponse(res);
    if (Array.isArray(data)) {
      return data.map((c) => ({
        ...c,
        title: c.title || c.subject || "Untitled",
        createdAt: c.createdAt || c.submittedAt,
      }));
    }

    return data;
  } catch {
    return [];
  }
}

export async function getUnreadComplaints() {
  try {
    const res = await apiCall(`${API_BASE}/complaints/admin/unread`);
    return handleResponse(res);
  } catch {
    return [];
  }
}

export async function getStats() {
  const res = await apiCall(`${API_BASE}/complaints/admin/analytics`);
  return handleResponse(res);
}

export async function getComplaintById(id) {
  const routesToTry = [
    `${API_BASE}/complaints/admin/${id}`,
    `${API_BASE}/complaints/${id}`,
    `${API_BASE}/admin/complaints/${id}`,
    `${API_BASE}/complaints/details/${id}`,
  ];

  for (const route of routesToTry) {
    try {
      console.log(`🔍 Trying route: ${route}`);
      const res = await apiCall(route);
      const data = await handleResponse(res);
      console.log(`✅ Success with route: ${route}`);
      return data;
    } catch (error) {
      console.log(`❌ Failed route: ${route} - ${error.message}`);
    }
  }

  throw new Error('Complaint not found - all routes failed');
}

export async function updateComplaintStatus(id, status, adminRemarks, assignedTo = null) {
  const body = { status };
  if (adminRemarks) body.adminRemarks = adminRemarks;
  if (assignedTo) body.assignedTo = assignedTo;

  const routesToTry = [
    `${API_BASE}/complaints/admin/${id}/status`,
    `${API_BASE}/admin/complaints/${id}/status`,
  ];

  for (const route of routesToTry) {
    try {
      console.log(`🔍 Trying status update route: ${route}`);
      const res = await apiCall(route, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      const data = await handleResponse(res);
      console.log(`✅ Status update success with route: ${route}`);
      return data;
    } catch (error) {
      console.log(`❌ Failed route: ${route} - ${error.message}`);
    }
  }

  throw new Error('Failed to update status - all routes failed');
}

export async function updateComplaint(id, updates) {
  if (updates && Object.keys(updates).length === 1 && updates.status) {
    return updateComplaintStatus(id, updates.status);
  }

  const routesToTry = [
    `${API_BASE}/complaints/admin/${id}`,
    `${API_BASE}/admin/complaints/${id}`,
    `${API_BASE}/complaints/${id}`,
  ];

  for (const route of routesToTry) {
    try {
      console.log(`🔍 Trying edit route: ${route}`);
      const res = await apiCall(route, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(res);
      console.log(`✅ Edit success with route: ${route}`);
      return data;
    } catch (error) {
      console.log(`❌ Failed route: ${route} - ${error.message}`);
    }
  }

  throw new Error('Failed to update complaint - all routes failed');
}

export async function markComplaintAsRead(id) {
  const res = await apiCall(`${API_BASE}/complaints/admin/${id}/read`, {
    method: "PATCH",
  });
  return handleResponse(res);
}

export async function getTrends(days = 7) {
  const res = await apiCall(`${API_BASE}/complaints/admin/trends?days=${days}`);
  return handleResponse(res);
}


// ============================================
// DEPARTMENTS
// ============================================

export async function getDepartments() {
  try {
    const res = await apiCall(`${API_BASE}/departments`);
    return handleResponse(res);
  } catch {
    return { data: [] };
  }
}

export async function getDepartmentById(id) {
  const res = await apiCall(`${API_BASE}/departments/${id}`);
  return handleResponse(res);
}

export async function createDepartment(data) {
  const res = await apiCall(`${API_BASE}/departments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateDepartment(id, data) {
  const res = await apiCall(`${API_BASE}/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteDepartment(id) {
  const res = await apiCall(`${API_BASE}/departments/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ============================================
// STAFF (Add after Departments section)
// ============================================

export async function getStaff(departmentId = null) {
  try {
    const url = departmentId 
      ? `${API_BASE}/staff?department=${departmentId}`
      : `${API_BASE}/staff`;
    const res = await apiCall(url);
    return handleResponse(res);
  } catch {
    return { data: [] };
  }
}

export async function getStaffByDepartment(departmentId) {
  const res = await apiCall(`${API_BASE}/staff/department/${departmentId}`);
  return handleResponse(res);
}

export async function getStaffById(id) {
  const res = await apiCall(`${API_BASE}/staff/${id}`);
  return handleResponse(res);
}

export async function createStaff(data) {
  const res = await apiCall(`${API_BASE}/staff`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateStaff(id, data) {
  const res = await apiCall(`${API_BASE}/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteStaff(id) {
  const res = await apiCall(`${API_BASE}/staff/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ============================================
// COMPLAINT ASSIGNMENT
// ============================================

export async function assignComplaint(complaintId, staffId, priority = null, remarks = null) {
  const body = { staffId };
  if (priority) body.priority = priority;
  if (remarks) body.remarks = remarks;

  const res = await apiCall(`${API_BASE}/complaints/${complaintId}/assign`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function reassignComplaint(complaintId, staffId, reason = null) {
  const res = await apiCall(`${API_BASE}/complaints/${complaintId}/reassign`, {
    method: "PUT",
    body: JSON.stringify({ staffId, reason }),
  });
  return handleResponse(res);
}

export async function unassignComplaint(complaintId, reason = null) {
  const res = await apiCall(`${API_BASE}/complaints/${complaintId}/unassign`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}

export async function getStaffComplaints(staffId) {
  const res = await apiCall(`${API_BASE}/staff/${staffId}/complaints`);
  return handleResponse(res);
}

export async function getAssignmentStats() {
  const res = await apiCall(`${API_BASE}/complaints/admin/assignment-stats`);
  return handleResponse(res);
}

// ============================================
// PROFILE
// ============================================

export async function getProfile() {
  const res = await apiCall(`${API_BASE}/profile`);
  return handleResponse(res);
}

export async function updateProfile(data) {
  const res = await apiCall(`${API_BASE}/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function changePassword(currentPassword, newPassword) {
  const res = await apiCall(`${API_BASE}/auth/change-password`, {
    method: "PUT", // ✅ Changed from POST to PUT
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
}

// ============================================
// STUDENTS
// ============================================

export async function searchStudent(rollNo) {
  const res = await apiCall(`${API_BASE}/admin/students/search`, {
    method: "POST",
    body: JSON.stringify({ rollNo }),
  });
  return handleResponse(res);
}

export async function resetStudent(rollNo) {
  const res = await apiCall(`${API_BASE}/admin/students/reset`, {
    method: "POST",
    body: JSON.stringify({ rollNo }),
  });
  return handleResponse(res);

}


// ============================================
// ADMIN MANAGEMENT
// ============================================

export async function getAllAdmins() {
  const res = await apiCall(`${API_BASE}/admin/list`);
  return handleResponse(res);
}

export async function createAdmin(data) {
  const res = await apiCall(`${API_BASE}/admin/create`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateAdmin(id, data) {
  const res = await apiCall(`${API_BASE}/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteAdmin(id) {
  const res = await apiCall(`${API_BASE}/admin/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function getAdminStats() {
  const res = await apiCall(`${API_BASE}/admin/stats`);
  return handleResponse(res);
}

// ============================================
// ADMIN LOGS
// ============================================

export async function getAllLogs() {
  const res = await apiCall(`${API_BASE}/admin/logs`);
  return handleResponse(res);
}

export async function logout() {
  logoutAdmin();
}
// ============================================
// REVEAL ANONYMOUS IDENTITY (Super Admin Only)
// ============================================

export async function revealIdentity(complaintId) {
  const res = await apiCall(`${API_BASE}/complaints/${complaintId}/reveal-identity`, {
    method: "POST",
  });
  return handleResponse(res);
}


const api = {

  // Complaints
  getAllComplaints,
  getUnreadComplaints,
  getStats,
  getComplaintById,
  updateComplaintStatus,
  updateComplaint,
  markComplaintAsRead,
  getTrends,
    revealIdentity, // ✅ ADD THIS LINE
  
  // Complaint Assignment - NEW
  assignComplaint,
  reassignComplaint,
  unassignComplaint,
  getStaffComplaints,
  getAssignmentStats,
  
  // Departments
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  
  // Staff
  getStaff,
  getStaffByDepartment,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  
  // Profile
  getProfile,
  updateProfile,
  changePassword,
  
  // Students
  searchStudent,
  resetStudent,

    getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminStats,
  
  // Logs
  getAllLogs,
  logout,
};

export default api;