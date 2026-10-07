import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ChevronRight,
  ShoppingBag,
  Zap,
  ShieldCheck,
  RotateCcw,
  Star,
  Plus,
  Minus,
  Check,
  Truck,
  Sparkles,
  Share2,
} from 'lucide-react';
import ProductGallery from './ProductGallery';
import VariantSelector from './VariantSelector';
import PinDeliveryChecker from './PinDeliveryChecker';
import ProductSpecsTabs from './ProductSpecsTabs';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProductBySlugQuery, useGetProductsQuery } from '../api/catalogApi';
import { useAddToCartMutation } from '../../cart/api/cartApi';
import { openCart } from '../../../store/slices/cartSlice';
import { toast } from 'sonner';

// Curated fallbacks if backend does not yet have this specific item seeded
const FALLBACK_PRODUCTS_MAP = {
  'studiomaster-anc-headphones': {
    id: 'prod-001',
    slug: 'studiomaster-anc-headphones',
    name: 'StudioMaster Pro Wireless ANC Over-Ear Headphones',
    description:
      'Engineered with custom 40mm bio-cellulose drivers, 3-level hybrid active noise cancellation, and up to 45 hours of ultra-low latency wireless listening. Built with an aviation-grade aluminum frame and plush memory foam protein leather earcups.',
    category: { id: 'electronics', name: 'Electronics', slug: 'electronics' },
    hsnCode: '85183000',
    gstRate: 18,
    sellingPrice: 4999,
    mrp: 7999,
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'var-001', sku: 'AUDIO-ANC-BLK', title: 'Matte Obsidian Black', sellingPrice: 4999, mrp: 7999, weightGrams: 280, inventory: { stockQuantity: 12 } },
      { id: 'var-001-slv', sku: 'AUDIO-ANC-SLV', title: 'Lunar Silver Edition', sellingPrice: 5299, mrp: 8299, weightGrams: 280, inventory: { stockQuantity: 4 } },
      { id: 'var-001-gld', sku: 'AUDIO-ANC-GLD', title: 'Champagne Gold Pro', sellingPrice: 5499, mrp: 8499, weightGrams: 280, inventory: { stockQuantity: 2 } },
    ],
    attributes: {
      battery_life: '45 Hours Playback',
      connectivity: 'Bluetooth 5.3 + 3.5mm Aux',
      noise_cancellation: 'Hybrid ANC (-38dB)',
      charging: 'USB-C Fast Charging (10m = 5h)',
    },
  },
  'chroma-smart-fitness-watch': {
    id: 'prod-002',
    slug: 'chroma-smart-fitness-watch',
    name: 'ChromaFit Ultra AMOLED GPS Smartwatch (Titanium Grey)',
    description:
      'Featuring a sapphire glass 1.43-inch AMOLED high-brightness always-on display, dual-frequency multi-satellite GPS tracking, and comprehensive 24/7 cardiovascular biometric monitoring.',
    category: { id: 'electronics', name: 'Electronics', slug: 'electronics' },
    hsnCode: '91021200',
    gstRate: 18,
    sellingPrice: 3499,
    mrp: 5999,
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'var-002', sku: 'WATCH-CHROMA-GRY', title: 'Titanium Grey / Fluororubber Band', sellingPrice: 3499, mrp: 5999, weightGrams: 52, inventory: { stockQuantity: 8 } },
      { id: 'var-002-blk', sku: 'WATCH-CHROMA-BLK', title: 'Midnight Carbon / Leather Band', sellingPrice: 3799, mrp: 6299, weightGrams: 52, inventory: { stockQuantity: 5 } },
    ],
    attributes: {
      display: '1.43-inch AMOLED (466x466)',
      water_resistance: '5 ATM (50m Waterproof)',
      battery_life: '14 Days Typical Use',
    },
  },
};

