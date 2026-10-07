import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Smartphone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function PaymentModal({
  open,
  onOpenChange,
  amount,
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  onPaymentSuccess,
}) {
  const [activePaymentTab, setActivePaymentTab] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handleSimulatePayment = (method) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        paymentId: `pay_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`,
        orderId: `order_rzp_${Date.now().toString().slice(-6)}`,
        signature: `sig_mock_${Math.random().toString(36).substring(2, 10)}`,
        method,
      });
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                V
              </div>
              <span className="text-sm font-extrabold tracking-tight text-white">
                Razorpay Checkout
              </span>
            </div>
            <Badge variant="secondary" className="bg-emerald-950/60 border-emerald-500/40 text-emerald-300 text-[10px]">
              256-Bit SSL Secured
            </Badge>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-slate-400">Order Reference</span>
              <p className="text-xs font-mono font-bold text-slate-200">
                {orderNumber || 'VYR-2026-LIVE'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Total Payable</span>
              <p className="text-xl font-black text-white font-mono">
                ₹{Number(amount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body with Tabs */}
        <div className="p-5 space-y-4">
          <Tabs value={activePaymentTab} onValueChange={setActivePaymentTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <TabsTrigger value="upi" className="text-xs data-active:bg-indigo-600 data-active:text-white">
                <Smartphone className="h-3.5 w-3.5 mr-1" />
                <span>UPI / QR</span>
              </TabsTrigger>
              <TabsTrigger value="card" className="text-xs data-active:bg-indigo-600 data-active:text-white">
                <CreditCard className="h-3.5 w-3.5 mr-1" />
                <span>Card</span>
              </TabsTrigger>
              <TabsTrigger value="netbanking" className="text-xs data-active:bg-indigo-600 data-active:text-white">
                <Lock className="h-3.5 w-3.5 mr-1" />
                <span>NetBanking</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: UPI & QR */}
            <TabsContent value="upi" className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center space-y-2">
                <div className="flex justify-center">
                  <div className="p-2.5 rounded-xl bg-white text-slate-950 shadow-md">
                    <QrCode className="h-24 w-24" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">
                  Scan with any UPI App: <strong className="text-indigo-400">GPay, PhonePe, Paytm, CRED</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400">Or enter your VPA / UPI ID:</span>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="username@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleSimulatePayment('UPI')}
                    className="whitespace-nowrap px-4"
                  >
                    Verify &amp; Pay
                  </Button>
                </div>
              </div>

              <Button
                className="w-full gap-2 shadow-lg shadow-indigo-600/30"
                size="default"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment('UPI_APP')}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing UPI Authorization...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" />
                    <span>Approve via UPI App (₹{Number(amount).toLocaleString('en-IN')})</span>
                  </>
                )}
              </Button>
            </TabsContent>

            {/* TAB 2: Debit / Credit Card */}
            <TabsContent value="card" className="mt-4 space-y-3 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-300 font-medium">Card Number</span>
                <Input
                  type="text"
                  maxLength={19}
                  placeholder="4532 •••• •••• 8849"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs font-mono text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-slate-300 font-medium">Expiry (MM/YY)</span>
                  <Input
                    type="text"
                    maxLength={5}
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs font-mono text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-slate-300 font-medium">CVV</span>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <Button
                className="w-full gap-2 mt-2"
                size="default"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment('CARD')}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Card Details...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay ₹{Number(amount).toLocaleString('en-IN')} with 3D Secure</span>
                  </>
                )}
              </Button>
            </TabsContent>

            {/* TAB 3: NetBanking */}
            <TabsContent value="netbanking" className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                  <Button
                    key={bank}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleSimulatePayment(`NETBANKING_${bank}`)}
                    className="border-slate-800 text-xs justify-start"
                  >
                    <span>{bank}</span>
                  </Button>
                ))}
              </div>

              <Button
                className="w-full gap-2 mt-2"
                size="default"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment('NETBANKING')}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting to Bank Portal...</span>
                  </>
                ) : (
                  <span>Select Another Bank &amp; Pay</span>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Razorpay PCI-DSS Level 1 Encrypted Payment Gateway</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
