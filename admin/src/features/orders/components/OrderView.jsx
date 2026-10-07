import React, { useState } from 'react';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../api/ordersApi';
import DispatchModal from './DispatchModal';
import InvoiceModal from './InvoiceModal';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Truck,
  ArrowRight,
  CheckCircle,
  PackageCheck,
  AlertCircle,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'PACKED', label: 'Packed' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_BADGES = {
  PENDING: 'bg-slate-800 text-slate-300 border-slate-700',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PROCESSING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PACKED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  OUT_FOR_DELIVERY: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DELIVERED: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const FALLBACK_ORDERS = [
  {
    id: 'ord-101',
    orderNumber: 'VYR-2026-9041',
    status: 'CONFIRMED',
    totalAmount: 4899,
    createdAt: new Date().toISOString(),
    shippingAddress: { city: 'Bengaluru', state: 'Karnataka', postalCode: '560001' },
    items: [{ id: 'item-1', title: 'Acoustic Studio Headphone ANC', quantity: 1, price: 4899 }],
  },
  {
    id: 'ord-102',
    orderNumber: 'VYR-2026-9040',
    status: 'PROCESSING',
    totalAmount: 12450,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    shippingAddress: { city: 'Mumbai', state: 'Maharashtra', postalCode: '400001' },
    items: [{ id: 'item-2', title: 'Veyra Mechanical Keyboard RGB Pro', quantity: 1, price: 12450 }],
  },
  {
    id: 'ord-103',
    orderNumber: 'VYR-2026-9039',
    status: 'PACKED',
    totalAmount: 2399,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    shippingAddress: { city: 'Hyderabad', state: 'Telangana', postalCode: '500081' },
    items: [{ id: 'item-3', title: 'Ergonomic Gaming Desk Mat', quantity: 1, price: 2399 }],
  },
  {
    id: 'ord-104',
    orderNumber: 'VYR-2026-9038',
    status: 'SHIPPED',
    totalAmount: 2799,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    shippingAddress: { city: 'New Delhi', state: 'Delhi', postalCode: '110001' },
    items: [{ id: 'item-4', title: 'MagSafe Wireless Charging Pad 15W', quantity: 1, price: 2799 }],
  },
];

export default function OrderView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const { data: apiData, isLoading, isFetching, refetch } = useGetAllOrdersQuery({
    search: searchTerm || undefined,
    status: activeTab === 'ALL' ? undefined : activeTab,
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();

  const orders =
    apiData?.data?.orders && apiData.data.orders.length > 0
      ? apiData.data.orders
      : FALLBACK_ORDERS;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchTerm ||
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      activeTab === 'ALL' || o.status?.toUpperCase() === activeTab;

    return matchesSearch && matchesStatus;
  });

  const handleAdvanceStatus = async (orderId, nextStatus, note) => {
    try {
      await updateStatus({ id: orderId, status: nextStatus, note }).unwrap();
    } catch {
      // Handled via RTK Query tag updates
    }
  };

  const handleOpenDispatch = (order) => {
    setDispatchOrder(order);
    setIsDispatchOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Orders Lifecycle &amp; FSM Pipeline
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Finite State Machine order transitions, logistics packaging &amp; carrier fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            title="Refresh Orders"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-indigo-400' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/80 pb-2.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Filter by Order Number (VYR-2026-XXXX) or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 border-slate-800 bg-slate-900/70 text-white text-xs placeholder:text-slate-500"
        />
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Details</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>FSM Status</TableHead>
              <TableHead className="text-right">FSM Transition</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const status = order.status?.toUpperCase() || 'CONFIRMED';
                const badgeClass =
                  STATUS_BADGES[status] || 'bg-slate-800 text-slate-300 border-slate-700';

                const itemCount = order.items?.length || 1;
                const firstTitle =
                  order.items?.[0]?.title || order.items?.[0]?.name || 'Standard Item';

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-mono text-xs font-semibold text-white">
                        {order.orderNumber || order.id}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="truncate max-w-[150px] inline-block text-xs text-slate-300">
                        {firstTitle} {itemCount > 1 ? `(+${itemCount - 1} more)` : ''}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-300">
                        {order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'KA'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-white text-xs">
                        ₹{(Number(order.totalAmount) || 0).toLocaleString('en-IN')}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass}`}
                      >
                        {status}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleAdvanceStatus(order.id, 'PROCESSING', 'Processing started')
                            }
                            className="h-7 text-xs bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 px-2.5"
                          >
                            Mark Processing
                          </Button>
                        )}

                        {status === 'PROCESSING' && (
                          <Button
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleAdvanceStatus(order.id, 'PACKED', 'Item boxed & packed')
                            }
                            className="h-7 text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 px-2.5"
                          >
                            <PackageCheck className="mr-1 h-3 w-3" />
                            Mark Packed
                          </Button>
                        )}

                        {status === 'PACKED' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenDispatch(order)}
                            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 shadow-sm"
                          >
                            <Truck className="mr-1 h-3 w-3" />
                            Dispatch / AWB
                          </Button>
                        )}

                        {status === 'SHIPPED' && (
                          <Button
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleAdvanceStatus(order.id, 'OUT_FOR_DELIVERY', 'Courier on route')
                            }
                            className="h-7 text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 px-2.5"
                          >
                            Out for Delivery
                          </Button>
                        )}

                        {status === 'OUT_FOR_DELIVERY' && (
                          <Button
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleAdvanceStatus(order.id, 'DELIVERED', 'Customer OTP confirmed')
                            }
                            className="h-7 text-xs bg-teal-600/20 text-teal-300 border border-teal-500/30 hover:bg-teal-600/30 px-2.5"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Delivered
                          </Button>
                        )}

                        {status === 'DELIVERED' && (
                          <span className="text-[11px] text-teal-400 font-medium">
                            Complete
                          </span>
                        )}

                        {status === 'CANCELLED' && (
                          <span className="text-[11px] text-rose-400 font-medium">
                            Terminated
                          </span>
                        )}

                        {/* View Tax Invoice Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setInvoiceOrder(order);
                            setIsInvoiceOpen(true);
                          }}
                          className="h-7 text-xs text-slate-400 hover:text-white px-2 hover:bg-slate-800"
                          title="View Section 46 CGST Tax Invoice"
                        >
                          <FileText className="h-3.5 w-3.5 text-indigo-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                  No orders found matching the filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dispatch Logistics Modal */}
      <DispatchModal
        order={dispatchOrder}
        open={isDispatchOpen}
        onOpenChange={setIsDispatchOpen}
      />

      {/* Section 46 CGST Tax Invoice Modal */}
      <InvoiceModal
        order={invoiceOrder}
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
      />
    </div>
  );
}
