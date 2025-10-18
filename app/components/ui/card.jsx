import React from 'react';

export const Card = ({ children, className }) => {
  return (
    <div className={`rounded-xl shadow-lg bg-white p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div className="p-2">{children}</div>;
};
