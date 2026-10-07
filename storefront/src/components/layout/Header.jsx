import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { openCart } from '../../store/slices/cartSlice';
import { toggleMobileNav } from '../../store/slices/uiSlice';
import { logoutCustomer } from '../../store/slices/authSlice';
import { useGetCartQuery } from '../../features/cart/api/cartApi';
import { toast } from 'sonner';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');

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
    toast.info('Signed out of your customer account');
    navigate('/');
  };

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user?.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'U';

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
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dispatch(toggleMobileNav())}
                  className="lg:hidden text-slate-300 hover:text-white"
                  aria-label="Toggle navigation drawer"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Open Menu</TooltipContent>
          </Tooltip>

          <Link to="/" className="flex items-center gap-2.5 group">
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
                className="pl-10 pr-20 bg-slate-900/90 text-sm border-slate-800 focus:border-indigo-500 text-slate-100 placeholder:text-slate-500"
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
          {/* Account Menu with shadcn DropdownMenu & Avatar */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-slate-800 bg-slate-900/70 hover:bg-slate-900 text-slate-200"
                  />
                }
              >
                <Avatar size="sm" className="h-5 w-5 bg-indigo-600/30 text-indigo-300 font-bold text-[10px]">
                  <AvatarFallback className="bg-indigo-600/30 text-indigo-300">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline max-w-[100px] truncate font-medium">
                  {user?.firstName || 'Account'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-900 border-slate-800 text-slate-200 p-1.5 shadow-2xl"
              >
                <DropdownMenuLabel className="px-3 py-2 text-xs">
                  <p className="font-semibold text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-slate-400 truncate text-[11px] font-normal">
                    {user?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={() => navigate('/account')}
                  className="cursor-pointer gap-2 text-xs hover:bg-slate-800 hover:text-white"
                >
                  <Package className="h-4 w-4 text-indigo-400" />
                  <span>Orders &amp; Tracking</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/catalog')}
                  className="cursor-pointer gap-2 text-xs hover:bg-slate-800 hover:text-white"
                >
                  <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                  <span>Explore Collections</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="cursor-pointer gap-2 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/account">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-slate-800 bg-slate-900/70 hover:bg-slate-900 text-slate-200"
              >
                <UserIcon className="h-4 w-4 text-indigo-400" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}

          {/* Cart Bag Drawer Trigger with shadcn Tooltip, Button & Badge */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  onClick={() => dispatch(openCart())}
                  size="sm"
                  className="relative gap-2 shadow-md shadow-indigo-600/20"
                  aria-label="Open shopping cart"
                />
              }
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
            </TooltipTrigger>
            <TooltipContent side="bottom">
              View Shopping Bag ({itemCount})
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
