import React from 'react';
import {
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Check,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const PRICE_BRACKETS = [
  { id: 'all', label: 'All Prices', min: 0, max: 20000 },
  { id: 'under-1500', label: 'Under ₹1,500', min: 0, max: 1500 },
  { id: '1500-3000', label: '₹1,500 to ₹3,000', min: 1500, max: 3000 },
  { id: '3000-5000', label: '₹3,000 to ₹5,000', min: 3000, max: 5000 },
  { id: 'above-5000', label: 'Above ₹5,000', min: 5000, max: 20000 },
];

export default function FilterSidebar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedPriceBracket,
  onSelectPriceBracket,
  inStockOnly,
  onToggleInStock,
  minRating,
  onToggleMinRating,
  onResetFilters,
  activeFiltersCount,
}) {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-[10px] font-bold">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onResetFilters}
            className="text-xs text-slate-400 hover:text-rose-400 gap-1 px-1.5"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      <Separator className="bg-slate-800" />

      {/* 1. Category Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Departments
          </Label>
          <span className="text-[10px] text-slate-500">
            {categories.length} Available
          </span>
        </div>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              selectedCategory === 'all' || !selectedCategory
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <span>All Collections</span>
            {(selectedCategory === 'all' || !selectedCategory) && (
              <Check className="h-3.5 w-3.5 text-indigo-400" />
            )}
          </button>

          {categories.map((cat) => {
            const isSelected =
              selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => onSelectCategory(cat.slug || cat.id)}
                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* 2. Price Range Slider via shadcn Slider */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Max Price
          </Label>
          <Badge variant="secondary" className="bg-slate-800 text-indigo-300 text-xs font-mono">
            ₹{Number(priceRange[0]).toLocaleString('en-IN')}
          </Badge>
        </div>

        <Slider
          value={priceRange}
          onValueChange={onPriceRangeChange}
          min={500}
          max={10000}
          step={250}
          className="py-1"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>₹500</span>
          <span>₹5,000</span>
          <span>₹10,000+</span>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* 3. Quick Price Brackets via shadcn RadioGroup */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Price Brackets
        </Label>
        <RadioGroup
          value={selectedPriceBracket}
          onValueChange={onSelectPriceBracket}
          className="space-y-2"
        >
          {PRICE_BRACKETS.map((bracket) => (
            <div
              key={bracket.id}
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => onSelectPriceBracket(bracket.id)}
            >
              <RadioGroupItem
                value={bracket.id}
                id={`bracket-${bracket.id}`}
                className="border-slate-700 text-indigo-500"
              />
              <label
                htmlFor={`bracket-${bracket.id}`}
                className="text-xs text-slate-300 cursor-pointer select-none flex-1 hover:text-white"
              >
                {bracket.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator className="bg-slate-800" />

      {/* 4. Availability & Rating Checkboxes via shadcn Checkbox */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Preferences
        </Label>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2.5 cursor-pointer">
            <Checkbox
              id="instock-filter"
              checked={inStockOnly}
              onCheckedChange={onToggleInStock}
              className="border-slate-700 data-checked:bg-indigo-600 data-checked:border-indigo-600"
            />
            <label
              htmlFor="instock-filter"
              className="text-xs text-slate-300 cursor-pointer select-none hover:text-white flex items-center gap-1.5"
            >
              <span>In-stock items only</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </label>
          </div>

          <div className="flex items-center space-x-2.5 cursor-pointer">
            <Checkbox
              id="rating-filter"
              checked={minRating}
              onCheckedChange={onToggleMinRating}
              className="border-slate-700 data-checked:bg-indigo-600 data-checked:border-indigo-600"
            />
            <label
              htmlFor="rating-filter"
              className="text-xs text-slate-300 cursor-pointer select-none hover:text-white flex items-center gap-1"
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>4.0★ &amp; Above Rating</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
