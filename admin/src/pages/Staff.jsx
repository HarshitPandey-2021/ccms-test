// admin/src/pages/Staff.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCloseLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiRefreshLine,
  RiFilterLine,
  RiShieldUserLine,
  RiToolsLine,
  RiBuildingLine,
} from 'react-icons/ri';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../api';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Worker',
    department: '',
  });

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

  // Fetch staff
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getStaff(filterDept || undefined);
      const data = response?.data || response || [];
      setStaffList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      showError('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  }, [filterDept, showError]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Filter staff
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.departmentName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !filterRole || staff.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for new staff
  const handleAddNew = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Worker',
      department: departments[0]?._id || '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role: staff.role || 'Worker',
      department: staff.department?.toString() || staff.department || '',
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError('Staff name is required');
      return;
    }

    if (!formData.email.trim()) {
      showError('Email is required');
      return;
    }

    if (!formData.department) {
      showError('Please select a department');
      return;
    }

    try {
      setSubmitting(true);

      if (editingStaff) {
        await api.updateStaff(editingStaff._id, formData);
        success('Staff member updated successfully');
      } else {
        await api.createStaff(formData);
        success('Staff member created successfully');
      }

      setShowModal(false);
      fetchStaff();
    } catch (err) {
      console.error('Error saving staff:', err);
      showError(err.message || 'Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete staff
  const handleDeleteClick = (staff) => {
    setDeletingStaff(staff);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;

    try {
      await api.deleteStaff(deletingStaff._id);
      success('Staff member deleted successfully');
      setShowDeleteDialog(false);
      setDeletingStaff(null);
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      showError(err.message || 'Failed to delete staff member');
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    if (role === 'Supervisor') {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    }
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Staff Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage staff who handle complaints
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchStaff}
            disabled={loading}
            className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RiRefreshLine className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleAddNew}
            disabled={departments.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <RiAddLine className="h-5 w-5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* No Departments Warning */}
      {departments.length === 0 && !loading && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            ⚠️ Please create departments first before adding staff members.
            <a href="/departments" className="ml-2 underline font-medium">
              Go to Departments →
            </a>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Department Filter */}
        <div className="relative">
          <RiFilterLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors appearance-none min-w-[180px]"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors min-w-[140px]"
        >
          <option value="">All Roles</option>
          <option value="Supervisor">Supervisors</option>
          <option value="Worker">Workers</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <RiUserLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{staffList.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Staff</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <RiShieldUserLine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {staffList.filter((s) => s.role === 'Supervisor').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Supervisors</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <RiToolsLine className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {staffList.filter((s) => s.role === 'Worker').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Workers</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <RiBuildingLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : filteredStaff.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <RiUserLine className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || filterDept || filterRole ? 'No staff found' : 'No staff members yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || filterDept || filterRole
              ? 'Try adjusting your filters'
              : 'Add staff members to assign complaints to them'}
          </p>
          {!searchQuery && !filterDept && !filterRole && departments.length > 0 && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <RiAddLine className="h-5 w-5" />
              Add Staff Member
            </button>
          )}
        </div>
      ) : (
        /* Staff Table */

        
       <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStaff.map((staff) => (
                  <tr key={staff._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {staff.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{staff.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <RiMailLine className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">{staff.email}</span>
                        </div>
                        {staff.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                            <RiPhoneLine className="h-4 w-4" />
                            <span>{staff.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <RiBuildingLine className="h-3.5 w-3.5" />
                        {staff.departmentName || 'Not Assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(staff.role)}`}>
                        {staff.role === 'Supervisor' ? (
                          <RiShieldUserLine className="h-3.5 w-3.5" />
                        ) : (
                          <RiToolsLine className="h-3.5 w-3.5" />
                        )}
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          title="Edit"
                        >
                          <RiEditLine className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(staff)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <RiDeleteBinLine className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
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
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Ramesh Kumar"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., ramesh@college.edu"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., 9876543210"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Department */}
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

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="Worker">Worker</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Supervisors can oversee workers and manage department tasks
                </p>
              </div>

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
                    <span>{editingStaff ? 'Update' : 'Create'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* Mobile Card View */}
<div className="md:hidden space-y-3">
  {filteredStaff.map((staff) => (
    <div
      key={staff._id}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {staff.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{staff.name}</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(staff.role)}`}>
              {staff.role === 'Supervisor' ? (
                <RiShieldUserLine className="h-3 w-3" />
              ) : (
                <RiToolsLine className="h-3 w-3" />
              )}
              {staff.role}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handleEdit(staff)}
            className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            <RiEditLine className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(staff)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <RiDeleteBinLine className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <RiMailLine className="h-4 w-4" />
          <span className="truncate">{staff.email}</span>
        </div>
        {staff.phone && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <RiPhoneLine className="h-4 w-4" />
            <span>{staff.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <RiBuildingLine className="h-4 w-4" />
          <span>{staff.departmentName || 'No Department'}</span>
        </div>
      </div>
    </div>
  ))}
</div>
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingStaff(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to remove "${deletingStaff?.name}" from the staff list? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Staff;