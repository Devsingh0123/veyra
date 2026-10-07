import React, { useState } from 'react';
import { useGetInventoryMatrixQuery } from '../api/inventoryApi';
import StockAdjustModal from './StockAdjustModal';
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
  Layers,
  Search,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  Boxes,
} from 'lucide-react';

export default function InventoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: matrix = [], isLoading, isFetching, refetch } = useGetInventoryMatrixQuery();

  // Aggregate metrics
  const totalOnHand = matrix.reduce((acc, curr) => acc + (curr.totalStock || 0), 0);
  const totalReserved = matrix.reduce((acc, curr) => acc + (curr.reservedStock || 0), 0);
  const totalAvailable = matrix.reduce((acc, curr) => acc + (curr.availableStock || 0), 0);
  const lowStockCount = matrix.filter((item) =>
    ['LOW_STOCK', 'OUT_OF_STOCK'].includes(item.status)
  ).length;

  const filteredMatrix = matrix.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Inventory Concurrency Matrix
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time warehouse stock balance, 15-minute checkout reservation holds &amp; atomic locking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            title="Refresh Inventory"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-amber-400' : ''}`}
            />
            <span>Sync Matrix</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total On-Hand Stock</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {isLoading ? '...' : totalOnHand.toLocaleString()} units
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Physical warehouse stock count</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">15-Min Reservation Holds</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-300">
            {isLoading ? '...' : totalReserved.toLocaleString()} units
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Held by active checkout sessions</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Net Available to Sell</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-400">
            {isLoading ? '...' : totalAvailable.toLocaleString()} units
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Instant buyable balance</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Replenishment Alerts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-400">
            {isLoading ? '...' : lowStockCount} SKUs
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Below minimum buffer threshold</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by SKU identifier or product title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-slate-800 bg-slate-900/70 text-white text-xs placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="HEALTHY">Healthy (&gt;15 units)</option>
            <option value="LOW_STOCK">Low Stock (&le;15 units)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
          </select>
        </div>
      </div>

      {/* Inventory Matrix Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU &amp; Variant</TableHead>
              <TableHead>Product Title</TableHead>
              <TableHead>On-Hand</TableHead>
              <TableHead>15-Min Hold</TableHead>
              <TableHead>Net Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lock Version</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMatrix.length > 0 ? (
              filteredMatrix.map((item) => {
                const statusBadge =
                  item.status === 'HEALTHY'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : item.status === 'LOW_STOCK'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                return (
                  <TableRow key={item.sku}>
                    <TableCell>
                      <div className="font-mono text-xs font-semibold text-slate-100">
                        {item.sku}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.variantTitle || 'Standard'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-300 font-medium">
                        {item.productName}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-white">
                        {item.totalStock}
                      </span>
                    </TableCell>

                    <TableCell>
                      {item.reservedStock > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 text-[11px]">
                          <Lock className="h-3 w-3" />
                          {item.reservedStock}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">0</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-emerald-400 text-sm">
                        {item.availableStock}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadge}`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-[11px] text-slate-400">
                        v{item.version}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAdjust(item)}
                        className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-xs h-7 px-2.5"
                      >
                        <SlidersHorizontal className="mr-1.5 h-3 w-3 text-amber-400" />
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                  No inventory records matched your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        item={selectedItem}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
