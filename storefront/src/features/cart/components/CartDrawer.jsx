import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { closeCart } from '../../../store/slices/cartSlice';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from '../api/cartApi';
import { toast } from 'sonner';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCartOpen } = useSelector((state) => state.cart);

  const { data: cartResponse, isLoading } = useGetCartQuery(undefined, {
    skip: !isCartOpen,
  });
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const cart = cartResponse?.data;
  const items = cart?.items || [];
  const totalAmount =
    cart?.totalAmount ??
    items.reduce(
      (sum, item) => sum + (item.price || item.unitPrice || 0) * (item.quantity || 1),
      0
    );

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);

  const handleUpdateQuantity = async (variantId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      handleRemoveItem(variantId);
      return;
    }
    try {
      await updateCartItem({ variantId, quantity: newQty }).unwrap();
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (variantId) => {
    try {
      await removeFromCart(variantId).unwrap();
      toast.success('Item removed from bag');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearCart().unwrap();
      toast.success('Shopping bag cleared');
    } catch {
      toast.error('Failed to clear bag');
    }
  };

  const handleProceedCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && dispatch(closeCart())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-slate-950 border-l border-slate-800 text-slate-100 p-0 flex flex-col justify-between"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <SheetTitle className="text-base font-bold text-white">
                Your Shopping Bag
              </SheetTitle>
              {itemCount > 0 && (
                <Badge variant="secondary" className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClearAll}
                disabled={isClearing}
                className="text-slate-400 hover:text-rose-400"
              >
                Clear
              </Button>
            )}
          </div>
          <SheetDescription className="text-xs text-slate-400">
            {remainingForFreeShipping === 0 ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium pt-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                You unlocked Complimentary Express Shipping!
              </span>
            ) : (
              <span className="pt-1 block">
                Add <strong className="text-indigo-300">₹{remainingForFreeShipping}</strong> more for Free Shipping
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        {/* Items List via ScrollArea */}
        <div className="flex-1 overflow-hidden">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-white">Your bag is empty</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
                Discover our curated collections and add your favourite pieces to your bag.
              </p>
              <Button
                size="sm"
                className="mt-5 gap-2"
                onClick={() => {
                  dispatch(closeCart());
                  navigate('/catalog');
                }}
              >
                <span>Browse Products</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full px-4 py-3">
              <div className="space-y-3">
                {items.map((item) => {
                  const unitPrice = item.price || item.unitPrice || 0;
                  const itemSubtotal = unitPrice * (item.quantity || 1);
                  const imageUrl =
                    item.image ||
                    item.variant?.product?.images?.[0] ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80';
                  const title = item.productName || item.variant?.product?.name || 'Curated Product';
                  const variantTitle = item.variantTitle || item.variant?.title;

                  return (
                    <div
                      key={item.variantId || item.id}
                      className="group flex gap-3 rounded-xl border border-slate-800/90 bg-slate-900/50 p-3 transition hover:border-slate-700 hover:bg-slate-900/80"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-lg bg-slate-950 border border-slate-800">
                        <img
                          src={imageUrl}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-white line-clamp-1">
                              {title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleRemoveItem(item.variantId)}
                              disabled={isRemoving}
                              className="text-slate-500 hover:text-rose-400 hover:bg-rose-950/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {variantTitle && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {variantTitle}
                            </span>
                          )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="mt-2 flex items-center justify-between">
                          {/* Stepper with shadcn Button */}
                          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateQuantity(item.variantId, item.quantity, -1)
                              }
                              className="h-6 w-6 text-slate-400 hover:text-white"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateQuantity(item.variantId, item.quantity, 1)
                              }
                              className="h-6 w-6 text-slate-400 hover:text-white"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-extrabold text-white">
                              ₹{Number(itemSubtotal).toLocaleString('en-IN')}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-[10px] text-slate-500">
                                ₹{Number(unitPrice).toLocaleString('en-IN')} each
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer Summary with shadcn Separator & Button */}
        {items.length > 0 && (
          <SheetFooter className="p-4 border-t border-slate-800 bg-slate-900/90 flex-col gap-3">
            <div className="space-y-1.5 text-xs w-full">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200 font-medium">
                  ₹{Number(totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated GST</span>
                <span className="text-slate-300">Included (Section 46)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Standard Delivery</span>
                <span className="text-emerald-400 font-semibold">
                  {remainingForFreeShipping === 0 ? 'FREE' : '₹99'}
                </span>
              </div>

              <Separator className="my-2 bg-slate-800" />

              <div className="flex justify-between text-sm font-bold text-white">
                <span>Estimated Total</span>
                <span className="text-base text-indigo-400 font-black">
                  ₹{Number(remainingForFreeShipping === 0 ? totalAmount : totalAmount + 99).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Button
              className="w-full gap-2 shadow-lg shadow-indigo-600/30"
              size="lg"
              onClick={handleProceedCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Razorpay 256-Bit Encrypted &amp; Section 46 GST Compliant</span>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
