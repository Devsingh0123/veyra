import React, { useState } from 'react';
import { useAdjustStockMutation } from '../api/inventoryApi';
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
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function StockAdjustModal({ item, open, onOpenChange }) {
  const [adjustStock, { isLoading }] = useAdjustStockMutation();

  const [mode, setMode] = useState('RESTOCK'); // 'RESTOCK' | 'WRITE_OFF' | 'AUDIT_COUNT'
  const [quantity, setQuantity] = useState('20');
  const [reason, setReason] = useState('PO Inbound Shipment Receipt');
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  if (!item) return null;

  const currentAvailable = item.availableStock ?? 0;
  const currentTotal = item.totalStock ?? 0;
  const qtyNum = parseInt(quantity, 10) || 0;

  let newAvailable = currentAvailable;
  if (mode === 'RESTOCK') newAvailable = currentAvailable + qtyNum;
  else if (mode === 'WRITE_OFF') newAvailable = Math.max(0, currentAvailable - qtyNum);
  else if (mode === 'AUDIT_COUNT') newAvailable = Math.max(0, qtyNum - (item.reservedStock ?? 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorNotice('');

    if (qtyNum <= 0 && mode !== 'AUDIT_COUNT') {
      setErrorNotice('Please provide a positive quantity.');
      return;
    }

    try {
      await adjustStock({
        variantId: item.variantId,
        type: mode,
        delta: qtyNum,
        reason,
      }).unwrap();

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onOpenChange(false);
      }, 900);
    } catch {
      setErrorNotice('Failed to record stock adjustment. Please retry.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="h-4 w-4" />
            </div>
            <DialogTitle>Warehouse Stock Balance Adjustment</DialogTitle>
          </div>
          <DialogDescription>
            Record inventory inflow, write-offs, or physical warehouse cycle count reconciliation.
          </DialogDescription>
        </DialogHeader>

        {/* Selected SKU Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-slate-200">
              {item.sku}
            </span>
            <span className="text-[11px] text-slate-400">{item.productName}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
            <div className="rounded-lg bg-slate-900/80 p-2">
              <div className="text-[10px] text-slate-500">On-Hand Total</div>
              <div className="text-sm font-bold text-white">{currentTotal}</div>
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2">
              <div className="text-[10px] text-amber-400">15-Min Reserved</div>
              <div className="text-sm font-bold text-amber-300">
                {item.reservedStock ?? 0}
              </div>
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2">
              <div className="text-[10px] text-emerald-400">Available to Sell</div>
              <div className="text-sm font-bold text-emerald-300">
                {currentAvailable}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorNotice && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorNotice}</span>
            </div>
          )}

          {successNotice && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Stock balance adjustment logged successfully!</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">
              Adjustment Operation Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('RESTOCK')}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition ${
                  mode === 'RESTOCK'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                <span>Restock (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('WRITE_OFF')}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition ${
                  mode === 'WRITE_OFF'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                <span>Write-Off (-)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('AUDIT_COUNT')}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition ${
                  mode === 'AUDIT_COUNT'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ClipboardCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Cycle Audit (=)</span>
              </button>
            </div>
          </div>

          {/* Quantity & Impact Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Quantity Units *
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="border-slate-700 bg-slate-950/60 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Projected Available
              </label>
              <div className="flex h-9 items-center rounded-md border border-slate-800 bg-slate-950/40 px-3 text-xs font-bold text-white">
                <span className="text-slate-400 line-through mr-2">
                  {currentAvailable}
                </span>
                <span className="text-emerald-400">&rarr; {newAvailable} units</span>
              </div>
            </div>
          </div>

          {/* Audit Reason */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Audit Note / Reconciliation Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-200 shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="PO Inbound Shipment Receipt">
                PO Inbound Shipment Receipt
              </option>
              <option value="Warehouse Damaged Item Quarantine">
                Warehouse Damaged Item Quarantine
              </option>
              <option value="Weekly Cycle Count Verification">
                Weekly Cycle Count Verification
              </option>
              <option value="Customer Replacement Allocation">
                Customer Replacement Allocation
              </option>
            </select>
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
              disabled={isLoading || successNotice}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Updating Matrix...
                </>
              ) : (
                'Commit Stock Adjustment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
