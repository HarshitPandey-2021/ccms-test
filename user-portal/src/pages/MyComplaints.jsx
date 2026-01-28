// user-portal/src/pages/MyComplaints.jsx - WITH FEEDBACK
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiEditLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiCloseCircleLine,
  RiDownloadLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiEyeOffLine,
  RiCloseLine,
  RiRefreshLine,
  RiStarFill,
  RiStarLine,
} from "react-icons/ri";
// import toast from "react-hot-toast";
import { useToast } from "../hooks/useToast";
import api from "../api";
import Badge from "../components/common/Badge";
import Loading from "../components/common/Loading";
import FeedbackModal from "../components/FeedbackModal";



const MyComplaints = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const toast = useToast();

  const initialStatus = location.state?.filterStatus
    ? location.state.filterStatus.toLowerCase()
    : "all";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // ✅ Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    complaint: null,
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (location.state?.filterStatus) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await api.getMyComplaints();
      console.log('📋 Fetched complaints:', data); // Debug log
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };
  

// ✅ FIXED: Use toast (lowercase) not useToast
const handleFeedbackSubmit = async (feedbackData) => {
  try {
    await api.submitFeedback(feedbackData.complaintId, {
      rating: feedbackData.rating,
      satisfaction: feedbackData.satisfaction,
      feedback: feedbackData.feedback,
    });
    toast.success("Thank you for your feedback! 🎉");  // ✅ toast not useToast
    fetchComplaints();
  } catch (error) {
    toast.error(error.message || "Failed to submit feedback");  // ✅ toast not useToast
    throw error;
  }
};

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending":
        return <RiTimeLine className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
      case "in-progress":
      case "in progress":
        return <RiAlertLine className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
      case "resolved":
        return <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case "rejected":
        return <RiCloseCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      default:
        return <RiTimeLine className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case "high":
        return "text-red-600 dark:text-red-400 font-semibold";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 font-semibold";
      case "low":
        return "text-green-600 dark:text-green-400 font-semibold";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaintId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      complaint.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" || complaint.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || categoryFilter !== "all";

  // ✅ Check if complaint is resolved (handles different cases)
  const isComplaintResolved = (status) => {
    if (!status) return false;
    const s = status.toLowerCase().trim();
    return s === 'resolved';
  };

  // ✅ Complaint Card with Feedback Section
  const ComplaintCard = ({ complaint }) => {
    // Debug logging
    const resolved = isComplaintResolved(complaint.status);
    console.log(`📋 Card: ${complaint.complaintId} | Status: "${complaint.status}" | Resolved: ${resolved} | Has Feedback: ${!!complaint.feedback?.rating}`);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              {/* Complaint ID & Anonymous Badge */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {complaint.complaintId}
                </span>
                {complaint.isAnonymous && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                    <RiEyeOffLine className="h-3 w-3" />
                    <span className="hidden xs:inline">Anonymous</span>
                  </span>
                )}
              </div>

              {/* Subject */}
              <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                {complaint.subject}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {complaint.description}
              </p>
            </div>

            {/* Status Badge & Icon */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {getStatusIcon(complaint.status)}
              <Badge status={complaint.status} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block mb-1">Category</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {complaint.category}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block mb-1">Priority</span>
              <span className={getPriorityColor(complaint.priority)}>
                {complaint.priority}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 dark:text-gray-400 block mb-1">
                <RiMapPinLine className="inline h-3 w-3 mr-1" />
                Location
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {complaint.location}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 dark:text-gray-400 block mb-1">
                <RiCalendarLine className="inline h-3 w-3 mr-1" />
                Submitted
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatDate(complaint.submittedAt || complaint.createdAt)}
              </span>
            </div>
          </div>

          {/* Assigned To */}
          {complaint.assignedTo && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm">
                <RiUserLine className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">Assigned to:</span>
                <span className="font-semibold text-blue-700 dark:text-blue-400 truncate">
                  {complaint.assignedTo.name || complaint.assignedTo}
                </span>
              </div>
            </div>
          )}

          {/* PDF Download */}
          {complaint.pdfDocument && (
            <a
              href={complaint.pdfDocument}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold mb-4 transition-colors"
            >
              <RiDownloadLine className="w-4 h-4" />
              Download Document
            </a>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => navigate(`/user/complaints/${complaint._id}`)}
              className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors font-semibold text-sm"
            >
              <RiEyeLine className="w-4 h-4" />
              <span className="hidden xs:inline">View</span>
              <span className="xs:hidden">Details</span>
            </button>

            {complaint.status?.toLowerCase() === "pending" && !complaint.assignedTo && (
              <button
                onClick={() => navigate(`/user/complaints/${complaint._id}/edit`)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-semibold text-sm"
              >
                <RiEditLine className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
          </div>

          {/* ========================================== */}
          {/* ✅ FEEDBACK SECTION - FOR RESOLVED ONLY   */}
          {/* ========================================== */}
          {resolved && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {complaint.feedback?.rating ? (
                // ✅ Already Submitted Feedback - Show Stars
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Rating:
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) =>
                        star <= complaint.feedback.rating ? (
                          <RiStarFill key={star} className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <RiStarLine key={star} className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                        )
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                    <RiCheckboxCircleLine className="w-4 h-4" />
                    Submitted
                  </span>
                </div>
              ) : (
                // ✅ Show "Rate Your Experience" Button
                <button
                  onClick={() => {
                    console.log('🌟 Opening feedback modal for:', complaint.complaintId);
                    setFeedbackModal({ isOpen: true, complaint });
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 rounded-xl hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30 transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <RiStarLine
                        key={i}
                        className="w-5 h-5 group-hover:text-yellow-500 transition-all duration-200"
                      />
                    ))}
                  </div>
                  <span className="font-bold text-sm sm:text-base">Rate Your Experience</span>
                </button>
              )}
            </div>
          )}
          {/* ========================================== */}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
          My Complaints
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          View and manage all your submitted complaints
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search by subject, description, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 sm:py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 transition-all text-sm sm:text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RiCloseLine className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Status Filter */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Status Filter
              </label>
              <div className="relative">
                <RiFilterLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none dark:bg-gray-700 dark:text-gray-200 transition-all cursor-pointer text-sm sm:text-base font-medium bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">🟡 Pending</option>
                  <option value="in progress">🔵 In Progress</option>
                  <option value="resolved">🟢 Resolved</option>
                  <option value="rejected">🔴 Rejected</option>
                </select>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Category Filter
              </label>
              <div className="relative">
                <RiFilterLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none dark:bg-gray-700 dark:text-gray-200 transition-all cursor-pointer text-sm sm:text-base font-medium bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="Fan">🌀 Fan</option>
                  <option value="Light">💡 Light</option>
                  <option value="Projector">📽️ Projector</option>
                  <option value="Furniture">🪑 Furniture</option>
                  <option value="Washroom">🚻 Washroom</option>
                  <option value="Water">💧 Water</option>
                  <option value="Internet">📶 Internet</option>
                  <option value="Other">📋 Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Active:
                </span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-medium">
                    "{searchTerm.substring(0, 15)}{searchTerm.length > 15 ? '...' : ''}"
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                    {statusFilter}
                  </span>
                )}
                {categoryFilter !== "all" && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium">
                    {categoryFilter}
                  </span>
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <RiRefreshLine className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <RiAlertLine className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            No complaints found
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            {hasActiveFilters
              ? "Try adjusting your filters"
              : "You haven't submitted any complaints yet"}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold"
            >
              <RiRefreshLine className="h-5 w-5" />
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => navigate("/user/submit")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold"
            >
              Submit Your First Complaint
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {filteredComplaints.length}
              </span>{" "}
              of <span className="font-semibold">{complaints.length}</span> complaints
            </p>
          </div>

          {/* Complaints Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        </>
      )}

      {/* ✅ FEEDBACK MODAL */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, complaint: null })}
        complaint={feedbackModal.complaint}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default MyComplaints;