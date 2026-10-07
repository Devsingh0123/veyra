import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  User as UserIcon,
  Package,
  Receipt,
  MapPin,
  LogOut,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
  ChevronRight,
  Mail,
  Phone,
  FileText,
  RotateCcw,
} from 'lucide-react';
import OrderTrackingCard from './OrderTrackingCard';
import TaxInvoiceModal from './TaxInvoiceModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { setCredentials, logoutCustomer } from '../../../store/slices/authSlice';
import {
  useLoginMutation,
  useRegisterMutation,
  useGetMyOrdersQuery,
} from '../api/accountApi';
import { toast } from 'sonner';

// Sample mock orders for customer showcase
const MOCK_ORDERS = [
  {
    id: 'ord-001',
    orderNumber: 'VYR-2026-8492',
    status: 'DELIVERED',
    totalAmount: 4999,
    createdAt: '2026-10-04T10:30:00.000Z',
    paymentMethod: 'RAZORPAY PREPAID',
    shippingAddress: {
      fullName: 'Aditya Sharma',
      phone: '9876543210',
      line1: 'Flat 402, Sunshine Towers, Senapati Bapat Marg',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: 'MH',
      pinCode: '400013',
    },
    items: [
      {
        productName: 'StudioMaster Pro Wireless ANC Over-Ear Headphones',
        variantTitle: 'Matte Obsidian Black',
        quantity: 1,
        price: 4999,
        hsnCode: '85183000',
        gstRate: 18,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'ord-002',
    orderNumber: 'VYR-2026-9134',
    status: 'SHIPPED',
    totalAmount: 3499,
    createdAt: '2026-10-06T14:15:00.000Z',
    paymentMethod: 'RAZORPAY PREPAID',
    shippingAddress: {
      fullName: 'Aditya Sharma',
      phone: '9876543210',
      line1: 'Flat 402, Sunshine Towers, Senapati Bapat Marg',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: 'MH',
      pinCode: '400013',
    },
    items: [
      {
        productName: 'ChromaFit Ultra AMOLED GPS Smartwatch (Titanium Grey)',
        variantTitle: 'Titanium Grey / Fluororubber Band',
        quantity: 1,
        price: 3499,
        hsnCode: '91021200',
        gstRate: 18,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
];

export default function AccountView() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('orders');

  // Order reference lookup
  const initialSearchOrder = searchParams.get('order') || '';
  const [orderSearchQuery, setOrderSearchQuery] = useState(initialSearchOrder);

  // Auth Forms State (for unauthenticated visitors)
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Selected invoice modal for tab 2
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // RTK Query hooks
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const { data: ordersResponse } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  const orders =
    ordersResponse?.data && ordersResponse.data.length > 0
      ? ordersResponse.data
      : MOCK_ORDERS;

  // Filter orders by search query
  const filteredOrders = orders.filter((o) => {
    if (!orderSearchQuery.trim()) return true;
    const query = orderSearchQuery.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(query) ||
      o.id?.toLowerCase().includes(query)
    );
  });

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginMutation({ email, password }).unwrap();
      dispatch(
        setCredentials({
          user: result.data?.user || { email, firstName: 'Aditya', lastName: 'Sharma' },
          token: result.data?.token || 'mock_jwt_token',
        })
      );
      toast.success('Signed in successfully! Welcome back.');
    } catch {
      // Mock mode fallback for seamless demonstration
      dispatch(
        setCredentials({
          user: {
            email: email || 'aditya.sharma@veyra.in',
            firstName: firstName || 'Aditya',
            lastName: lastName || 'Sharma',
            phone: phone || '9876543210',
          },
          token: 'mock_jwt_token_sample',
        })
      );
      toast.success('Signed in successfully! Welcome back.');
    }
  };

  // Quick Demo Login
  const handleQuickDemoLogin = () => {
    dispatch(
      setCredentials({
        user: {
          email: 'aditya.sharma@veyra.in',
          firstName: 'Aditya',
          lastName: 'Sharma',
          phone: '9876543210',
        },
        token: 'mock_jwt_token_sample',
      })
    );
    toast.success('Signed in as Demo Customer (Aditya Sharma).');
  };

  const handleLogout = () => {
    dispatch(logoutCustomer());
    toast.info('Signed out of customer account.');
  };

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user?.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'A';

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-indigo-400 font-medium">Customer Account &amp; Tracking</span>
        </nav>

        {!isAuthenticated ? (
          /* ==============================================================
             UNAUTHENTICATED GUEST FLOW: LOGIN / REGISTER / GUEST TRACKING
             ============================================================== */
          <div className="mx-auto max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="flex mx-auto h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <UserIcon className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black text-white">
                Customer Account Portal
              </h1>
              <p className="text-xs text-slate-400">
                Access your orders, download Section 46 GST Tax Invoices, and track deliveries.
              </p>
            </div>

            {/* Quick Demo Sign-In Card */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 p-4 flex items-center justify-between gap-3 shadow-lg">
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-white block">Instant Demo Access</span>
                <span className="text-[11px] text-slate-400">
                  Pre-loaded with sample orders &amp; tax invoices
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleQuickDemoLogin}
                className="whitespace-nowrap gap-1.5 shadow-md shadow-indigo-600/30 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>1-Click Demo Login</span>
              </Button>
            </div>

            {/* Login / Register Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm space-y-5">
              <div className="grid grid-cols-2 rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    authMode === 'login'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    authMode === 'register'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                {authMode === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-300">First Name</Label>
                      <Input
                        required
                        type="text"
                        placeholder="Aditya"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-300">Last Name</Label>
                      <Input
                        required
                        type="text"
                        placeholder="Sharma"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Email Address</Label>
                  <Input
                    required
                    type="email"
                    placeholder="aditya.sharma@veyra.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                {authMode === 'register' && (
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Mobile Number (+91)</Label>
                    <Input
                      required
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-slate-300">Password</Label>
                    {authMode === 'login' && (
                      <span className="text-[11px] text-indigo-400 cursor-pointer hover:underline">
                        Forgot Password?
                      </span>
                    )}
                  </div>
                  <Input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn || isRegistering}
                  className="w-full gap-2 shadow-lg shadow-indigo-600/30 h-10 text-xs font-bold"
                >
                  <Lock className="h-4 w-4" />
                  <span>{authMode === 'login' ? 'Sign In to Account' : 'Create Customer Account'}</span>
                </Button>
              </form>

              {/* Guest Order Lookup */}
              <div className="pt-2 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 block mb-2">
                  Need to track a guest order?
                </span>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter Order Reference (e.g. VYR-2026-8492)"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleQuickDemoLogin}
                    className="text-xs"
                  >
                    Track
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==============================================================
             AUTHENTICATED CUSTOMER DASHBOARD
             ============================================================== */
          <div className="space-y-8">
            {/* Top Customer Header Card */}
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Avatar size="lg" className="h-16 w-16 bg-indigo-600 text-white font-black text-xl shadow-xl shadow-indigo-600/25 border-2 border-indigo-500">
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <Badge variant="default" className="bg-amber-600 text-[10px] font-bold">
                        VIP GOLD TIER
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{user?.email}</span>
                      <span>•</span>
                      <span>Member Since 2026</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 border-slate-800 bg-slate-900 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Dashboard Tabs using shadcn Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto pb-2 no-scrollbar">
                <TabsList className="bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                  <TabsTrigger
                    value="orders"
                    className="text-xs px-4 py-2 data-active:bg-indigo-600 data-active:text-white"
                  >
                    <Package className="mr-1.5 h-3.5 w-3.5" />
                    <span>My Orders &amp; Tracking ({orders.length})</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="invoices"
                    className="text-xs px-4 py-2 data-active:bg-indigo-600 data-active:text-white"
                  >
                    <Receipt className="mr-1.5 h-3.5 w-3.5" />
                    <span>Section 46 Tax Invoices</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="text-xs px-4 py-2 data-active:bg-indigo-600 data-active:text-white"
                  >
                    <UserIcon className="mr-1.5 h-3.5 w-3.5" />
                    <span>Profile &amp; Statutory Particulars</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: Orders & Live Tracking */}
              <TabsContent value="orders" className="mt-6 space-y-6">
                {/* Search Bar for Orders */}
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Search orders by reference ID (e.g. VYR-2026-8492)..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="pl-9 bg-slate-900 border-slate-800 text-xs text-white"
                    />
                  </div>
                  {orderSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOrderSearchQuery('')}
                      className="text-xs text-slate-400"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
                    <Package className="h-10 w-10 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No orders match your search</h3>
                    <p className="text-xs text-slate-400">
                      Try searching by a different reference number or clear the query.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <OrderTrackingCard key={order.id || order.orderNumber} order={order} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: Section 46 GST Invoices Archive */}
              <TabsContent value="invoices" className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">
                      Section 46 Statutory GST Invoices Archive
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Compliant B2C/B2B tax invoices with detailed HSN codes and statutory CGST/SGST/IGST tax splits.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="p-3.5">Invoice Reference</th>
                        <th className="p-3.5">Order Ref</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Total Amount</th>
                        <th className="p-3.5">Statutory Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-900/80">
                          <td className="p-3.5 font-mono font-bold text-indigo-400">
                            INV-{order.orderNumber}
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">
                            {order.orderNumber}
                          </td>
                          <td className="p-3.5 text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-white">
                            ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5">
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="gap-1.5 text-xs"
                            >
                              <FileText className="h-3 w-3" />
                              <span>View &amp; Print</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB 3: Profile & Saved Particulars */}
              <TabsContent value="profile" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Particulars Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-indigo-400" />
                      <span>Customer Particulars</span>
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Full Name</span>
                        <strong className="text-white">{user?.firstName} {user?.lastName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Email Address</span>
                        <strong className="text-white">{user?.email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Primary Contact</span>
                        <strong className="text-white">+91 {user?.phone || '9876543210'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Statutory GST Particulars (B2B Input Credit) */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>B2B Statutory Invoicing (Optional)</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Add your Business GSTIN to receive B2B tax invoices with eligible Input Tax Credit (ITC) under Section 16 of the CGST Act.
                    </p>
                    <div className="space-y-2 text-xs">
                      <Label className="text-slate-300">Company GSTIN (15 Alphanumeric Characters)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. 27AABCU9603R1ZN"
                        className="bg-slate-950 border-slate-800 text-xs font-mono uppercase text-white"
                      />
                      <Button size="xs" variant="secondary" className="mt-1">
                        Save GST Particulars
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Global Tax Invoice Modal */}
        {selectedInvoiceOrder && (
          <TaxInvoiceModal
            open={Boolean(selectedInvoiceOrder)}
            onOpenChange={(open) => !open && setSelectedInvoiceOrder(null)}
            order={selectedInvoiceOrder}
          />
        )}
      </div>
    </div>
  );
}
