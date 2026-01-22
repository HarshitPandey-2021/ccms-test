// src/components/layout/BottomNavigation.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  RiDashboardLine,
  RiDashboardFill,
  RiAddCircleLine,
  RiAddCircleFill,
  RiFileListLine,
  RiFileListFill,
  RiUserLine,
  RiUserFill,
} from "react-icons/ri";

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/user/dashboard",
      icon: RiDashboardLine,
      activeIcon: RiDashboardFill,
      label: "Home",
    },
    {
      path: "/user/submit",
      icon: RiAddCircleLine,
      activeIcon: RiAddCircleFill,
      label: "Submit",
    },
    {
      path: "/user/my-complaints",
      icon: RiFileListLine,
      activeIcon: RiFileListFill,
      label: "Complaints",
    },
    {
      path: "/user/profile",
      icon: RiUserLine,
      activeIcon: RiUserFill,
      label: "Profile",
    },
  ];

  const isActive = (path) => {
    if (path === "/user/dashboard") {
      return location.pathname === "/" || location.pathname === "/user/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden">
      {/* Safe area for iOS */}
      <div className="flex items-center justify-around h-16 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = active ? item.activeIcon : item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-all duration-200 ${
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all duration-200 ${
                  active ? "bg-indigo-100 dark:bg-indigo-900/30 scale-110" : ""
                }`}
              >
                <Icon className="h-6 w-6" />
                {/* Active indicator dot */}
                {/* {active && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )} */}
              </div>
              <span
                className={`text-xs mt-1 font-medium transition-all duration-200 ${
                  active ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;