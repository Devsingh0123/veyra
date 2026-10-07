import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  ChevronRight,
  Search,
  Sparkles,
  Grid3X3,
  LayoutGrid,
  RotateCcw,
  PackageOpen,
  ArrowUpDown,
  Flame,
} from 'lucide-react';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useGetCategoriesQuery, useGetProductsQuery } from '../api/catalogApi';

// Fallback curated products if backend has empty or unseeded catalog
const FALLBACK_CATALOG = [
  {
    id: 'prod-001',
    slug: 'studiomaster-anc-headphones',
    name: 'StudioMaster Pro Wireless ANC Over-Ear Headphones',
    category: { id: 'electronics', name: 'Electronics', slug: 'electronics' },
    hsnCode: '85183000',
    gstRate: 18,
    sellingPrice: 4999,
    mrp: 7999,
    rating: 4.9,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-001', sku: 'AUDIO-ANC-BLK', title: 'Matte Obsidian', sellingPrice: 4999, mrp: 7999 }],
  },
  {
    id: 'prod-002',
    slug: 'chroma-smart-fitness-watch',
    name: 'ChromaFit Ultra AMOLED GPS Smartwatch (Titanium Grey)',
    category: { id: 'electronics', name: 'Electronics', slug: 'electronics' },
    hsnCode: '91021200',
    gstRate: 18,
    sellingPrice: 3499,
    mrp: 5999,
    rating: 4.8,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-002', sku: 'WATCH-CHROMA-GRY', title: 'Titanium Grey', sellingPrice: 3499, mrp: 5999 }],
  },
  {
    id: 'prod-003',
    slug: 'craft-artisan-leather-wallet',
    name: 'Handcrafted Full-Grain Vegetable Tanned Leather Bifold Wallet',
    category: { id: 'fashion', name: 'Fashion & Apparel', slug: 'fashion' },
    hsnCode: '42023120',
    gstRate: 12,
    sellingPrice: 1299,
    mrp: 1999,
    rating: 4.7,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-003', sku: 'LEATH-WAL-BRN', title: 'Vintage Saddle Tan', sellingPrice: 1299, mrp: 1999 }],
  },
  {
    id: 'prod-004',
    slug: 'nordic-minimalist-desk-lamp',
    name: 'Nordic Lumina Minimalist Aluminum LED Desk Lamp (Warm White)',
    category: { id: 'home', name: 'Home & Living', slug: 'home-living' },
    hsnCode: '94052090',
    gstRate: 18,
    sellingPrice: 2199,
    mrp: 3299,
    rating: 4.6,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-004', sku: 'HOME-LAMP-WHT', title: 'Architect Matte White', sellingPrice: 2199, mrp: 3299 }],
  },
  {
    id: 'prod-005',
    slug: 'aeroflex-organic-cotton-hoodie',
    name: 'AeroFlex Heavyweight 450 GSM Organic Cotton French Terry Hoodie',
    category: { id: 'fashion', name: 'Fashion & Apparel', slug: 'fashion' },
    hsnCode: '61102000',
    gstRate: 12,
    sellingPrice: 2499,
    mrp: 3999,
    rating: 4.8,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-005', sku: 'HOOD-AF-COAL-L', title: 'Charcoal Black - Large', sellingPrice: 2499, mrp: 3999 }],
  },
  {
    id: 'prod-006',
    slug: 'aurora-botanical-eau-de-parfum',
    name: 'Aurora Artisan Cedarwood & Bergamot Eau De Parfum (100ml)',
    category: { id: 'beauty', name: 'Beauty & Wellness', slug: 'beauty-wellness' },
    hsnCode: '33030010',
    gstRate: 18,
    sellingPrice: 2899,
    mrp: 4200,
    rating: 4.9,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-006', sku: 'PERF-AURORA-100', title: '100ml Glass Flacon', sellingPrice: 2899, mrp: 4200 }],
  },
  {
    id: 'prod-007',
    slug: 'fastcharge-mag-duo-dock',
    name: 'MagDuo 3-in-1 Foldable 15W Qi2 Fast Wireless Charging Stand',
    category: { id: 'electronics', name: 'Electronics', slug: 'electronics' },
    hsnCode: '85044090',
    gstRate: 18,
    sellingPrice: 2799,
    mrp: 4499,
    rating: 4.5,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-007', sku: 'MAG-DOCK-BLK', title: 'Space Grey Aluminum', sellingPrice: 2799, mrp: 4499 }],
  },
  {
    id: 'prod-008',
    slug: 'zenith-artisan-ceramic-tumbler',
    name: 'Zenith Hand-Thrown Matte Ceramic Coffee Tumbler with Lid (350ml)',
    category: { id: 'home', name: 'Home & Living', slug: 'home-living' },
    hsnCode: '69120010',
    gstRate: 12,
    sellingPrice: 899,
    mrp: 1499,
    rating: 4.7,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-008', sku: 'MUG-ZENITH-GRY', title: 'Stone Grey Speckle', sellingPrice: 899, mrp: 1499 }],
  },
  {
    id: 'prod-009',
    slug: 'solace-linen-oversized-shirt',
    name: 'Solace Relaxed Pure European Linen Button-Down Shirt (Sand Dune)',
    category: { id: 'fashion', name: 'Fashion & Apparel', slug: 'fashion' },
    hsnCode: '62052000',
    gstRate: 12,
    sellingPrice: 2299,
    mrp: 3499,
    rating: 4.6,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-009', sku: 'SHIRT-LINEN-SND-M', title: 'Sand Dune - Medium', sellingPrice: 2299, mrp: 3499 }],
  },
  {
    id: 'prod-010',
    slug: 'lumos-portable-espresso-maker',
    name: 'Lumos Compact 18-Bar Handheld Manual Espresso Maker',
    category: { id: 'home', name: 'Home & Living', slug: 'home-living' },
    hsnCode: '85167100',
    gstRate: 18,
    sellingPrice: 3899,
    mrp: 5499,
    rating: 4.8,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-010', sku: 'ESPRESSO-LUMOS-BLK', title: 'Stealth Matte Black', sellingPrice: 3899, mrp: 5499 }],
  },
];

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Collection', slug: 'all' },
  { id: 'electronics', name: 'Electronics', slug: 'electronics' },
  { id: 'fashion', name: 'Fashion & Apparel', slug: 'fashion' },
  { id: 'home-living', name: 'Home & Living', slug: 'home-living' },
  { id: 'beauty-wellness', name: 'Beauty & Wellness', slug: 'beauty-wellness' },
  { id: 'footwear', name: 'Footwear & Bags', slug: 'footwear' },
];

