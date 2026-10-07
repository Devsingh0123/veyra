import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectCurrentRole } from '@/store/slices/authSlice';
import { selectIsSidebarCollapsed, toggleSidebar } from '@/store/slices/uiSlice';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: 'Live',
    roles: ['*'],
  },
  {
    path: '/catalog',
    label: 'Product Catalog',
    icon: Package,
    roles: ['*'],
  },
  {
    path: '/inventory',
    label: 'Inventory & Stock',
    icon: Layers,
    roles: ['*'],
  },
  {
    path: '/orders',
    label: 'Orders Pipeline',
    icon: ShoppingBag,
    badge: 'FSM',
    roles: ['*'],
  },
  {
    path: '/returns',
    label: 'Returns & QC',
    icon: RotateCcw,
    roles: ['*'],
  },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isCollapsed = useSelector(selectIsSidebarCollapsed);
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectCurrentRole) || 'SUPERADMIN';

  // Filter nav items by role (if roles array contains '*' or matching role)
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles.includes('*') || item.roles.includes(role?.toUpperCase())
  );

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-950/95 transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-600/10">
            <Shield className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-white">
                VEYRA
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-indigo-400">
                Operations
              </span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
        )}

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group flex items-center rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Summary when expanded */}
      <div className="border-t border-slate-800 p-3">
        {isCollapsed ? (
          <div className="flex justify-center py-1">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300"
              title={user?.email || 'Admin'}
            >
              {(user?.fullName || user?.name || user?.email || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              {(user?.fullName || user?.name || user?.email || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-semibold text-slate-200">
                {user?.fullName || user?.name || 'Administrator'}
              </span>
              <span className="truncate text-[10px] text-slate-400 font-mono">
                {user?.email || 'admin@veyra.internal'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
