// src/components/ComplaintFilters.jsx
import React, { useState, useEffect, useRef } from "react";
import { RiSearchLine, RiFilterLine, RiRefreshLine, RiShieldLine } from "react-icons/ri";

const ComplaintFilters = ({ onFilterChange, initialFilters }) => {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [priority, setPriority] = useState("");
  const [anonymous, setAnonymous] = useState(""); // ✅ NEW: Privacy filter
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isInitialized = useRef(false);
  const isApplyingInitialFilters = useRef(false);

  // Initialize from parent filters
  useEffect(() => {
    if (initialFilters && !isApplyingInitialFilters.current) {
      console.log("🎯 ComplaintFilters received initialFilters:", initialFilters);
      isApplyingInitialFilters.current = true;

      if (initialFilters.status !== undefined) {
        setStatus(initialFilters.status || "");
      }
      if (initialFilters.search !== undefined) {
        setSearch(initialFilters.search || "");
        setDebouncedSearch(initialFilters.search || "");
      }
      if (initialFilters.dateRange !== undefined) {
        setDateRange(initialFilters.dateRange || "all");
      }
      if (initialFilters.priority !== undefined) {
        setPriority(initialFilters.priority || "");
      }
      // ✅ NEW: Initialize anonymous filter
      if (initialFilters.anonymous !== undefined) {
        setAnonymous(initialFilters.anonymous || "");
      }

      setTimeout(() => {
        isInitialized.current = true;
        isApplyingInitialFilters.current = false;
      }, 0);
    }
  }, [initialFilters]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Auto apply filters when changed
  useEffect(() => {
    if (isInitialized.current && !isApplyingInitialFilters.current) {
      handleApplyFilters();
    }
  }, [status, debouncedSearch, dateRange, priority, anonymous]); // ✅ Added anonymous

  const handleApplyFilters = () => {
    const filters = {
      status,
      search: debouncedSearch,
      dateRange,
      priority,
      anonymous, // ✅ NEW: Include anonymous filter
    };
    console.log("🔍 ComplaintFilters applying:", filters);
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStatus("");
    setSearch("");
    setDateRange("all");
    setPriority("");
    setAnonymous(""); // ✅ NEW: Reset anonymous filter
    setDebouncedSearch("");
    onFilterChange({ 
      status: "", 
      search: "", 
      dateRange: "all", 
      priority: "",
      anonymous: "" // ✅ NEW: Include in reset
    });
  };

  const hasActiveFilters =
    status !== "" ||
    debouncedSearch !== "" ||
    dateRange !== "all" ||
    priority !== "" ||
    anonymous !== ""; // ✅ NEW: Check anonymous filter

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            id="search-filter"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, description, category, location..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {search.length > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Searching... ({search.length} characters)
            </p>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Status */}
          <div className="flex items-center gap-2">
            <RiFilterLine className="hidden md:block text-gray-500 dark:text-gray-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
            >
              <option value="">All Priority</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          {/* ✅ NEW: Privacy/Anonymous Filter */}
          <div className="flex items-center gap-2">
            <RiShieldLine className="hidden md:block text-gray-500 dark:text-gray-400" />
            <select
              value={anonymous}
              onChange={(e) => setAnonymous(e.target.value)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
            >
              <option value="">All Privacy</option>
              <option value="anonymous">🕵️ Anonymous Only</option>
              <option value="identified">👤 Identified Only</option>
              <option value="confidential">🔒 Confidential</option>
              <option value="sensitive">⚠️ Sensitive</option>
            </select>
          </div>

          {/* Date range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
              hasActiveFilters
                ? "border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40"
                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <RiRefreshLine className="h-4 w-4" />
            <span>{hasActiveFilters ? "Clear All" : "Reset"}</span>
          </button>
        </div>
      </div>

      {/* ✅ NEW: Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
            
            {status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Status: {status}
                <button 
                  onClick={() => setStatus("")}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {priority && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                Priority: {priority}
                <button 
                  onClick={() => setPriority("")}
                  className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {anonymous && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                Privacy: {anonymous}
                <button 
                  onClick={() => setAnonymous("")}
                  className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {dateRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                Date: {dateRange}
                <button 
                  onClick={() => setDateRange("all")}
                  className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Search: "{debouncedSearch.substring(0, 20)}{debouncedSearch.length > 20 ? '...' : ''}"
                <button 
                  onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                  className="ml-1 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintFilters;