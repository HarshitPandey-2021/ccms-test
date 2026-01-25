// src/utils/constants.js

// ============================================
// CATEGORY GROUPS (For organized UI display)
// ============================================
export const CATEGORY_GROUPS = {
  'Infrastructure': [
    { id: 'electrical', label: 'Electrical Issues', icon: '⚡' },
    { id: 'plumbing', label: 'Plumbing/Water', icon: '🚿' },
    { id: 'furniture', label: 'Furniture', icon: '🪑' },
    { id: 'fan', label: 'Fan/AC', icon: '🌀' },
    { id: 'light', label: 'Lighting', icon: '💡' },
    { id: 'civil', label: 'Civil/Building', icon: '🏗️' },
  ],
  'IT & Technical': [
    { id: 'wifi', label: 'WiFi/Internet', icon: '📶' },
    { id: 'computer', label: 'Computer Lab', icon: '💻' },
    { id: 'projector', label: 'Projector/AV', icon: '📽️' },
  ],
  'Cleanliness': [
    { id: 'washroom', label: 'Washroom', icon: '🚻' },
    { id: 'cleaning', label: 'General Cleaning', icon: '🧹' },
    { id: 'water', label: 'Drinking Water', icon: '💧' },
  ],
  'Academic': [
    { id: 'academic', label: 'Academic Issues', icon: '📚' },
    { id: 'exam', label: 'Examination', icon: '📝' },
    { id: 'library', label: 'Library', icon: '📖' },
  ],
  'Safety & Security': [
    { id: 'harassment', label: 'Harassment', icon: '🛡️', sensitive: true },
    { id: 'ragging', label: 'Ragging', icon: '🚫', sensitive: true },
    { id: 'eve_teasing', label: 'Eve Teasing', icon: '⚠️', sensitive: true },
    { id: 'bullying', label: 'Bullying', icon: '😰', sensitive: true },
    { id: 'discrimination', label: 'Discrimination', icon: '⚖️', sensitive: true },
    { id: 'safety', label: 'Safety Concern', icon: '🆘', sensitive: true },
  ],
  'Other': [
    { id: 'hostel', label: 'Hostel Related', icon: '🏠' },
    { id: 'transport', label: 'Transport', icon: '🚌' },
    { id: 'canteen', label: 'Canteen/Food', icon: '🍽️' },
    { id: 'other', label: 'Other', icon: '📋' },
  ],
};

// ============================================
// FLAT CATEGORIES (For backward compatibility)
// ============================================
export const CATEGORIES = Object.values(CATEGORY_GROUPS)
  .flat()
  .map(c => c.label);

// Old simple categories (keep for backward compatibility)
export const SIMPLE_CATEGORIES = [
  'Fan',
  'Light', 
  'Projector',
  'Furniture',
  'Washroom',
  'Water',
  'Internet',
  'Other'
];

// ============================================
// SENSITIVE CATEGORIES
// ============================================
export const SENSITIVE_CATEGORIES = Object.values(CATEGORY_GROUPS)
  .flat()
  .filter(c => c.sensitive)
  .map(c => c.id);

// Also check by label for backend compatibility
export const SENSITIVE_CATEGORY_LABELS = [
  'Harassment',
  'Ragging', 
  'Eve Teasing',
  'Bullying',
  'Discrimination',
  'Safety Concern',
];

// Helper function to check if category is sensitive
export const isSensitiveCategory = (category) => {
  if (!category) return false;
  const lowerCategory = category.toLowerCase();
  
  // Check by ID
  if (SENSITIVE_CATEGORIES.includes(lowerCategory)) return true;
  
  // Check by label
  if (SENSITIVE_CATEGORY_LABELS.some(label => 
    lowerCategory.includes(label.toLowerCase())
  )) return true;
  
  // Check common keywords
  const sensitiveKeywords = ['harassment', 'ragging', 'eve', 'bully', 'discriminat', 'safety'];
  return sensitiveKeywords.some(keyword => lowerCategory.includes(keyword));
};

// ============================================
// PRIORITIES
// ============================================
export const PRIORITIES = ['Low', 'Medium', 'High'];

export const PRIORITY_COLORS = {
  'Low': 'green',
  'Medium': 'yellow', 
  'High': 'red'
};

export const PRIORITY_CONFIG = {
  Low: {
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-300 dark:border-green-700',
    icon: '🟢',
  },
  Medium: {
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    borderClass: 'border-yellow-300 dark:border-yellow-700',
    icon: '🟡',
  },
  High: {
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-300 dark:border-red-700',
    icon: '🔴',
  },
};

// ============================================
// STATUSES
// ============================================
export const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

export const STATUS_COLORS = {
  'Pending': 'blue',
  'Assigned': 'purple',
  'In Progress': 'yellow',
  'Resolved': 'green',
  'Rejected': 'red'
};

export const STATUS_CONFIG = {
  Pending: {
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-300 dark:border-blue-700',
    icon: '⏳',
  },
  Assigned: {
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-400',
    borderClass: 'border-purple-300 dark:border-purple-700',
    icon: '👤',
  },
  'In Progress': {
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    borderClass: 'border-yellow-300 dark:border-yellow-700',
    icon: '🔄',
  },
  Resolved: {
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-300 dark:border-green-700',
    icon: '✅',
  },
  Rejected: {
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-300 dark:border-red-700',
    icon: '❌',
  },
};

// ============================================
// FILE UPLOAD LIMITS
// ============================================
export const MAX_IMAGES = 3;
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_PDF_TYPE = 'application/pdf';

// ============================================
// CATEGORY TO DEPARTMENT MAPPING
// ============================================
export const CATEGORY_DEPARTMENT_MAP = {
  // Infrastructure -> Maintenance
  'electrical': 'Maintenance',
  'plumbing': 'Maintenance',
  'furniture': 'Maintenance',
  'fan': 'Maintenance',
  'light': 'Maintenance',
  'civil': 'Maintenance',
  
  // IT
  'wifi': 'IT Department',
  'computer': 'IT Department',
  'projector': 'IT Department',
  
  // Cleanliness
  'washroom': 'Housekeeping',
  'cleaning': 'Housekeeping',
  'water': 'Housekeeping',
  
  // Academic
  'academic': 'Academic',
  'exam': 'Examination Cell',
  'library': 'Library',
  
  // Sensitive - Special Cells
  'harassment': "Women's Cell",
  'eve_teasing': "Women's Cell",
  'safety': "Women's Cell",
  'ragging': 'Anti-Ragging Cell',
  'bullying': 'Anti-Ragging Cell',
  'discrimination': 'Grievance Cell',
  
  // Other
  'hostel': 'Hostel',
  'transport': 'Transport',
  'canteen': 'Canteen',
  'other': 'General',
};

// Get department for a category
export const getDepartmentForCategory = (categoryId) => {
  if (!categoryId) return 'General';
  const lowerCat = categoryId.toLowerCase().replace(/\s+/g, '_');
  return CATEGORY_DEPARTMENT_MAP[lowerCat] || 'General';
};

// ============================================
// COMPLAINT TYPES
// ============================================
export const COMPLAINT_TYPES = {
  GENERAL: 'general',
  SENSITIVE: 'sensitive',
  CONFIDENTIAL: 'confidential',
};

// Get complaint type based on category
export const getComplaintType = (category) => {
  if (isSensitiveCategory(category)) {
    return COMPLAINT_TYPES.CONFIDENTIAL;
  }
  return COMPLAINT_TYPES.GENERAL;
};