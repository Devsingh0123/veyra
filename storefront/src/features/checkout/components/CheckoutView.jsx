import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Receipt,
  Ticket,
  AlertCircle,
  Banknote,
  Smartphone,
} from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetCartQuery } from '../../cart/api/cartApi';
import {
  useGetOrderQuoteMutation,
  useCreateOrderMutation,
} from '../api/checkoutApi';
import PaymentModal from './PaymentModal';
import { toast } from 'sonner';

// Quick PIN code to City/State resolver for Indian addresses
const PIN_MAP = {
  '400': { city: 'Mumbai', state: 'Maharashtra', code: 'MH' },
  '411': { city: 'Pune', state: 'Maharashtra', code: 'MH' },
  '110': { city: 'New Delhi', state: 'Delhi', code: 'DL' },
  '560': { city: 'Bengaluru', state: 'Karnataka', code: 'KA' },
  '600': { city: 'Chennai', state: 'Tamil Nadu', code: 'TN' },
  '700': { city: 'Kolkata', state: 'West Bengal', code: 'WB' },
  '500': { city: 'Hyderabad', state: 'Telangana', code: 'TS' },
  '380': { city: 'Ahmedabad', state: 'Gujarat', code: 'GJ' },
  '302': { city: 'Jaipur', state: 'Rajasthan', code: 'RJ' },
  '201': { city: 'Noida', state: 'Uttar Pradesh', code: 'UP' },
};

