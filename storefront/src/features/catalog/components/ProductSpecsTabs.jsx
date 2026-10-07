import React from 'react';
import {
  FileText,
  ShieldCheck,
  Star,
  CheckCircle2,
  Package,
  Cpu,
  Receipt,
  User,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ProductSpecsTabs({ product, currentVariant }) {
  const hsnCode = product?.hsnCode || '85183000';
  const gstRate = product?.gstRate || 18;
  const attributes = product?.attributes || {};
  const weightGrams = currentVariant?.weightGrams || 280;

  const mockReviews = [
    {
      id: 1,
      name: 'Aditya Sharma',
      city: 'Bengaluru, KA',
      rating: 5,
      date: '3 days ago',
      comment:
        'The build quality is exceptional! Received the Section 46 GST tax invoice with the correct company name instantly via email. BlueDart delivery arrived within 24 hours.',
    },
    {
      id: 2,
      name: 'Priyanka Sen',
      city: 'Mumbai, MH',
      rating: 5,
      date: '1 week ago',
      comment:
        'Authentic genuine piece. Packed with premium tamper-proof packaging. Worth every rupee.',
    },
    {
      id: 3,
      name: 'Rohan Mehta',
      city: 'New Delhi, DL',
      rating: 4,
      date: '2 weeks ago',
      comment:
        'Smooth checkout via Google Pay on Razorpay. Great attention to details and statutory invoice compliance.',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      <Tabs defaultValue="overview" className="w-full">
        {/* Tab Switcher Headers */}
        <div className="overflow-x-auto pb-2 no-scrollbar">
          <TabsList className="bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="text-xs px-3.5 py-1.5 data-active:bg-indigo-600 data-active:text-white"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              <span>Overview &amp; Highlights</span>
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="text-xs px-3.5 py-1.5 data-active:bg-indigo-600 data-active:text-white"
            >
              <Cpu className="mr-1.5 h-3.5 w-3.5" />
              <span>Technical Specs</span>
            </TabsTrigger>
            <TabsTrigger
              value="tax"
              className="text-xs px-3.5 py-1.5 data-active:bg-indigo-600 data-active:text-white"
            >
              <Receipt className="mr-1.5 h-3.5 w-3.5" />
              <span>Section 46 GST &amp; HSN</span>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="text-xs px-3.5 py-1.5 data-active:bg-indigo-600 data-active:text-white"
            >
              <Star className="mr-1.5 h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>Verified Reviews (3)</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            {product?.description ||
              'Crafted to impeccable standards, this item integrates cutting-edge craftsmanship and robust materials engineered for daily luxury and reliable endurance.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">100% Genuine Certified</strong>
                <span className="text-[11px] text-slate-400">
                  Direct procurement from authorized manufacturers with verification seal.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Statutory Warranty</strong>
                <span className="text-[11px] text-slate-400">
                  Backed by 1-year brand warranty with pan-India authorized service access.
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Technical Specifications */}
        <TabsContent value="specifications" className="mt-4">
          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
            <div className="grid grid-cols-2 p-3">
              <span className="text-slate-400 font-medium">SKU Reference</span>
              <span className="font-mono text-white font-bold">
                {currentVariant?.sku || product?.sku || 'VYR-PROD-001'}
              </span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-slate-900/30">
              <span className="text-slate-400 font-medium">Item Weight</span>
              <span className="text-white">{weightGrams} grams</span>
            </div>
            <div className="grid grid-cols-2 p-3">
              <span className="text-slate-400 font-medium">Category Department</span>
              <span className="text-white">
                {product?.category?.name || product?.category || 'Curated Lifestyle'}
              </span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-slate-900/30">
              <span className="text-slate-400 font-medium">Country of Origin</span>
              <span className="text-white">India (IN)</span>
            </div>
            {Object.entries(attributes).map(([key, val], idx) => (
              <div
                key={key}
                className={`grid grid-cols-2 p-3 ${idx % 2 === 0 ? '' : 'bg-slate-900/30'}`}
              >
                <span className="text-slate-400 font-medium capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-white">{String(val)}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Section 46 GST & Tax */}
        <TabsContent value="tax" className="mt-4 space-y-3">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-indigo-400" />
              <strong className="text-sm text-white">
                Statutory CGST / SGST / IGST Particulars
              </strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In strict accordance with Section 46 of the Central Goods and Services Tax Act, 2017, all customer orders on VEYRA are accompanied by a digitally validated Tax Invoice.
            </p>
          </div>

          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
            <div className="grid grid-cols-2 p-3">
              <span className="text-slate-400 font-medium">Harmonized System Code (HSN)</span>
              <span className="font-mono text-indigo-400 font-bold">{hsnCode}</span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-slate-900/30">
              <span className="text-slate-400 font-medium">GST Tax Bracket</span>
              <span className="text-emerald-400 font-semibold">{gstRate}% (Inclusive in Price)</span>
            </div>
            <div className="grid grid-cols-2 p-3">
              <span className="text-slate-400 font-medium">Intra-State Supply (Maharashtra)</span>
              <span className="text-white">CGST {gstRate / 2}% + SGST {gstRate / 2}%</span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-slate-900/30">
              <span className="text-slate-400 font-medium">Inter-State Supply (Rest of India)</span>
              <span className="text-white">Integrated GST (IGST) {gstRate}%</span>
            </div>
            <div className="grid grid-cols-2 p-3">
              <span className="text-slate-400 font-medium">Seller GSTIN</span>
              <span className="font-mono text-slate-300">27AABCU9603R1ZN</span>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Reviews */}
        <TabsContent value="reviews" className="mt-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                <Star className="h-5 w-5 fill-amber-400" />
              </div>
              <span className="text-lg font-black text-white">4.8</span>
              <span className="text-xs text-slate-400">out of 5.0 rating</span>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
              100% Verified Buyers
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {mockReviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm" className="h-6 w-6 bg-indigo-600/30 text-indigo-300">
                      <AvatarFallback className="text-[10px] font-bold">
                        {rev.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {rev.name}
                      </span>
                      <span className="text-[10px] text-slate-500">{rev.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>
                <span className="text-[10px] text-slate-500 block">
                  Reviewed {rev.date}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
