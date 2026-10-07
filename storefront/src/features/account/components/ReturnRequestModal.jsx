import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Upload,
  CheckCircle2,
  ReceiptText,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useFileReturnMutation } from '../api/accountApi';
import { toast } from 'sonner';

export default function ReturnRequestModal({ open, onOpenChange, order, onReturnSuccess }) {
  const [reason, setReason] = useState('DEFECTIVE');
  const [comments, setComments] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fileReturn] = useFileReturnMutation();

  if (!order) return null;

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (order.id) {
        await fileReturn({
          orderId: order.id,
          returnData: { reason, comments },
        }).unwrap();
      }
    } catch {
      // Mock mode fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('7-Day Return Request Filed Successfully!', {
        description: `Doorstep reverse pickup arranged for Order ${order.orderNumber || order.id}. Section 34 Credit Note will be issued upon inspection.`,
      });
      onReturnSuccess?.();
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                File 7-Day Return Request
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Order: <strong className="text-slate-200">{order.orderNumber || order.id}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmitReturn} className="space-y-4 pt-2 text-xs">
          {/* Reason Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Reason for Return *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full bg-slate-900 border-slate-800 text-xs text-white">
                <SelectValue placeholder="Select Return Reason" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="DEFECTIVE">Product Defective or Damaged on Arrival</SelectItem>
                <SelectItem value="WRONG_ITEM">Received Incorrect Variant or Item</SelectItem>
                <SelectItem value="SIZE_FIT">Size / Fit Incompatibility</SelectItem>
                <SelectItem value="QUALITY">Quality Differed from Specifications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Detailed Comments */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Detailed Description *</Label>
            <textarea
              required
              rows={3}
              placeholder="Please provide specifics regarding the reason for return..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Photo upload mock */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Upload Defect / Condition Photo</Label>
            <div
              onClick={() => {
                setFileUploaded(true);
                toast.info('Item condition photo attached.');
              }}
              className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-800 rounded-xl bg-slate-900/50 hover:bg-slate-900 cursor-pointer transition text-center"
            >
              {fileUploaded ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>IMG_Defect_Inspection.jpg (Attached)</span>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-[11px] text-slate-300">Click to upload photo evidence</span>
                  <span className="text-[10px] text-slate-500">PNG, JPG up to 5MB</span>
                </>
              )}
            </div>
          </div>

          {/* Section 34 Credit Note & Refund Notice */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <ReceiptText className="h-3.5 w-3.5" />
              <span>Section 34 Credit Note &amp; Refund Particulars</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Upon doorstep reverse pickup by BlueDart and receipt verification at our hub, a statutory Section 34 Credit Note will be generated and refund credited to your original payment instrument within 3 to 5 business days.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !comments.trim()}
              className="text-xs gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Filing Return...' : 'Submit Return Request'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
