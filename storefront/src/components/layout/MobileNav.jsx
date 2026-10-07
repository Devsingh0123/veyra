import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  User as UserIcon,
  Package,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { closeMobileNav } from '../../store/slices/uiSlice';
import { logoutCustomer } from '../../store/slices/authSlice';
import { useGetCategoriesQuery } from '../../features/catalog/api/catalogApi';
import { toast } from 'sonner';

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
    toast.info('Signed out successfully');
    navigate('/');
  };

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user?.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'U';

  return (
    <Sheet
      open={isMobileNavOpen}
      onOpenChange={(open) => !open && dispatch(closeMobileNav())}
    >
      <SheetContent
        side="left"
        className="w-full sm:max-w-xs bg-slate-950 border-r border-slate-800 text-slate-100 p-0 flex flex-col justify-between"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">
              V
            </div>
            <div>
              <SheetTitle className="text-base font-extrabold text-white">
                VEYRA
              </SheetTitle>
              <SheetDescription className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                Storefront Navigation
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Search */}
        <div className="p-4 border-b border-slate-800/80">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search catalog..."
              className="pl-9 bg-slate-900/90 text-xs border-slate-800 text-slate-100 placeholder:text-slate-500"
            />
          </form>
        </div>

        {/* Scrollable Navigation Area via ScrollArea */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between px-2 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Browse Categories
                  </p>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[10px] py-0 px-1.5">
                    Curated
                  </Badge>
                </div>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const targetPath =
                      cat.slug === 'all' ? '/catalog' : `/catalog?category=${cat.slug}`;
                    return (
                      <Button
                        key={cat.id || cat.slug}
                        variant="ghost"
                        onClick={() => handleNavClick(targetPath)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-900 hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{cat.name}</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div>
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Account &amp; Orders
                </p>
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                      <Avatar size="sm" className="h-7 w-7 bg-indigo-600/30 text-indigo-300">
                        <AvatarFallback className="bg-indigo-600/30 text-indigo-300 text-xs font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => handleNavClick('/account')}
                      className="w-full justify-start gap-2.5 text-xs text-slate-200 hover:bg-slate-900"
                    >
                      <Package className="h-4 w-4 text-indigo-400" />
                      <span>My Orders &amp; Invoices</span>
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start gap-2.5 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleNavClick('/account')}
                    className="w-full justify-start gap-2.5 text-xs bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30"
                  >
                    <UserIcon className="h-4 w-4 text-indigo-400" />
                    <span>Customer Sign In / Register</span>
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer info in drawer */}
        <div className="border-t border-slate-800 bg-slate-900/50 p-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-medium mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Section 46 GST Compliant Store</span>
          </div>
          <p className="text-[10px] text-slate-400">
            GSTIN: 27AABCU9603R1ZN • Mumbai, MH
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
