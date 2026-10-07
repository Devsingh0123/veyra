import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function VariantSelector({
  variants = [],
  selectedVariantIndex = 0,
  onSelectVariant,
}) {
  if (!variants || variants.length <= 1) {
    return null;
  }

  const selectedVariant = variants[selectedVariantIndex] || variants[0];
  const stockQty = selectedVariant?.inventory?.stockQuantity ?? 15;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Available Edition / Variant:
        </label>
        <span className="text-xs font-semibold text-indigo-400">
          {selectedVariant?.title || 'Selected'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((v, idx) => {
          const isSelected = selectedVariantIndex === idx;
          const isLowStock =
            v.inventory?.stockQuantity !== undefined && v.inventory.stockQuantity < 5;

          return (
            <button
              key={v.id || idx}
              type="button"
              onClick={() => onSelectVariant(idx)}
              className={`group relative flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{v.title || `Option ${idx + 1}`}</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
              {isLowStock && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {stockQty <= 5 && stockQty > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Hurry! Only {stockQty} units remaining in fulfillment warehouse.</span>
        </div>
      )}
    </div>
  );
}
