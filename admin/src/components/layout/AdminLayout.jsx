import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * AdminLayout Shell
 * Enforces authentication and provides the persistent Sidebar and Topbar chrome.
 * Nested views render dynamically inside the scrollable <Outlet /> area.
 */
export default function AdminLayout() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If user is not authenticated, protect admin routes by redirecting to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Topbar */}
        <Topbar />

        {/* Dynamic Nested Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