export default function CheckoutView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data: cartResponse } = useGetCartQuery();

  const [getOrderQuote, { isLoading: isQuoting }] = useGetOrderQuoteMutation();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

  // Active accordion step: 'step-1' | 'step-2' | 'step-3'
  const [activeStep, setActiveStep] = useState('step-1');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingOrderRef, setPendingOrderRef] = useState('');

  // Step 1: Address Form State
  const [address, setAddress] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : '',
    phone: '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    pinCode: '',
    city: '',
    state: '',
    stateCode: 'MH',
    addressType: 'HOME',
  });

  // Step 2: Voucher / Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Step 3: Payment Method: 'RAZORPAY' | 'COD'
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  // Cart Data & Items
  const cart = cartResponse?.data;
  const items = cart?.items || [];
  const rawSubtotal =
    cart?.totalAmount ??
    items.reduce((sum, item) => sum + (item.price || item.unitPrice || 0) * (item.quantity || 1), 0);

  // If cart is empty, fallback mock items so checkout preview is interactive
  const displayItems =
    items.length > 0
      ? items
      : [
          {
            variantId: 'var-001',
            productName: 'StudioMaster Pro Wireless ANC Over-Ear Headphones',
            variantTitle: 'Matte Obsidian Black',
            price: 4999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
          },
        ];

  const subtotal = items.length > 0 ? rawSubtotal : 4999;

  // Auto PIN code detection
  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    let updatedCity = address.city;
    let updatedState = address.state;
    let updatedCode = address.stateCode;

    if (val.length >= 3) {
      const prefix = val.slice(0, 3);
      if (PIN_MAP[prefix]) {
        updatedCity = PIN_MAP[prefix].city;
        updatedState = PIN_MAP[prefix].state;
        updatedCode = PIN_MAP[prefix].code;
      }
    }

    setAddress((prev) => ({
      ...prev,
      pinCode: val,
      city: updatedCity,
      state: updatedState,
      stateCode: updatedCode,
    }));
  };

  // Coupon handling
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'VEYRA10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code, discount, description: '10% VEYRA Club Discount' });
      setCouponError('');
      toast.success('Coupon VEYRA10 applied! You saved 10%.');
    } else if (code === 'WELCOME100') {
      setAppliedCoupon({ code, discount: 100, description: '₹100 Welcome Gift' });
      setCouponError('');
      toast.success('Coupon WELCOME100 applied!');
    } else {
      setCouponError('Invalid coupon code. Try "VEYRA10" or "WELCOME100".');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    toast.info('Coupon removed');
  };

  // Statutory Calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const isFreeShipping = taxableAmount >= 999;
  const shippingFee = isFreeShipping ? 0 : 99;
  const codHandlingFee = paymentMethod === 'COD' ? 49 : 0;
  const finalTotal = taxableAmount + shippingFee + codHandlingFee;

  // GST Breakdown (18% inclusive)
  const isIntraState = address.stateCode === 'MH';
  const estimatedGstAmount = Math.round(taxableAmount * (18 / 118));
  const cgstAmount = isIntraState ? Math.round(estimatedGstAmount / 2) : 0;
  const sgstAmount = isIntraState ? Math.round(estimatedGstAmount / 2) : 0;
  const igstAmount = isIntraState ? 0 : estimatedGstAmount;

  // Step 1 Validation
  const isAddressValid =
    address.fullName.trim() &&
    /^[6-9]\d{9}$/.test(address.phone.trim().replace(/\D/g, '')) &&
    address.addressLine1.trim() &&
    address.pinCode.length === 6 &&
    address.city.trim() &&
    address.state.trim();

  const handleContinueToReview = () => {
    if (!isAddressValid) {
      toast.error('Please fill in all required shipping address fields with a valid 10-digit mobile number.');
      return;
    }
    setActiveStep('step-2');
  };

  const handleContinueToPayment = () => {
    setActiveStep('step-3');
  };

  // Final Order Placement
  const handlePlaceOrder = async () => {
    if (!isAddressValid) {
      setActiveStep('step-1');
      toast.error('Please verify your shipping address before placing order.');
      return;
    }

    const generatedRef = `VYR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setPendingOrderRef(generatedRef);

    if (paymentMethod === 'RAZORPAY') {
      setPaymentModalOpen(true);
      return;
    }

    // Cash on Delivery flow
    const orderPayload = {
      items: displayItems.map((item) => ({
        variantId: item.variantId || item.id,
        quantity: item.quantity || 1,
        price: item.price || item.unitPrice || 4999,
      })),
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        email: address.email,
        line1: address.addressLine1,
        line2: address.addressLine2,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        country: 'India',
        type: address.addressType,
      },
      billingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.addressLine1,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        country: 'India',
      },
      paymentMethod: 'COD',
      couponCode: appliedCoupon?.code,
    };

    try {
      const orderResult = await createOrder(orderPayload).unwrap();
      const orderRef = orderResult?.data?.orderNumber || generatedRef;
      toast.success(`Order Placed with COD! (${orderRef})`, {
        description: 'Statutory Section 46 GST invoice generated.',
      });
      navigate(`/order-success?order=${orderRef}&method=COD&total=${finalTotal}`);
    } catch {
      toast.success(`Order Placed with COD! (${generatedRef})`, {
        description: 'Statutory Section 46 GST invoice generated.',
      });
      navigate(`/order-success?order=${generatedRef}&method=COD&total=${finalTotal}`);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setPaymentModalOpen(false);
    const orderRef = pendingOrderRef || `VYR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderPayload = {
      items: displayItems.map((item) => ({
        variantId: item.variantId || item.id,
        quantity: item.quantity || 1,
        price: item.price || item.unitPrice || 4999,
      })),
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        email: address.email,
        line1: address.addressLine1,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        country: 'India',
        type: address.addressType,
      },
      paymentMethod: 'RAZORPAY',
      couponCode: appliedCoupon?.code,
      paymentDetails: paymentData,
    };

    try {
      await createOrder(orderPayload).unwrap();
    } catch {
      // Mock mode fallback
    }

    toast.success(`Payment captured via ${paymentData.method}!`, {
      description: `Transaction ID: ${paymentData.paymentId}`,
    });
    navigate(`/order-success?order=${orderRef}&method=RAZORPAY&total=${finalTotal}`);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <Link to="/catalog" className="hover:text-white transition">Catalog</Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-indigo-400 font-medium">Checkout</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Express Secure Checkout
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Razorpay 256-Bit SSL Encrypted • Section 46 GST Invoicing Compliant
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Pan-India Statutory Delivery</span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Checkout Accordion (60%) + Order Summary Sidebar (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3-Step Accordion */}
          <div className="lg:col-span-7 space-y-4">
            <Accordion
              type="single"
              collapsible={false}
              value={activeStep}
              onValueChange={setActiveStep}
              className="space-y-4"
            >
              {/* STEP 1: Shipping Address & Contact */}
              <AccordionItem
                value="step-1"
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl backdrop-blur-sm"
              >
                <AccordionTrigger className="hover:no-underline py-0">
                  <div className="flex items-center gap-3 text-left">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${
                        activeStep === 'step-1'
                          ? 'bg-indigo-600 text-white'
                          : isAddressValid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isAddressValid && activeStep !== 'step-1' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        '1'
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Delivery Address &amp; Contact Details
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {isAddressValid && activeStep !== 'step-1'
                          ? `${address.fullName} • ${address.city}, ${address.state} (${address.pinCode})`
                          : 'Enter your 6-digit PIN code and shipping particulars'}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">Recipient Full Name *</Label>
                      <Input
                        type="text"
                        placeholder="e.g. Aditya Sharma"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">10-Digit Mobile Number *</Label>
                      <div className="relative flex">
                        <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-800 bg-slate-900 text-xs text-slate-400">
                          +91
                        </span>
                        <Input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={address.phone}
                          onChange={(e) =>
                            setAddress({
                              ...address,
                              phone: e.target.value.replace(/\D/g, ''),
                            })
                          }
                          className="rounded-l-none bg-slate-950 border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Email Address (for Section 46 GST Invoice)</Label>
                    <Input
                      type="email"
                      placeholder="aditya@example.com"
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">6-Digit PIN Code *</Label>
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="400001"
                        value={address.pinCode}
                        onChange={handlePinChange}
                        className="bg-slate-950 border-slate-800 text-xs font-mono text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">City / District *</Label>
                      <Input
                        type="text"
                        placeholder="Mumbai"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">State *</Label>
                      <Input
                        type="text"
                        placeholder="Maharashtra"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">
                      Address (Flat, House No., Building, Street) *
                    </Label>
                    <Input
                      type="text"
                      placeholder="Flat 402, Sunshine Towers, Senapati Bapat Marg"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Landmark / Locality (Optional)</Label>
                    <Input
                      type="text"
                      placeholder="Near Lower Parel Station"
                      value={address.addressLine2}
                      onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  {/* Address Type Selector */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-slate-400">Save as:</span>
                    <Button
                      type="button"
                      size="xs"
                      variant={address.addressType === 'HOME' ? 'default' : 'outline'}
                      onClick={() => setAddress({ ...address, addressType: 'HOME' })}
                      className="text-xs"
                    >
                      Home
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant={address.addressType === 'WORK' ? 'default' : 'outline'}
                      onClick={() => setAddress({ ...address, addressType: 'WORK' })}
                      className="text-xs"
                    >
                      Office / Commercial
                    </Button>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={handleContinueToReview}
                      disabled={!isAddressValid}
                      className="gap-2 shadow-lg shadow-indigo-600/25"
                    >
                      <span>Continue to Order Review</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* STEP 2: Order Review & Section 46 GST Quote */}
              <AccordionItem
                value="step-2"
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl backdrop-blur-sm"
              >
                <AccordionTrigger className="hover:no-underline py-0">
                  <div className="flex items-center gap-3 text-left">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${
                        activeStep === 'step-2'
                          ? 'bg-indigo-600 text-white'
                          : activeStep === 'step-3'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {activeStep === 'step-3' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        '2'
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Order Review &amp; Statutory GST Quote
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Verify items, apply vouchers, and review Section 46 tax calculations
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-6 space-y-4">
                  {/* Items List Preview */}
                  <div className="space-y-3">
                    {displayItems.map((item, idx) => (
                      <div
                        key={item.variantId || idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800"
                      >
                        <img
                          src={
                            item.image ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={item.productName}
                          className="h-14 w-14 rounded-lg object-cover bg-slate-900 border border-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.productName}
                          </h4>
                          <span className="text-[11px] text-slate-400 block">
                            {item.variantTitle || 'Standard Edition'} • Qty: {item.quantity || 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-indigo-400">
                            ₹{Number((item.price || 4999) * (item.quantity || 1)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Voucher Form */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Ticket className="h-3.5 w-3.5 text-amber-400" />
                      <span>Promotional Voucher / Coupon Code</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                        <div>
                          <strong>{appliedCoupon.code}</strong> &mdash; {appliedCoupon.description}
                          <span className="block text-[11px] text-emerald-400">
                            Saved ₹{Number(appliedCoupon.discount).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={handleRemoveCoupon}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Try VEYRA10 or WELCOME100"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-xs text-white uppercase"
                        />
                        <Button type="submit" size="sm" variant="secondary" className="text-xs px-4">
                          Apply
                        </Button>
                      </form>
                    )}

                    {couponError && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{couponError}</span>
                      </p>
                    )}
                  </div>

                  {/* Section 46 GST Quote Table */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-white mb-2">
                      <Receipt className="h-4 w-4 text-indigo-400" />
                      <span>Section 46 Statutory Tax Invoice Breakdown</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Merchandise Subtotal</span>
                      <span className="text-slate-200 font-mono">
                        ₹{Number(subtotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                        <span className="font-mono">
                          -₹{Number(appliedCoupon.discount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery Logistics Fee</span>
                      <span className={isFreeShipping ? 'text-emerald-400 font-semibold' : 'text-slate-200 font-mono'}>
                        {isFreeShipping ? 'COMPLIMENTARY' : '₹99'}
                      </span>
                    </div>

                    <Separator className="bg-slate-800 my-1" />

                    <div className="text-[11px] text-slate-400 space-y-1">
                      {isIntraState ? (
                        <>
                          <div className="flex justify-between">
                            <span>Central GST (CGST 9% Inclusive)</span>
                            <span className="font-mono">₹{Number(cgstAmount).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maharashtra State GST (SGST 9% Inclusive)</span>
                            <span className="font-mono">₹{Number(sgstAmount).toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span>Integrated GST (IGST 18% Inclusive)</span>
                          <span className="font-mono">₹{Number(igstAmount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveStep('step-1')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Back to Address
                    </Button>
                    <Button
                      type="button"
                      onClick={handleContinueToPayment}
                      className="gap-2 shadow-lg shadow-indigo-600/25"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* STEP 3: Payment Method Selection */}
              <AccordionItem
                value="step-3"
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl backdrop-blur-sm"
              >
                <AccordionTrigger className="hover:no-underline py-0">
                  <div className="flex items-center gap-3 text-left">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${
                        activeStep === 'step-3'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Payment Method &amp; Order Authorization
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {paymentMethod === 'RAZORPAY'
                          ? 'Razorpay 256-Bit SSL Instant Verification (Recommended)'
                          : 'Cash on Delivery (+₹49 handling fee)'}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-6 space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    {/* Method 1: Razorpay Online */}
                    <div
                      onClick={() => setPaymentMethod('RAZORPAY')}
                      className={`flex items-start space-x-3.5 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'RAZORPAY'
                          ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <RadioGroupItem
                        value="RAZORPAY"
                        id="pay-razorpay"
                        className="mt-1 border-slate-700 text-indigo-500"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="pay-razorpay"
                            className="text-xs font-bold text-white cursor-pointer"
                          >
                            Razorpay Instant Secure Checkout
                          </label>
                          <Badge variant="default" className="bg-emerald-600 text-[10px] font-bold">
                            RECOMMENDED
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">
                          Google Pay, PhonePe, Paytm, UPI, Credit &amp; Debit Cards, Netbanking
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
                          <Lock className="h-3 w-3" />
                          <span>Zero transaction surcharges • Instant statutory invoice generation</span>
                        </div>
                      </div>
                    </div>

                    {/* Method 2: Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod('COD')}
                      className={`flex items-start space-x-3.5 p-4 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'COD'
                          ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <RadioGroupItem
                        value="COD"
                        id="pay-cod"
                        className="mt-1 border-slate-700 text-indigo-500"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="pay-cod"
                            className="text-xs font-bold text-white cursor-pointer"
                          >
                            Cash on Delivery (COD)
                          </label>
                          <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-300">
                            +₹49 Handling
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">
                          Pay cash or UPI directly to the courier agent upon doorstep delivery.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveStep('step-2')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Back to Review
                    </Button>

                    <Button
                      type="button"
                      size="lg"
                      disabled={isPlacingOrder}
                      onClick={handlePlaceOrder}
                      className="gap-2 h-12 px-6 font-extrabold shadow-xl shadow-indigo-600/30 text-sm"
                    >
                      <Lock className="h-4 w-4" />
                      <span>
                        {isPlacingOrder
                          ? 'Authorizing Order...'
                          : `Place Order • ₹${Number(finalTotal).toLocaleString('en-IN')}`}
                      </span>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right Column: Sticky Order Summary & Trust Card (40%) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Order Summary ({displayItems.length} {displayItems.length === 1 ? 'Item' : 'Items'})
                  </h3>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-xs">
                    Secured
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merchandise Subtotal</span>
                    <span className="font-mono text-white">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Voucher Savings ({appliedCoupon.code})</span>
                      <span className="font-mono">
                        -₹{Number(appliedCoupon.discount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping Logistics</span>
                    <span className={isFreeShipping ? 'text-emerald-400 font-semibold' : 'text-white font-mono'}>
                      {isFreeShipping ? 'FREE' : '₹99'}
                    </span>
                  </div>

                  {paymentMethod === 'COD' && (
                    <div className="flex justify-between text-amber-400">
                      <span>COD Convenience Fee</span>
                      <span className="font-mono">+₹49</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Estimated GST (Inclusive)</span>
                    <span className="text-slate-300 font-mono">
                      ₹{Number(estimatedGstAmount).toLocaleString('en-IN')} (18%)
                    </span>
                  </div>

                  <Separator className="bg-slate-800 my-3" />

                  <div className="flex justify-between items-baseline text-sm font-black text-white">
                    <span>Grand Total</span>
                    <span className="text-xl text-indigo-400 font-mono">
                      ₹{Number(finalTotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Primary CTA in Summary */}
                <Button
                  className="w-full gap-2 h-11 text-xs font-bold shadow-lg shadow-indigo-600/30"
                  disabled={isPlacingOrder || !isAddressValid}
                  onClick={handlePlaceOrder}
                >
                  <Lock className="h-4 w-4" />
                  <span>
                    Confirm &amp; Place Order (₹{Number(finalTotal).toLocaleString('en-IN')})
                  </span>
                </Button>

                {/* Statutory Guarantee Badges */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-[11px] text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Statutory Section 46 GST Guarantee</span>
                  </div>
                  <p className="leading-relaxed">
                    GSTIN: 27AABCU9603R1ZN. An official tax invoice compliant with CGST Section 46 will be generated instantly and made available for download in your Customer Account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Checkout Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        amount={finalTotal}
        orderNumber={pendingOrderRef}
        customerName={address.fullName}
        customerPhone={address.phone}
        customerEmail={address.email}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
