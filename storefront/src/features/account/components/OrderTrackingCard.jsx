import React, { useState } from 'react';
import {
  Package,
  Truck,
  Receipt,
  RotateCcw,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import TaxInvoiceModal from './TaxInvoiceModal';
import ReturnRequestModal from './ReturnRequestModal';

export default function OrderTrackingCard({ order }) {
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  const status = order.status || 'DELIVERED';
  const orderNumber = order.orderNumber || order.id || 'VYR-2026-LIVE';
  const totalAmount = order.totalAmount || 4999;
  const items = order.items || [
    {
      productName: 'StudioMaster Pro Wireless ANC Over-Ear Headphones',
      variantTitle: 'Matte Obsidian Black',
      quantity: 1,
      price: 4999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    },
  ];

  // Map 4-step progress: 1: Placed, 2: Packed, 3: Shipped, 4: Delivered
  const currentStep =
    status === 'DELIVERED'
      ? 4
      : status === 'SHIPPED'
      ? 3
      : status === 'PROCESSING' || status === 'CONFIRMED'
      ? 2
      : 1;

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Oct 07, 2026';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-5 shadow-xl backdrop-blur-sm transition hover:border-slate-700">
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Order Ref:</span>
            <span className="font-mono font-bold text-white text-sm">
              {orderNumber}
            </span>
            <Badge
              variant="default"
              className={
                status === 'DELIVERED'
                  ? 'bg-emerald-600 text-white text-[10px]'
                  : status === 'SHIPPED'
                  ? 'bg-indigo-600 text-white text-[10px]'
                  : 'bg-amber-600 text-white text-[10px]'
              }
            >
              {status}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Placed on {orderDate} • Payment: {order.paymentMethod || 'RAZORPAY PREPAID'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInvoiceModalOpen(true)}
            className="gap-1.5 border-slate-800 bg-slate-950 text-xs text-slate-200 hover:text-white"
          >
            <Receipt className="h-3.5 w-3.5 text-indigo-400" />
            <span>Tax Invoice</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReturnModalOpen(true)}
            className="gap-1.5 text-xs text-slate-400 hover:text-rose-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>7-Day Return</span>
          </Button>
        </div>
      </div>

      {/* 4-Stage Live Telemetry Stepper */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-indigo-400" />
            <span>Live BlueDart Air Courier Tracking (AWB: BLUEDART-884920)</span>
          </span>
          <span className="text-emerald-400 font-medium text-[11px]">
            {status === 'DELIVERED' ? 'Delivered to Doorstep' : 'In Transit'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { label: 'Order Placed', step: 1 },
            { label: 'Packed & Invoiced', step: 2 },
            { label: 'Air Express Dispatched', step: 3 },
            { label: 'Delivered', step: 4 },
          ].map((milestone) => {
            const isCompleted = currentStep >= milestone.step;
            const isCurrent = currentStep === milestone.step;

            return (
              <div key={milestone.step} className="flex flex-col items-center text-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold mb-1.5 transition ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : milestone.step}
                </div>
                <span className={`text-[10px] ${isCompleted ? 'text-white font-medium' : 'text-slate-500'}`}>
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items in Order */}
      <div className="space-y-3 pt-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  item.image ||
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80'
                }
                alt={item.productName || item.name}
                className="h-12 w-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
              />
              <div>
                <h4 className="text-xs font-semibold text-white">
                  {item.productName || item.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {item.variantTitle || 'Standard Edition'} • Qty: {item.quantity || 1}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-white">
                ₹{Number((item.price || item.unitPrice || 4999) * (item.quantity || 1)).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">
                GST 18% Inclusive
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer particulars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>
            Delivered to: <strong>{order.shippingAddress?.fullName || 'Customer'}</strong> ({order.shippingAddress?.city || 'Mumbai'}, {order.shippingAddress?.pinCode || '400001'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Total Paid:</span>
          <span className="text-sm font-black font-mono text-indigo-400">
            ₹{Number(totalAmount).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Modals */}
      <TaxInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        order={order}
      />
      <ReturnRequestModal
        open={returnModalOpen}
        onOpenChange={setReturnModalOpen}
        order={order}
      />
    </div>
  );
}
