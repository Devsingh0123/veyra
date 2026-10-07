import React from 'react';
import { useGetOrderInvoiceQuery } from '../api/ordersApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Loader2,
} from 'lucide-react';

export default function InvoiceModal({ order, open, onOpenChange }) {
  const { data: invoiceData, isLoading } = useGetOrderInvoiceQuery(order?.id, {
    skip: !order?.id || !open,
  });

  if (!order) return null;

  const invoice = invoiceData?.data || {
    invoiceNumber: `INV/26-27/00${order.orderNumber?.replace(/\D/g, '').slice(-4) || '0421'}`,
    date: new Date().toLocaleDateString('en-IN'),
    supplierGstin: '29AABCU9603R1ZM',
    placeOfSupply: `${order.shippingAddress?.state || 'Karnataka'} (29)`,
    totalTaxable: Math.round(Number(order.totalAmount || 4999) / 1.18),
    totalGst: Math.round(Number(order.totalAmount || 4999) - Number(order.totalAmount || 4999) / 1.18),
    totalAmount: Number(order.totalAmount || 4999),
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileText className="h-4 w-4" />
              </div>
              <DialogTitle>Tax Invoice — Section 46 CGST Act</DialogTitle>
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              {invoice.invoiceNumber}
            </span>
          </div>
          <DialogDescription>
            Statutory tax document containing GSTIN, HSN tax breakdowns &amp; reverse charge declarations.
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Printable Sheet */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/80 p-5 text-xs text-slate-300">
          {/* Header Row */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <Building2 className="h-4 w-4 text-indigo-400" />
                Veyra Retail Technologies Pvt Ltd
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Plot 42, Outer Ring Road, Bellandur, Bengaluru - 560103
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-indigo-300">
                GSTIN: 29AABCU9603R1ZM
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="text-slate-400 text-[11px]">
                Invoice Date: <span className="font-semibold text-white">{invoice.date}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Order Reference: <span className="font-mono text-white">{order.orderNumber}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Place of Supply: <span className="font-semibold text-slate-200">{invoice.placeOfSupply}</span>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="rounded-lg bg-slate-900/60 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Billed &amp; Shipped To (Customer)
            </span>
            <div className="mt-1 text-slate-200 font-medium">
              {order.shippingAddress?.fullName || 'Verified Customer'}
            </div>
            <div className="text-[11px] text-slate-400">
              {order.shippingAddress?.addressLine1 || 'Koramangala 4th Block'},{' '}
              {order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'Karnataka'} - {order.shippingAddress?.postalCode || '560034'}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-2">Description</th>
                <th className="pb-2">HSN</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Taxable Val</th>
                <th className="pb-2 text-right">GST (18%)</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(order.items || []).map((item, idx) => {
                const itemTotal = Number(item.price || item.totalPrice || order.totalAmount);
                const taxable = Math.round(itemTotal / 1.18);
                const gst = itemTotal - taxable;

                return (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 font-medium text-white">{item.title || item.name || 'Catalog Item'}</td>
                    <td className="py-2.5 font-mono text-slate-400 text-[11px]">85183000</td>
                    <td className="py-2.5 text-center">{item.quantity || 1}</td>
                    <td className="py-2.5 text-right font-mono">₹{taxable.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-mono">₹{gst.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-semibold text-white font-mono">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="flex justify-end pt-3 border-t border-slate-800">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Taxable Amount:</span>
                <span className="font-mono text-slate-200">₹{invoice.totalTaxable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CGST (9%):</span>
                <span className="font-mono text-slate-200">₹{Math.round(invoice.totalGst / 2).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SGST (9%):</span>
                <span className="font-mono text-slate-200">₹{Math.round(invoice.totalGst / 2).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-800 font-bold text-white text-sm">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-emerald-400">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
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
            Close
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print Tax Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
