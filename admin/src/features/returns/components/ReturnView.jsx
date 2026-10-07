import React, { useState } from 'react';
import { useGetReturnsQuery } from '../api/returnsApi';
import InspectModal from './InspectModal';
import CreditNoteModal from './CreditNoteModal';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RotateCcw,
  Search,
  RefreshCw,
  ShieldAlert,
  FileCheck2,
  Receipt,
  CheckCircle2,
  XCircle,
  Truck,
  Boxes,
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Returns' },
  { id: 'REQUESTED', label: 'Requested' },
  { id: 'RECEIVED_AT_WAREHOUSE', label: 'In Warehouse' },
  { id: 'INSPECTED_PASSED', label: 'QC Passed' },
  { id: 'INSPECTED_FAILED', label: 'QC Rejected' },
  { id: 'REFUNDED', label: 'Refunded' },
];

const STATUS_BADGES = {
  REQUESTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  APPROVED_FOR_PICKUP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  RECEIVED_AT_WAREHOUSE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  INSPECTED_PASSED: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  INSPECTED_FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  REFUNDED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const FALLBACK_RETURNS = [
  {
    id: 'RET-8812',
    orderId: 'ord-101',
    order: { orderNumber: 'VYR-2026-9041' },
    status: 'RECEIVED_AT_WAREHOUSE',
    reason: 'Defective Driver Coil',
    comments: 'Left earcup crackles at volume > 60%, verified across 2 laptops.',
    refundAmount: 4899,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    creditNote: null,
  },
  {
    id: 'RET-8811',
    orderId: 'ord-102',
    order: { orderNumber: 'VYR-2026-9040' },
    status: 'INSPECTED_PASSED',
    reason: 'Key Switch Chatter',
    comments: 'Spacebar double presses intermittently.',
    refundAmount: 12450,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    adminNote: 'Verified key bounce on switch #32. Approved for full replacement refund.',
    creditNote: {
      creditNoteNumber: 'CN/26-27/000012',
      originalInvoiceNo: 'INV/26-27/009040',
      totalRefundGst: 1899,
      totalRefundValue: 12450,
    },
  },
  {
    id: 'RET-8810',
    orderId: 'ord-103',
    order: { orderNumber: 'VYR-2026-9039' },
    status: 'REQUESTED',
    reason: 'Color Mismatch',
    comments: 'Ordered stealth slate but received carbon weave.',
    refundAmount: 2399,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    creditNote: null,
  },
];

export default function ReturnView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const [inspectTarget, setInspectTarget] = useState(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);

  const [creditNoteTarget, setCreditNoteTarget] = useState(null);
  const [isCreditNoteOpen, setIsCreditNoteOpen] = useState(false);

  const { data: apiData, isLoading, isFetching, refetch } = useGetReturnsQuery();

  const returns =
    apiData?.data && (Array.isArray(apiData.data) ? apiData.data : apiData.data.returns || [])
      ? Array.isArray(apiData.data)
        ? apiData.data
        : apiData.data.returns
      : FALLBACK_RETURNS;

  const returnList = returns.length > 0 ? returns : FALLBACK_RETURNS;

  // Aggregate stats
  const totalClaims = returnList.length;
  const inQC = returnList.filter((r) =>
    ['REQUESTED', 'RECEIVED_AT_WAREHOUSE'].includes(r.status)
  ).length;
  const passedQC = returnList.filter((r) =>
    ['INSPECTED_PASSED', 'REFUNDED'].includes(r.status)
  ).length;
  const totalReversed = returnList
    .filter((r) => ['INSPECTED_PASSED', 'REFUNDED'].includes(r.status))
    .reduce((acc, curr) => acc + (Number(curr.refundAmount) || 0), 0);

  const filteredReturns = returnList.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      activeTab === 'ALL' || r.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Returns &amp; Quality Check (QC)
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Reverse logistics inspection, hardware defect verification &amp; statutory Section 34 Credit Notes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            title="Refresh Returns"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-teal-400' : ''}`}
            />
            <span>Sync Claims</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Return Claims</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">{totalClaims} tickets</div>
          <p className="mt-1 text-[11px] text-slate-500">Filed within 7-day delivery window</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Awaiting Warehouse QC</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-300">{inQC} parcels</div>
          <p className="mt-1 text-[11px] text-slate-500">Pending engineer defect inspection</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">QC Approved Claims</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-teal-400">{passedQC} claims</div>
          <p className="mt-1 text-[11px] text-slate-500">Authorized for Credit Note refund</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Value Reversed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-400">
            ₹{totalReversed.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Statutory GST liability adjusted</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/80 pb-2.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
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
          placeholder="Search by Claim ID, Order Number or Reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 border-slate-800 bg-slate-900/70 text-white text-xs placeholder:text-slate-500"
        />
      </div>

      {/* Returns Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim ID &amp; Order</TableHead>
              <TableHead>Customer Reason</TableHead>
              <TableHead>Refund Value</TableHead>
              <TableHead>QC Status</TableHead>
              <TableHead>Credit Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((item) => {
                const status = item.status || 'REQUESTED';
                const badgeClass =
                  STATUS_BADGES[status] || 'bg-slate-800 text-slate-300 border-slate-700';

                const isCreditNoteAvailable =
                  status === 'INSPECTED_PASSED' || status === 'REFUNDED';

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-mono text-xs font-semibold text-white">
                        {item.id}
                      </div>
                      <div className="text-[11px] font-mono text-indigo-400">
                        {item.order?.orderNumber || `Order Ref`}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-slate-200">{item.reason}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {item.comments || 'No comments'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-white text-xs font-mono">
                        ₹{(Number(item.refundAmount || 0)).toLocaleString('en-IN')}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass}`}
                      >
                        {status.replace(/_/g, ' ')}
                      </span>
                    </TableCell>

                    <TableCell>
                      {isCreditNoteAvailable ? (
                        <span className="font-mono text-[11px] text-teal-400 font-semibold">
                          {item.creditNote?.creditNoteNumber || 'CN/26-27/000012'}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Pending QC</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setInspectTarget(item);
                            setIsInspectOpen(true);
                          }}
                          className="h-7 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white px-2.5"
                        >
                          <ShieldAlert className="mr-1 h-3 w-3 text-amber-400" />
                          Inspect QC
                        </Button>

                        {isCreditNoteAvailable && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setCreditNoteTarget(item);
                              setIsCreditNoteOpen(true);
                            }}
                            className="h-7 text-xs bg-teal-600 hover:bg-teal-500 text-white px-2.5 shadow-sm"
                          >
                            <Receipt className="mr-1 h-3 w-3" />
                            Credit Note
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                  No return tickets found matching the selected filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* QC Inspection Modal */}
      <InspectModal
        returnReq={inspectTarget}
        open={isInspectOpen}
        onOpenChange={setIsInspectOpen}
      />

      {/* Section 34 Credit Note Modal */}
      <CreditNoteModal
        returnReq={creditNoteTarget}
        open={isCreditNoteOpen}
        onOpenChange={setIsCreditNoteOpen}
      />
    </div>
  );
}
