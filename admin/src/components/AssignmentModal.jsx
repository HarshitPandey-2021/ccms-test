// admin/src/components/AssignmentModal.jsx
import React, { useState, useEffect } from 'react';
import {
  RiCloseLine,
  RiUserLine,
  RiBuilding2Line,
  RiAlertLine,
  RiCheckLine,
} from 'react-icons/ri';
import api from '../api';

const AssignmentModal = ({ complaint, onClose, onAssigned }) => {
  const [staff, setStaff] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAllStaff, setShowAllStaff] = useState(false);
  
  const [formData, setFormData] = useState({
    staffId: '',
    priority: complaint?.priority || 'Medium',
    remarks: '',
  });

  useEffect(() => {
    fetchStaff();
  }, [complaint]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');

      // Get staff from complaint's department (if exists)
      let departmentStaff = [];
      if (complaint?.department) {
        const deptResponse = await api.getStaffByDepartment(complaint.department);
        departmentStaff = deptResponse?.data || [];
      }

      // Get all staff
      const allResponse = await api.getStaff();
      const allStaffList = allResponse?.data || [];

      setStaff(departmentStaff);
      setAllStaff(allStaffList);
      
      // If no department staff, show all
      if (departmentStaff.length === 0) {
        setShowAllStaff(true);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.staffId) {
      setError('Please select a staff member');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.assignComplaint(
        complaint._id,
        formData.staffId,
        formData.priority,
        formData.remarks || null
      );

      onAssigned();
    } catch (err) {
      console.error('Error assigning complaint:', err);
      setError(err.message || 'Failed to assign complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const displayStaff = showAllStaff ? allStaff : staff;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Assign Complaint
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {complaint?.complaintId || 'Complaint'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Complaint Summary */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
              {complaint?.subject || complaint?.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                {complaint?.category}
              </span>
              {complaint?.departmentName && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <RiBuilding2Line className="h-3 w-3" />
                  {complaint.departmentName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
              <RiAlertLine className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Staff Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign To <span className="text-red-500">*</span>
              </label>
              {staff.length > 0 && allStaff.length > staff.length && (
                <button
                  type="button"
                  onClick={() => setShowAllStaff(!showAllStaff)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {showAllStaff ? 'Show department staff only' : 'Show all staff'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : displayStaff.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <RiUserLine className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No staff members available
                </p>
                <a
                  href="/staff"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
                >
                  Add staff members →
                </a>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {displayStaff.map((member) => (
                  <label
                    key={member._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.staffId === member._id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="staffId"
                      value={member._id}
                      checked={formData.staffId === member._id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, staffId: e.target.value }))}
                      className="sr-only"
                    />
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.departmentName || 'No department'} • {member.role}
                      </p>
                    </div>
                    {formData.staffId === member._id && (
                      <RiCheckLine className="h-5 w-5 text-indigo-600" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    formData.priority === priority
                      ? getPriorityColor(priority) + ' ring-2 ring-offset-1'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
              placeholder="Any instructions for the assigned staff..."
              rows="3"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none text-sm"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || displayStaff.length === 0 || !formData.staffId}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Assigning...</span>
              </>
            ) : (
              <span>Assign</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;