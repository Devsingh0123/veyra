import React, { useState } from 'react';
import { useUpdateReturnStatusMutation } from '../api/returnsApi';
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
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

export default function InspectModal({ returnReq, open, onOpenChange }) {
  const [updateStatus, { isLoading }] = useUpdateReturnStatusMutation();

  const [decision, setDecision] = useState('INSPECTED_PASSED'); // 'INSPECTED_PASSED' | 'INSPECTED_FAILED' | 'RECEIVED_AT_WAREHOUSE'
  const [adminNote, setAdminNote] = useState('Hardware acoustic driver verified defective. Approved for credit note refund.');
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  if (!returnReq) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorNotice('');

    try {
      await updateStatus({
        returnId: returnReq.id,
        status: decision,
        adminNote,
      }).unwrap();

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onOpenChange(false);
      }, 900);
    } catch (err) {
      setErrorNotice(
        err?.data?.error || err?.data?.message || 'Failed to submit QC inspection disposition.'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <DialogTitle>Warehouse Quality Check (QC) Inspection</DialogTitle>
          </div>
          <DialogDescription>
            Inspect customer return parcel, verify physical defect evidence, and authorize Section 34 Credit Note.
          </DialogDescription>
        </DialogHeader>

        {/* Return Details Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-white">
              {returnReq.id}
            </span>
            <span className="text-emerald-400 font-semibold font-mono">
              Refund Value: ₹{(Number(returnReq.refundAmount || 4899)).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Customer Claim Reason:</span>
              <span className="font-medium text-amber-300">{returnReq.reason || 'Defective Audio Component'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Customer Comments:</span>
              <span className="text-slate-300 italic max-w-xs truncate text-right">
                {returnReq.comments || 'Left earcup crackles at volume > 60%'}
              </span>
            </div>
          </div>

          {/* Photo Evidence Thumbnail Preview */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Customer Photo Evidence
            </span>
            <div className="mt-2 flex gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400">
                <ImageIcon className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex flex-col justify-center text-[11px] text-slate-400">
                <span className="text-slate-200 font-medium">defect_verification_01.jpg</span>
                <span>Serial Number &amp; Packaging seal verified</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorNotice && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorNotice}</span>
            </div>
          )}

          {successNotice && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>QC Disposition recorded! Section 34 Credit Note generated.</span>
            </div>
          )}

          {/* Disposition Decision */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">
              QC Inspection Disposition Decision *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecision('INSPECTED_PASSED')}
                className={`flex flex-col text-left rounded-lg border p-2.5 transition ${
                  decision === 'INSPECTED_PASSED'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Pass Inspection
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Issue Section 34 Credit Note &amp; authorize refund
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('INSPECTED_FAILED')}
                className={`flex flex-col text-left rounded-lg border p-2.5 transition ${
                  decision === 'INSPECTED_FAILED'
                    ? 'border-rose-500 bg-rose-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-rose-400 text-xs">
                  <XCircle className="h-3.5 w-3.5" />
                  Fail Inspection
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Reject claim (Customer damage / voided seal)
                </span>
              </button>
            </div>
          </div>

          {/* Inspection Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Inspector Audit Log Notes *
            </label>
            <Input
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              required
              className="border-slate-700 bg-slate-950/60 text-white text-xs"
            />
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Recording QC...
                </>
              ) : (
                <>
                  <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                  Commit Disposition
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
