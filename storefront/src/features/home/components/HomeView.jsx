import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Zap, Award } from 'lucide-react';
import HeroBanner from './HeroBanner';
import FeaturedCategories from './FeaturedCategories';
import ProductCard from '../../catalog/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetProductsQuery } from '../../catalog/api/catalogApi';

// Fallback curated showcase items if database catalog is unseeded
const FALLBACK_TRENDING_PRODUCTS = [
  {
    id: 'prod-001',
    slug: 'studiomaster-anc-headphones',
    name: 'StudioMaster Pro Wireless ANC Over-Ear Headphones',
    category: { name: 'Electronics' },
    hsnCode: '85183000',
    gstRate: 18,
    sellingPrice: 4999,
    mrp: 7999,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-001', sku: 'AUDIO-ANC-BLK', title: 'Matte Obsidian', sellingPrice: 4999, mrp: 7999 }],
  },
  {
    id: 'prod-002',
    slug: 'chroma-smart-fitness-watch',
    name: 'ChromaFit Ultra AMOLED GPS Smartwatch (Titanium Grey)',
    category: { name: 'Electronics' },
    hsnCode: '91021200',
    gstRate: 18,
    sellingPrice: 3499,
    mrp: 5999,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-002', sku: 'WATCH-CHROMA-GRY', title: 'Titanium Grey', sellingPrice: 3499, mrp: 5999 }],
  },
  {
    id: 'prod-003',
    slug: 'craft-artisan-leather-wallet',
    name: 'Handcrafted Full-Grain Vegetable Tanned Leather Bifold Wallet',
    category: { name: 'Fashion' },
    hsnCode: '42023120',
    gstRate: 12,
    sellingPrice: 1299,
    mrp: 1999,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-003', sku: 'LEATH-WAL-BRN', title: 'Vintage Saddle Tan', sellingPrice: 1299, mrp: 1999 }],
  },
  {
    id: 'prod-004',
    slug: 'nordic-minimalist-desk-lamp',
    name: 'Nordic Lumina Minimalist Aluminum LED Desk Lamp (Warm White)',
    category: { name: 'Home & Living' },
    hsnCode: '94052090',
    gstRate: 18,
    sellingPrice: 2199,
    mrp: 3299,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-004', sku: 'HOME-LAMP-WHT', title: 'Architect Matte White', sellingPrice: 2199, mrp: 3299 }],
  },
  {
    id: 'prod-005',
    slug: 'aeroflex-organic-cotton-hoodie',
    name: 'AeroFlex Heavyweight 450 GSM Organic Cotton French Terry Hoodie',
    category: { name: 'Fashion' },
    hsnCode: '61102000',
    gstRate: 12,
    sellingPrice: 2499,
    mrp: 3999,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-005', sku: 'HOOD-AF-COAL-L', title: 'Charcoal Black - Large', sellingPrice: 2499, mrp: 3999 }],
  },
  {
    id: 'prod-006',
    slug: 'aurora-botanical-eau-de-parfum',
    name: 'Aurora Artisan Cedarwood & Bergamot Eau De Parfum (100ml)',
    category: { name: 'Beauty & Wellness' },
    hsnCode: '33030010',
    gstRate: 18,
    sellingPrice: 2899,
    mrp: 4200,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-006', sku: 'PERF-AURORA-100', title: '100ml Glass Flacon', sellingPrice: 2899, mrp: 4200 }],
  },
  {
    id: 'prod-007',
    slug: 'fastcharge-mag-duo-dock',
    name: 'MagDuo 3-in-1 Foldable 15W Qi2 Fast Wireless Charging Stand',
    category: { name: 'Electronics' },
    hsnCode: '85044090',
    gstRate: 18,
    sellingPrice: 2799,
    mrp: 4499,
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-007', sku: 'MAG-DOCK-BLK', title: 'Space Grey Aluminum', sellingPrice: 2799, mrp: 4499 }],
  },
  {
    id: 'prod-008',
    slug: 'zenith-artisan-ceramic-tumbler',
    name: 'Zenith Hand-Throuwn Matte Ceramic Coffee Tumbler with Lid (350ml)',
    category: { name: 'Home & Living' },
    hsnCode: '69120010',
    gstRate: 12,
    sellingPrice: 899,
    mrp: 1499,
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-008', sku: 'MUG-ZENITH-GRY', title: 'Stone Grey Speckle', sellingPrice: 899, mrp: 1499 }],
  },
];

export default function HomeView() {
  const { data: response } = useGetProductsQuery({ limit: 8 });

  const products =
    response?.data?.products && response.data.products.length > 0
      ? response.data.products
      : FALLBACK_TRENDING_PRODUCTS;

  return (
    <div className="flex-1 bg-slate-950">
      {/* 1. Hero Promo Section */}
      <HeroBanner />

      {/* 2. Featured Category Grid */}
      <FeaturedCategories />

      {/* 3. Trending Curated Products Showcase */}
      <section className="py-12 md:py-16 border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500 animate-pulse" />
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                  Curated Catalog
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Trending Essentials &amp; New Arrivals
              </h2>
            </div>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {products.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Statutory & Trust Proposition Banner using shadcn Card */}
      <section className="border-t border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Card className="border-indigo-500/20 bg-slate-900/80 p-8 sm:p-12 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Section 46 GST Invoicing</h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Download compliant tax invoices with HSN codes, SAC particulars and complete CGST/SGST breakdowns on every purchase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Instant UPI &amp; Razorpay</h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Zero payment failures with intelligent routing across Google Pay, PhonePe, Paytm, credit/debit cards and Netbanking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">7-Day Easy Returns</h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Doorstep returns with instant statutory Section 34 Credit Note issuance and prompt refund back to source account.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
