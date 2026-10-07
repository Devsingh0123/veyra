import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentRole } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/features/auth/api/authApi';
import {
  ChevronRight,
  LogOut,
  Radio,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';

const ROUTE_TITLES = {
  '/': 'Operations Dashboard',
  '/catalog': 'Product Catalog & SKUs',
  '/inventory': 'Inventory & Stock Holds',
  '/orders': 'Orders Lifecycle & FSM',
  '/returns': 'Returns & QC Inspection',
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectCurrentRole) || 'SUPERADMIN';
  const [logoutTrigger, { isLoading: isLoggingOut }] = useLogoutMutation();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Portal';

  const handleLogout = async () => {
    try {
      await logoutTrigger().unwrap();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/"
          className="text-slate-400 hover:text-slate-200 transition font-medium"
        >
          Control Plane
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="font-semibold text-white tracking-wide">
          {currentTitle}
        </span>
      </div>

      {/* Right Telemetry & Session Management */}
      <div className="flex items-center gap-4">
        {/* Gateway Health Indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Gateway: 3000 Connected</span>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs">
          <span className="text-[11px] font-medium text-slate-400">Role:</span>
          <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
            {role}
          </span>
        </div>

        {/* Sign Out Action Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200 focus:outline-none"
          title="Sign out of administrative session"
        >
          {isLoggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
