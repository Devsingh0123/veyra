import React from 'react';
import { Link } from 'react-router-dom';
import { useGetDashboardMetricsQuery } from '../api/dashboardApi';
import StatCard from './StatCard';
import {
  TrendingUp,
  ShoppingBag,
  Layers,
  RotateCcw,
  RefreshCw,
  ArrowRight,
  Server,
  CheckCircle,
  Clock,
  Package,
} from 'lucide-react';

const STATUS_BADGES = {
  PLACED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PROCESSING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DELIVERED: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const MICROSERVICES = [
  { name: 'API Gateway', port: 3000, status: 'Active', latency: '12ms' },
  { name: 'Auth Service', port: 3001, status: 'Active', latency: '8ms' },
  { name: 'Catalog & Inventory', port: 3002, status: 'Active', latency: '15ms' },
  { name: 'Order Service', port: 3004, status: 'Active', latency: '18ms' },
  { name: 'Payment Service', port: 3005, status: 'Active', latency: '22ms' },
  { name: 'Notification Service', port: 3006, status: 'Active', latency: '10ms' },
];

export default function DashboardView() {
  const { data: metrics, isLoading, isFetching, refetch } = useGetDashboardMetricsQuery();

  const formattedGMV = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(metrics?.gmv || 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time multi-service telemetry, GMV metrics &amp; fulfillment dispatch queue
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            title="Refresh Metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <span>Fulfill Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross Merchandise Value"
          value={isLoading ? 'Loading...' : formattedGMV}
          change="+18.4%"
          changeType="positive"
          subtitle="Processed via Razorpay gateway"
          icon={TrendingUp}
          accentColor="indigo"
        />

        <StatCard
          title="Total Lifetime Orders"
          value={isLoading ? '...' : (metrics?.totalOrders || 0).toLocaleString()}
          change="+12 today"
          changeType="positive"
          subtitle="Orders recorded across all channels"
          icon={ShoppingBag}
          accentColor="emerald"
        />

        <StatCard
          title="Pending Dispatches"
          value={isLoading ? '...' : (metrics?.pendingDispatch || 0).toString()}
          change="Action required"
          changeType="negative"
          subtitle="Orders awaiting AWB generation"
          icon={Layers}
          accentColor="amber"
        />

        <StatCard
          title="Active Return Claims"
          value={isLoading ? '...' : (metrics?.returnsCount || 0).toString()}
          change="QC Queue"
          changeType="neutral"
          subtitle="Pending reverse logistics audit"
          icon={RotateCcw}
          accentColor="rose"
        />
      </div>

      {/* Main Grid: Recent Orders & System Telemetry */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Recent Order Stream</h2>
            </div>
            <Link
              to="/orders"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
            >
              View All Orders &rarr;
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-medium">Order Number</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Total Amount</th>
                  <th className="pb-3 font-medium">FSM Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                  metrics.recentOrders.map((order) => {
                    const badgeClass =
                      STATUS_BADGES[order.status?.toUpperCase()] ||
                      'bg-slate-800 text-slate-300 border-slate-700';

                    const itemCount = order.items?.length || 1;
                    const itemTitle =
                      order.items?.[0]?.title || order.items?.[0]?.name || 'Catalog Item';

                    return (
                      <tr key={order.id} className="transition hover:bg-slate-800/30">
                        <td className="py-3.5 font-mono font-medium text-slate-200">
                          {order.orderNumber || order.id?.slice(0, 8)}
                        </td>
                        <td className="py-3.5 text-slate-300">
                          <span className="truncate max-w-[140px] inline-block font-normal">
                            {itemTitle} {itemCount > 1 ? `(+${itemCount - 1} more)` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 font-medium text-slate-100">
                          ₹{(Number(order.totalAmount) || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass}`}
                          >
                            {order.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-400">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Just now'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">
                      No order telemetry recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Platform Topology & Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Cluster Mesh Topology</h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Optimal
            </span>
          </div>

          <div className="space-y-2.5">
            {MICROSERVICES.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-2.5 text-xs transition hover:border-slate-700/80"
              >
                <div>
                  <div className="font-medium text-slate-200">{svc.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Port: {svc.port}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium text-emerald-400">
                    {svc.status}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {svc.latency}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Operations Actions */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quick Shortcuts
            </span>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/catalog"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                <Package className="h-3.5 w-3.5 text-indigo-400" />
                <span>Add Product</span>
              </Link>
              <Link
                to="/inventory"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span>Adjust Stock</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
