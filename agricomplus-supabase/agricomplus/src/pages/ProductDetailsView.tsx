import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Clock,
  ShieldCheck,
  Minus,
  Plus,
  ChevronRight,
  Sparkles,
  Check,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { HealthTag } from '../components/ui/HealthTag';
import { Button } from '../components/ui/Button';
import { FARMS, PRODUCTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export const ProductDetailsView: React.FC = () => {
  const {
    activeProduct,
    goToScreen,
    viewFarmerProfile,
    addToCart,
    openQRScanner,
    isSaved,
    toggleSaveItem,
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddedBanner, setShowAddedBanner] = useState(false);

  const product = activeProduct || PRODUCTS[0];
  const farm = FARMS[product.farmId] || FARMS['farm-offinso'];
  const saved = isSaved(product.id);

  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setShowAddedBanner(true);
    setTimeout(() => setShowAddedBanner(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28 relative">
      {/* 1. HERO IMAGE WITH FLOATING TOP ACTIONS */}
      <div className="relative w-full aspect-[4/3] max-h-[380px] bg-stone-200">
        <img
          src={product.images[selectedImageIndex] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {/* Floating Header Icons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={() => goToScreen({ type: 'home' })}
            aria-label="Back to home"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-stone-800 flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSaveItem(product.id)}
              aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name} to wishlist`}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer ${
                saved
                  ? 'bg-rose-50 text-rose-500 scale-105'
                  : 'bg-white/90 text-stone-800 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 transition-transform ${saved ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
            </button>
          </div>
        </div>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute bottom-4 left-4 bg-[#E8622C] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Save {product.discountPercent}% Off Farm-Gate
          </div>
        )}

        {/* Thumbnail Selector if multiple images */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs p-1 rounded-full">
            {product.images.map((img, idx) => (
              <button
                key={img}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  selectedImageIndex === idx
                    ? 'bg-white scale-125'
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. BODY CONTENT */}
      <main className="px-4 pt-4 space-y-4 max-w-md mx-auto">
        {/* Added Notification Toast */}
        {showAddedBanner && (
          <div className="p-3 rounded-2xl bg-[#234D33] text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Added {quantity} × {product.name} to cart!</span>
            </div>
            <button
              type="button"
              onClick={() => goToScreen({ type: 'cart' })}
              className="text-emerald-200 underline font-bold"
            >
              View Cart
            </button>
          </div>
        )}

        {/* Farm / Category Meta Line */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span className="uppercase tracking-wider font-semibold text-[#3A7D44]">
            {product.category.toUpperCase()}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-stone-600 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#3A7D44] shrink-0" />
            {farm.cluster}
          </span>
        </div>

        {/* Title & Price */}
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-stone-900 leading-snug">
            {product.name}
          </h1>

          {product.localName && (
            <p className="text-xs sm:text-sm text-stone-500 italic mt-0.5">
              Local Name: {product.localName}
            </p>
          )}

          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="font-heading text-2xl font-black text-[#234D33]">
              GH₵ {product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-stone-400 line-through">
                GH₵ {product.originalPrice}
              </span>
            )}
            <span className="text-xs text-stone-500 font-medium ml-1">
              per {product.unit} ({product.weight})
            </span>
          </div>
        </div>

        {/* Health Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-[#234D33] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Farm Direct</span>
          </div>
          {product.healthTags.map((tag) => (
            <HealthTag key={tag} label={tag} />
          ))}
        </div>

        {/* 3. FARM SOURCE CARD LINK */}
        <div
          onClick={() => viewFarmerProfile(farm.id)}
          className="p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
              <img
                src={farm.photo}
                alt={farm.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                Sourced Directly From
              </p>
              <h4 className="font-heading text-sm font-bold text-stone-900 truncate group-hover:text-[#234D33]">
                {farm.name}
              </h4>
              <p className="text-xs text-[#3A7D44] font-medium flex items-center gap-1 truncate mt-0.5">
                <span>By {farm.farmerName}</span>
                <span>•</span>
                <span>{farm.location.split(',')[0]}</span>
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-stone-50 group-hover:bg-[#234D33] group-hover:text-white text-stone-400 flex items-center justify-center transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4. PRODUCT DETAILS & DESCRIPTION */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="font-heading text-sm font-bold text-stone-900">
            Product Details
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {product.description}
          </p>

          <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#3A7D44] shrink-0 mt-0.5" />
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                  Harvest Timestamp
                </span>
                <span className="font-medium text-stone-800">
                  {product.harvestDate}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#3A7D44] shrink-0 mt-0.5" />
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                  Freshness Guarantee
                </span>
                <span className="font-medium text-stone-800">
                  {product.shelfLife}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. NUTRITION & COOKING HIGHLIGHTS */}
        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-2">
          <h4 className="font-heading text-xs font-bold text-[#234D33] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nutritional & Culinary Value</span>
          </h4>
          <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside">
            {product.nutritionHighlights.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      </main>

      {/* 6. STICKY FOOTER: QUANTITY STEPPER + ADD TO CART */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 max-w-md mx-auto shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-700 shadow-xs hover:bg-stone-50 active:scale-95 disabled:opacity-40 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-stone-800">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded-full bg-[#234D33] text-white flex items-center justify-center shadow-xs hover:bg-[#1b3d28] active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <div className="flex-1">
            <Button
              size="md"
              onClick={handleAddToCart}
              className="w-full"
            >
              Add to Cart • GH₵ {totalPrice}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
