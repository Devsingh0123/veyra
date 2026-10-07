import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  ReceiptText,
  CreditCard,
  Mail,
  MapPin,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Trust Pillars Grid */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Pillar 1 */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Genuine Products</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Direct from certified manufacturers with verified authenticity guarantee.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Pan-India Express</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Prompt courier delivery across 28,000+ Indian PIN codes with live updates.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Section 46 GST Invoicing</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Compliant B2C/B2B tax invoices with detailed HSN and CGST/SGST/IGST tax splits.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Razorpay Secure Checkout</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  256-bit encrypted UPI, Netbanking, Credit/Debit cards &amp; Cash on Delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Intro & Compliance */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/30">
                V
              </div>
              <span className="text-xl font-black tracking-wider text-white">VEYRA</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              VEYRA is India&apos;s premier multi-category commerce storefront engineered for discerning customers. Providing uncompromised quality, transparent statutory tax invoicing, and seamless Razorpay checkouts.
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Statutory Compliance Particulars:</span>
              </div>
              <p className="text-[11px]">
                <strong className="text-slate-300">GSTIN:</strong> 27AABCU9603R1ZN • Section 46 CGST Act
              </p>
              <p className="text-[11px]">
                <strong className="text-slate-300">Registered Office:</strong> BKC Commerce Hub, Bandra East, Mumbai, Maharashtra 400051
              </p>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Shop Categories</h5>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/catalog" className="hover:text-white transition">All Products</Link>
              </li>
              <li>
                <Link to="/catalog?category=electronics" className="hover:text-white transition">Electronics</Link>
              </li>
              <li>
                <Link to="/catalog?category=fashion" className="hover:text-white transition">Apparel &amp; Fashion</Link>
              </li>
              <li>
                <Link to="/catalog?category=home-living" className="hover:text-white transition">Home &amp; Living</Link>
              </li>
              <li>
                <Link to="/catalog?category=beauty-wellness" className="hover:text-white transition">Beauty &amp; Wellness</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Service */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Customer Care</h5>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/account" className="hover:text-white transition">Track Your Order</Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition">Returns &amp; Credit Notes</Link>
              </li>
              <li>
                <span className="text-slate-400">Shipping Policy (2-5 Days)</span>
              </li>
              <li>
                <span className="text-slate-400">PIN Code Serviceability</span>
              </li>
              <li>
                <span className="text-slate-400">Helpdesk: support@veyra.in</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Trust */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Legal &amp; Policy</h5>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
              <li>
                <span className="text-slate-400">Terms of Service</span>
              </li>
              <li>
                <span className="text-slate-400">Privacy &amp; Cookie Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Section 46 Tax Rules</span>
              </li>
              <li>
                <span className="text-slate-400">Section 34 Credit Notes</span>
              </li>
              <li>
                <span className="text-slate-400">Grievance Officer</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 sm:flex-row text-xs text-slate-400">
          <p>© 2026 VEYRA Retail Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <span>Razorpay</span>
              <span className="text-slate-400">•</span>
              <span>UPI</span>
              <span className="text-slate-400">•</span>
              <span>RuPay</span>
              <span className="text-slate-400">•</span>
              <span>Netbanking</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400">
              INR (₹) India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
