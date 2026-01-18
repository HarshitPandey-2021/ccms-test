// admin/src/pages/ManageStudents.jsx - BEAUTIFUL & MOBILE-FRIENDLY

import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import {
  RiSearchLine,
  RiDeleteBinLine,
  RiUserLine,
  RiMailLine,
  RiCalendarLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiCloseLine,
  RiCheckLine,
} from 'react-icons/ri';
import ConfirmDialog from '../components/ConfirmDialog';

const ManageStudents = () => {
  const { success, error: showError } = useToast();

  const [rollNo, setRollNo] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Search student by roll number
  const handleSearch = async () => {
    if (!rollNo.trim()) {
      showError('Please enter a roll number');
      return;
    }

    setSearching(true);
    setStudentInfo(null);

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('ccms-admin-token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/students/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ rollNo: rollNo.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setStudentInfo(data.student);
        if (!data.student.isRegistered) {
          showError(`${data.student.name} hasn't registered yet`);
        }
      } else {
        showError(data.message || 'Student not found');
      }
    } catch (err) {
      console.error('Search error:', err);
      showError('Failed to search student');
    } finally {
      setSearching(false);
    }
  };

  // Reset student registration
  const handleReset = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('ccms-admin-token');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/students/reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ rollNo: rollNo.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        success(`✅ ${data.message}`);
        setStudentInfo(null);
        setRollNo('');
      } else {
        showError(data.message || 'Failed to reset student');
      }
    } catch (err) {
      console.error('Reset error:', err);
      showError('Failed to reset student');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !searching) {
      handleSearch();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <RiUserLine className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-gray-200">
                Student Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Reset student registrations and manage access
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <RiSearchLine className="h-6 w-6" />
              Reset Student Registration
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Search by roll number to manage student access
            </p>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Search Box */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Roll Number
              </label>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 2310013155037"
                  disabled={searching || loading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-50 font-mono text-base sm:text-lg"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || loading || !rollNo.trim()}
                  className="px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {searching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Searching...</span>
                    </>
                  ) : (
                    <>
                      <RiSearchLine className="h-5 w-5" />
                      <span className="hidden sm:inline">Search</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter the student's roll number and press Enter or click Search
              </p>
            </div>

            {/* Student Info Card */}
            {studentInfo && (
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg flex-shrink-0">
                      {studentInfo.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                        {studentInfo.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {studentInfo.rollNo}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {studentInfo.isRegistered ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs sm:text-sm font-semibold">
                        <RiCheckLine className="h-4 w-4" />
                        Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs sm:text-sm font-semibold">
                        <RiCloseLine className="h-4 w-4" />
                        Not Registered
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <RiShieldCheckLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Batch</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {studentInfo.batch}
                      </p>
                    </div>
                  </div>

                  {studentInfo.registeredEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <RiMailLine className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {studentInfo.registeredEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {studentInfo.registeredAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <RiCalendarLine className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Registered On</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {new Date(studentInfo.registeredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Warning Box */}
                {studentInfo.isRegistered && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                    <RiAlertLine className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-semibold mb-1">⚠️ Warning</p>
                      <p className="text-xs sm:text-sm">
                        Resetting will <strong>permanently delete</strong> this student's account,
                        all their complaints, and allow them to register again with a new email.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setStudentInfo(null);
                      setRollNo('');
                    }}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RiCloseLine className="h-5 w-5" />
                    Cancel
                  </button>

                  {studentInfo.isRegistered && (
                    <button
                      onClick={() => setShowConfirm(true)}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Resetting...</span>
                        </>
                      ) : (
                        <>
                          <RiDeleteBinLine className="h-5 w-5" />
                          <span>Reset & Delete User</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Help Text */}
            {!studentInfo && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RiSearchLine className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Search for a Student
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter a roll number above to view student details and manage their registration
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1 text-sm sm:text-base">
              ℹ️ What happens when you reset?
            </h4>
            <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• User account is deleted</li>
              <li>• All complaints are removed</li>
              <li>• Student can register with new email</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1 text-sm sm:text-base">
              ✅ When to use this?
            </h4>
            <ul className="text-xs sm:text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Student used wrong email</li>
              <li>• Testing registration flow</li>
              <li>• Account access issues</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleReset}
        title="Reset Student Registration?"
        message={`Are you sure you want to reset ${studentInfo?.name}? This will permanently delete their account and all associated data. This action cannot be undone.`}
        confirmText="Yes, Reset Student"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ManageStudents;