import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  QrCode,
  MapPin,
  ChevronRight,
  Star,
  Users,
  Heart,
} from 'lucide-react';
import { TopLocationBar } from '../components/common/TopLocationBar';
import { CategoryChip } from '../components/ui/CategoryChip';
import { ProduceCard } from '../components/ui/ProduceCard';
import { Button } from '../components/ui/Button';
import { CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { CategoryId } from '../types';

export const MarketplaceHomeView: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    savedItemIds,
    goToScreen,
    viewFarmerProfile,
    openQRScanner,
    viewProductDetails,
    products: PRODUCTS,
    farms: FARMS,
  } = useApp();

  const [isSeeAllCategoriesOpen, setIsSeeAllCategoriesOpen] = useState(false);

  // Filter products by selected category and search query
  const filteredProducts = PRODUCTS.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.localName && prod.localName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      {/* 1. TOP LOCATION BAR & SEARCH */}
      <TopLocationBar onOpenFilter={() => setIsSeeAllCategoriesOpen(true)} />

      <main className="px-4 pt-3.5 space-y-5 max-w-md mx-auto">
        {/* 2. HERO: today's farm-gate price board */}
        <section
          aria-label="Today's farm prices"
          className="overflow-hidden rounded-[1.75rem] bg-[var(--green)] text-white shadow-lg"
        >
          <div className="kente" />
          <div className="p-5">
            <p className="text-[13px] font-medium text-emerald-200">Farm to your door in Kumasi</p>
            <h2 className="font-heading text-[1.7rem] leading-[1.08] font-extrabold mt-1.5">
              Fresh from the farm, at farm-gate prices.
            </h2>

            <div className="mt-4 rounded-2xl bg-black/25 border border-white/10">
              <p className="px-3.5 pt-3 pb-1 text-xs font-bold text-[var(--gold)]">Today&apos;s prices</p>
              <div className="divide-y divide-white/10">
                {PRODUCTS.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => viewProductDetails(p.id)}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer active:bg-white/5"
                  >
                    <span className="text-[13px] truncate">{p.name}</span>
                    <span className="font-heading font-bold text-[15px] whitespace-nowrap">GH₵ {p.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('featured-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--gold)] text-[#12201A] text-sm font-extrabold active:scale-[0.98] transition-transform cursor-pointer"
              >
                <span>Shop fresh produce</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={openQRScanner}
                aria-label="Scan package QR code"
                className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/15 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[var(--gold)]" />
                <span>Scan</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. CATEGORIES ROW */}
        <section aria-label="Produce Categories">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-heading text-sm font-bold text-stone-900 tracking-tight">
              Categories
            </h3>
            <button
              type="button"
              onClick={() => setIsSeeAllCategoriesOpen(true)}
              className="text-xs font-semibold text-[#234D33] hover:text-[#3A7D44] flex items-center gap-0.5 cursor-pointer"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Scrollable Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                id={cat.id}
                name={cat.name}
                count={cat.count}
                isActive={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>
        </section>

        {/* 4. FEATURED PRODUCE GRID */}
        <section id="featured-grid" aria-label="Featured Produce">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-stone-900 tracking-tight">
                {selectedCategory === 'all'
                  ? 'Fresh From Kumasi Farms'
                  : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Produce'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {filteredProducts.length} items verified farm-direct today
              </p>
            </div>

            <div className="flex items-center gap-2">
              {savedItemIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => goToScreen({ type: 'account' })}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  title="View Saved Favorites in Account tab"
                >
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>{savedItemIds.length} Saved</span>
                </button>
              )}

              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs font-semibold text-[#234D33] underline cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* 2-Column ProduceCard Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProduceCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80">
              <p className="text-sm font-semibold text-stone-700">
                No produce found matching your search.
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Try searching for "yams", "tomatoes", or clear your filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 rounded-full bg-[#234D33] text-white text-xs font-semibold"
              >
                View All Items
              </button>
            </div>
          )}
        </section>

        {/* 5. MEET YOUR LOCAL FARMERS SECTION */}
        <section aria-label="Local Farmer Clusters" className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-stone-900 tracking-tight">
                Meet Your Kumasi Farmers
              </h3>
              <p className="text-[11px] text-stone-500">
                Verified cooperatives and sustainable growers
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {Object.values(FARMS).slice(0, 3).map((farm) => (
              <div
                key={farm.id}
                onClick={() => viewFarmerProfile(farm.id)}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={farm.photo}
                    alt={farm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading text-xs sm:text-sm font-bold text-stone-900 truncate group-hover:text-[#234D33]">
                      {farm.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#3A7D44]" />
                    <span>{farm.cluster}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                    <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {farm.rating} ({farm.reviewsCount})
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded">
                      {farm.certifications[0]?.label || 'Verified'}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-stone-50 group-hover:bg-[#234D33] group-hover:text-white text-stone-400 flex items-center justify-center transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. TRANSPARENCY & QR TRACE BANNER */}
        <section className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-100/90 text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#234D33] text-white flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#234D33]">
                Full Farm-to-Door Traceability
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Every box delivered in Kumasi includes an encrypted QR label with harvest hour, moisture test, and MoFA inspector verification.
              </p>
              <button
                type="button"
                onClick={openQRScanner}
                className="mt-2 text-xs font-bold text-[#234D33] hover:underline inline-flex items-center gap-1"
              >
                <span>Try Scanning a Package Code</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* SEE ALL CATEGORIES MODAL */}
      {isSeeAllCategoriesOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white text-stone-900 w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading text-base font-bold text-stone-900">
                  All Produce Categories
                </h3>
                <p className="text-xs text-stone-500">
                  Browse by agricultural category
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSeeAllCategoriesOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setIsSeeAllCategoriesOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    selectedCategory === cat.id
                      ? 'border-[#234D33] bg-emerald-50 text-[#234D33] font-bold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <span className="text-xs font-semibold">{cat.name}</span>
                  <span className="text-[11px] text-stone-500 mt-1">
                    {cat.count} items
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
