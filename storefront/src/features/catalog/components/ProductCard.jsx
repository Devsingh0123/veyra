import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAddToCartMutation } from '../../cart/api/cartApi';
import { openCart } from '../../../store/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [justAdded, setJustAdded] = useState(false);

  // Extract primary variant data
  const variant = product?.variants?.[0] || {};
  const sellingPrice = variant.sellingPrice ?? product.sellingPrice ?? 1999;
  const mrp = variant.mrp ?? product.mrp ?? Math.round(sellingPrice * 1.35);
  const discountPercent =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variant.id && !product.variantId) {
      return;
    }

    try {
      await addToCart({
        variantId: variant.id || product.variantId,
        quantity: 1,
      }).unwrap();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      dispatch(openCart());
    } catch {
      // Fallback
    }
  };

  const productUrl = `/product/${product.slug || product.id}`;
  const categoryName = product.category?.name || product.category || 'Curated';
  const imageUrl =
    product.images?.[0] ||
    product.image ||
    `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10">
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

        {/* Shadcn Badge for Discount */}
        {discountPercent > 0 && (
          <div className="absolute left-2.5 top-2.5">
            <Badge variant="destructive" className="shadow-md">
              {discountPercent}% OFF
            </Badge>
          </div>
        )}

        {/* Shadcn Badge for Tax Note */}
        <div className="absolute right-2.5 top-2.5">
          <Badge variant="secondary" className="backdrop-blur-md bg-slate-900/80 text-slate-300 border-slate-750">
            GST {product.gstRate ?? 18}%
          </Badge>
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
            {/* Shadcn Button for Add to Bag */}
            <Button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdding}
              variant={justAdded ? 'default' : 'default'}
              size="sm"
              className={`w-full gap-1.5 ${
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
    </div>
  );
}
