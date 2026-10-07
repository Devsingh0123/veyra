import React from 'react';
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
  FileCheck2,
  Printer,
  Building2,
  Calendar,
  Receipt,
} from 'lucide-react';

export default function CreditNoteModal({ returnReq, open, onOpenChange }) {
  if (!returnReq) return null;

  const cn = returnReq.creditNote || {
    creditNoteNumber: `CN/26-27/0000${returnReq.id?.slice(-2) || '14'}`,
    originalInvoiceNo: `INV/26-27/00${returnReq.order?.orderNumber?.replace(/\D/g, '').slice(-4) || '0421'}`,
    date: new Date().toLocaleDateString('en-IN'),
    totalRefundGst: Math.round(Number(returnReq.refundAmount || 4899) - Number(returnReq.refundAmount || 4899) / 1.18),
    totalRefundValue: Number(returnReq.refundAmount || 4899),
  };

  const taxableReversed = cn.totalRefundValue - cn.totalRefundGst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Receipt className="h-4 w-4" />
              </div>
              <DialogTitle>Credit Note — Section 34 CGST Act</DialogTitle>
            </div>
            <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-teal-400 border border-teal-500/20">
              {cn.creditNoteNumber}
            </span>
          </div>
          <DialogDescription>
            Statutory tax credit note reversing GST output liability for returned defective goods.
          </DialogDescription>
        </DialogHeader>

        {/* Credit Note Sheet */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/80 p-5 text-xs text-slate-300">
          {/* Header */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <Building2 className="h-4 w-4 text-teal-400" />
                Veyra Retail Technologies Pvt Ltd
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Outer Ring Road, Bellandur, Bengaluru - 560103
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-teal-300">
                GSTIN: 29AABCU9603R1ZM
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="text-slate-400 text-[11px]">
                Credit Note Date: <span className="font-semibold text-white">{cn.date}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Original Tax Invoice Ref:{' '}
                <span className="font-mono text-indigo-300 font-semibold">{cn.originalInvoiceNo}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Return Claim ID: <span className="font-mono text-white">{returnReq.id}</span>
              </div>
            </div>
          </div>

          {/* Statutory Statement */}
          <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/80">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Statutory Reason for Adjustment
            </span>
            <p className="mt-1 text-slate-300 font-medium">
              Sales Return / Defective Merchandise Reversal under Section 34(1) of Central Goods and Services Tax Act.
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              QC Verification: {returnReq.adminNote || 'Acoustic driver coil defective. Restock rejected.'}
            </p>
          </div>

          {/* Tax Reversal Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Taxable Value Reversed:</span>
              <span className="font-mono text-slate-200">₹{taxableReversed.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>CGST Reversal (9%):</span>
              <span className="font-mono text-slate-200">₹{Math.round(cn.totalRefundGst / 2).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SGST Reversal (9%):</span>
              <span className="font-mono text-slate-200">₹{Math.round(cn.totalRefundGst / 2).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white text-sm">
              <span>Total Refund Authorized:</span>
              <span className="font-mono text-teal-400">₹{cn.totalRefundValue.toLocaleString('en-IN')}</span>
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
            className="bg-teal-600 hover:bg-teal-500 text-white"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print Credit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
