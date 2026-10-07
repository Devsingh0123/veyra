import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ShoppingBag,
  Star,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { openCart } from '../../../store/slices/cartSlice';
import { useAddToCartMutation } from '../../cart/api/cartApi';
import { toast } from 'sonner';

export default function QuickViewDialog({ product, open, onOpenChange }) {
  const dispatch = useDispatch();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  if (!product) return null;

  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const currentVariant = variants[selectedVariantIndex] || {};

  const sellingPrice =
    currentVariant.sellingPrice ?? product.sellingPrice ?? 1999;
  const mrp =
    currentVariant.mrp ?? product.mrp ?? Math.round(sellingPrice * 1.35);
  const discountPercent =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const imageUrl =
    product.images?.[0] ||
    product.image ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const categoryName = product.category?.name || product.category || 'Curated';

  const handleAddToCart = async () => {
    const variantId = currentVariant.id || product.variantId || product.id;
    try {
      await addToCart({ variantId, quantity: 1 }).unwrap();
      toast.success(`Added "${product.name}" to your bag!`, {
        description: 'Complimentary shipping applied on orders above ₹999.',
      });
      onOpenChange(false);
      dispatch(openCart());
    } catch {
      toast.error('Failed to add item to bag. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Side */}
          <div className="relative aspect-square md:aspect-auto w-full bg-slate-900 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3 shadow-md">
                {discountPercent}% OFF
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-300 border-slate-700"
            >
              GST {product.gstRate ?? 18}%
            </Badge>
          </div>

          {/* Details & Action Side */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <DialogHeader className="p-0 text-left">
                <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-1">
                  <span>{categoryName}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span className="font-bold text-slate-300 text-xs">4.9 / 5.0</span>
                  </div>
                </div>
                <DialogTitle className="text-lg font-bold text-white leading-snug">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-2 line-clamp-3">
                  {product.description ||
                    'Premium grade quality with certified statutory tax compliance, direct manufacturer warranty, and pan-India express fulfillment.'}
                </DialogDescription>
              </DialogHeader>

              {/* Price section */}
              <div className="mt-4 flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-white">
                  ₹{Number(sellingPrice).toLocaleString('en-IN')}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    ₹{Number(mrp).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[11px] font-medium text-emerald-400 ml-auto">
                  In Stock &amp; Ready to Ship
                </span>
              </div>

              {/* Variants Selector if multiple variants */}
              {variants.length > 1 && (
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Select Option:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, idx) => (
                      <Button
                        key={v.id || idx}
                        variant={selectedVariantIndex === idx ? 'default' : 'outline'}
                        size="xs"
                        onClick={() => setSelectedVariantIndex(idx)}
                        className="text-xs"
                      >
                        {v.title || `Variant ${idx + 1}`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4 bg-slate-800" />

              {/* Highlights */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Section 46 Tax Invoice with HSN: {product.hsnCode || '85183000'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Free Express delivery across 28,000+ PIN codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Razorpay 256-Bit SSL Instant Verification</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1 gap-2 shadow-lg shadow-indigo-600/25"
                size="default"
                disabled={isAdding}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
