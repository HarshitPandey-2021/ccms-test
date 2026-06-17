// admin/src/pages/AdminManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCloseLine,
  RiRefreshLine,
  RiShieldUserLine,
  RiBuildingLine,
  RiUserLine,
  RiMailLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiAdminLine,
  RiUserStarLine,
    RiKeyLine,  // ✅ ADD THIS
  RiTeamLine,
} from 'react-icons/ri';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../api';
import { getAdminUser } from '../utils/tokenUtils';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState(null);

    // ✅ ADD THESE NEW STATES
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resettingAdmin, setResettingAdmin] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const { success, error: showError } = useToast();
  const currentUser = getAdminUser();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminType: 'department',
    department: '',
    permissions: [],
  });

  // Admin Type Configurations
  const adminTypes = {
    super: {
      label: 'Super Admin',
      icon: RiShieldUserLine,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-300',
      description: 'Full system access and control',
    },
    department: {
      label: 'Department Admin',
      icon: RiBuildingLine,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-300',
      description: 'Manages specific department',
    },
    womens_cell: {
      label: "Women's Cell",
      icon: RiUserStarLine,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      textColor: 'text-pink-700 dark:text-pink-300',
      description: 'Handles sensitive complaints',
    },
    academic: {
      label: 'Academic Admin',
      icon: RiTeamLine,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-300',
      description: 'Academic & faculty matters',
    },
    anti_ragging: {
      label: 'Anti-Ragging',
      icon: RiAdminLine,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      textColor: 'text-orange-700 dark:text-orange-300',
      description: 'Ragging & discipline cases',
    },
  };

  // Fetch admins
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAllAdmins();
      const data = response?.data || response || [];
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admins:', err);
      showError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.getDepartments();
      const data = response?.data || response || [];
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.getAdminStats();
      setStats(response?.data || null);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    fetchDepartments();
    fetchStats();
  }, [fetchAdmins, fetchDepartments, fetchStats]);

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.departmentName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !filterType || admin.adminType === filterType;

    return matchesSearch && matchesType;
  });

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for new admin
  const handleAddNew = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      adminType: 'department',
      department: departments[0]?._id || '',
      permissions: [],
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      password: '', // Don't pre-fill password
      adminType: admin.adminType || 'department',
      department: admin.department?.toString() || admin.department || '',
      permissions: admin.permissions || [],
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError('Admin name is required');
      return;
    }

    if (!formData.email.trim()) {
      showError('Email is required');
      return;
    }

    if (!editingAdmin && !formData.password) {
      showError('Password is required for new admins');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (formData.adminType === 'department' && !formData.department) {
      showError('Please select a department');
      return;
    }

    const dataToSend = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      adminType: formData.adminType,
      department: formData.adminType === 'department' ? formData.department : null,
      permissions: formData.permissions,
    };

    // Only include password if provided
    if (formData.password) {
      dataToSend.password = formData.password;
    }

    try {
      setSubmitting(true);

      if (editingAdmin) {
        await api.updateAdmin(editingAdmin._id, dataToSend);
        success('Admin updated successfully');
      } else {
        await api.createAdmin(dataToSend);
        success('Admin created successfully');
      }

      setShowModal(false);
      fetchAdmins();
      fetchStats();
    } catch (err) {
      console.error('Error saving admin:', err);
      showError(err.message || 'Failed to save admin');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete admin
  const handleDeleteClick = (admin) => {
    setDeletingAdmin(admin);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAdmin) return;

    try {
      await api.deleteAdmin(deletingAdmin._id);
      success('Admin deleted successfully');
      setShowDeleteDialog(false);
      setDeletingAdmin(null);
      fetchAdmins();
      fetchStats();
    } catch (err) {
      console.error('Error deleting admin:', err);
      showError(err.message || 'Failed to delete admin');
    }
  };

    // ✅ ADD THIS FUNCTION
  // Reset password for another admin
  const handleResetPasswordClick = (admin) => {
    setResettingAdmin(admin);
    setResetPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = async () => {
    if (!resettingAdmin) return;

    if (!resetPasswordForm.newPassword || !resetPasswordForm.confirmPassword) {
      showError('Please fill in both password fields');
      return;
    }

    if (resetPasswordForm.newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      setResettingPassword(true);
     // REPLACE WITH:
console.log('🔑 Resetting password for:', resettingAdmin); // Debug
const adminIdToReset = resettingAdmin._id || resettingAdmin.id;
console.log('🆔 Admin ID:', adminIdToReset); // Debug

if (!adminIdToReset) {
  showError('Admin ID is missing');
  setResettingPassword(false);
  return;
}

await api.resetAdminPassword(adminIdToReset, resetPasswordForm.newPassword);
      success(`Password reset successfully for ${resettingAdmin.name}`);
      setShowResetPasswordModal(false);
      setResettingAdmin(null);
      setResetPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error resetting password:', err);
      showError(err.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
    setShowPassword(false);
  };

  // Get admin type badge
  const getAdminTypeBadge = (type) => {
    const config = adminTypes[type] || adminTypes.department;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Admin Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage admin accounts and permissions
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              fetchAdmins();
              fetchStats();
            }}
            disabled={loading}
            className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RiRefreshLine className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleAddNew}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            <RiAddLine className="h-5 w-5" />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <RiUserLine className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Admins</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <RiShieldUserLine className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.superAdmins}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Super Admins</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <RiBuildingLine className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.deptAdmins}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
                <RiUserStarLine className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.womensCell}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Women's Cell</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors min-w-[180px]"
        >
          <option value="">All Types</option>
          {Object.entries(adminTypes).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Admin List - Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || filterType ? 'No admins found' : 'No admins yet'}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const config = adminTypes[admin.adminType] || adminTypes.department;
                  const Icon = config.icon;
                  const isCurrentUser = admin._id === currentUser?.id || admin._id === currentUser?._id;

                  return (
                    <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-semibold`}>
                            {admin.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {admin.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAdminTypeBadge(admin.adminType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {admin.departmentName ? (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{admin.departmentName}</span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Reset Password Button */}
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleResetPasswordClick(admin)}
                              className="p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                              title="Reset Password"
                            >
                              <RiKeyLine className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            title="Edit"
                          >
                            <RiEditLine className="h-4 w-4" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleDeleteClick(admin)}
                              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <RiDeleteBinLine className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin List - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredAdmins.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <RiUserLine className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{searchQuery || filterType ? 'No admins found' : 'No admins yet'}</p>
          </div>
        ) : (
          filteredAdmins.map((admin) => {
            const config = adminTypes[admin.adminType] || adminTypes.department;
            const Icon = config.icon;
            const isCurrentUser = admin._id === currentUser?.id || admin._id === currentUser?._id;

            return (
              <div
                key={admin._id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-semibold`}>
                      {admin.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {admin.name}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs text-indigo-600">(You)</span>
                        )}
                      </p>
                      {getAdminTypeBadge(admin.adminType)}
                    </div>
                  </div>
                  

                  <div className="flex gap-1">
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleResetPasswordClick(admin)}
                        className="p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        title="Reset Password"
                      >
                        <RiKeyLine className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(admin)}
                      className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <RiEditLine className="h-4 w-4" />
                    </button>
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleDeleteClick(admin)}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <RiDeleteBinLine className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <RiMailLine className="h-4 w-4" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  {admin.departmentName && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <RiBuildingLine className="h-4 w-4" />
                      <span>{admin.departmentName}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Created: {new Date(admin.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Dr. Sharma"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., admin@college.edu"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password {!editingAdmin && <span className="text-red-500">*</span>}
                  {editingAdmin && <span className="text-gray-400 text-xs ml-1">(Leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingAdmin}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <RiEyeOffLine className="h-5 w-5" /> : <RiEyeLine className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Admin Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {Object.entries(adminTypes).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.adminType === key
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="adminType"
                          value={key}
                          checked={formData.adminType === key}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {config.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {config.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Department (only for department admins) */}
              {formData.adminType === 'department' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingAdmin ? 'Update' : 'Create Admin'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingAdmin(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete "${deletingAdmin?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />

            {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <RiKeyLine className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Reset Password
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setResettingAdmin(null);
                  setResetPasswordForm({ newPassword: '', confirmPassword: '' });
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Admin Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Resetting password for:
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                    {resettingAdmin?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {resettingAdmin?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {resettingAdmin?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={resetPasswordForm.newPassword}
                    onChange={(e) => setResetPasswordForm({ 
                      ...resetPasswordForm, 
                      newPassword: e.target.value 
                    })}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showResetPassword ? <RiEyeOffLine className="h-5 w-5" /> : <RiEyeLine className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm({ 
                      ...resetPasswordForm, 
                      confirmPassword: e.target.value 
                    })}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  ⚠️ The admin will need to use this new password to login. Make sure to communicate it securely.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setResettingAdmin(null);
                  setResetPasswordForm({ newPassword: '', confirmPassword: '' });
                }}
                disabled={resettingPassword}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPasswordSubmit}
                disabled={resettingPassword}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {resettingPassword ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RiKeyLine className="h-4 w-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;