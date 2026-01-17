// src/pages/Dashboard.jsx - ADD REJECTED CARD

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import Badge from "../components/common/Badge";
import Loading from "../components/common/Loading";
import useCountUp from "../hooks/useCountUp";
import { getMyComplaints, getMyStats } from "../api";
import {
  RiFileListLine,
  RiTimeLine,
  RiLoader4Line,
  RiCheckLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiAddCircleLine,
  RiMapPinLine,
  RiSparklingLine,
  RiCloseCircleLine, // ✅ Added for rejected
} from "react-icons/ri";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { info, success } = useToast();

  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0, // ✅ Added rejected
  });

  const totalCount = useCountUp(stats.total, 1200, 0);
  const pendingCount = useCountUp(stats.pending, 1200, 0);
  const inProgressCount = useCountUp(stats.inProgress, 1200, 0);
  const resolvedCount = useCountUp(stats.resolved, 1200, 0);
  const rejectedCount = useCountUp(stats.rejected, 1200, 0); // ✅ Added rejected counter

  // Fetch complaints + stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("No token found, redirecting to landing login");
          window.location.href = "https://landing-test-liard-one.vercel.app/login";
          return;
        }

        const complaints = await getMyComplaints(token);
        const userStats = await getMyStats(token);

        if (Array.isArray(complaints)) {
          setRecentComplaints(complaints.slice(0, 5));
        }

        if (userStats) {
          setStats({
            total: userStats.total || 0,
            pending: userStats.pending || 0,
            inProgress: userStats.inProgress || 0,
            resolved: userStats.resolved || 0,
            rejected: userStats.rejected || 0, // ✅ Added rejected
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        info("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [info]);

  // ONE-TIME welcome toast
  const welcomeShownRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (welcomeShownRef.current) return;

    const hasSeenWelcome =
      sessionStorage.getItem("user-dashboard-welcome-seen") === "true";

    if (hasSeenWelcome) {
      welcomeShownRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      if (stats.pending > 0) {
        info(
          `Welcome back, ${user.name}! You have ${stats.pending} complaint${
            stats.pending > 1 ? "s" : ""
          } waiting to be reviewed.`
        );
      } else if (stats.total > 0) {
        success("Great! All your complaints are being handled or resolved!");
      } else {
        info(
          `Welcome, ${user.name}! Submit your first complaint to get started.`
        );
      }

      sessionStorage.setItem("user-dashboard-welcome-seen", "true");
      welcomeShownRef.current = true;
    }, 1200);

    return () => clearTimeout(timer);
  }, [loading, user, stats.pending, stats.total, info, success]);

  const handleStatClick = (status) => {
    navigate("/user/my-complaints", { state: { filterStatus: status } });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-gray-200">
            Welcome back!
          </h1>
          <RiSparklingLine className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 animate-pulse" />
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Hi <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.name}</span>, 
          here's your complaint overview
        </p>
      </div>

      {/* Stats Grid - ✅ NOW 5 CARDS (2-2-1 layout on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {/* Total */}
        <button
          onClick={() => handleStatClick("all")}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 active:scale-95 transition-all duration-300 text-left"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <RiFileListLine className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            <div className="text-2xl sm:text-3xl font-bold">{totalCount}</div>
          </div>
          <div className="text-xs sm:text-sm font-medium opacity-90">Total</div>
        </button>

        {/* Pending */}
        <button
          onClick={() => handleStatClick("Pending")}
          className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 active:scale-95 transition-all duration-300 text-left"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <RiTimeLine className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            <div className="text-2xl sm:text-3xl font-bold">{pendingCount}</div>
          </div>
          <div className="text-xs sm:text-sm font-medium opacity-90">Pending</div>
        </button>

        {/* In Progress */}
        <button
          onClick={() => handleStatClick("In Progress")}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 active:scale-95 transition-all duration-300 text-left"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <RiLoader4Line className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            <div className="text-2xl sm:text-3xl font-bold">{inProgressCount}</div>
          </div>
          <div className="text-xs sm:text-sm font-medium opacity-90">Active</div>
        </button>

        {/* Resolved */}
        <button
          onClick={() => handleStatClick("Resolved")}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 active:scale-95 transition-all duration-300 text-left"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <RiCheckLine className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            <div className="text-2xl sm:text-3xl font-bold">{resolvedCount}</div>
          </div>
          <div className="text-xs sm:text-sm font-medium opacity-90">Resolved</div>
        </button>

        {/* ✅ NEW: Rejected Card */}
        <button
          onClick={() => handleStatClick("Rejected")}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 active:scale-95 transition-all duration-300 text-left col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <RiCloseCircleLine className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            <div className="text-2xl sm:text-3xl font-bold">{rejectedCount}</div>
          </div>
          <div className="text-xs sm:text-sm font-medium opacity-90">Rejected</div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <button
          onClick={() => navigate("/user/submit")}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl p-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
              <RiAddCircleLine className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-3 sm:ml-4 text-left flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                Submit New Complaint
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Report a new issue
              </p>
            </div>
            <RiArrowRightLine className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </button>

        <button
          onClick={() => navigate("/user/my-complaints")}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md hover:border-purple-500 dark:hover:border-purple-500 transition-all group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-xl p-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <RiFileListLine className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3 sm:ml-4 text-left flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                View All Complaints
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Manage your submissions
              </p>
            </div>
            <RiArrowRightLine className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </button>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
            Recent Complaints
          </h2>
          {recentComplaints.length > 0 && (
            <button
              onClick={() => navigate("/user/my-complaints")}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              View All
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {recentComplaints.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiFileListLine className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No Complaints Yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Start by submitting your first complaint
              </p>
              <button
                onClick={() => navigate("/user/submit")}
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/25"
              >
                Submit Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <button
                  key={complaint._id}
                  onClick={() => navigate(`/user/complaints/${complaint._id}`)}
                  className="w-full p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 flex-1 text-sm sm:text-base">
                      {complaint.title || complaint.subject}
                    </h3>
                    <Badge status={complaint.status} />
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 gap-3 flex-wrap">
                    {complaint.location && (
                      <span className="flex items-center gap-1">
                        <RiMapPinLine className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">{complaint.location}</span>
                      </span>
                    )}
                    {complaint.submittedAt && (
                      <span className="flex items-center gap-1">
                        <RiCalendarLine className="h-3.5 w-3.5" />
                        {formatDate(complaint.submittedAt || complaint.createdAt)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;