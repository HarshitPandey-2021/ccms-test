import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  RiCloseLine,
  RiPlayFill,
  
    RiStarFill,
  RiStarLine,
  RiCalendarLine,
  RiCloseFill,
  RiMapPinLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiFileTextLine,
  RiImageLine,
  RiFilePdfLine,
  RiCheckLine,
  RiCheckFill,
  RiCloseCircleFill,
  RiLoader4Line,
  RiEditLine,
  RiSaveLine,
  RiAlertLine,
  RiShieldLine,
  RiEyeLine,
  RiFlagLine,
  RiDownloadLine,
} from "react-icons/ri";
import Badge from "./Badge";
import api, { updateComplaint } from "../api";
import { getAdminToken } from "../utils/tokenUtils";

// ============================================
// REVEAL IDENTITY BUTTON COMPONENT - ENHANCED
// ============================================
const RevealIdentityButton = ({ complaint, onReveal }) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [identity, setIdentity] = useState(null);

  const handleReveal = async () => {
    if (!window.confirm(
      '⚠️ WARNING: You are about to reveal an anonymous user\'s identity.\n\n' +
      'This action:\n' +
      '• Will be logged with your admin details\n' +
      '• Is irreversible for this session\n' +
      '• Should only be done if absolutely necessary\n\n' +
      'Do you want to continue?'
    )) {
      return;
    }

    setIsRevealing(true);

    try {
      const response = await api.revealIdentity(complaint._id);
      
      if (response.success && response.identity) {
        setIdentity(response.identity);
        setRevealed(true);
        if (onReveal) onReveal(response.identity);
        
        // Success toast instead of alert
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10002] animate-slideInRight';
        toast.innerHTML = '✅ Identity revealed successfully. Action logged.';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } else {
        throw new Error('Failed to reveal identity');
      }
    } catch (error) {
      console.error('Reveal identity error:', error);
      
      // Error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10002] animate-slideInRight';
      toast.innerHTML = `❌ Error: ${error.message || 'Failed to reveal identity'}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setIsRevealing(false);
    }
  };

  if (revealed && identity) {
    return (
      <div className="mt-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <RiEyeLine className="h-4 w-4 text-white" />
            </div>
            <h5 className="font-bold text-white text-sm sm:text-base">
              Identity Revealed
            </h5>
          </div>
          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
            Logged
          </span>
        </div>

        {/* Content */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 border-t-0 rounded-b-lg p-4 space-y-3">
          {/* Name */}
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-800">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {identity.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Full Name</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base break-words">
                {identity.name || 'N/A'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-800">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <RiMailLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email Address</p>
              <a 
                href={`mailto:${identity.email}`}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {identity.email || 'N/A'}
              </a>
            </div>
          </div>

          {/* Roll Number */}
          {identity.roll && (
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-800">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <RiFileTextLine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Roll Number</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {identity.roll}
                </p>
              </div>
            </div>
          )}

          {/* Phone */}
          {identity.phone && (
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-800">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <RiPhoneLine className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Phone Number</p>
                <a 
                  href={`tel:${identity.phone}`}
                  className="font-semibold text-green-600 dark:text-green-400 hover:underline text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {identity.phone}
                </a>
              </div>
            </div>
          )}

          {/* Warning Footer */}
          <div className="flex items-start gap-2 p-3 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-200 dark:border-red-700">
            <RiShieldLine className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
              <strong>Audit Log:</strong> This reveal action has been logged with your admin details, IP address, and timestamp for security purposes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleReveal}
        disabled={isRevealing}
        className="group w-full relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-red-400 disabled:to-pink-400 text-white font-semibold rounded-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        
        {/* Button content */}
        <div className="relative flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4">
          {isRevealing ? (
            <>
              <RiLoader4Line className="h-5 w-5 animate-spin" />
              <span className="text-sm sm:text-base">Revealing Identity...</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <RiEyeLine className="h-5 w-5" />
              </div>
              <span className="text-sm sm:text-base font-bold">Reveal Anonymous Identity</span>
              <div className="hidden sm:block ml-auto">
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Super Admin</span>
              </div>
            </>
          )}
        </div>
      </button>

      {/* Warning Text */}
      <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
        <RiAlertLine className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            <strong className="block sm:inline">⚠️ Warning:</strong>
            <span className="block sm:inline sm:ml-1">
              This action will be permanently logged with your admin credentials and timestamp.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
// ============================================
// MAIN COMPLAINT DETAILS COMPONENT
// ============================================
const ComplaintDetails = ({ 
  complaint, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  onComplaintUpdate,
  isEditMode = false
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editMode, setEditMode] = useState(isEditMode);
  const [currentUser, setCurrentUser] = useState(null);
  const [editedData, setEditedData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    location: "",
  });

  console.log("🔍 ComplaintDetails:", {
    isOpen,
    currentUser: currentUser,
    isSuperAdmin: currentUser?.adminType === 'super',
  });

  // ✅ Load user from localStorage when modal opens
// ✅ Load user from localStorage when modal opens
useEffect(() => {
  if (isOpen) {
    try {
      // Try all possible keys
      const userStr = 
        localStorage.getItem('ccms-admin-session') || 
        localStorage.getItem('user') || 
        localStorage.getItem('adminUser');
      
      const user = userStr ? JSON.parse(userStr) : null;
      
      console.log('📋 ComplaintDetails - User Check:', {
        found: !!user,
        name: user?.name,
        role: user?.role,
        adminType: user?.adminType,
        isSuperAdmin: user?.adminType === 'super'
      });
      
      setCurrentUser(user);
    } catch (error) {
      console.error('❌ Error loading user:', error);
      setCurrentUser(null);
    }
  }
}, [isOpen]);

  // Initialize edit data
  useEffect(() => {
    if (complaint) {
      setEditedData({
        title: complaint.title || complaint.subject || "",
        description: complaint.description || "",
        category: complaint.category || "",
        priority: complaint.priority || "Medium",
        location: complaint.location || "",
      });
      setEditMode(isEditMode);
    }
  }, [complaint, isEditMode]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setActionType(null);
      setAdminRemarks("");
      setSelectedImage(null);
      setEditMode(false);
      setCurrentUser(null);
    }
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        if (selectedImage) setSelectedImage(null);
        else if (showConfirmation) setShowConfirmation(false);
        else onClose();
      }
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, showConfirmation, selectedImage, onClose]);

  if (!isOpen || !complaint) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleSaveEdit = async () => {
    if (!editedData.title.trim()) {
      alert("Title is required!");
      return;
    }
    if (!editedData.description.trim()) {
      alert("Description is required!");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAdminToken() || localStorage.getItem("token");
      
      const updateData = {
        title: editedData.title,
        subject: editedData.title,
        description: editedData.description,
        category: editedData.category,
        priority: editedData.priority,
        location: editedData.location,
      };

      await updateComplaint(complaint._id, updateData, token);
      
      console.log("✅ Complaint updated");
      
      setEditMode(false);
      
      if (onComplaintUpdate) onComplaintUpdate();
      
      onClose();
    } catch (error) {
      console.error("❌ Update error:", error);
      alert(`❌ Failed to update: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData({
      title: complaint.title || complaint.subject || "",
      description: complaint.description || "",
      category: complaint.category || "",
      priority: complaint.priority || "Medium",
      location: complaint.location || "",
    });
    setEditMode(false);
  };

  const handleActionClick = (action) => {
    setActionType(action);
    setShowConfirmation(true);
  };

  const handleConfirmAction = () => {
    if ((actionType === "resolve" || actionType === "reject") && !adminRemarks.trim()) {
      alert("Please provide admin remarks for this action.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newStatus =
        actionType === "start" ? "In Progress" :
        actionType === "resolve" ? "Resolved" : "Rejected";

      onStatusUpdate(complaint._id, newStatus, adminRemarks);
      setIsSubmitting(false);
      setShowConfirmation(false);
      onClose();
    }, 800);
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setActionType(null);
    setAdminRemarks("");
  };

  const handlePdfView = () => {
    if (complaint.pdfDocument) window.open(complaint.pdfDocument, "_blank");
  };

  const handlePdfDownload = async () => {
    if (!complaint.pdfDocument) return;

    try {
      const response = await fetch(complaint.pdfDocument);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `complaint-${complaint._id}-document.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF");
    }
  };
const getActionButtons = () => {
  const status = complaint.status || complaint.Status;
  
  // ✅ FIX: Treat "Assigned" as a workable status
  const canWork = status === "Pending" || status === "Assigned" || status === "In Progress";
  const isCompleted = status === "Resolved" || status === "Rejected";

  // No buttons for completed complaints
  if (isCompleted) {
    return null;
  }

  // For Pending or Assigned → Show "Start Work" and "Reject"
  if (status === "Pending" || status === "Assigned") {
    return (
      <>
        <button
          onClick={() => handleActionClick("start")}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
        >
          <RiPlayFill className="h-5 w-5" />
          <span>{status === "Assigned" ? "Start Work" : "Start Work"}</span>
        </button>
        <button
          onClick={() => handleActionClick("reject")}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm"
        >
          <RiCloseFill className="h-5 w-5" />
          <span>Reject</span>
        </button>
      </>
    );
  }

  // For In Progress → Show "Mark Resolved" and "Reject"
  if (status === "In Progress") {
    return (
      <>
        <button
          onClick={() => handleActionClick("resolve")}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-sm"
        >
          <RiCheckFill className="h-5 w-5" />
          <span>Mark Resolved</span>
        </button>
        <button
          onClick={() => handleActionClick("reject")}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm"
        >
          <RiCloseFill className="h-5 w-5" />
          <span>Reject</span>
        </button>
      </>
    );
  }

  return null;
};

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "Low":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const modalContent = (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {editMode ? "Edit Complaint" : "Complaint Details"}
                </h2>
                <Badge status={complaint.status} />
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (complaint.status === "Pending" || complaint.status === "In Progress") && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    <RiEditLine className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <RiCloseLine className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* ID */}
            <div>
              <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                #{complaint._id?.toString().slice(-8) || "N/A"}
              </span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {complaint.title || complaint.subject || "Untitled"}
                </h3>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              {editMode ? (
                <textarea
                  value={editedData.description}
                  onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              ) : (
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                  {complaint.description || "No description"}
                </p>
              )}
            </div>

            {/* Images */}
            {complaint.images && complaint.images.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Images ({complaint.images.length})
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {complaint.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className="aspect-square rounded-lg overflow-hidden border-2 cursor-pointer hover:border-indigo-500"
                    >
                      <img
                        src={imgUrl}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF */}
            {complaint.pdfDocument && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Document
                </label>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
                      <RiFilePdfLine className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Document.pdf
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePdfView}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
                        >
                          View
                        </button>
                        <button
                          onClick={handlePdfDownload}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category, Priority, Location Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  {complaint.category || "General"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <p className={`font-semibold px-4 py-2 rounded-lg border ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority || "Medium"}
                </p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <p className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  {complaint.location || "N/A"}
                </p>
              </div>
            </div>

            {/* Student Information */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <RiUserLine className="h-4 w-4" />
                Student Information
              </h4>

              {complaint.isAnonymous ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-2xl">
                      🕵️
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Anonymous Student
                      </p>
                      {complaint.type === 'confidential' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          🔒 Confidential
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded p-3 text-sm mb-3">
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Privacy Protected:</strong> Student identity hidden for safety
                    </p>
                  </div>
                  
                  {/* ✅ REVEAL BUTTON - Super Admin Only */}
                  {currentUser?.adminType === 'super' && (
                    <RevealIdentityButton 
                      complaint={complaint} 
                      onReveal={(identity) => console.log('Identity revealed:', identity)}
                    />
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg border bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {complaint.submittedBy?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {complaint.submittedBy || 'Unknown'}
                      </p>
                      {complaint.email && (
                        <a
                          href={`mailto:${complaint.email}`}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {complaint.email}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    {complaint.roll && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Roll:</strong> {complaint.roll}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Submitted:</strong> {formatDate(complaint.createdAt || complaint.submittedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Remarks */}
            {complaint.adminRemarks && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Admin Remarks
                </label>
                <p className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  {complaint.adminRemarks}
                </p>
              </div>
            )}

          </div>

          {/* ✅ STUDENT FEEDBACK SECTION - Add this after Admin Remarks section */}
{complaint.feedback?.rating && (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
      <RiStarFill className="h-5 w-5 text-yellow-500" />
      Student Feedback
    </label>
    
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-800 space-y-4">
      
      {/* Star Rating */}
      <div className="flex items-center gap-4 pb-3 border-b border-amber-200 dark:border-amber-700">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px]">
          Rating:
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) =>
            star <= complaint.feedback.rating ? (
              <RiStarFill key={star} className="w-6 h-6 text-yellow-400" />
            ) : (
              <RiStarLine key={star} className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            )
          )}
        </div>
        <span className="ml-2 text-sm font-bold text-gray-700 dark:text-gray-300 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-lg">
          {complaint.feedback.rating}/5 Stars
        </span>
      </div>

      {/* Satisfaction Level */}
      {complaint.feedback.satisfaction && (
        <div className="flex items-center gap-4 pb-3 border-b border-amber-200 dark:border-amber-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px]">
            Satisfaction:
          </span>
          <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
            complaint.feedback.satisfaction === 1 
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
              : complaint.feedback.satisfaction === 2 
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          }`}>
            {complaint.feedback.satisfaction === 1 && "😕 Poor"}
            {complaint.feedback.satisfaction === 2 && "😐 Okay"}
            {complaint.feedback.satisfaction === 3 && "😊 Great"}
          </span>
        </div>
      )}

      {/* ✅ STUDENT COMMENT - This was missing! */}
      {complaint.feedback.comment && complaint.feedback.comment.trim() !== "" && (
        <div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2 flex items-center gap-2">
            <RiFileTextLine className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Student's Comment:
          </span>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-700">
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed italic">
              "{complaint.feedback.comment}"
            </p>
          </div>
        </div>
      )}

      {/* No Comment Message */}
      {(!complaint.feedback.comment || complaint.feedback.comment.trim() === "") && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No written feedback provided
          </p>
        </div>
      )}

      {/* Submitted Time */}
      {complaint.feedback.submittedAt && (
        <div className="pt-3 border-t border-amber-200 dark:border-amber-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <RiCalendarLine className="h-3.5 w-3.5" />
            <span className="font-medium">Feedback submitted:</span>
            {new Date(complaint.feedback.submittedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      )}
    </div>
  </div>
)}

{/* FOOTER */}
<div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t px-6 py-4 rounded-b-2xl">
  {/* 🐛 DEBUG BOX */}


  {editMode ? (
    /* EDIT MODE - Save/Cancel Buttons */
    <div className="flex gap-3 justify-end">
      <button
        onClick={handleCancelEdit}
        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300"
      >
        Cancel
      </button>
      <button
        onClick={handleSaveEdit}
        disabled={isSubmitting}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        <RiSaveLine className="h-5 w-5" />
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </div>
  ) : (
    /* ACTION BUTTONS BASED ON STATUS */
    <div className="flex gap-3 justify-end">
      {(() => {
        const status = complaint.status || complaint.Status || "";
        const isResolved = status === "Resolved";
        const isRejected = status === "Rejected";
        const isPending = status === "Pending";
        const isAssigned = status === "Assigned";
        const isInProgress = status === "In Progress";

        console.log('🔘 Button Logic:', { status, isPending, isAssigned, isInProgress, isResolved, isRejected });

        // Completed complaints - only Close button
        if (isResolved || isRejected) {
          return (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          );
        }

        // Pending or Assigned - Show Start + Reject + Close
        if (isPending || isAssigned) {
          return (
            <>
              <button
                onClick={() => handleActionClick("start")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
              >
                <RiPlayFill className="h-5 w-5" />
                <span>Start Work</span>
              </button>
              <button
                onClick={() => handleActionClick("reject")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm"
              >
                <RiCloseFill className="h-5 w-5" />
                <span>Reject</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </>
          );
        }

        // In Progress - Show Resolve + Reject + Close
        if (isInProgress) {
          return (
            <>
              <button
                onClick={() => handleActionClick("resolve")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-sm"
              >
                <RiCheckFill className="h-5 w-5" />
                <span>Mark Resolved</span>
              </button>
              <button
                onClick={() => handleActionClick("reject")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm"
              >
                <RiCloseFill className="h-5 w-5" />
                <span>Reject</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </>
          );
        }

        // Fallback - Just Close
        return (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        );
      })()}
    </div>
  )}
</div>
        </div>
      </div>

      {/* IMAGE LIGHTBOX */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[10001] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg"
          >
            <RiCloseLine className="h-8 w-8 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[10000] bg-black/70">
          <div className="fixed inset-0 flex items-center justify-center p-4" onClick={handleCancelAction}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="bg-indigo-600 px-6 py-4 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <RiAlertLine className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Confirm Action</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-800 dark:text-gray-200">
                  {actionType === "start" ? "Start work on this complaint?" :
                   actionType === "resolve" ? "Mark complaint as resolved?" :
                   "Reject this complaint?"}
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Admin Remarks {(actionType === "resolve" || actionType === "reject") && <span className="text-red-600">*</span>}
                  </label>
                  <textarea
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    placeholder={actionType === "start" ? "Optional notes..." : "Required: Explain your decision..."}
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-xl flex gap-3">
                <button
                  onClick={handleCancelAction}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg ${
                    actionType === "start" ? "bg-indigo-600 hover:bg-indigo-700" :
                    actionType === "resolve" ? "bg-green-600 hover:bg-green-700" :
                    "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ComplaintDetails;