import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {children}
    </div>
  );
}
