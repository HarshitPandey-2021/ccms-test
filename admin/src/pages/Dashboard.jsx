// src/pages/Dashboard.jsx - Mobile Responsive
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Loading from "../components/Loading";
import { useToast } from "../hooks/useToast";
import { useCountUp } from "../hooks/useCountUp";
import { getAllComplaints, getStats } from "../api";
import { getAdminUser, getAdminToken } from "../utils/tokenUtils";
import {
  RiFileListLine,
  RiTimeLine,
  RiLoader4Line,
  RiCheckLine,
  RiArrowRightLine,
} from "react-icons/ri";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    pending: 0, 
    inProgress: 0, 
    resolved: 0,
    rejected: 0 
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const { info, success } = useToast();
  const adminUser = getAdminUser();
  const adminToken = getAdminToken() || localStorage.getItem("token");

  // CountUp hooks
  const totalCount = useCountUp(stats.total, 1200, 0);
  const pendingCount = useCountUp(stats.pending, 1200, 0);
  const inProgressCount = useCountUp(stats.inProgress, 1200, 0);
  const resolvedCount = useCountUp(stats.resolved, 1200, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!adminToken) {
          info("Authentication token not found");
          setLoading(false);
          return;
        }

        const allComplaints = await getAllComplaints();
        
        if (Array.isArray(allComplaints)) {
          const sorted = [...allComplaints].sort((a, b) => 
            (new Date(b.createdAt || b.submittedAt) - new Date(a.createdAt || a.submittedAt))
          );
          setRecentComplaints(sorted.slice(0, 5));
        }

        const statsData = await getStats();
        
        if (statsData) {
          const statsObj = statsData.stats || statsData;
          
          setStats({
            total: statsObj.total || 0,
            pending: statsObj.pending || 0,
            inProgress: statsObj.inProgress || 0,
            resolved: statsObj.resolved || 0,
            rejected: statsObj.rejected || 0,
          });
        }
      } catch (err) {
        console.error("❌ Dashboard error:", err);
        info("Failed to fetch data. Please refresh.");
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };

    if (adminToken) fetchData();
  }, [adminToken, info]);

  const welcomeToastRef = useRef(false);

  useEffect(() => {
    if (!dataLoaded || welcomeToastRef.current) return;

    const hasSeenWelcome = localStorage.getItem("dashboard-welcome-seen");
    
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        if (stats.pending > 0) {
          info(
            `Welcome back, ${adminUser?.name || "Admin"}! You have ${stats.pending} pending ${stats.pending === 1 ? "complaint" : "complaints"}.`
          );
        } else {
          success("Great work! All complaints are handled.");
        }
        
        localStorage.setItem("dashboard-welcome-seen", "true");
        welcomeToastRef.current = true;
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [dataLoaded, stats.pending, adminUser, info, success]);

  const handleStatClick = (status) => {
    navigate("/complaints", { state: { filterStatus: status } });
  };

  const handleComplaintRowClick = (complaintId) => {
    navigate("/complaints", { state: { openComplaintId: complaintId } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid";
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 page-enter">
        <Loading type="chart" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 page-enter"> {/* Extra padding for mobile bottom nav */}
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
          Welcome, {adminUser?.name || "Admin"}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Quick overview of all complaints
        </p>
      </div>

      {/* Stats Cards Grid - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Total */}
        <div 
          onClick={() => handleStatClick("all")} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mb-2">
              <RiFileListLine className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mt-1">{totalCount}</p>
          </div>
        </div>

        {/* Pending */}
        <div 
          onClick={() => handleStatClick("Pending")} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mb-2">
              <RiTimeLine className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => handleStatClick("In Progress")} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-2">
              <RiLoader4Line className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Active</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
          </div>
        </div>

        {/* Resolved */}
        <div 
          onClick={() => handleStatClick("Resolved")} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg active:scale-95 transition-all"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-2">
              <RiCheckLine className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Resolved</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Complaints - Mobile Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <RiFileListLine className="h-5 w-5 sm:h-6 sm:w-6" /> Recent
          </h3>
          <button
            onClick={() => navigate("/complaints")}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors active:scale-95"
          >
            View All <RiArrowRightLine className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <RiFileListLine className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">No complaints yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentComplaints.map((complaint, index) => (
              <div
                key={complaint._id || index}
                onClick={() => handleComplaintRowClick(complaint._id)}
                className="flex items-start sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer active:bg-gray-100 dark:active:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate">
                    {complaint.title || complaint.subject || "Untitled"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {complaint.category || "General"}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(complaint.createdAt || complaint.submittedAt)}
                    </span>
                  </div>
                </div>
                <Badge status={complaint.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats - Mobile Stacked */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-lg p-4 border border-indigo-200 dark:border-indigo-900/30">
          <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 font-medium">Resolution Rate</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-900 dark:text-indigo-200 mt-1">
            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.resolved} of {stats.total} resolved
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-900/30">
          <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">Avg Response</p>
          <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-200 mt-1">2.4 hrs</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Response time</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30">
          <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-medium">Active Rate</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-200 mt-1">
            {stats.total > 0 ? Math.round(((stats.pending + stats.inProgress) / stats.total) * 100) : 0}%
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            {stats.pending + stats.inProgress} active
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;