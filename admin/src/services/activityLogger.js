// src/services/activityLogger.js
// Enhanced Activity Logger with Human-Readable Descriptions

import { getAdminUser } from "../utils/tokenUtils";

const ACTIVITY_LOG_KEY = "ccms-activity-logs";
const MAX_LOGS = 500;

// ============================================
// ACTIVITY TYPES WITH EMOJIS & DESCRIPTIONS
// ============================================

export const ACTIVITY_TYPES = {
  // Auth
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  
  // Complaints
  COMPLAINT_VIEW: "COMPLAINT_VIEW",
  COMPLAINT_CREATE: "COMPLAINT_CREATE",
  STATUS_CHANGE: "STATUS_CHANGE",
  COMPLAINT_ASSIGN: "COMPLAINT_ASSIGN",
  COMPLAINT_RESOLVE: "COMPLAINT_RESOLVE",
  COMPLAINT_REJECT: "COMPLAINT_REJECT",
  COMPLAINT_EXPORT: "COMPLAINT_EXPORT",
  
  // Admin Actions
  ADMIN_CREATE: "ADMIN_CREATE",
  ADMIN_UPDATE: "ADMIN_UPDATE",
  ADMIN_DELETE: "ADMIN_DELETE",
  ADMIN_PASSWORD_RESET: "ADMIN_PASSWORD_RESET",
  STUDENT_RESET: "STUDENT_RESET",
  REVEAL_IDENTITY: "REVEAL_IDENTITY",
  
  // Department & Staff
  DEPARTMENT_CREATE: "DEPARTMENT_CREATE",
  DEPARTMENT_UPDATE: "DEPARTMENT_UPDATE",
  DEPARTMENT_DELETE: "DEPARTMENT_DELETE",
  STAFF_CREATE: "STAFF_CREATE",
  STAFF_UPDATE: "STAFF_UPDATE",
  STAFF_DELETE: "STAFF_DELETE",
  
  // UI Actions
  FILTER_APPLY: "FILTER_APPLY",
  SEARCH: "SEARCH",
  BULK_ACTION: "BULK_ACTION",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  SETTINGS_CHANGE: "SETTINGS_CHANGE",
  PAGE_VIEW: "PAGE_VIEW",
};

// ============================================
// ACTIVITY METADATA (Icons, Colors, Descriptions)
// ============================================

