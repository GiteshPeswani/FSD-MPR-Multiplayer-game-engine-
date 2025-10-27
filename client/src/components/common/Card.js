import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  const hoverClasses = hover ? 'hover:shadow-2xl hover:scale-105 cursor-pointer' : '';
  
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700 transition-all duration-300 ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;