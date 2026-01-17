// src/pages/Analytics.jsx - ENHANCED & INDUSTRY-LEVEL
import React, { useState, useEffect, useCallback } from "react";
import Charts from "../components/Charts";
import Loading from "../components/Loading";
import { getStats } from "../api";
import { getAdminToken } from "../utils/tokenUtils";
import {
  RiBarChartFill,
  RiPieChartFill,
  RiLineChartFill,
  RiRefreshLine,
  RiTimeLine,
  RiTrophyLine,
  RiFireLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from "react-icons/ri";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    rejected: 0,
  });
  const [avgResolutionTime, setAvgResolutionTime] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [trendData, setTrendData] = useState([]);

  const token = getAdminToken() || localStorage.getItem("token");

  // Calculate derived metrics
  const resolutionRate = stats.total > 0 
    ? Math.round((stats.resolved / stats.total) * 100) 
    : 0;

  const activeRate = stats.total > 0 
    ? Math.round(((stats.pending + stats.inProgress) / stats.total) * 100) 
    : 0;

  const successRate = (stats.resolved + stats.inProgress) > 0
    ? Math.round((stats.resolved / (stats.resolved + stats.inProgress + stats.rejected)) * 100)
    : 0;

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!token) return;

      const statsData = await getStats(token);

      // Extract basic stats
      setStats({
        total: statsData.stats?.total || statsData.total || 0,
        resolved: statsData.stats?.resolved || statsData.resolved || 0,
        pending: statsData.stats?.pending || statsData.pending || 0,
        inProgress: statsData.stats?.inProgress || statsData.inProgress || 0,
        rejected: statsData.stats?.rejected || statsData.rejected || 0,
      });

      // Average resolution time
      setAvgResolutionTime(statsData.avgResolutionTime || 0);

      // Category data
      const categories = [];
      if (statsData.categories && Array.isArray(statsData.categories)) {
        statsData.categories.forEach((cat) => {
          categories.push({
            name: cat._id || cat.name || "Unknown",
            Complaints: cat.count || 0,
          });
        });
      } else if (statsData.categoryStats) {
        statsData.categoryStats.forEach((cat) => {
          categories.push({
            name: cat._id || "Unknown",
            Complaints: cat.count || 0,
          });
        });
      }

      setCategoryData(categories.sort((a, b) => b.Complaints - a.Complaints).slice(0, 10));

      // Priority data
      const priorities = [];
      if (statsData.byPriority) {
        Object.entries(statsData.byPriority).forEach(([name, value]) => {
          if (name !== "UNKNOWN" || value > 0) {
            priorities.push({ name, value: value || 0 });
          }
        });
      }
      setPriorityData(priorities);

      // Mock trend data (last 7 days) - you can replace with real API data
      const generateTrendData = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map((day, i) => ({
          day,
          Submitted: Math.floor(Math.random() * 20) + 5,
          Resolved: Math.floor(Math.random() * 15) + 3,
        }));
      };
      setTrendData(generateTrendData());

      setLastUpdated(new Date());

    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchAnalyticsData(false);
  }, [token, fetchAnalyticsData]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchAnalyticsData(false), 60000);
    return () => clearInterval(interval);
  }, [token, fetchAnalyticsData]);

  const handleManualRefresh = () => fetchAnalyticsData(true);

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const diffSecs = Math.floor((new Date() - lastUpdated) / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
        <Loading type="chart" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
            Analytics & Insights
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last updated: {formatLastUpdated()}
          </p>
        </div>
        
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 active:scale-95"
        >
          <RiRefreshLine className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* KPI Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {/* Total */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-lg p-4 border border-indigo-200 dark:border-indigo-900/30 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Total</p>
            <RiBarChartFill className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{stats.total}</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">All time</p>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-900/30 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Pending</p>
            <RiTimeLine className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{stats.pending}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Awaiting action</p>
        </div>

        {/* Active */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-900/30 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Active</p>
            <RiFireLine className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.inProgress}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{activeRate}% of total</p>
        </div>

        {/* Resolved */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-900/30 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-green-700 dark:text-green-300">Resolved</p>
            <RiTrophyLine className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.resolved}</p>
          <div className="flex items-center gap-1 mt-1">
            <RiArrowUpLine className="h-3 w-3 text-green-600" />
            <p className="text-xs text-green-600 dark:text-green-400">{resolutionRate}% rate</p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-4 border border-purple-200 dark:border-purple-900/30 hover:shadow-lg transition-shadow col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Success</p>
            <div className={`flex items-center gap-1 ${successRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
              {successRate >= 80 ? <RiArrowUpLine className="h-3 w-3" /> : <RiArrowDownLine className="h-3 w-3" />}
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{successRate}%</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Resolution success</p>
        </div>
      </div>

      {/* Trend Chart - NEW! */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <RiLineChartFill className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          7-Day Trend
        </h3>
        {trendData.length > 0 ? (
          <Charts type="line" data={trendData} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No trend data available
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Status Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <RiPieChartFill className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Status Distribution
          </h3>
          {stats.total > 0 ? (
            <Charts
              type="pie"
              data={[
                { name: "Pending", value: stats.pending },
                { name: "In Progress", value: stats.inProgress },
                { name: "Resolved", value: stats.resolved },
                { name: "Rejected", value: stats.rejected },
              ].filter(item => item.value > 0)}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Category Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <RiBarChartFill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Top Categories
          </h3>
          {categoryData.length > 0 ? (
            <Charts type="bar" data={categoryData.filter(c => c.Complaints > 0)} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data
            </div>
          )}
        </div>
      </div>

      {/* Priority Bar - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <RiFireLine className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Priority Distribution
        </h3>
        {priorityData.length > 0 ? (
          <Charts type="bar" data={priorityData.filter(p => p.value > 0)} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No priority data
          </div>
        )}
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Avg Resolution Time */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10 rounded-lg p-4 sm:p-6 border border-pink-200 dark:border-pink-900/30 hover:shadow-lg transition-shadow">
          <p className="text-sm text-pink-700 dark:text-pink-300 font-medium">Avg Resolution Time</p>
          <p className="text-3xl font-bold text-pink-900 dark:text-pink-200 mt-2">
            {avgResolutionTime > 0 
              ? (avgResolutionTime > 24 
                  ? `${(avgResolutionTime/24).toFixed(1)} days` 
                  : `${avgResolutionTime.toFixed(1)} hrs`)
              : "N/A"}
          </p>
          <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Time to close complaints</p>
        </div>

        {/* Resolution Rate */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/10 rounded-lg p-4 sm:p-6 border border-teal-200 dark:border-teal-900/30 hover:shadow-lg transition-shadow">
          <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">Resolution Rate</p>
          <p className="text-3xl font-bold text-teal-900 dark:text-teal-200 mt-2">{resolutionRate}%</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">{stats.resolved} of {stats.total} resolved</p>
        </div>

        {/* Active Cases */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-lg p-4 sm:p-6 border border-orange-200 dark:border-orange-900/30 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Active Cases</p>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-200 mt-2">
            {stats.pending + stats.inProgress}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Pending + In Progress</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;