const ACTIVITY_META = {
  [ACTIVITY_TYPES.LOGIN]: {
    emoji: "🔐",
    color: "emerald",
    category: "Auth",
    verb: "logged in",
  },
  [ACTIVITY_TYPES.LOGOUT]: {
    emoji: "👋",
    color: "gray",
    category: "Auth",
    verb: "logged out",
  },
  [ACTIVITY_TYPES.PASSWORD_CHANGE]: {
    emoji: "🔑",
    color: "amber",
    category: "Security",
    verb: "changed password",
  },
  [ACTIVITY_TYPES.COMPLAINT_VIEW]: {
    emoji: "👁️",
    color: "blue",
    category: "Complaint",
    verb: "viewed",
  },
  [ACTIVITY_TYPES.COMPLAINT_CREATE]: {
    emoji: "📝",
    color: "indigo",
    category: "Complaint",
    verb: "created complaint",
  },
  [ACTIVITY_TYPES.STATUS_CHANGE]: {
    emoji: "🔄",
    color: "purple",
    category: "Complaint",
    verb: "changed status",
  },
  [ACTIVITY_TYPES.COMPLAINT_ASSIGN]: {
    emoji: "👤",
    color: "cyan",
    category: "Complaint",
    verb: "assigned",
  },
  [ACTIVITY_TYPES.COMPLAINT_RESOLVE]: {
    emoji: "✅",
    color: "green",
    category: "Complaint",
    verb: "resolved",
  },
  [ACTIVITY_TYPES.COMPLAINT_REJECT]: {
    emoji: "❌",
    color: "red",
    category: "Complaint",
    verb: "rejected",
  },
  [ACTIVITY_TYPES.COMPLAINT_EXPORT]: {
    emoji: "📥",
    color: "teal",
    category: "Export",
    verb: "exported",
  },
  [ACTIVITY_TYPES.ADMIN_CREATE]: {
    emoji: "👤➕",
    color: "green",
    category: "Admin",
    verb: "created admin",
  },
  [ACTIVITY_TYPES.ADMIN_UPDATE]: {
    emoji: "✏️",
    color: "blue",
    category: "Admin",
    verb: "updated admin",
  },
  [ACTIVITY_TYPES.ADMIN_DELETE]: {
    emoji: "🗑️",
    color: "red",
    category: "Admin",
    verb: "deleted admin",
  },
  [ACTIVITY_TYPES.ADMIN_PASSWORD_RESET]: {
    emoji: "🔐",
    color: "amber",
    category: "Admin",
    verb: "reset password for",
  },
  [ACTIVITY_TYPES.STUDENT_RESET]: {
    emoji: "🎓",
    color: "orange",
    category: "Student",
    verb: "reset student",
  },
  [ACTIVITY_TYPES.REVEAL_IDENTITY]: {
    emoji: "🕵️",
    color: "red",
    category: "Security",
    verb: "revealed identity of",
  },
  [ACTIVITY_TYPES.DEPARTMENT_CREATE]: {
    emoji: "🏢➕",
    color: "indigo",
    category: "Department",
    verb: "created department",
  },
  [ACTIVITY_TYPES.DEPARTMENT_UPDATE]: {
    emoji: "🏢✏️",
    color: "blue",
    category: "Department",
    verb: "updated department",
  },
  [ACTIVITY_TYPES.DEPARTMENT_DELETE]: {
    emoji: "🏢🗑️",
    color: "red",
    category: "Department",
    verb: "deleted department",
  },
  [ACTIVITY_TYPES.STAFF_CREATE]: {
    emoji: "👷➕",
    color: "green",
    category: "Staff",
    verb: "added staff member",
  },
  [ACTIVITY_TYPES.STAFF_UPDATE]: {
    emoji: "👷✏️",
    color: "blue",
    category: "Staff",
    verb: "updated staff",
  },
  [ACTIVITY_TYPES.STAFF_DELETE]: {
    emoji: "👷🗑️",
    color: "red",
    category: "Staff",
    verb: "removed staff",
  },
  [ACTIVITY_TYPES.FILTER_APPLY]: {
    emoji: "🔍",
    color: "slate",
    category: "UI",
    verb: "filtered",
  },
  [ACTIVITY_TYPES.SEARCH]: {
    emoji: "🔎",
    color: "slate",
    category: "UI",
    verb: "searched for",
  },
  [ACTIVITY_TYPES.BULK_ACTION]: {
    emoji: "📦",
    color: "purple",
    category: "Bulk",
    verb: "performed bulk action",
  },
  [ACTIVITY_TYPES.PROFILE_UPDATE]: {
    emoji: "👤",
    color: "blue",
    category: "Profile",
    verb: "updated profile",
  },
  [ACTIVITY_TYPES.PAGE_VIEW]: {
    emoji: "📄",
    color: "gray",
    category: "Navigation",
    verb: "visited",
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getCurrentAdmin = () => {
  const adminUser = getAdminUser();
  if (adminUser && adminUser.email) {
    return {
      name: adminUser.name || adminUser.email.split("@")[0] || "Admin",
      email: adminUser.email,
      role: adminUser.adminType || adminUser.role || "admin",
      userId: adminUser.id || adminUser._id || adminUser.userId || "unknown",
    };
  }

  return {
    name: "System Admin",
    email: "admin@ccms.local",
    role: "admin",
    userId: `session-${Date.now()}`,
  };
};

const getDeviceInfo = () => ({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  screenSize: `${window.screen.width}x${window.screen.height}`,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  isMobile: window.innerWidth < 768,
});

const getSessionId = () => {
  let sessionId = sessionStorage.getItem("ccms-session-id");
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem("ccms-session-id", sessionId);
  }
  return sessionId;
};

// ============================================
// GENERATE HUMAN-READABLE DESCRIPTION
// ============================================

const generateDescription = (type, details = {}) => {
  const meta = ACTIVITY_META[type] || { emoji: "📋", verb: "performed action" };
  
  switch (type) {
    // Auth
    case ACTIVITY_TYPES.LOGIN:
      return `${meta.emoji} Logged into the admin dashboard`;
    
    case ACTIVITY_TYPES.LOGOUT:
      return `${meta.emoji} Logged out of the dashboard`;
    
    case ACTIVITY_TYPES.PASSWORD_CHANGE:
      return `${meta.emoji} Changed their account password`;
    
    // Complaints
    case ACTIVITY_TYPES.COMPLAINT_VIEW:
      if (details.complaintId) {
        return `${meta.emoji} Viewed complaint #${details.complaintId}`;
      }
      return `${meta.emoji} Viewed ${details.page || 'complaints page'}`;
    
    case ACTIVITY_TYPES.STATUS_CHANGE:
      const from = details.previousStatus || details.from || '?';
      const to = details.newStatus || details.to || '?';
      const cId = details.complaintId ? ` #${details.complaintId}` : '';
      return `${meta.emoji} Changed status${cId}: ${from} → ${to}`;
    
    case ACTIVITY_TYPES.COMPLAINT_ASSIGN:
      return `${meta.emoji} Assigned complaint #${details.complaintId || 'N/A'} to ${details.assignedTo || details.staffName || 'staff'}`;
    
    case ACTIVITY_TYPES.COMPLAINT_RESOLVE:
      return `${meta.emoji} Resolved complaint #${details.complaintId || 'N/A'}${details.remarks ? ` - "${details.remarks.substring(0, 30)}..."` : ''}`;
    
    case ACTIVITY_TYPES.COMPLAINT_REJECT:
      return `${meta.emoji} Rejected complaint #${details.complaintId || 'N/A'}${details.reason ? ` - "${details.reason.substring(0, 30)}..."` : ''}`;
    
    case ACTIVITY_TYPES.COMPLAINT_EXPORT:
      return `${meta.emoji} Exported ${details.count || 'multiple'} complaints to ${details.format || 'CSV'}`;
    
    // Admin Management
    case ACTIVITY_TYPES.ADMIN_CREATE:
      return `${meta.emoji} Created new admin: ${details.adminName || details.name || 'Unknown'} (${details.adminType || 'admin'})`;
    
    case ACTIVITY_TYPES.ADMIN_UPDATE:
      return `${meta.emoji} Updated admin: ${details.adminName || details.name || 'Unknown'}`;
    
    case ACTIVITY_TYPES.ADMIN_DELETE:
      return `${meta.emoji} Deleted admin: ${details.adminName || details.name || 'Unknown'}`;
    
    case ACTIVITY_TYPES.ADMIN_PASSWORD_RESET:
      return `${meta.emoji} Reset password for admin: ${details.targetName || details.adminName || 'Unknown'}`;
    
    // Student Management
    case ACTIVITY_TYPES.STUDENT_RESET:
      return `${meta.emoji} Reset student registration: ${details.studentName || ''} (${details.rollNo || 'N/A'})`;
    
    case ACTIVITY_TYPES.REVEAL_IDENTITY:
      return `${meta.emoji} Revealed anonymous identity for complaint #${details.complaintId || 'N/A'}`;
    
    // Department
    case ACTIVITY_TYPES.DEPARTMENT_CREATE:
      return `${meta.emoji} Created department: ${details.departmentName || details.name || 'Unknown'}`;
    
    case ACTIVITY_TYPES.DEPARTMENT_UPDATE:
      return `${meta.emoji} Updated department: ${details.departmentName || details.name || 'Unknown'}`;
    
    case ACTIVITY_TYPES.DEPARTMENT_DELETE:
      return `${meta.emoji} Deleted department: ${details.departmentName || details.name || 'Unknown'}`;
    
    // Staff
    case ACTIVITY_TYPES.STAFF_CREATE:
      return `${meta.emoji} Added staff: ${details.staffName || details.name || 'Unknown'} to ${details.department || 'a department'}`;
    
    case ACTIVITY_TYPES.STAFF_UPDATE:
      return `${meta.emoji} Updated staff: ${details.staffName || details.name || 'Unknown'}`;
    
    case ACTIVITY_TYPES.STAFF_DELETE:
      return `${meta.emoji} Removed staff: ${details.staffName || details.name || 'Unknown'}`;
    
    // UI Actions
    case ACTIVITY_TYPES.FILTER_APPLY:
      return `${meta.emoji} Applied filter: ${details.filter || details.filterType || 'custom'}`;
    
    case ACTIVITY_TYPES.SEARCH:
      return `${meta.emoji} Searched for: "${details.query || details.searchTerm || '...'}"`;
    
    case ACTIVITY_TYPES.BULK_ACTION:
      return `${meta.emoji} Bulk action: ${details.action || 'processed'} ${details.count || 'multiple'} items`;
    
    case ACTIVITY_TYPES.PROFILE_UPDATE:
      return `${meta.emoji} Updated their profile${details.field ? ` (${details.field})` : ''}`;
    
    case ACTIVITY_TYPES.PAGE_VIEW:
      return `${meta.emoji} Visited ${details.page || 'a page'}`;
    
    default:
      return `${meta.emoji} ${meta.verb}: ${JSON.stringify(details).substring(0, 50)}`;
  }
};

// ============================================
// MAIN LOG FUNCTION
// ============================================

export const logActivity = (type, details = {}) => {
  try {
    const admin = getCurrentAdmin();
    const device = getDeviceInfo();
    const meta = ACTIVITY_META[type] || { emoji: "📋", color: "gray", category: "Other" };

    const logEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      
      // Human-readable description
      description: generateDescription(type, details),
      
      // Metadata
      meta: {
        emoji: meta.emoji,
        color: meta.color,
        category: meta.category,
      },
      
      // Admin info
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        userId: admin.userId,
      },
      
      // Raw details for debugging
      details,
      
      // Context
      context: {
        url: window.location.pathname,
        page: window.location.pathname.split('/').pop() || 'dashboard',
      },
      
      // Device
      device: {
        platform: device.platform,
        screenSize: device.screenSize,
        isMobile: device.isMobile,
      },
      
      sessionId: getSessionId(),
    };

    const logs = getAllLogs();
    logs.unshift(logEntry);
    const trimmedLogs = logs.slice(0, MAX_LOGS);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmedLogs));

    // Console log for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Activity: ${logEntry.description}`);
    }

    return logEntry;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getAllLogs = () => {
  try {
    const logs = localStorage.getItem(ACTIVITY_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
};

export const clearAllLogs = () => {
  localStorage.removeItem(ACTIVITY_LOG_KEY);
  return true;
};

export const getLogStatistics = (logs = null) => {
  const allLogs = logs || getAllLogs();
  const stats = {
    total: allLogs.length,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byType: {},
    byCategory: {},
    byAdmin: {},
  };

  if (!allLogs.length) return stats;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  allLogs.forEach((log) => {
    const logDate = new Date(log.timestamp);

    if (logDate >= todayStart) stats.today++;
    if (logDate >= weekStart) stats.thisWeek++;
    if (logDate >= monthStart) stats.thisMonth++;

    stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    
    const category = log.meta?.category || 'Other';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    const adminKey = log.admin?.email || 'unknown';
    stats.byAdmin[adminKey] = (stats.byAdmin[adminKey] || 0) + 1;
  });

  return stats;
};

export const exportLogsToCSV = (logs = null) => {
  const logsToExport = logs || getAllLogs();
  if (!logsToExport.length) {
    alert("No logs to export");
    return;
  }

  const headers = [
    "Timestamp",
    "Activity",
    "Category",
    "Admin Name",
    "Admin Email",
    "Details",
    "Page",
  ];

  const rows = logsToExport.map((log) => [
    new Date(log.timestamp).toLocaleString("en-IN"),
    log.description || log.type,
    log.meta?.category || 'Other',
    log.admin?.name || 'Unknown',
    log.admin?.email || 'N/A',
    JSON.stringify(log.details || {}),
    log.context?.page || 'N/A',
  ]);

  let csvContent = headers.join(",") + "\n";
  rows.forEach((row) => {
    csvContent += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const filename = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getActivityMeta = (type) => {
  return ACTIVITY_META[type] || { emoji: "📋", color: "gray", category: "Other", verb: "action" };
};

export const initializeActivityLogger = () => {
  // Reserved for future initialization
};