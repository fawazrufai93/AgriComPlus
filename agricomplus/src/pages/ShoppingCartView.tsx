import React from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { CartItemRow } from '../components/ui/CartItemRow';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export const ShoppingCartView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    clearCart,
    goToScreen,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToScreen({ type: 'home' })}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-base font-bold text-stone-900">
              Shopping Cart
            </h1>
            <p className="text-[11px] text-stone-500">
              {cart.length} unique produce {cart.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </header>

      <main className="px-4 pt-4 max-w-md mx-auto space-y-4">
        {cart.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/80 shadow-xs my-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#234D33] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-stone-900">
                Your cart is empty
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Add fresh produce directly from Kumasi local farmers to start your order.
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="md"
                onClick={() => goToScreen({ type: 'home' })}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Browse Fresh Produce
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="space-y-2.5">
              {cart.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </div>

            {/* Farm direct guarantee banner */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center gap-3 text-xs text-stone-700">
              <div className="w-8 h-8 rounded-xl bg-[#234D33] text-white flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#234D33]">
                  Direct Cold-Pack Delivery
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Packaged in biodegradable sacks with tamper QR authenticity seal.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
              <h3 className="font-heading text-sm font-bold text-stone-900">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span className="font-semibold text-stone-900">GH₵ {cartSubtotal}</span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Kumasi Metro Express Delivery</span>
                  <span className="font-semibold text-stone-900">GH₵ {deliveryFee}</span>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-sm font-bold text-stone-900">
                  <span>Total Amount</span>
                  <span className="font-heading text-base font-extrabold text-[#234D33]">
                    GH₵ {cartTotal}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Sticky Bottom Checkout Footer */}
      {cart.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 max-w-md mx-auto shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3 mb-2 text-xs">
            <span className="text-stone-500 font-medium">Total to Pay:</span>
            <span className="font-heading text-base font-extrabold text-[#234D33]">
              GH₵ {cartTotal}
            </span>
          </div>

          <Button
            size="md"
            onClick={() => goToScreen({ type: 'checkout' })}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Proceed to Checkout
          </Button>
        </footer>
      )}
    </div>
  );
};