export default function CatalogView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeParams = useParams();

  const searchQuery = searchParams.get('q') || '';
  const filterParam = searchParams.get('filter') || '';
  const initialCategory =
    routeParams.slug || routeParams.categorySlug || searchParams.get('category') || 'all';

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([10000]);
  const [selectedPriceBracket, setSelectedPriceBracket] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync category when URL changes
  useEffect(() => {
    const urlCategory =
      routeParams.slug || routeParams.categorySlug || searchParams.get('category') || 'all';
    setSelectedCategory(urlCategory);
  }, [routeParams.slug, routeParams.categorySlug, searchParams]);

  // Data fetching
  const { data: catResponse } = useGetCategoriesQuery();
  const { data: prodResponse, isLoading } = useGetProductsQuery({
    search: searchQuery || undefined,
  });

  const categories =
    catResponse?.data && catResponse.data.length > 0
      ? catResponse.data
      : DEFAULT_CATEGORIES.filter((c) => c.slug !== 'all');

  const rawProducts =
    prodResponse?.data?.products && prodResponse.data.products.length > 0
      ? prodResponse.data.products
      : FALLBACK_CATALOG;

  // Active filters calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && selectedCategory !== 'all') count++;
    if (priceRange[0] < 10000) count++;
    if (selectedPriceBracket !== 'all') count++;
    if (inStockOnly) count++;
    if (minRating) count++;
    return count;
  }, [selectedCategory, priceRange, selectedPriceBracket, inStockOnly, minRating]);

  // Filtered & sorted products pipeline
  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((product) => {
        // 1. Search Query Filter
        if (searchQuery) {
          const matchName = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchDesc = product.description?.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchName && !matchDesc) return false;
        }

        // 2. Category Filter
        if (selectedCategory && selectedCategory !== 'all') {
          const catSlug = product.category?.slug || '';
          const catId = product.category?.id || '';
          const catName = product.category?.name?.toLowerCase() || '';
          const target = selectedCategory.toLowerCase();
          const matches =
            catSlug.toLowerCase() === target ||
            catId.toLowerCase() === target ||
            catName.includes(target);
          if (!matches) return false;
        }

        // 3. Price Filter (via slider)
        const price =
          product.variants?.[0]?.sellingPrice ?? product.sellingPrice ?? 0;
        if (price > priceRange[0]) return false;

        // 4. Price Bracket Filter (via radio)
        if (selectedPriceBracket === 'under-1500' && price > 1500) return false;
        if (selectedPriceBracket === '1500-3000' && (price < 1500 || price > 3000)) return false;
        if (selectedPriceBracket === '3000-5000' && (price < 3000 || price > 5000)) return false;
        if (selectedPriceBracket === 'above-5000' && price < 5000) return false;

        // 5. In-Stock Filter
        if (inStockOnly && product.isAvailable === false) return false;

        // 6. Rating Filter (4.0+)
        const rating = product.rating ?? 4.8;
        if (minRating && rating < 4.0) return false;

        // 7. Flash Deals Filter
        if (filterParam === 'deals') {
          const mrp = product.variants?.[0]?.mrp ?? product.mrp ?? price;
          if (mrp <= price) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.variants?.[0]?.sellingPrice ?? a.sellingPrice ?? 0;
        const priceB = b.variants?.[0]?.sellingPrice ?? b.sellingPrice ?? 0;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating ?? 4.5) - (a.rating ?? 4.5);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // default featured
      });
  }, [
    rawProducts,
    searchQuery,
    selectedCategory,
    priceRange,
    selectedPriceBracket,
    inStockOnly,
    minRating,
    filterParam,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setPriceRange([10000]);
    setSelectedPriceBracket('all');
    setInStockOnly(false);
    setMinRating(false);
    setSortBy('featured');
    if (searchQuery) {
      setSearchParams({});
    }
  };

  const currentCategoryObj = categories.find(
    (c) => c.slug === selectedCategory || c.id === selectedCategory
  );
  const currentCategoryName = currentCategoryObj?.name || (selectedCategory === 'all' ? 'All Collections' : selectedCategory);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100">
      {/* 1. Header & Breadcrumbs Banner */}
      <section className="border-b border-slate-800/80 bg-slate-900/50 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <Link to="/catalog" className="hover:text-white transition">Catalog</Link>
            {selectedCategory && selectedCategory !== 'all' && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span className="text-indigo-400 font-medium capitalize">
                  {currentCategoryName}
                </span>
              </>
            )}
            {searchQuery && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span className="text-indigo-400 font-medium">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              </>
            )}
          </nav>

          {/* Title & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {filterParam === 'deals' ? (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <Flame className="h-3.5 w-3.5 animate-pulse" />
                    <span>Flash Deals Active</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-xs">
                    <Sparkles className="h-3 w-3 mr-1 text-amber-400" />
                    Verified Catalog
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1 capitalize">
                {searchQuery ? `Search Results for "${searchQuery}"` : currentCategoryName}
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Displaying <strong>{filteredProducts.length}</strong> authenticated items with Section 46 GST tax invoice compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content: Sidebar + Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Toolbar: Mobile Filters Toggle, Active Badges, Sort & Layout Switchers */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden gap-1.5 border-slate-800 bg-slate-900 text-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="h-4 px-1 text-[10px]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Active Filters Summary Chips */}
            {activeFiltersCount > 0 && (
              <div className="hidden sm:flex flex-wrap items-center gap-1.5">
                {selectedCategory !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer bg-slate-900 border-slate-800 text-xs hover:border-slate-700"
                    onClick={() => setSelectedCategory('all')}
                  >
                    <span>{currentCategoryName}</span>
                    <span className="text-slate-500 hover:text-white">✕</span>
                  </Badge>
                )}
                {priceRange[0] < 10000 && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer bg-slate-900 border-slate-800 text-xs hover:border-slate-700"
                    onClick={() => setPriceRange([10000])}
                  >
                    <span>Under ₹{Number(priceRange[0]).toLocaleString('en-IN')}</span>
                    <span className="text-slate-500 hover:text-white">✕</span>
                  </Badge>
                )}
                {inStockOnly && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer bg-slate-900 border-slate-800 text-xs hover:border-slate-700"
                    onClick={() => setInStockOnly(false)}
                  >
                    <span>In-Stock Only</span>
                    <span className="text-slate-500 hover:text-white">✕</span>
                  </Badge>
                )}
                {minRating && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer bg-slate-900 border-slate-800 text-xs hover:border-slate-700"
                    onClick={() => setMinRating(false)}
                  >
                    <span>4★ &amp; Above</span>
                    <span className="text-slate-500 hover:text-white">✕</span>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-400 hover:text-rose-400"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Right Toolbar: Sort Select + View Layout Toggles */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Sort Dropdown via shadcn Select */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs text-slate-400 font-medium">
                Sort By:
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[170px] h-8 text-xs bg-slate-900/80 border-slate-800 text-slate-200">
                  <SelectValue placeholder="Sort Products" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="featured">Featured / Best Match</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Customer Rating</SelectItem>
                  <SelectItem value="name">Alphabetical (A - Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid Layout Switcher */}
            <div className="hidden sm:flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setViewMode('grid')}
                className={`h-7 w-7 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Standard Grid View"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setViewMode('compact')}
                className={`h-7 w-7 ${
                  viewMode === 'compact'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Compact Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Main Grid layout: Sidebar (25%) + Product Grid (75%) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                selectedPriceBracket={selectedPriceBracket}
                onSelectPriceBracket={setSelectedPriceBracket}
                inStockOnly={inStockOnly}
                onToggleInStock={setInStockOnly}
                minRating={minRating}
                onToggleMinRating={setMinRating}
                onResetFilters={handleResetFilters}
                activeFiltersCount={activeFiltersCount}
              />
            </div>
          </aside>

          {/* Products Grid Column */}
          <main className="lg:col-span-3">
            {isLoading ? (
              /* Loading Skeletons via shadcn Skeleton */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
                  >
                    <Skeleton className="aspect-square w-full rounded-xl bg-slate-800" />
                    <Skeleton className="h-4 w-3/4 bg-slate-800" />
                    <Skeleton className="h-4 w-1/2 bg-slate-800" />
                    <Skeleton className="h-8 w-full rounded-lg bg-slate-800 mt-2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mb-4">
                  <PackageOpen className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white">No products found</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">
                  We couldn&apos;t find any items matching your active filter criteria. Try adjusting your price bracket or clearing some filters.
                </p>
                <Button
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-5 gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </Button>
              </div>
            ) : (
              /* Products Grid */
              <div
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === 'compact'
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer via shadcn Sheet */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent
          side="left"
          className="w-full sm:max-w-sm bg-slate-950 border-r border-slate-800 text-slate-100 p-4 overflow-y-auto"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-bold text-white">
              Filter Catalog
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-400">
              Refine products by department, price, stock, and ratings.
            </SheetDescription>
          </SheetHeader>

          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setMobileFilterOpen(false);
            }}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            selectedPriceBracket={selectedPriceBracket}
            onSelectPriceBracket={(bracket) => {
              setSelectedPriceBracket(bracket);
              setMobileFilterOpen(false);
            }}
            inStockOnly={inStockOnly}
            onToggleInStock={setInStockOnly}
            minRating={minRating}
            onToggleMinRating={setMinRating}
            onResetFilters={() => {
              handleResetFilters();
              setMobileFilterOpen(false);
            }}
            activeFiltersCount={activeFiltersCount}
          />

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Button
              className="w-full"
              onClick={() => setMobileFilterOpen(false)}
            >
              Show {filteredProducts.length} Results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
