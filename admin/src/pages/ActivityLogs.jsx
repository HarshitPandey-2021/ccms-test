// src/pages/ActivityLogs.jsx - BEAUTIFUL & INTERACTIVE
import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import {
  getAllLogs,
  exportLogsToCSV,
  clearAllLogs,
  getLogStatistics,
  getActivityMeta,
  ACTIVITY_TYPES,
  logActivity,
} from "../services/activityLogger";
import {
  RiHistoryLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiEyeLine,
  RiCloseLine,
  RiRefreshLine,
  RiFilterLine,
  RiUserLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiFileTextLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
  RiSettings4Line,
  RiShieldUserLine,
} from "react-icons/ri";

const ActivityLogs = () => {
  const { success, error: showError } = useToast();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Load logs
  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = getAllLogs();
      setLogs(allLogs);
      setFilteredLogs(allLogs);
      setStats(getLogStatistics(allLogs));
    } catch (err) {
      console.error("Load error:", err);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    logActivity(ACTIVITY_TYPES.PAGE_VIEW, { page: 'Activity Logs' });
    loadLogs();
  }, []);

  // Filter logs
  useEffect(() => {
    let filtered = [...logs];

    // Category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((log) => log.meta?.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((log) =>
        log.description?.toLowerCase().includes(query) ||
        log.admin?.name?.toLowerCase().includes(query) ||
        log.admin?.email?.toLowerCase().includes(query) ||
        log.type?.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, activeCategory]);

  const handleExport = () => {
    logActivity(ACTIVITY_TYPES.COMPLAINT_EXPORT, { 
      count: filteredLogs.length,
      format: 'CSV'
    });
    exportLogsToCSV(filteredLogs);
    success(`Exported ${filteredLogs.length} logs to CSV`);
  };

  const handleClearAll = () => {
    if (window.confirm("⚠️ Delete ALL activity logs? This cannot be undone!")) {
      logActivity(ACTIVITY_TYPES.BULK_ACTION, { action: 'Clear all logs' });
      clearAllLogs();
      loadLogs();
      success("All logs cleared successfully");
    }
  };

  const handleRefresh = () => {
    loadLogs();
    success("Logs refreshed");
  };

  // Get color classes based on log color
  const getColorClasses = (color) => {
    const colors = {
      emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
      gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400",
      slate: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400",
    };
    return colors[color] || colors.gray;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Get unique categories from logs
  const categories = ["all", ...new Set(logs.map((log) => log.meta?.category).filter(Boolean))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <RiHistoryLine className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
                Activity Logs
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time admin activity tracking
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
            title="Refresh"
          >
            <RiRefreshLine className="h-5 w-5" />
          </button>
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
          >
            <RiDownloadLine className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
          >
            <RiDeleteBinLine className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <RiFileTextLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Logs</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <RiTimeLine className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.today}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <RiHistoryLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.thisWeek}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <RiUserLine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.keys(stats.byAdmin || {}).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admins</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities, admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredLogs.length} logs)
              </span>
            </h3>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full animate-pulse">
              ● Live
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <RiHistoryLine className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No activities found
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "Try a different search term" : "Activities will appear here as you use the dashboard"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-[60vh] overflow-y-auto">
            {filteredLogs.slice(0, 100).map((log) => (
              <div
                key={log.id}
                onClick={() => {
                  setSelectedLog(log);
                  setShowModal(true);
                }}
                className="p-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${getColorClasses(log.meta?.color)}`}>
                    <span className="text-lg">{log.meta?.emoji || "📋"}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {log.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {log.admin?.name}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTimeAgo(log.timestamp)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getColorClasses(log.meta?.color)}`}>
                        {log.meta?.category}
                      </span>
                    </div>
                  </div>

                  {/* View Button */}
                  <button
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="View details"
                  >
                    <RiEyeLine className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedLog && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 ${getColorClasses(selectedLog.meta?.color)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedLog.meta?.emoji}</span>
                  <div>
                    <p className="font-bold text-lg">{selectedLog.meta?.category}</p>
                    <p className="text-sm opacity-80">{selectedLog.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <RiCloseLine className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {selectedLog.description}
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Admin</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {selectedLog.admin?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedLog.admin?.email}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {formatTimeAgo(selectedLog.timestamp)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFullDate(selectedLog.timestamp)}
                  </p>
                </div>
              </div>

              {/* Details */}
              {Object.keys(selectedLog.details || {}).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Details</p>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {/* Device Info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>📍 {selectedLog.context?.page || 'Unknown page'}</span>
                <span>📱 {selectedLog.device?.isMobile ? 'Mobile' : 'Desktop'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;