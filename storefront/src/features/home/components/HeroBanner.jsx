import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 md:py-20">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[380px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2">
              <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 py-1 px-3">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                Autumn 2026 Collection Live
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Engineered for Elegance.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                Delivered with Trust.
              </span>
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore authentic luxury lifestyle, flagship electronics, and curated apparel. Seamless checkout via Razorpay with 100% statutory Section 46 GST tax invoicing and express delivery across 28,000+ PIN codes.
            </p>

            {/* Action Buttons using shadcn Button */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/catalog">
                <Button size="lg" className="gap-2">
                  <span>Shop All Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/catalog?filter=deals">
                <Button variant="outline" size="lg" className="gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>View Flash Deals</span>
                </Button>
              </Link>
            </div>

            {/* Live Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-white">28,000+</p>
                <p className="text-[11px] text-slate-400">PIN Codes Covered</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-emerald-400">100%</p>
                <p className="text-[11px] text-slate-400">Genuine &amp; Certified</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-indigo-400">Section 46</p>
                <p className="text-[11px] text-slate-400">Tax Invoicing</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Acoustic Wireless Headphones"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="default" className="shadow">
                    EDITOR&apos;S CHOICE
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="backdrop-blur-md bg-slate-950/80 text-slate-200">
                    ⚡ Ships in 24h
                  </Badge>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400">Veyra Acoustics Series</span>
                  <span className="text-emerald-400 font-bold">In Stock</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  StudioMaster Hi-Fi Wireless ANC Headphones
                </h3>
                <div className="flex items-baseline justify-between pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">₹4,999</span>
                    <span className="text-xs text-slate-500 line-through">₹7,999</span>
                  </div>
                  <Link to="/catalog">
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
