import React from 'react';
import {
  Printer,
  ShieldCheck,
  Receipt,
  Download,
  Building2,
  FileCheck2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function TaxInvoiceModal({ open, onOpenChange, order }) {
  if (!order) return null;

  const invoiceNo = `INV-${order.orderNumber || order.id || 'VYR-2026-LIVE'}`;
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const items = order.items || [
    {
      name: 'StudioMaster Pro Wireless ANC Over-Ear Headphones',
      hsnCode: '85183000',
      quantity: 1,
      unitPrice: 4236.44,
      sellingPrice: 4999,
      gstRate: 18,
    },
  ];

  const totalAmount = order.totalAmount || 4999;
  const isIntraState = order.shippingAddress?.stateCode === 'MH' || true;
  const taxableSubtotal = Math.round(totalAmount * (100 / 118));
  const gstTotal = totalAmount - taxableSubtotal;
  const cgst = isIntraState ? Math.round(gstTotal / 2) : 0;
  const sgst = isIntraState ? Math.round(gstTotal / 2) : 0;
  const igst = isIntraState ? 0 : gstTotal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs">
                V
              </div>
              <DialogTitle className="text-base font-extrabold text-slate-950 tracking-tight">
                TAX INVOICE
              </DialogTitle>
              <Badge variant="outline" className="text-[10px] border-emerald-600 text-emerald-700 bg-emerald-50">
                Section 46 CGST Act
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Original for Recipient • Triplicate Copy
            </p>
          </div>

          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Invoice</span>
          </Button>
        </DialogHeader>

        {/* Invoice Body */}
        <div className="py-4 space-y-5 text-xs text-slate-700">
          {/* Supplier & Invoice Particulars */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <strong className="text-sm font-bold text-slate-900 block">
                VEYRA RETAIL PVT. LTD.
              </strong>
              <p className="text-slate-600">
                BKC Commerce Hub, Bandra East, Mumbai, Maharashtra 400051
              </p>
              <p>
                <strong>GSTIN:</strong> 27AABCU9603R1ZN
              </p>
              <p>
                <strong>PAN:</strong> AABCU9603R • <strong>State Code:</strong> 27 (MH)
              </p>
            </div>

            <div className="space-y-1 text-right sm:text-left">
              <p>
                <strong>Invoice No:</strong> <span className="font-mono text-slate-900">{invoiceNo}</span>
              </p>
              <p>
                <strong>Invoice Date:</strong> {invoiceDate}
              </p>
              <p>
                <strong>Order Ref:</strong> {order.orderNumber || order.id || 'VYR-2026-LIVE'}
              </p>
              <p>
                <strong>Payment Mode:</strong> {order.paymentMethod || 'PREPAID RAZORPAY'}
              </p>
            </div>
          </div>

          {/* Billed To & Shipped To */}
          <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-4">
            <div>
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                Billed &amp; Shipped To:
              </span>
              <p className="font-semibold text-slate-900">
                {order.shippingAddress?.fullName || 'Valued Customer'}
              </p>
              <p className="text-slate-600">
                {order.shippingAddress?.line1 || 'Lower Parel East'}
              </p>
              <p className="text-slate-600">
                {order.shippingAddress?.city || 'Mumbai'}, {order.shippingAddress?.state || 'Maharashtra'} - {order.shippingAddress?.pinCode || '400001'}
              </p>
              <p className="text-slate-600">
                Phone: +91 {order.shippingAddress?.phone || '9876543210'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                Tax Jurisdictional Parameters:
              </span>
              <p>
                <strong>Place of Supply:</strong> {order.shippingAddress?.state || 'Maharashtra'} (State Code: {order.shippingAddress?.stateCode || '27'})
              </p>
              <p>
                <strong>Supply Category:</strong> {isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
              </p>
              <p>
                <strong>Reverse Charge:</strong> No (Regular B2C Invoicing)
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">HSN Code</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Taxable Value</th>
                  <th className="p-2.5 text-right">GST Rate</th>
                  <th className="p-2.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-medium text-slate-900">
                      {item.productName || item.name || 'Curated Product'}
                      {item.variantTitle && (
                        <span className="text-[10px] text-slate-500 block">
                          {item.variantTitle}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-slate-600">{item.hsnCode || '85183000'}</td>
                    <td className="p-2.5 text-center">{item.quantity || 1}</td>
                    <td className="p-2.5 text-right font-mono">
                      ₹{Number(taxableSubtotal).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono">{item.gstRate || 18}%</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      ₹{Number(totalAmount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown Matrix */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount</span>
                <span className="font-mono">₹{Number(taxableSubtotal).toLocaleString('en-IN')}</span>
              </div>
              {isIntraState ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%)</span>
                    <span className="font-mono">₹{Number(cgst).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%)</span>
                    <span className="font-mono">₹{Number(sgst).toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>IGST (18%)</span>
                  <span className="font-mono">₹{Number(igst).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping &amp; Logistics</span>
                <span className="text-emerald-700 font-semibold">FREE (Exempt)</span>
              </div>
              <Separator className="bg-slate-300 my-1" />
              <div className="flex justify-between font-extrabold text-sm text-slate-950">
                <span>Invoice Total</span>
                <span className="font-mono text-indigo-700">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Legal Certification */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Certified under Section 46 of Central Goods and Services Tax Act, 2017.</span>
            </div>
            <div className="text-right">
              <span className="font-semibold block text-slate-800">For VEYRA Retail Pvt. Ltd.</span>
              <span className="text-[10px] text-slate-400">Authorized Digital Signature</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
