import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Zap,
  Award,
  HelpCircle,
  Mail,
  Truck,
  RotateCcw,
} from 'lucide-react';
import HeroBanner from './HeroBanner';
import FeaturedCategories from './FeaturedCategories';
import ProductCard from '../../catalog/components/ProductCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useGetProductsQuery } from '../../catalog/api/catalogApi';
import { toast } from 'sonner';

// Curated products fallback
const FALLBACK_TRENDING_PRODUCTS = [
  {
    id: 'prod-001',
    slug: 'studiomaster-anc-headphones',
    name: 'StudioMaster Pro Wireless ANC Over-Ear Headphones',
    category: { name: 'Electronics', slug: 'electronics' },
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
    category: { name: 'Electronics', slug: 'electronics' },
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
    category: { name: 'Fashion', slug: 'fashion' },
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
    category: { name: 'Home & Living', slug: 'home-living' },
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
    category: { name: 'Fashion', slug: 'fashion' },
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
    category: { name: 'Beauty & Wellness', slug: 'beauty-wellness' },
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
    category: { name: 'Electronics', slug: 'electronics' },
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
    name: 'Zenith Hand-Thrown Matte Ceramic Coffee Tumbler with Lid (350ml)',
    category: { name: 'Home & Living', slug: 'home-living' },
    hsnCode: '69120010',
    gstRate: 12,
    sellingPrice: 899,
    mrp: 1499,
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'],
    variants: [{ id: 'var-008', sku: 'MUG-ZENITH-GRY', title: 'Stone Grey Speckle', sellingPrice: 899, mrp: 1499 }],
  },
];

export default function HomeView() {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { data: response } = useGetProductsQuery({ limit: 12 });

  const allProducts =
    response?.data?.products && response.data.products.length > 0
      ? response.data.products
      : FALLBACK_TRENDING_PRODUCTS;

  const filteredProducts =
    selectedCategoryTab === 'all'
      ? allProducts
      : allProducts.filter((p) => {
          const catName = p.category?.name || p.category || '';
          const catSlug = p.category?.slug || '';
          return (
            catName.toLowerCase().includes(selectedCategoryTab) ||
            catSlug.toLowerCase().includes(selectedCategoryTab)
          );
        });

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      toast.success('Welcome to VEYRA Insider!', {
        description: 'You will receive priority access to seasonal drops and exclusive discounts.',
      });
      setNewsletterEmail('');
    }
  };

  return (
    <div className="flex-1 bg-slate-950">
      {/* 1. Hero Promo Section */}
      <HeroBanner />

      {/* 2. Featured Category Grid */}
      <FeaturedCategories />

      {/* 3. Interactive Trending Products Showcase with shadcn Tabs */}
      <section className="py-12 md:py-16 border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
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

          {/* Category Filter Tabs via shadcn Tabs */}
          <Tabs
            value={selectedCategoryTab}
            onValueChange={setSelectedCategoryTab}
            className="w-full mb-8"
          >
            <div className="overflow-x-auto pb-2 no-scrollbar">
              <TabsList className="bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                <TabsTrigger value="all" className="text-xs px-3 py-1.5 rounded-lg data-active:bg-indigo-600 data-active:text-white">
                  All Collections
                </TabsTrigger>
                <TabsTrigger value="electronics" className="text-xs px-3 py-1.5 rounded-lg data-active:bg-indigo-600 data-active:text-white">
                  Electronics
                </TabsTrigger>
                <TabsTrigger value="fashion" className="text-xs px-3 py-1.5 rounded-lg data-active:bg-indigo-600 data-active:text-white">
                  Fashion &amp; Apparel
                </TabsTrigger>
                <TabsTrigger value="home" className="text-xs px-3 py-1.5 rounded-lg data-active:bg-indigo-600 data-active:text-white">
                  Home &amp; Living
                </TabsTrigger>
                <TabsTrigger value="beauty" className="text-xs px-3 py-1.5 rounded-lg data-active:bg-indigo-600 data-active:text-white">
                  Beauty &amp; Wellness
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={selectedCategoryTab} className="mt-2">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
                {filteredProducts.slice(0, 8).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 4. Statutory & Trust Proposition Grid using shadcn Card */}
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

      {/* 5. Customer FAQs Section using shadcn Accordion */}
      <section className="py-12 md:py-16 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 mb-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                Customer Care &amp; Compliance
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Clear answers regarding statutory invoicing, delivery schedules, and payment integrity.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1" className="border-slate-800">
                <AccordionTrigger className="text-sm font-semibold text-white hover:text-indigo-300">
                  How does Section 46 GST tax invoicing work on VEYRA?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-400 leading-relaxed">
                  Every order placed on VEYRA automatically generates a certified statutory tax invoice complying with Section 46 of the CGST Act. The invoice displays our GSTIN (27AABCU9603R1ZN), the applicable 6-to-8 digit HSN/SAC code per line item, and an explicit breakdown between CGST, SGST, or IGST depending on the place of supply. You can download PDF tax invoices anytime from your Customer Account.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border-slate-800">
                <AccordionTrigger className="text-sm font-semibold text-white hover:text-indigo-300">
                  What are the delivery timelines across Indian PIN codes?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-400 leading-relaxed">
                  We service over 28,000+ PIN codes across India through Tier-1 express air courier partners (BlueDart, Delhivery, Shadowfax). Metro orders are delivered within 24 to 48 hours, while rest of India orders arrive in 3 to 5 business days. Complimentary express shipping is automatically applied on all orders exceeding ₹999.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border-slate-800">
                <AccordionTrigger className="text-sm font-semibold text-white hover:text-indigo-300">
                  How are Razorpay payments verified and protected?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-400 leading-relaxed">
                  Checkout payments are processed via Razorpay's PCI-DSS Level 1 certified gateway with 256-bit SSL encryption. All transactions are cryptographically signed with server-side HMAC-SHA256 signature verification before any order is finalized, guaranteeing zero phantom debits or order loss.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="border-slate-800">
                <AccordionTrigger className="text-sm font-semibold text-white hover:text-indigo-300">
                  What is the return and refund policy?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-400 leading-relaxed">
                  We provide a 7-day hassle-free doorstep return window for eligible products. Upon receipt and quality inspection at our fulfillment hub, a statutory Section 34 Credit Note is automatically produced and your refund is credited directly to your original payment instrument (UPI, Bank, Card) within 3 to 5 business days.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </section>

      {/* 6. VIP Newsletter Club using shadcn Card, Input, and Button */}
      <section className="py-12 border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 p-8 sm:p-10 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    VIP Club Invitation
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Join the VEYRA Insider Community
                </h3>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  Receive private invitations to limited edition collections, flash sale previews, and seasonal style edits.
                </p>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto items-center gap-2">
                <Input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 w-full sm:w-64"
                />
                <Button type="submit" size="sm" className="whitespace-nowrap gap-1.5 shadow-md">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Join</span>
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
