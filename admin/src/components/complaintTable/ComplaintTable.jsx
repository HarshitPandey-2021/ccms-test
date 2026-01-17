// src/components/complaintTable/ComplaintTable.jsx
import React, { useState, useMemo, useEffect } from "react";
import Badge from "../Badge";
import EmptyState from "../EmptyState";
import SortIcon from "./SortIcon";
import { RiEyeLine, RiEditLine } from "react-icons/ri";

export default function ComplaintTable({
  complaints = [],
  onRowClick,
  onActionClick,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "submittedAt",
    direction: "desc",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "Invalid";
    return date.toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const sortedComplaints = useMemo(() => {
    const data = [...complaints];
    const { key, direction } = sortConfig;
    if (!key) return data;

    const dir = direction === "asc" ? 1 : -1;

    return data.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === "subject") {
        aVal = (a.subject || a.title || "").toString().toLowerCase();
        bVal = (b.subject || b.title || "").toString().toLowerCase();
      } else if (key === "category") {
        aVal = (a.category || a.department || "").toString().toLowerCase();
        bVal = (b.category || b.department || "").toString().toLowerCase();
      } else if (key === "submittedAt") {
        aVal = new Date(a.submittedAt || a.createdAt);
        bVal = new Date(b.submittedAt || b.createdAt);
      } else if (key === "priority") {
        const order = { High: 3, Medium: 2, Low: 1 };
        const pa = (a.priority || a.Priority || "").toString();
        const pb = (b.priority || b.Priority || "").toString();
        aVal = order[pa] || 0;
        bVal = order[pb] || 0;
      }

      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }, [complaints, sortConfig]);

  if (!sortedComplaints.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-gray-700">
        <EmptyState type="complaints" />
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    const p = (priority || "").toString().toLowerCase();
    if (p.includes("high") || p.includes("urgent")) {
      return <Badge status="High" />;
    }
    if (p.includes("medium")) {
      return <Badge status="Medium" />;
    }
    if (p.includes("low")) {
      return <Badge status="Low" />;
    }
    return <Badge status="Unknown" />;
  };

  // ===== MOBILE CARD VIEW =====
  if (isMobile) {
    return (
      <div className="space-y-4 pb-20"> {/* Added padding for bottom nav */}
        {sortedComplaints.map((complaint, index) => {
          const id = complaint._id || complaint.id || index + 1;
          const subject = complaint.subject || complaint.title || "Untitled";
          const submittedBy = complaint.isAnonymous
            ? "Anonymous 🕵️"
            : complaint.submittedBy || complaint.name || complaint.email;
          const category = complaint.category || complaint.department || "General";
          const dateValue = complaint.submittedAt || complaint.createdAt;
          const status = complaint.status || complaint.Status;
          const priority = complaint.priority || complaint.Priority;

          return (
            <div
              key={id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 space-y-3 active:shadow-lg transition-shadow"
            >
              {/* Header: ID + Status */}
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  #{complaint.complaintId || `CMP${String(index + 1).padStart(3, '0')}`}
                </span>
                <Badge status={status} />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-base">
                {subject}
              </h3>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Category</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{category}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Priority</span>
                  <div className="mt-1">{getPriorityBadge(priority)}</div>
                </div>
              </div>

              {/* Submitted By */}
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400 text-xs">Submitted by:</span>
                <p className="font-medium text-gray-700 dark:text-gray-300 truncate">{submittedBy}</p>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                📅 {formatDate(dateValue)}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionClick && onActionClick("view", complaint);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
                >
                  <RiEyeLine size={18} />
                  View Details
                </button>
                {(status === "Pending" || status === "In Progress") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick && onActionClick("edit", complaint);
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 transition-colors shadow-sm"
                  >
                    <RiEditLine size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ===== DESKTOP TABLE VIEW =====
  const columns = [
    { key: "id", label: "ID", sortable: false },
    { key: "subject", label: "Subject", sortable: true },
    { key: "submittedBy", label: "Submitted", sortable: false },
    { key: "category", label: "Category", sortable: true },
    { key: "location", label: "Location", sortable: false },
    { key: "submittedAt", label: "Date", sortable: true },
    { key: "status", label: "Status", sortable: false },
    { key: "priority", label: "Priority", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300"
              >
                <div
                  className={`flex items-center gap-1 ${
                    col.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span>{col.label}</span>
                  {col.sortable && (
                    <SortIcon columnKey={col.key} sortConfig={sortConfig} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {sortedComplaints.map((complaint, index) => {
            const id = complaint._id || complaint.id || index + 1;
            const subject = complaint.subject || complaint.title || "Untitled";
            const submittedBy = complaint.isAnonymous
              ? "Anonymous 🕵️"
              : complaint.submittedBy || complaint.name || complaint.email;
            const category = complaint.category || complaint.department || "General";
            const location = complaint.location || "N/A";
            const dateValue = complaint.submittedAt || complaint.createdAt;
            const status = complaint.status || complaint.Status;
            const priority = complaint.priority || complaint.Priority;

            return (
              <tr
                key={id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors cursor-pointer"
                onClick={() => onRowClick && onRowClick(id)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  #{index + 1}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2">
                      {subject}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {complaint.complaintId || ""}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {submittedBy}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {category}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {location}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {formatDate(dateValue)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge status={status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getPriorityBadge(priority)}
                </td>
                <td
                  className="px-4 py-3 whitespace-nowrap text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ✅ ONLY VIEW BUTTON - No 3-dot menu */}
                  <button
                    onClick={() => {
                      console.log("👁️ View clicked for:", id);
                      onActionClick && onActionClick("view", complaint);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm hover:shadow-md"
                  >
                    <RiEyeLine size={16} />
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}