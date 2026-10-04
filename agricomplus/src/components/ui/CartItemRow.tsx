import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateCartQuantity, removeFromCart, viewProductDetails } = useApp();
  const { product, quantity } = item;

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
      {/* Thumbnail */}
      <div
        onClick={() => viewProductDetails(product.id)}
        className="w-18 h-18 rounded-xl bg-stone-100 overflow-hidden shrink-0 cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4
          onClick={() => viewProductDetails(product.id)}
          className="font-heading text-xs sm:text-sm font-semibold text-stone-900 truncate cursor-pointer hover:text-[#234D33]"
        >
          {product.name}
        </h4>
        <p className="text-[11px] text-stone-500 truncate mt-0.5">
          {product.unit} • {product.weight}
        </p>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-heading text-sm font-bold text-[#234D33]">
            GH₵ {product.price}
          </span>
          <span className="text-[11px] text-stone-400 font-medium">
            Total: GH₵ {product.price * quantity}
          </span>
        </div>
      </div>

      {/* Quantity Stepper & Remove */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => removeFromCart(product.id)}
          aria-label={`Remove ${product.name}`}
          className="text-stone-400 hover:text-red-500 p-1 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="flex items-center bg-stone-100 rounded-full p-0.5 border border-stone-200">
          <button
            type="button"
            onClick={() => updateCartQuantity(product.id, quantity - 1)}
            aria-label="Decrease quantity"
            className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-stone-700 shadow-xs hover:bg-stone-50 active:scale-95 transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-7 text-center text-xs font-bold text-stone-800">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => updateCartQuantity(product.id, quantity + 1)}
            aria-label="Increase quantity"
            className="w-6 h-6 rounded-full bg-[#234D33] text-white flex items-center justify-center shadow-xs hover:bg-[#1b3d28] active:scale-95 transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
