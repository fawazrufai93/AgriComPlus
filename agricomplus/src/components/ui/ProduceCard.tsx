import React, { useState } from 'react';
import { Plus, Check, MapPin, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProduceCardProps {
  product: Product;
  onSelect?: () => void;
  hideFarmName?: boolean;
}

export const ProduceCard: React.FC<ProduceCardProps> = ({
  product,
  onSelect,
  hideFarmName = false,
}) => {
  const { addToCart, viewProductDetails, isSaved, toggleSaveItem, farms: FARMS } = useApp();
  const [justAdded, setJustAdded] = useState(false);

  const farm = FARMS[product.farmId];
  const saved = isSaved(product.id);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      viewProductDetails(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveItem(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-[1.25rem] border border-stone-200 hover:shadow-lg transition-shadow duration-200 flex flex-col overflow-hidden cursor-pointer active:scale-[0.985]"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-[var(--gold)] text-[#12201A] text-[11px] font-extrabold px-2 py-0.5 rounded-md">
            Save {product.discountPercent}%
          </div>
        )}

        {/* Heart Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleSave}
          aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name} to wishlist`}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-10 cursor-pointer shadow-xs ${
            saved
              ? 'bg-rose-50/95 text-rose-500 scale-105'
              : 'bg-black/35 hover:bg-black/55 text-white/90 backdrop-blur-xs'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              saved ? 'fill-rose-500 scale-110' : 'hover:scale-110'
            }`}
          />
        </button>

      </div>

      {/* Product Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Farm Kicker */}
          {!hideFarmName && farm && (
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium mb-1 truncate">
              <MapPin className="w-3 h-3 text-[#3A7D44] shrink-0" />
              <span className="truncate">{farm.cluster}</span>
            </div>
          )}

          {/* Product Title */}
          <h3 className="font-heading text-xs sm:text-sm font-semibold text-stone-900 leading-snug line-clamp-2 min-h-[2.4em]">
            {product.name}
          </h3>

          {product.localName && (
            <p className="text-[11px] text-stone-500 italic mt-0.5 truncate">
              {product.localName}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2.5 mt-1 border-t border-stone-100 flex items-center justify-between gap-1">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-heading text-base font-extrabold text-[#234D33]">
                GH₵ {product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] text-stone-400 line-through">
                  GH₵ {product.originalPrice}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-medium truncate">
              {product.weight}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer ${
              justAdded
                ? 'bg-[#3A7D44] text-white scale-110'
                : 'bg-[#234D33] text-white hover:bg-[#1b3d28] active:scale-95'
            }`}
          >
            {justAdded ? (
              <Check className="w-4 h-4 animate-scale-in" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
