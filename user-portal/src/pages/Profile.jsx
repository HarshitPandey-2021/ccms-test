// src/pages/Profile.jsx - COMPLETE EDIT PROFILE
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api';
import {
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiLockPasswordLine,
  RiEditLine,
  RiSaveLine,
  RiCloseLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShieldUserLine,
  RiCalendarLine,
  RiCheckLine,
  RiErrorWarningLine,
} from 'react-icons/ri';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';

      case 'phone':
        if (value && !/^[6-9]\d{9}$/.test(value)) return 'Invalid phone number (10 digits)';
        return '';

      case 'currentPassword':
        if (formData.newPassword && !value) return 'Current password required to change password';
        return '';

      case 'newPassword':
        if (value && value.length < 6) return 'Password must be at least 6 characters';
        if (value && value === formData.currentPassword) return 'New password must be different';
        return '';

      case 'confirmPassword':
        if (formData.newPassword && value !== formData.newPassword) return 'Passwords do not match';
        return '';

      default:
        return '';
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Validate all fields
  const validateAll = () => {
    const newErrors = {};
    
    newErrors.name = validateField('name', formData.name);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);

    // Password validation only if changing password
    if (formData.newPassword) {
      newErrors.currentPassword = validateField('currentPassword', formData.currentPassword);
      newErrors.newPassword = validateField('newPassword', formData.newPassword);
      newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v)
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  // Handle save
const handleSave = async () => {
  if (!validateAll()) {
    showError('Please fix all errors before saving');
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem('token');
    
    const updateData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || undefined,
    };

    // Add password fields if changing password
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    console.log('💾 Updating profile:', updateData); // ✅ Debug

    const response = await api.updateProfile(updateData, token);

    console.log('📥 Response:', response); // ✅ Debug

    // ✅ UPDATE AUTH CONTEXT
    if (updateUser) {
      updateUser(response.user || updateData);
    }

    // ✅ UPDATE LOCALSTORAGE IMMEDIATELY
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { 
      ...currentUser, 
      name: updateData.name,
      email: updateData.email,
      phone: updateData.phone 
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    console.log('✅ Updated user:', updatedUser); // ✅ Debug

    // ✅ FORCE PAGE RE-RENDER
    window.dispatchEvent(new Event('storage'));

    success('Profile updated successfully!');
    setEditMode(false);

    // Clear password fields
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    setTouched({});
    setErrors({});

    // ✅ FORCE REFRESH USER DATA
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (err) {
    console.error('❌ Update error:', err);
    showError(err.response?.data?.message || err.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};
  // Handle cancel
  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setTouched({});
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Get field status icon
  const getFieldStatus = (fieldName) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName]) {
      return <RiErrorWarningLine className="h-5 w-5 text-red-500" />;
    }
    if (formData[fieldName]) {
      return <RiCheckLine className="h-5 w-5 text-green-500" />;
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your account information and settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {user?.name || 'Student'}
                </h2>
                <p className="text-indigo-100 text-sm sm:text-base mb-2">
                  {user?.email}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {user?.rollNo && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-semibold">
                      <RiShieldUserLine className="h-4 w-4" />
                      {user.rollNo}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-semibold capitalize">
                    {user?.role || 'Student'}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <RiEditLine className="h-5 w-5" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <RiUserLine className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                Basic Information
              </h3>

              <div className="space-y-4 sm:space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  {editMode ? (
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                          touched.name && errors.name
                            ? 'border-red-500 focus:ring-red-500'
                            : touched.name
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {getFieldStatus('name')}
                      </div>
                      {touched.name && errors.name && (
                        <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                          <RiErrorWarningLine className="h-4 w-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-medium">
                      {user?.name || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiMailLine className="inline h-4 w-4 mr-1" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  {editMode ? (
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                          touched.email && errors.email
                            ? 'border-red-500 focus:ring-red-500'
                            : touched.email
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {getFieldStatus('email')}
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                          <RiErrorWarningLine className="h-4 w-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-medium">
                      {user?.email || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiPhoneLine className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  {editMode ? (
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="10-digit mobile number"
                        className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                          touched.phone && errors.phone
                            ? 'border-red-500 focus:ring-red-500'
                            : touched.phone && formData.phone
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {getFieldStatus('phone')}
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                          <RiErrorWarningLine className="h-4 w-4" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-medium">
                      {user?.phone || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Read-only fields */}
                {user?.rollNo && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Roll Number
                    </label>
                    <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-medium">
                      {user.rollNo}
                    </p>
                  </div>
                )}

                {/* Member Since - FORCE DISPLAY */}
<div>
  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
    <RiCalendarLine className="inline h-4 w-4 mr-1" />
    Member Since
  </label>
  <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-medium">
    {(() => {
      console.log('🔍 User object:', user); // ✅ Debug
      console.log('🔍 createdAt value:', user?.createdAt); // ✅ Debug
      
      if (!user?.createdAt) {
        return 'Date not available';
      }
      
      try {
        const date = new Date(user.createdAt);
        console.log('📅 Parsed date:', date); // ✅ Debug
        
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      } catch (error) {
        console.error('❌ Date parsing error:', error);
        return 'Invalid date';
      }
    })()}
  </p>
</div>
              </div>
            </div>

            {/* Change Password Section (Only in Edit Mode) */}
            {editMode && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <RiLockPasswordLine className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                  Change Password
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Leave blank if you don't want to change your password
                </p>

                <div className="space-y-4 sm:space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter current password"
                        className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                          touched.currentPassword && errors.currentPassword
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword.current ? (
                          <RiEyeOffLine className="h-5 w-5" />
                        ) : (
                          <RiEyeLine className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {touched.currentPassword && errors.currentPassword && (
                      <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                        <RiErrorWarningLine className="h-4 w-4" />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter new password (min 6 characters)"
                        className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                          touched.newPassword && errors.newPassword
                            ? 'border-red-500 focus:ring-red-500'
                            : touched.newPassword && formData.newPassword.length >= 6
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword.new ? (
                          <RiEyeOffLine className="h-5 w-5" />
                        ) : (
                          <RiEyeLine className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {touched.newPassword && errors.newPassword && (
                      <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                        <RiErrorWarningLine className="h-4 w-4" />
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Re-enter new password"
                        className={`w-full px-4 py-2.5 sm:py-3 pr-12 rounded-lg border-2 transition-all ${
                          touched.confirmPassword && errors.confirmPassword
                            ? 'border-red-500 focus:ring-red-500'
                            : touched.confirmPassword &&
                              formData.confirmPassword === formData.newPassword &&
                              formData.newPassword
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword.confirm ? (
                          <RiEyeOffLine className="h-5 w-5" />
                        ) : (
                          <RiEyeLine className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                        <RiErrorWarningLine className="h-4 w-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {editMode && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RiCloseLine className="h-5 w-5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || Object.keys(errors).some((key) => errors[key])}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <RiSaveLine className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <RiUserLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 capitalize">
                  {user?.role || 'Student'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <RiCheckLine className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                  Active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <RiCalendarLine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Joined</p>
                <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;