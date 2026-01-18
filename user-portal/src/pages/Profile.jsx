// src/pages/Profile.jsx - STUDENT PORTAL (Admin-Style Design)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../api';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  RiUserFill,
  RiMailFill,
  RiPhoneFill,
  RiShieldUserFill,
  RiLogoutBoxRLine,
  RiEditLine,
  RiSaveLine,
  RiCloseLine,
  RiLockPasswordLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiEyeLine,
  RiEyeOffLine,
  RiBookOpenLine,
  RiIdCardLine,
} from 'react-icons/ri';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { success, error: showError } = useToast();

  const [profileData, setProfileData] = useState({
    name: 'Loading...',
    email: 'Loading...',
    phone: '',
    userId: 'Loading...',
    rollNo: '',
    role: 'Student',
    joinedDate: new Date(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ name: '', email: '', phone: '' });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize profile data
  useEffect(() => {
    const initProfile = async () => {
      setLoading(true);
      try {
        if (user) {
          const uiProfile = {
            name: user.name || 'Student User',
            email: user.email || 'student@campus.com',
            phone: user.phone || '',
            userId: user._id || user.id || 'N/A',
            rollNo: user.rollNo || '',
            role: user.role || 'Student',
            joinedDate: user.createdAt || new Date(),
          };

          setProfileData(uiProfile);
          setEditedData({
            name: uiProfile.name,
            email: uiProfile.email,
            phone: uiProfile.phone,
          });
        }
      } catch (err) {
        console.error('Profile init error:', err);
        showError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [user, showError]);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    success('Logged out successfully!');
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    try {
      // Validation
      if (!editedData.name.trim()) {
        showError('Name is required');
        return;
      }
      if (!editedData.email.trim()) {
        showError('Email is required');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedData.email)) {
        showError('Invalid email format');
        return;
      }
      if (editedData.phone && !/^[6-9]\d{9}$/.test(editedData.phone)) {
        showError('Invalid phone number (10 digits starting with 6-9)');
        return;
      }

      setSaving(true);
      const token = localStorage.getItem('token');

      const updateData = {
        name: editedData.name.trim(),
        email: editedData.email.trim(),
        phone: editedData.phone?.trim() || undefined,
      };

      const response = await api.updateProfile(updateData, token);

      // Update local state
      const updated = {
        ...profileData,
        name: editedData.name,
        email: editedData.email,
        phone: editedData.phone,
      };
      setProfileData(updated);
      setIsEditing(false);

      // Update auth context
      if (updateUser) {
        updateUser(response.user || updateData);
      }

      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'));

      success('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      showError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    });
    setIsEditing(false);
  };

// In Profile.jsx handleChangePassword function

const handleChangePassword = async () => {
  try {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showError('Please fill all password fields');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showError('New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('token');

    // ✅ Call with single object
    await api.changePassword({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });

    success('Password changed successfully!');
    setShowPasswordChange(false);
    setPasswords({ current: '', new: '', confirm: '' });
  } catch (err) {
    console.error('Change password error:', err);
    showError(err.response?.data?.message || err.message || 'Failed to change password');
  } finally {
    setSaving(false);
  }
};

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-8">
      {/* Page Title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <RiUserFill className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
            My Profile
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:sticky lg:top-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl mb-4">
                {profileData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 text-center">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                {profileData.role}
              </p>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                Active
              </span>
            </div>

            {/* Quick Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
              {/* User ID */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <RiIdCardLine className="h-4 w-4" />
                  User ID
                </span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 truncate bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs max-w-[120px]">
                  {profileData.userId.slice(-8)}
                </span>
              </div>

              {/* Roll Number */}
              {profileData.rollNo && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <RiBookOpenLine className="h-4 w-4" />
                    Roll No
                  </span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {profileData.rollNo}
                  </span>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <RiCheckboxCircleLine className="h-4 w-4" />
                  Active
                </span>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Joined</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">
                  {new Date(profileData.joinedDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all shadow-lg hover:shadow-xl"
            >
              <RiLogoutBoxRLine className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <RiShieldUserFill className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" />
                Profile Information
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <RiEditLine className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <RiSaveLine className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all text-sm"
                  >
                    <RiCloseLine className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RiUserFill className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold"
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    {profileData.name}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RiMailFill className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="font-mono text-sm sm:text-lg text-gray-900 dark:text-white bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-blue-200 dark:border-blue-800 break-all">
                    {profileData.email}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RiPhoneFill className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.phone}
                    onChange={(e) =>
                      setEditedData({ ...editedData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                ) : (
                  <div className="font-mono text-sm sm:text-lg text-gray-900 dark:text-white bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-green-200 dark:border-green-800">
                    {profileData.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Roll Number (Read-only) */}
              {profileData.rollNo && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <RiBookOpenLine className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    Roll Number
                  </label>
                  <div className="font-mono text-sm sm:text-lg text-gray-900 dark:text-white bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    {profileData.rollNo}
                  </div>
                </div>
              )}

              {/* Role */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RiShieldUserFill className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  Role & Access
                </label>
                <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 shadow-sm">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                  <span className="font-bold text-indigo-800 dark:text-indigo-200 text-base sm:text-lg capitalize">
                    {profileData.role}
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                    Student Access
                  </span>
                </div>
              </div>

              {/* Account Created */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RiCalendarLine className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  Account Created
                </label>
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl border border-purple-200 dark:border-purple-800 font-mono text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Joined </span>
                  <span className="font-semibold text-purple-800 dark:text-purple-200">
                    {formatDate(profileData.joinedDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Password & Security */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <RiLockPasswordLine className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                Password & Security
              </h3>
              <button
                onClick={() => setShowPasswordChange((prev) => !prev)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200 flex items-center gap-1"
              >
                {showPasswordChange ? (
                  <>
                    <RiCloseLine className="h-4 w-4" />
                    <span>Close</span>
                  </>
                ) : (
                  <>
                    <RiEditLine className="h-4 w-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>

            {showPasswordChange ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords({ ...passwords, current: e.target.value })
                        }
                        className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.current ? (
                          <RiEyeOffLine className="h-4 w-4" />
                        ) : (
                          <RiEyeLine className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords({ ...passwords, new: e.target.value })
                        }
                        className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.new ? (
                          <RiEyeOffLine className="h-4 w-4" />
                        ) : (
                          <RiEyeLine className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords({ ...passwords, confirm: e.target.value })
                        }
                        className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.confirm ? (
                          <RiEyeOffLine className="h-4 w-4" />
                        ) : (
                          <RiEyeLine className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <p className="font-semibold mb-1">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Minimum 6 characters</li>
                    <li>Must be different from current password</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswords({ current: '', new: '', confirm: '' });
                    }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    )}
                    Update Password
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For security reasons, use a strong password and avoid sharing your account with others.
                  Click "Change Password" to update your password.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You'll be redirected to the login page."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Profile;