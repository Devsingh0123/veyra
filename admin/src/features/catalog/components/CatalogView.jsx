import React, { useState } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../api/catalogApi';
import ProductModal from './ProductModal';
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
  Package,
  Plus,
  Search,
  Layers,
  Filter,
  RefreshCw,
  Tag,
  AlertCircle,
} from 'lucide-react';

const FALLBACK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Acoustic Studio Headphone ANC',
    slug: 'acoustic-studio-headphone-anc',
    hsnCode: '85183000',
    gstRate: 18,
    category: { name: 'Audio' },
    variants: [
      {
        sku: 'VYR-AU-001',
        title: 'Obsidian Black',
        mrp: 6999,
        sellingPrice: 4899,
        inventory: { stockQuantity: 84 },
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'Veyra Mechanical Keyboard RGB Pro',
    slug: 'veyra-mechanical-keyboard-rgb-pro',
    hsnCode: '84716060',
    gstRate: 18,
    category: { name: 'Peripherals' },
    variants: [
      {
        sku: 'VYR-KB-002',
        title: 'Gateron Brown',
        mrp: 14999,
        sellingPrice: 12450,
        inventory: { stockQuantity: 28 },
      },
    ],
  },
  {
    id: 'prod-3',
    name: 'Precision Ergonomic Gaming Desk Mat',
    slug: 'precision-ergonomic-desk-mat',
    hsnCode: '40169990',
    gstRate: 12,
    category: { name: 'Accessories' },
    variants: [
      {
        sku: 'VYR-DM-003',
        title: 'XL Stealth Slate',
        mrp: 2999,
        sellingPrice: 2399,
        inventory: { stockQuantity: 112 },
      },
    ],
  },
  {
    id: 'prod-4',
    name: 'MagSafe Wireless Charging Pad 15W',
    slug: 'magsafe-wireless-charging-pad',
    hsnCode: '85044090',
    gstRate: 18,
    category: { name: 'Power' },
    variants: [
      {
        sku: 'VYR-WC-004',
        title: 'Silver Anodized',
        mrp: 3499,
        sellingPrice: 2799,
        inventory: { stockQuantity: 14 },
      },
    ],
  },
];

export default function CatalogView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: apiData, isLoading, isFetching, refetch } = useGetProductsQuery({
    search: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
  });

  const { data: catData } = useGetCategoriesQuery();

  const products =
    apiData?.data?.products && apiData.data.products.length > 0
      ? apiData.data.products
      : FALLBACK_PRODUCTS;

  // Filter products by local search query if fallback is used
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variants?.some((v) => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Product Catalog &amp; SKUs
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Multi-variant SKU registry, HSN tax classifications &amp; statutory GST brackets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            title="Refresh Catalog"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-indigo-400' : ''}`}
            />
            <span>Refresh</span>
          </button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 shadow-md shadow-indigo-600/20"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add New SKU
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by title, variant or SKU code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-slate-800 bg-slate-900/70 text-white text-xs placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {catData?.data?.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product &amp; SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Statutory Tax (HSN / GST)</TableHead>
              <TableHead>Price &amp; MRP</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const primaryVariant = product.variants?.[0] || {};
                const stock = primaryVariant.inventory?.stockQuantity ?? 0;

                const stockBadge =
                  stock > 20
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : stock > 0
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                return (
                  <TableRow key={product.id}>
                    {/* Title and SKU */}
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            SKU: {primaryVariant.sku || 'N/A'}{' '}
                            {primaryVariant.title ? `• ${primaryVariant.title}` : ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300">
                        {product.category?.name || 'General'}
                      </span>
                    </TableCell>

                    {/* HSN & GST */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-300">
                          {product.hsnCode || '85183000'}
                        </span>
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                          {product.gstRate || 18}% GST
                        </span>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <div>
                        <span className="font-semibold text-white">
                          ₹{(Number(primaryVariant.sellingPrice) || 0).toLocaleString('en-IN')}
                        </span>
                        {primaryVariant.mrp && primaryVariant.mrp > primaryVariant.sellingPrice && (
                          <span className="ml-1.5 text-[11px] text-slate-500 line-through">
                            ₹{Number(primaryVariant.mrp).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Stock Balance */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${stockBadge}`}
                      >
                        {stock} units
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                  No products found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for adding product */}
      <ProductModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
