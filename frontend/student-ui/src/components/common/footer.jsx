// src/components/common/Footer.jsx
import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { Heart } from 'lucide-react';

const Footer = () => {
  const { isDark } = useDarkMode();

  return (
    <footer
      className={`py-8 border-t ${
        isDark
          ? 'bg-gray-950 border-gray-800 text-gray-400'
          : 'bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200 text-gray-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className={isDark ? 'text-gray-500' : 'text-teal-700'}>
          © {new Date().getFullYear()} University of Lucknow | Campus Complaint Portal
        </p>
        <p
          className={`text-sm mt-2 flex items-center justify-center gap-1 ${
            isDark ? 'text-gray-600' : 'text-gray-500'
          }`}
        >
          Built with <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> by B.Tech AI Students
        </p>
      </div>
    </footer>
  );
};

export default Footer;