export default function ProductDetailView() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Data fetching
  const { data: response, isLoading } = useGetProductBySlugQuery(slug, {
    skip: !slug,
  });
  const { data: relatedResponse } = useGetProductsQuery({ limit: 4 });
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const product =
    response?.data ||
    FALLBACK_PRODUCTS_MAP[slug] ||
    FALLBACK_PRODUCTS_MAP['studiomaster-anc-headphones'];

  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};

  const sellingPrice =
    currentVariant.sellingPrice ?? product.sellingPrice ?? 1999;
  const mrp =
    currentVariant.mrp ?? product.mrp ?? Math.round(sellingPrice * 1.35);
  const discountPercent =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const savings = mrp - sellingPrice;

  const relatedProducts =
    relatedResponse?.data?.products?.filter((p) => p.id !== product.id).slice(0, 4) || [];

  const handleAddToCart = async () => {
    const targetVariantId = currentVariant.id || product.variantId || product.id;
    if (!targetVariantId) return;

    try {
      await addToCart({ variantId: targetVariantId, quantity }).unwrap();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      toast.success(`Added ${quantity} × "${product.name}" to your bag!`, {
        description: 'Complimentary express shipping applied on orders above ₹999.',
      });
      dispatch(openCart());
    } catch {
      toast.error('Failed to add item to bag. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    const targetVariantId = currentVariant.id || product.variantId || product.id;
    if (!targetVariantId) return;

    try {
      await addToCart({ variantId: targetVariantId, quantity }).unwrap();
      navigate('/checkout');
    } catch {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Product link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <Skeleton className="aspect-square w-full rounded-2xl bg-slate-900" />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <Skeleton className="h-6 w-1/4 bg-slate-900" />
            <Skeleton className="h-10 w-3/4 bg-slate-900" />
            <Skeleton className="h-8 w-1/3 bg-slate-900" />
            <Skeleton className="h-20 w-full bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 text-slate-100">
      {/* 1. Breadcrumb navigation */}
      <section className="border-b border-slate-800/80 bg-slate-900/40 py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <Link to="/catalog" className="hover:text-white transition">Catalog</Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <Link
              to={`/catalog?category=${product.category?.slug || 'all'}`}
              className="hover:text-white transition capitalize"
            >
              {product.category?.name || product.category || 'Collection'}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-indigo-400 font-medium truncate max-w-[200px] sm:max-w-md">
              {product.name}
            </span>
          </nav>
        </div>
      </section>

      {/* 2. Main Product Hero (Gallery + Purchasing Console) */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Image Gallery (55%) */}
            <div className="lg:col-span-6">
              <ProductGallery
                images={product.images}
                productName={product.name}
                discountPercent={discountPercent}
                gstRate={product.gstRate ?? 18}
              />
            </div>

            {/* Right Column: Purchasing & Specifications Console (45%) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category tag, Rating & Share */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs py-0.5">
                    {product.category?.name || product.category || 'Curated Luxury'}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span className="font-bold text-slate-200">
                      {product.rating ?? 4.9}
                    </span>
                    <span className="text-slate-500 text-[11px]">(328 reviews)</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleShare}
                  className="text-slate-400 hover:text-white"
                  title="Share product link"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Title & SKU */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {product.name}
                </h1>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                  <span>SKU: <strong className="text-slate-200 font-mono">{currentVariant?.sku || 'VYR-001'}</strong></span>
                  <span>•</span>
                  <span>HSN: <strong className="text-indigo-400 font-mono">{product.hsnCode || '85183000'}</strong></span>
                </div>
              </div>

              {/* Price Banner with Section 46 GST Compliance */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">
                    ₹{Number(sellingPrice).toLocaleString('en-IN')}
                  </span>
                  {mrp > sellingPrice && (
                    <span className="text-sm text-slate-500 line-through">
                      ₹{Number(mrp).toLocaleString('en-IN')}
                    </span>
                  )}
                  {savings > 0 && (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs font-bold">
                      Save ₹{Number(savings).toLocaleString('en-IN')} ({discountPercent}% OFF)
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Inclusive of all statutory taxes • Section 46 GST Invoice generated automatically.
                  </span>
                </div>
              </div>

              {/* Variant Selector */}
              {variants.length > 0 && (
                <VariantSelector
                  variants={variants}
                  selectedVariantIndex={selectedVariantIndex}
                  onSelectVariant={setSelectedVariantIndex}
                />
              )}

              {/* Quantity Stepper & Main Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Quantity:
                  </span>
                  <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-7 w-7 text-slate-400 hover:text-white"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="px-3 text-xs font-bold text-white min-w-[28px] text-center">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={quantity >= 10}
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="h-7 w-7 text-slate-400 hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`gap-2 h-12 text-sm font-bold shadow-lg shadow-indigo-600/25 ${
                      justAdded ? 'bg-emerald-600 hover:bg-emerald-500' : ''
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleBuyNow}
                    disabled={isAdding}
                    className="gap-2 h-12 text-sm font-bold border-indigo-500/40 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                  >
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Instant Checkout</span>
                  </Button>
                </div>
              </div>

              {/* Indian PIN Code Delivery Checker */}
              <PinDeliveryChecker price={sellingPrice} />

              {/* Statutory Guarantee Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-[11px] text-slate-400">
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 mx-auto" />
                  <span className="font-semibold text-slate-200 block">100% Genuine</span>
                  <span className="text-[10px]">Verified Origin</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                  <RotateCcw className="h-4 w-4 text-indigo-400 mx-auto" />
                  <span className="font-semibold text-slate-200 block">7-Day Returns</span>
                  <span className="text-[10px]">Credit Note Refund</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                  <Truck className="h-4 w-4 text-amber-400 mx-auto" />
                  <span className="font-semibold text-slate-200 block">Free Shipping</span>
                  <span className="text-[10px]">On Orders &gt; ₹999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deep Specifications, Features & Statutory Tabs */}
      <section className="py-8 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ProductSpecsTabs product={product} currentVariant={currentVariant} />
        </div>
      </section>

      {/* 4. Curated Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="py-12 border-t border-slate-800 bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  Recommended For You
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Customers Also Viewed
                </h3>
              </div>
              <Link
                to="/catalog"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
              >
                <span>View Full Catalog</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
