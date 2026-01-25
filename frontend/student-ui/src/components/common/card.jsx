import React from "react";

const Card = ({ title, children }) => {
  return (
    <div className="group bg-white rounded-3xl shadow-md p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Gradient accent - visible on hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {title && (
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">
          {title}
        </h2>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  );
};

export default Card;