import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  Search,
  User,
  ShoppingBag,
  Package,
  ShieldCheck,
  Headphones,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { closeMobileNav } from '../../store/slices/uiSlice';
import { logoutCustomer } from '../../store/slices/authSlice';
import { useGetCategoriesQuery } from '../../features/catalog/api/catalogApi';

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'electronics', name: 'Electronics & Audio', slug: 'electronics' },
  { id: 'fashion', name: 'Apparel & Fashion', slug: 'fashion' },
  { id: 'home', name: 'Home & Kitchen', slug: 'home-living' },
  { id: 'beauty', name: 'Beauty & Wellness', slug: 'beauty-wellness' },
  { id: 'footwear', name: 'Footwear & Bags', slug: 'footwear' },
];

export default function MobileNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const { isMobileNavOpen } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data: catResponse } = useGetCategoriesQuery();

  const categories =
    catResponse?.data && catResponse.data.length > 0
      ? [{ id: 'all', name: 'All Products', slug: 'all' }, ...catResponse.data]
      : DEFAULT_CATEGORIES;

  if (!isMobileNavOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(closeMobileNav());
      navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleNavClick = (path) => {
    dispatch(closeMobileNav());
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logoutCustomer());
    dispatch(closeMobileNav());
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(closeMobileNav())}
      />

      {/* Slide-over panel */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-950 border-r border-slate-800 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
              V
            </div>
            <span className="text-lg font-black tracking-wider text-white">VEYRA</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closeMobileNav())}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800/80">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search store..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </form>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div>
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Browse Categories
            </p>
            <div className="space-y-1">
              {categories.map((cat) => {
                const targetPath =
                  cat.slug === 'all' ? '/catalog' : `/catalog?category=${cat.slug}`;
                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onClick={() => handleNavClick(targetPath)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-200 hover:bg-slate-900 hover:text-white transition"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account &amp; Orders
            </p>
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-3 py-2 rounded-xl bg-slate-900/60 mb-2">
                  <p className="text-xs font-semibold text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavClick('/account')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 transition"
                >
                  <Package className="h-4 w-4 text-indigo-400" />
                  <span>My Orders &amp; Invoices</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('/account')}
                className="flex w-full items-center gap-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition"
              >
                <User className="h-4 w-4 text-indigo-400" />
                <span>Customer Sign In / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info in drawer */}
        <div className="border-t border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-medium mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Section 46 GST Compliant Store</span>
          </div>
          <p className="text-[10px] text-slate-400">
            GSTIN: 27AABCU9603R1ZN • Mumbai, MH
          </p>
        </div>
      </div>
    </div>
  );
}
