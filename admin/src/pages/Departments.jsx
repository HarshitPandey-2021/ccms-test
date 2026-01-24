// admin/src/pages/Departments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCloseLine,
  RiBuildingLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiPriceTag3Line,
  RiRefreshLine,
} from 'react-icons/ri';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingDept, setDeletingDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: '',
    headName: '',
    headEmail: '',
    headPhone: '',
  });

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getDepartments();
      const data = response?.data || response || [];
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      showError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Filter departments
  const filteredDepartments = departments.filter((dept) =>
    dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.headName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for new department
  const handleAddNew = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      description: '',
      categories: '',
      headName: '',
      headEmail: '',
      headPhone: '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      description: dept.description || '',
      categories: dept.categories?.join(', ') || '',
      headName: dept.headName || '',
      headEmail: dept.headEmail || '',
      headPhone: dept.headPhone || '',
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError('Department name is required');
      return;
    }

    const dataToSend = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categories: formData.categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c),
      headName: formData.headName.trim(),
      headEmail: formData.headEmail.trim(),
      headPhone: formData.headPhone.trim(),
    };

    try {
      setSubmitting(true);

      if (editingDept) {
        await api.updateDepartment(editingDept._id, dataToSend);
        success('Department updated successfully');
      } else {
        await api.createDepartment(dataToSend);
        success('Department created successfully');
      }

      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      console.error('Error saving department:', err);
      showError(err.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete department
  const handleDeleteClick = (dept) => {
    setDeletingDept(dept);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDept) return;

    try {
      await api.deleteDepartment(deletingDept._id);
      success('Department deleted successfully');
      setShowDeleteDialog(false);
      setDeletingDept(null);
      fetchDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      showError(err.message || 'Failed to delete department');
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingDept(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Departments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage departments and their categories
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchDepartments}
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
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : filteredDepartments.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <RiBuildingLine className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No departments found' : 'No departments yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first department to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <RiAddLine className="h-5 w-5" />
              Add Department
            </button>
          )}
        </div>
      ) : (
        /* Departments Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDepartments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <RiBuildingLine className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {dept.name}
                    </h3>
                    {dept.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {dept.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    title="Edit"
                  >
                    <RiEditLine className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(dept)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              {dept.categories?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <RiPriceTag3Line className="h-3.5 w-3.5" />
                    <span>Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.categories.slice(0, 4).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {cat}
                      </span>
                    ))}
                    {dept.categories.length > 4 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                        +{dept.categories.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Head Info */}
              {dept.headName && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <RiUserLine className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{dept.headName}</span>
                  </div>
                  {dept.headEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <RiMailLine className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400 truncate">{dept.headEmail}</span>
                    </div>
                  )}
                  {dept.headPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <RiPhoneLine className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">{dept.headPhone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingDept ? 'Edit Department' : 'Add New Department'}
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
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Maintenance"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Brief description of this department..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Categories
                  <span className="text-gray-400 font-normal ml-1">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="categories"
                  value={formData.categories}
                  onChange={handleInputChange}
                  placeholder="e.g., Furniture, Electrical, Plumbing"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Department Head Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Department Head (Optional)
                </h4>

                <div className="space-y-3">
                  <input
                    type="text"
                    name="headName"
                    value={formData.headName}
                    onChange={handleInputChange}
                    placeholder="Head Name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      name="headEmail"
                      value={formData.headEmail}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                    <input
                      type="tel"
                      name="headPhone"
                      value={formData.headPhone}
                      onChange={handleInputChange}
                      placeholder="Phone"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
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
                    <span>{editingDept ? 'Update' : 'Create'}</span>
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
          setDeletingDept(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${deletingDept?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Departments;