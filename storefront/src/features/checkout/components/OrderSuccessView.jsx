import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  Package,
  Truck,
  Receipt,
  Download,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function OrderSuccessView() {
  const [searchParams] = useSearchParams();

  const orderNumber =
    searchParams.get('order') ||
    `VYR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentMethod = searchParams.get('method') || 'RAZORPAY';
  const totalAmount = searchParams.get('total') || '4999';

  const handleDownloadInvoice = () => {
    toast.success('Downloading Section 46 GST Tax Invoice PDF...', {
      description: `Invoice reference: INV-${orderNumber}`,
    });
    window.print();
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Celebration Header Card */}
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-xl shadow-emerald-600/20 mb-4 animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 text-xs">
              Order Confirmed &amp; Invoiced
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Your purchase is confirmed and being prepared for express fulfillment. A statutory Section 46 GST Tax Invoice has been generated.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Order Reference:</span>
              <span className="font-mono font-bold text-white text-sm">{orderNumber}</span>
            </div>
            <Separator orientation="vertical" className="h-8 bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-400 text-[11px] block">Payment Status:</span>
              <Badge variant="default" className={paymentMethod === 'COD' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}>
                {paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'PAID VIA RAZORPAY'}
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-8 bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-400 text-[11px] block">Est. Delivery:</span>
              <span className="font-semibold text-emerald-400">Within 24–48 Hours</span>
            </div>
          </div>
        </div>

        {/* 4-Stage Delivery Telemetry Stepper */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>Fulfillment &amp; Dispatch Milestones</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-xs text-white block">Order Placed</strong>
                <span className="text-[10px] text-slate-400">Inventory Reserved</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-xs text-white block">Invoice Generated</strong>
                <span className="text-[10px] text-indigo-400">Section 46 CGST Act</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 font-bold text-xs">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-xs text-slate-300 block">Air Express Dispatch</strong>
                <span className="text-[10px] text-slate-500">BlueDart Logistics</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex sm:flex-col items-center sm:text-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 font-bold text-xs">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-xs text-slate-400 block">Doorstep Delivery</strong>
                <span className="text-[10px] text-slate-500">OTP / Signature</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 46 GST Invoicing Particulars Box */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Statutory Section 46 GST Tax Invoice
                </h3>
                <p className="text-[11px] text-slate-400">
                  Seller GSTIN: 27AABCU9603R1ZN • VEYRA Retail Ltd.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadInvoice}
              className="gap-1.5 border-slate-800 text-xs text-slate-200 hover:text-white"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Download Invoice</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 block">Tax Invoice No.</span>
              <strong className="font-mono text-white">INV-{orderNumber}</strong>
              <span className="text-[10px] text-slate-400 block">Date: {new Date().toLocaleDateString('en-IN')}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 block">Place of Supply</span>
              <strong className="text-white">Maharashtra (State Code: 27)</strong>
              <span className="text-[10px] text-emerald-400 block">CGST (9%) + SGST (9%) Invoiced</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 block">Total Amount Captured</span>
              <strong className="font-mono text-indigo-400 text-sm">₹{Number(totalAmount).toLocaleString('en-IN')}</strong>
              <span className="text-[10px] text-slate-400 block">Inclusive of all taxes</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/catalog">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
              <span>← Back to Catalog</span>
            </Button>
          </Link>

          <Link to="/account">
            <Button size="lg" className="gap-2 shadow-lg shadow-indigo-600/30">
              <span>View Order in Customer Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
