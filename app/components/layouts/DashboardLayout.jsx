import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 mb-6 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-100">Panel de Control</h1>
      </header>
      <main className="max-w-6xl px-4 mx-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
