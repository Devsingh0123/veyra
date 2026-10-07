import React, { useState } from 'react';
import { useCreateProductMutation, useGetCategoriesQuery } from '../api/catalogApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Plus, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const GST_RATES = [5, 12, 18, 28];

export default function ProductModal({ open, onOpenChange }) {
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: catData } = useGetCategoriesQuery();

  // Categories list
  const categories = catData?.data || [
    { id: 'cat-audio', name: 'Audio & Acoustics', slug: 'audio' },
    { id: 'cat-periph', name: 'Computer Peripherals', slug: 'peripherals' },
    { id: 'cat-wearables', name: 'Smart Wearables', slug: 'wearables' },
  ];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [hsnCode, setHsnCode] = useState('85183000');
  const [gstRate, setGstRate] = useState(18);

  // Variant fields
  const [sku, setSku] = useState('');
  const [variantTitle, setVariantTitle] = useState('Standard Edition');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [initialStock, setInitialStock] = useState('50');
  const [weightGrams, setWeightGrams] = useState('250');

  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyPreset = () => {
    setName('Acoustic Studio Pro Headphone');
    setDescription('Flagship over-ear wireless audio with active noise cancellation.');
    setCategoryId(categories[0]?.id || 'cat-audio');
    setHsnCode('85183000');
    setGstRate(18);
    setSku(`VYR-PRO-${Math.floor(100 + Math.random() * 900)}`);
    setVariantTitle('Matte Obsidian');
    setMrp('7999');
    setSellingPrice('5499');
    setInitialStock('100');
    setWeightGrams('320');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !sku || !mrp || !sellingPrice) {
      setErrorMsg('Please complete all mandatory fields (Name, SKU, MRP, Selling Price).');
      return;
    }

    try {
      await createProduct({
        name,
        description,
        categoryId: categoryId || categories[0]?.id,
        hsnCode,
        gstRate: Number(gstRate),
        variants: [
          {
            sku,
            title: variantTitle || 'Default',
            mrp: parseFloat(mrp),
            sellingPrice: parseFloat(sellingPrice),
            initialStock: parseInt(initialStock, 10) || 0,
            weightGrams: parseInt(weightGrams, 10) || 100,
          },
        ],
      }).unwrap();

      onOpenChange(false);
      // Reset form
      setName('');
      setDescription('');
      setSku('');
      setMrp('');
      setSellingPrice('');
    } catch (err) {
      setErrorMsg(
        err?.data?.error || err?.data?.message || err?.message || 'Failed to create product'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Package className="h-4 w-4" />
              </div>
              <DialogTitle>Add New Catalog SKU</DialogTitle>
            </div>
            <button
              type="button"
              onClick={handleApplyPreset}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-indigo-300 hover:bg-slate-750 transition"
            >
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Auto-fill Demo
            </button>
          </div>
          <DialogDescription>
            Register product details, statutory HSN &amp; GST tax brackets, and initial stock balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Product Title *
              </label>
              <Input
                placeholder="e.g. Ergonomic Mech Keyboard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-slate-700 bg-slate-950/60 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-200 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              Description
            </label>
            <Input
              placeholder="Key specifications and product summary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-slate-700 bg-slate-950/60 text-white text-xs"
            />
          </div>

          {/* Tax & Statutory Codes */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              GST Section 46 Compliance
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">
                  HSN / SAC Code *
                </label>
                <Input
                  placeholder="85183000"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  required
                  className="border-slate-700 bg-slate-900 text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">
                  GST Rate (%)
                </label>
                <div className="flex gap-2">
                  {GST_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setGstRate(rate)}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium border transition ${
                        gstRate === rate
                          ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Default Variant Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Primary SKU Variant &amp; Stock
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">SKU Code *</label>
                <Input
                  placeholder="VYR-SKU-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                  className="border-slate-700 bg-slate-900 text-white text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Variant Name</label>
                <Input
                  placeholder="Midnight Black"
                  value={variantTitle}
                  onChange={(e) => setVariantTitle(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Initial Stock</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">MRP (₹) *</label>
                <Input
                  type="number"
                  placeholder="2999"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  required
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Selling Price (₹) *</label>
                <Input
                  type="number"
                  placeholder="1999"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  required
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Weight (grams)</label>
                <Input
                  type="number"
                  placeholder="250"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving SKU...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Create Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
