// src/pages/Complaints.jsx - Mobile Responsive with Assignment
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ComplaintFilters from "../components/ComplaintFilters";
import ComplaintTable from "../components/complaintTable/ComplaintTable";
import ComplaintDetails from "../components/ComplaintDetails";
import AssignmentModal from "../components/AssignmentModal"; // ✅ NEW
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import { useToast } from "../hooks/useToast";
import {
  getAllComplaints,
  updateComplaintStatus,
  getComplaintById,
} from "../api";
import { getAdminToken } from "../utils/tokenUtils";
import {
  RiDownloadLine,
  RiPrinterLine,
  RiCloseLine,
  RiFilterLine,
  RiRefreshLine,
  RiUserAddLine, // ✅ NEW
} from "react-icons/ri";
import { exportToCSV, exportToPrint } from "../utils/exportUtils";
import { logActivity, ACTIVITY_TYPES } from "../services/activityLogger";

const Complaints = () => {
  const location = useLocation();
  const { success, error } = useToast();

  // Mobile filter toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ✅ NEW: Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningComplaint, setAssigningComplaint] = useState(null);

  // Initialize filters
  const initialFilters = useMemo(() => {
    if (location.state?.filterStatus) {
      const filterValue = location.state.filterStatus;
      window.history.replaceState({}, document.title);
      return {
        status: filterValue === "all" ? "" : filterValue,
        search: "",
        dateRange: "all",
        priority: "",
      };
    }
    return { status: "", search: "", dateRange: "all", priority: "" };
  }, [location.state]);

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterHighlight, setFilterHighlight] = useState(
    !!location.state?.filterStatus
  );
  const [refreshing, setRefreshing] = useState(false);

  const token = getAdminToken() || localStorage.getItem("token");

  // Apply filters
  const applyFilters = useCallback((complaintsToFilter, currentFilters) => {
    let filtered = [...complaintsToFilter];

    if (currentFilters.status && currentFilters.status !== "All") {
      filtered = filtered.filter(
        (c) =>
          (c.status || c.Status || "").toString() === currentFilters.status
      );
    }

    if (currentFilters.priority && currentFilters.priority !== "all") {
      const target = currentFilters.priority.toLowerCase();
      filtered = filtered.filter((c) => {
        const p = (c.priority || c.Priority || "").toString().toLowerCase();
        if (target === "high") return p.includes("high") || p.includes("urgent");
        if (target === "medium") return p.includes("medium");
        if (target === "low") return p.includes("low");
        return true;
      });
    }

    // ✅ NEW: Anonymous filter
    if (currentFilters.anonymous) {
      if (currentFilters.anonymous === 'anonymous') {
        filtered = filtered.filter(c => c.isAnonymous === true);
      } else if (currentFilters.anonymous === 'identified') {
        filtered = filtered.filter(c => !c.isAnonymous);
      } else if (currentFilters.anonymous === 'confidential') {
        filtered = filtered.filter(c => c.type === 'confidential');
      } else if (currentFilters.anonymous === 'sensitive') {
        filtered = filtered.filter(c => c.type === 'sensitive');
      }
    }

    if (currentFilters.search && currentFilters.search.trim() !== "") {
      const term = currentFilters.search.toLowerCase();
      filtered = filtered.filter((c) => {
        const title = (c.title || c.subject || "").toString().toLowerCase();
        const desc = (c.description || "").toString().toLowerCase();
        const cat = (c.category || c.department || "").toString().toLowerCase();
        const loc = (c.location || "").toString().toLowerCase();
        const assigned = (c.assignedToName || "").toString().toLowerCase(); // ✅ NEW
        return (
          title.includes(term) ||
          desc.includes(term) ||
          cat.includes(term) ||
          loc.includes(term) ||
          assigned.includes(term) // ✅ NEW
        );
      });
    }

    if (currentFilters.dateRange && currentFilters.dateRange !== "all") {
      const now = new Date();
      let threshold = new Date();

      if (currentFilters.dateRange === "week") {
        threshold.setDate(now.getDate() - 7);
      } else if (currentFilters.dateRange === "month") {
        threshold.setDate(now.getDate() - 30);
      } else if (currentFilters.dateRange === "today") {
        threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      filtered = filtered.filter((c) => {
        const date = new Date(c.createdAt || c.submittedAt || c.date);
        if (isNaN(date)) return false;

        if (currentFilters.dateRange === "today") {
          const complaintDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          return complaintDate.getTime() === threshold.getTime();
        }

        return date >= threshold;
      });
    }

    setFilteredComplaints(filtered);
  }, []);

  // Fetch complaints
  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!token) {
        error("❌ No authentication token found");
        setIsLoading(false);
        return;
      }

      const response = await getAllComplaints();
      console.log("📦 Complaints fetched:", response?.length || 0);

      if (!Array.isArray(response)) {
        console.error("Response is not an array:", response);
        setComplaints([]);
        setFilteredComplaints([]);
        setIsLoading(false);
        return;
      }

      setComplaints(response);
      applyFilters(response, initialFilters);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      error("❌ Failed to fetch complaints from the server.");
      setComplaints([]);
      setFilteredComplaints([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token, applyFilters, initialFilters, error]);

  useEffect(() => {
    if (token) {
      fetchComplaints();
    }
  }, [token, fetchComplaints]);

  // Auto-open complaint from notification
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const complaintId = urlParams.get('id');
    
    if (complaintId && complaints.length > 0) {
      console.log('🔔 Auto-opening complaint:', complaintId);
      
      const exists = complaints.find(c => c._id === complaintId || c.id === complaintId);
      
      if (exists) {
        openComplaintDetails(complaintId, false);
        window.history.replaceState({}, '', '/complaints');
      } else {
        error('⚠️ Complaint not found or access denied');
      }
    }
  }, [complaints, location.search, error]);

  // Re-apply filters when they change
  useEffect(() => {
    applyFilters(complaints, filters);
  }, [filters, complaints, applyFilters]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setShowMobileFilters(false);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    const cleared = { status: "", search: "", dateRange: "all", priority: "" };
    setFilters(cleared);
    setFilterHighlight(false);
    applyFilters(complaints, cleared);
    setShowMobileFilters(false);
    success("🔄 Filters cleared!");
  }, [applyFilters, complaints, success]);

  // Open complaint details
  const openComplaintDetails = useCallback(
    async (complaintId, editMode = false) => {
      console.log("🎯 Opening complaint:", complaintId, "Edit:", editMode);

      try {
        if (!complaintId) {
          error("⚠️ Invalid complaint ID");
          return;
        }

        const complaintDetails = await getComplaintById(complaintId);
        console.log("✅ Complaint details fetched");

        setSelectedComplaint(complaintDetails);
        setIsEditMode(editMode);
        setIsModalOpen(true);

        logActivity(ACTIVITY_TYPES.COMPLAINT_VIEW, {
          page: "Complaints",
          complaintId,
          complaintTitle:
            complaintDetails?.title || complaintDetails?.subject || "Unknown",
          action: editMode ? "Editing complaint" : "Viewed complaint details",
        });
      } catch (err) {
        console.error("❌ Error loading complaint:", err);
        error("⚠️ Failed to load complaint details.");
      }
    },
    [error]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (complaintId) => {
      openComplaintDetails(complaintId, false);
    },
    [openComplaintDetails]
  );

  // ✅ NEW: Handle assign click
  const handleAssignClick = useCallback((complaint) => {
    setAssigningComplaint(complaint);
    setShowAssignModal(true);
  }, []);

  // ✅ NEW: Handle assignment complete
  const handleAssignmentComplete = useCallback(async () => {
    setShowAssignModal(false);
    setAssigningComplaint(null);
    success("✅ Complaint assigned successfully!");
    
    // Refresh complaints
    const refreshed = await getAllComplaints();
    if (Array.isArray(refreshed)) {
      setComplaints(refreshed);
      applyFilters(refreshed, filters);
    }
  }, [filters, applyFilters, success]);

  // Handle action click - ✅ UPDATED
  const handleActionClick = useCallback(
    (action, complaint) => {
      if (!complaint?._id) return;

      if (action === "view") {
        openComplaintDetails(complaint._id, false);
      } else if (action === "edit") {
        openComplaintDetails(complaint._id, true);
      } else if (action === "assign") {
        handleAssignClick(complaint);
      }
    },
    [openComplaintDetails, handleAssignClick]
  );

  // Handle status update
  const handleStatusUpdate = useCallback(
    async (complaintId, newStatus, remarks) => {
      console.log("📝 Updating status:", { complaintId, newStatus, remarks });

      try {
        const updateSuccess = await updateComplaintStatus(
          complaintId,
          newStatus,
          remarks
        );

        if (updateSuccess) {
          logActivity(ACTIVITY_TYPES.STATUS_CHANGE, {
            complaintId,
            complaintSubject:
              selectedComplaint?.title ||
              selectedComplaint?.subject ||
              "Unknown",
            previousStatus: selectedComplaint?.status || "Unknown",
            newStatus,
            remarks: remarks || "No remarks provided",
          });

          success(`✅ Complaint updated to ${newStatus}`);
          setIsModalOpen(false);
          setSelectedComplaint(null);
          setIsEditMode(false);

          const refreshed = await getAllComplaints();
          if (Array.isArray(refreshed)) {
            setComplaints(refreshed);
            applyFilters(refreshed, filters);
          }
        } else {
          error(`❌ Failed to update complaint`);
        }
      } catch (err) {
        console.error("Error updating complaint:", err);
        error("⚠️ Error while updating complaint status.");
      }
    },
    [selectedComplaint, filters, applyFilters, success, error]
  );

  // Handle complaint update (from edit)
  const handleComplaintUpdate = useCallback(async () => {
    console.log("🔄 Complaint updated, refreshing...");
    
    try {
      setIsModalOpen(false);
      setSelectedComplaint(null);
      setIsEditMode(false);

      const refreshed = await getAllComplaints();
      if (Array.isArray(refreshed)) {
        setComplaints(refreshed);
        applyFilters(refreshed, filters);
      }

      success("✅ Complaint updated successfully!");
    } catch (err) {
      console.error("Error refreshing complaints:", err);
      error("⚠️ Failed to refresh complaints list.");
    }
  }, [filters, applyFilters, success, error]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setIsEditMode(false);
  }, []);

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    try {
      const filename = `complaints_${new Date()
        .toISOString()
        .split("T")[0]}.csv`;
      exportToCSV(filteredComplaints, filename);

      logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, {
        action: "Exported complaints to CSV",
        filename,
        complaintCount: filteredComplaints.length,
        filters,
      });

      success(
        `✅ Exported ${filteredComplaints.length} complaint${
          filteredComplaints.length !== 1 ? "s" : ""
        } to CSV!`
      );
    } catch (err) {
      console.error("Export error:", err);
      error("❌ Failed to export complaints");
    }
  }, [filteredComplaints, filters, success, error]);

  // Print
  const handlePrint = useCallback(() => {
    try {
      exportToPrint(filteredComplaints);

      logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, {
        action: "Printed complaints",
        complaintCount: filteredComplaints.length,
        filters,
      });

      success("📄 Print preview opened");
    } catch (err) {
      console.error("Print error:", err);
      error("❌ Failed to print complaints");
    }
  }, [filteredComplaints, filters, success, error]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
  };

  const getEmptyStateType = () => {
    if (filters.search) return "search";
    if (
      filters.status ||
      filters.dateRange !== "all" ||
      (filters.priority && filters.priority !== "")
    )
      return "filter";
    return "complaints";
  };

  // ✅ NEW: Calculate assignment stats
  const assignmentStats = useMemo(() => {
    const assigned = complaints.filter(c => c.assignedTo).length;
    const unassigned = complaints.filter(c => !c.assignedTo && c.status !== 'Resolved' && c.status !== 'Rejected').length;
    return { assigned, unassigned };
  }, [complaints]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Loading type="table" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200">
                Manage Complaints
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {assignmentStats.unassigned > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {assignmentStats.unassigned} unassigned • 
                  </span>
                )}{" "}
                {complaints.length} total complaints
              </p>
            </div>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg shadow-md active:scale-95 transition-transform"
            >
              <RiFilterLine className="h-5 w-5" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* ✅ NEW: Unassigned Alert */}
        {assignmentStats.unassigned > 0 && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiUserAddLine className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-semibold">{assignmentStats.unassigned}</span> complaint{assignmentStats.unassigned !== 1 ? 's' : ''} pending assignment
              </p>
            </div>
            <button
              onClick={() => handleFilterChange({ status: 'Pending' })}
              className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
            >
              View all →
            </button>
          </div>
        )}

        {/* Desktop Filters (always visible) */}
        <div className="hidden md:block mb-4">
          <ComplaintFilters
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </div>

        {/* Mobile Filters (slide-in panel) */}
        {showMobileFilters && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
            <div 
              className="absolute top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <RiCloseLine className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4">
                <ComplaintFilters
                  onFilterChange={handleFilterChange}
                  initialFilters={filters}
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Highlight Banner */}
        {filterHighlight && filters.status && (
          <div
            className={`mb-4 border-l-4 p-3 sm:p-4 rounded-lg shadow-sm animate-slideDown relative ${
              filters.status === "Resolved"
                ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                : filters.status === "Pending"
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : filters.status === "In Progress"
                ? "border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                : filters.status === "Assigned"
                ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                : "border-red-600 bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl lg:text-3xl">
                {filters.status === "Resolved"
                  ? "✅"
                  : filters.status === "Pending"
                  ? "⏳"
                  : filters.status === "In Progress"
                  ? "🔧"
                  : filters.status === "Assigned"
                  ? "👤"
                  : "❌"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate">
                  Showing {filters.status} complaints
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Found {filteredComplaints.length} item
                  {filteredComplaints.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setFilterHighlight(false)}
                className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Table Header with Export + Refresh */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700 border-b-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200">
              {filteredComplaints.length} Complaint
              {filteredComplaints.length !== 1 ? "s" : ""}
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 transition-all text-sm font-medium disabled:opacity-50"
              >
                <RiRefreshLine className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              {filteredComplaints.length > 0 && (
                <>
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all text-sm font-medium"
                  >
                    <RiDownloadLine className="h-4 w-4" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all text-sm font-medium"
                  >
                    <RiPrinterLine className="h-4 w-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredComplaints.length === 0 ? (
          <EmptyState
            type={getEmptyStateType()}
            searchTerm={filters.search}
            onAction={handleClearFilters}
            actionLabel="Clear All Filters"
          />
        ) : (
          <ComplaintTable
            complaints={filteredComplaints}
            onRowClick={handleRowClick}
            onActionClick={handleActionClick}
            onAssignClick={handleAssignClick} // ✅ NEW
          />
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && isModalOpen && (
        <ComplaintDetails
          complaint={selectedComplaint}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          onComplaintUpdate={handleComplaintUpdate}
          isEditMode={isEditMode}
          onAssignClick={() => handleAssignClick(selectedComplaint)} // ✅ NEW
        />
      )}

      {/* ✅ NEW: Assignment Modal */}
      {showAssignModal && assigningComplaint && (
        <AssignmentModal
          complaint={assigningComplaint}
          onClose={() => {
            setShowAssignModal(false);
            setAssigningComplaint(null);
          }}
          onAssigned={handleAssignmentComplete}
        />
      )}
    </div>
  );
};

export default Complaints;