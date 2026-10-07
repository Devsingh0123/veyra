import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingBag, Star, Check, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import QuickViewDialog from './QuickViewDialog';
import { useAddToCartMutation } from '../../cart/api/cartApi';
import { openCart } from '../../../store/slices/cartSlice';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Extract primary variant data
  const variant = product?.variants?.[0] || {};
  const sellingPrice = variant.sellingPrice ?? product.sellingPrice ?? 1999;
  const mrp = variant.mrp ?? product.mrp ?? Math.round(sellingPrice * 1.35);
  const discountPercent =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const targetVariantId = variant.id || product.variantId || product.id;
    if (!targetVariantId) {
      return;
    }

    try {
      await addToCart({
        variantId: targetVariantId,
        quantity: 1,
      }).unwrap();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      toast.success(`Added "${product.name}" to your bag!`, {
        description: 'Orders above ₹999 qualify for complimentary express delivery.',
      });
      dispatch(openCart());
    } catch {
      toast.error('Failed to add product to bag. Please try again.');
    }
  };

  const productUrl = `/product/${product.slug || product.id}`;
  const categoryName = product.category?.name || product.category || 'Curated';
  const imageUrl =
    product.images?.[0] ||
    product.image ||
    `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80`;

  return (
    <>
      <Card className="group relative flex flex-col overflow-hidden rounded-2xl border-slate-800 bg-slate-900/60 p-3.5 transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10">
        <CardContent className="p-0 flex flex-1 flex-col justify-between">
          {/* Image container & Badges */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-950">
            <Link to={productUrl} className="block h-full w-full">
              <img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </Link>

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute left-2.5 top-2.5">
                <Badge variant="destructive" className="shadow-md">
                  {discountPercent}% OFF
                </Badge>
              </div>
            )}

            {/* Tax Note Badge */}
            <div className="absolute right-2.5 top-2.5">
              <Badge
                variant="secondary"
                className="backdrop-blur-md bg-slate-900/80 text-slate-300 border-slate-700"
              >
                GST {product.gstRate ?? 18}%
              </Badge>
            </div>

            {/* Quick View Floating Action with shadcn Tooltip */}
            <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuickViewOpen(true);
                      }}
                      className="h-8 w-8 rounded-full bg-slate-900/90 backdrop-blur-md hover:bg-indigo-600 hover:text-white shadow-lg text-slate-200"
                      aria-label="Quick preview"
                    />
                  }
                >
                  <Eye className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Quick View
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Details */}
          <div className="mt-3 flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium text-indigo-400">{categoryName}</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <span className="font-bold text-slate-300">4.8</span>
                </div>
              </div>

              <Link to={productUrl} className="mt-1 block">
                <h3 className="line-clamp-2 text-xs font-semibold text-white group-hover:text-indigo-300 transition leading-snug">
                  {product.name}
                </h3>
              </Link>
            </div>

            {/* Pricing & Add Action */}
            <div className="mt-3.5 border-t border-slate-800/80 pt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-extrabold text-white">
                  ₹{Number(sellingPrice).toLocaleString('en-IN')}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-xs text-slate-500 line-through">
                    ₹{Number(mrp).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Inclusive of all taxes</p>

              <div className="mt-2.5">
                <Button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={isAdding}
                  size="sm"
                  className={`w-full gap-1.5 transition-colors ${
                    justAdded ? 'bg-emerald-600 hover:bg-emerald-500' : ''
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Added to Bag</span>
                    </>
                  ) : isAdding ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Quick Add</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}
