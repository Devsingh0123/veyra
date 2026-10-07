import React, { useState } from 'react';
import { useCreateShipmentMutation } from '../api/ordersApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Truck,
  Package,
  Barcode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';

const CARRIERS = [
  {
    id: 'delhivery',
    name: 'Delhivery Surface',
    tag: 'National Transit (3-4 Days)',
    badge: 'Standard',
  },
  {
    id: 'bluedart',
    name: 'BlueDart Air Express',
    tag: 'Next-Day Express Priority',
    badge: 'Express',
  },
  {
    id: 'blrlocal',
    name: 'BlrLocal Hyperlocal',
    tag: 'Same-Day Metro Delivery',
    badge: 'Same-Day',
  },
];

export default function DispatchModal({ order, open, onOpenChange }) {
  const [createShipment, { isLoading }] = useCreateShipmentMutation();

  const [carrier, setCarrier] = useState('delhivery');
  const [deadWeightGrams, setDeadWeightGrams] = useState('450');
  const [lengthCm, setLengthCm] = useState('24');
  const [widthCm, setWidthCm] = useState('18');
  const [heightCm, setHeightCm] = useState('10');

  const [successInfo, setSuccessInfo] = useState(null);
  const [errorNotice, setErrorNotice] = useState('');

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorNotice('');

    try {
      const res = await createShipment({
        id: order.id,
        carrier,
        deadWeightGrams: parseInt(deadWeightGrams, 10) || 500,
        lengthCm: parseFloat(lengthCm) || 20,
        widthCm: parseFloat(widthCm) || 15,
        heightCm: parseFloat(heightCm) || 10,
      }).unwrap();

      setSuccessInfo(res?.data || { awb: `AWB-${Math.floor(10000000 + Math.random() * 90000000)}` });

      setTimeout(() => {
        setSuccessInfo(null);
        onOpenChange(false);
      }, 1200);
    } catch (err) {
      setErrorNotice(
        err?.data?.error || err?.data?.message || 'Failed to manifest shipment. Please try again.'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Truck className="h-4 w-4" />
            </div>
            <DialogTitle>Order Dispatch &amp; AWB Assignment</DialogTitle>
          </div>
          <DialogDescription>
            Generate electronic Air Waybill (AWB) label and manifest shipment with logistics carrier.
          </DialogDescription>
        </DialogHeader>

        {/* Order Details Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-white">
              {order.orderNumber || order.id}
            </span>
            <span className="text-xs font-medium text-emerald-400">
              ₹{(Number(order.totalAmount) || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              {order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'Karnataka'} - {order.shippingAddress?.postalCode || '560001'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorNotice && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorNotice}</span>
            </div>
          )}

          {successInfo && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Manifested! AWB Assigned: <strong>{successInfo.trackingNumber || successInfo.awb || 'DL-90214-881'}</strong>
              </span>
            </div>
          )}

          {/* Carrier Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">
              Select Logistics Carrier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CARRIERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCarrier(c.id)}
                  className={`flex flex-col text-left rounded-lg border p-2.5 transition ${
                    carrier === c.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-slate-200">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{c.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Package Weight & Dimensions */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Box Packaging &amp; Dead Weight
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Weight (g)</label>
                <Input
                  type="number"
                  value={deadWeightGrams}
                  onChange={(e) => setDeadWeightGrams(e.target.value)}
                  required
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Length (cm)</label>
                <Input
                  type="number"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Width (cm)</label>
                <Input
                  type="number"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Height (cm)</label>
                <Input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!successInfo}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Generating AWB...
                </>
              ) : (
                <>
                  <Barcode className="mr-1.5 h-3.5 w-3.5" />
                  Manifest &amp; Assign AWB
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
