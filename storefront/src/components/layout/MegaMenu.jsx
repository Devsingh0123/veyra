import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Compass, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGetCategoriesQuery } from '../../features/catalog/api/catalogApi';

// Fallback categories if catalog backend has empty or unseeded data
const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Collection', slug: 'all' },
  { id: 'electronics', name: 'Electronics', slug: 'electronics' },
  { id: 'fashion', name: 'Apparel & Fashion', slug: 'fashion' },
  { id: 'home', name: 'Home & Living', slug: 'home-living' },
  { id: 'beauty', name: 'Beauty & Wellness', slug: 'beauty-wellness' },
  { id: 'footwear', name: 'Footwear', slug: 'footwear' },
];

export default function MegaMenu() {
  const { data: catResponse } = useGetCategoriesQuery();
  const remoteCategories = catResponse?.data;

  const categories =
    remoteCategories && remoteCategories.length > 0
      ? [{ id: 'all', name: 'All Collection', slug: 'all' }, ...remoteCategories]
      : DEFAULT_CATEGORIES;

  return (
    <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Horizontal scrollable category links */}
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar text-xs font-medium scroll-smooth">
          <NavLink
            to="/catalog"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`
            }
          >
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            <span>Discover All</span>
          </NavLink>

          {categories.map((cat) => {
            const path = cat.slug === 'all' ? '/catalog' : `/catalog?category=${cat.slug}`;
            return (
              <NavLink
                key={cat.id || cat.slug}
                to={path}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                {cat.name}
              </NavLink>
            );
          })}
        </div>

        {/* Right side quick link: Hot Deals */}
        <div className="hidden lg:flex items-center pl-4 border-l border-slate-800">
          <NavLink
            to="/catalog?filter=deals"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition"
          >
            <Flame className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            <span>Flash Deals</span>
            <Badge variant="destructive" className="h-4 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider">
              HOT
            </Badge>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
