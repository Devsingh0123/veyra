import React, { useState } from 'react';
import { Truck, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PinDeliveryChecker({ price = 1999 }) {
  const [pinCode, setPinCode] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = (e) => {
    e.preventDefault();
    const cleanPin = pinCode.trim();

    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setCheckResult({
        valid: false,
        message: 'Please enter a valid 6-digit Indian postal PIN code.',
      });
      return;
    }

    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      // Realistic metro vs non-metro logistics resolution
      const firstDigit = cleanPin[0];
      const isMetro = ['1', '4', '5', '6', '7'].includes(firstDigit);

      setCheckResult({
        valid: true,
        pin: cleanPin,
        timeline: isMetro ? 'Express 24 to 48 Hours Delivery' : 'Standard 2 to 4 Business Days',
        carrier: 'BlueDart Air & Delhivery Prime',
        codAvailable: true,
        freeDelivery: price >= 999,
      });
    }, 400);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Truck className="h-4 w-4 text-indigo-400" />
          <span>Delivery &amp; Serviceability Check</span>
        </div>
        <span className="text-[10px] text-slate-400">28,000+ PIN Codes</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit PIN code (e.g. 400001)"
            value={pinCode}
            onChange={(e) => {
              setPinCode(e.target.value.replace(/\D/g, ''));
              setCheckResult(null);
            }}
            className="pl-9 h-9 bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isChecking || pinCode.length !== 6}
          className="h-9 px-4 text-xs font-semibold"
        >
          {isChecking ? 'Checking...' : 'Check'}
        </Button>
      </form>

      {/* Result feedback */}
      {checkResult && (
        <div className="pt-1">
          {checkResult.valid ? (
            <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Serviceable to {checkResult.pin}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] bg-emerald-900/50 text-emerald-200">
                  {checkResult.freeDelivery ? 'FREE SHIPPING' : '₹99 STANDARD'}
                </Badge>
              </div>
              <p className="text-[11px] text-emerald-400/90 pl-5.5">
                • {checkResult.timeline} via {checkResult.carrier}
              </p>
              <p className="text-[11px] text-emerald-400/90 pl-5.5">
                • Cash on Delivery (COD) &amp; Instant Razorpay UPI supported
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-950/30 border border-rose-500/30 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{checkResult.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
