import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { openCart } from '../../store/slices/cartSlice';
import { toggleMobileNav } from '../../store/slices/uiSlice';
import { logoutCustomer } from '../../store/slices/authSlice';
import { useGetCartQuery } from '../../features/cart/api/cartApi';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data: cartResponse } = useGetCartQuery(undefined, {
    refetchOnFocus: true,
  });

  const cart = cartResponse?.data;
  const itemCount =
    cart?.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutCustomer());
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/40 px-4 py-1.5 text-center text-xs font-medium text-indigo-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>100% Genuine • Section 46 GST Invoicing</span>
          </div>
          <div className="flex-1 text-center font-normal sm:font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Complimentary Express Shipping on all orders above <strong>₹999</strong></span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>24/7 Support: support@veyra.in</span>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch(toggleMobileNav())}
            className="lg:hidden"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white font-black shadow-lg shadow-indigo-600/25 group-hover:shadow-indigo-500/40 transition">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition">
                VEYRA
              </span>
              <span className="text-[10px] -mt-1 tracking-widest uppercase font-semibold text-indigo-400">
                Premium Store
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar with shadcn Input and Button */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 z-10" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, brands, or categories..."
                className="pl-10 pr-20 bg-slate-900/90 text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-16 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <Button
                type="submit"
                size="xs"
                className="absolute right-1.5 h-7 px-3 text-xs"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Actions (Account, Cart) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Account Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="gap-2"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-[11px]">
                  {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user?.firstName || 'My Account'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </Button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <p className="font-semibold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-slate-400 truncate text-[11px]">{user?.email}</p>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Package className="h-3.5 w-3.5 text-indigo-400" />
                    Orders &amp; Tracking
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/account">
              <Button variant="outline" size="sm" className="gap-1.5">
                <User className="h-4 w-4 text-indigo-400" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}

          {/* Cart Bag Drawer Trigger with shadcn Button & Badge */}
          <Button
            type="button"
            onClick={() => dispatch(openCart())}
            size="sm"
            className="relative gap-2"
            aria-label="Open shopping cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            {itemCount > 0 && (
              <Badge
                variant="default"
                className="bg-white text-indigo-600 hover:bg-white h-5 min-w-5 p-0 flex items-center justify-center rounded-full text-[10px] font-black animate-pulse"
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
