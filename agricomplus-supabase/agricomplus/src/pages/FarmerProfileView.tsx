import React from 'react';
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Phone,
  Sprout,
  CheckCircle2,
} from 'lucide-react';
import { CredentialBadge } from '../components/ui/CredentialBadge';
import { ProduceCard } from '../components/ui/ProduceCard';
import { FARMS, PRODUCTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export const FarmerProfileView: React.FC = () => {
  const { activeFarmId, goToScreen } = useApp();

  const farm = (activeFarmId && FARMS[activeFarmId]) || FARMS['farm-offinso'];

  // All products produced by this specific farm
  const farmProducts = PRODUCTS.filter((p) => p.farmId === farm.id);

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      {/* 1. HERO FARM COVER & BACK BUTTON */}
      <div className="relative h-56 bg-stone-300">
        <img
          src={farm.photo}
          alt={farm.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

        <div className="absolute top-4 left-4 z-10">
          <button
            type="button"
            onClick={() => goToScreen({ type: 'home' })}
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-stone-800 flex items-center justify-center shadow-md active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Established Kicker */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
          Est. {farm.establishedYear}
        </div>

        {/* Farm Name Banner overlay */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <Sprout className="w-3.5 h-3.5" />
            <span>{farm.cluster}</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold leading-tight">
            {farm.name}
          </h1>
          <p className="text-xs text-stone-200 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{farm.location}</span>
          </p>
        </div>
      </div>

      <main className="px-4 -mt-4 relative z-20 space-y-4 max-w-md mx-auto">
        {/* 2. FARMER IDENTITY CARD */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#234D33] shrink-0 shadow-sm">
            <img
              src={farm.farmerPhoto}
              alt={farm.farmerName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-bold text-stone-900 truncate">
                {farm.farmerName}
              </h2>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {farm.rating}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Lead Farmer & Cluster Steward
            </p>
            <p className="text-[11px] text-[#3A7D44] font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3A7D44]" />
              <span>Registered Kumasi Agro Collective</span>
            </p>
          </div>
        </div>

        {/* 3. CREDENTIAL BADGE ROW */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2.5">
          <h3 className="font-heading text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#234D33]" />
            <span>Farm Certifications & Standards</span>
          </h3>

          <div className="space-y-2">
            {farm.certifications.map((cert) => (
              <CredentialBadge key={cert.id} credential={cert} variant="detailed" />
            ))}
          </div>
        </div>

        {/* 4. FARM BIO & SUSTAINABLE PRACTICES */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="font-heading text-sm font-bold text-stone-900">
            About the Farm & Growing Philosophy
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {farm.bio}
          </p>

          <div className="pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-800 mb-2">
              Verified Farming Practices:
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600">
              {farm.practices.map((practice, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3A7D44] mt-1.5 shrink-0" />
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. PRODUCE CURRENTLY HARVESTED FROM THIS FARM */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-stone-900">
              Harvested at {farm.name}
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              {farmProducts.length} items available
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {farmProducts.map((product) => (
              <ProduceCard
                key={product.id}
                product={product}
                hideFarmName={true}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
