import React, { useState } from 'react';
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  QrCode,
  MapPin,
  Check,
  X,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const KUMASI_AREAS = [
  { id: 'ahodwo', name: 'Ahodwo Residential', eta: '35–45 mins' },
  { id: 'adum', name: 'Adum CBD & Commercial', eta: '25–40 mins' },
  { id: 'knust', name: 'KNUST Campus & Ayeduase', eta: '40–55 mins' },
  { id: 'nhyiaeso', name: 'Nhyiaeso Residential', eta: '30–45 mins' },
  { id: 'bantama', name: 'Bantama & Komfo Anokye', eta: '35–50 mins' },
  { id: 'asokwa', name: 'Asokwa & Baba Yara Corridor', eta: '30–45 mins' },
  { id: 'ejisu-hub', name: 'Ejisu Road Agro Corridor', eta: '45–60 mins' },
];

export const TopLocationBar: React.FC<{ onOpenFilter?: () => void }> = ({ onOpenFilter }) => {
  const {
    deliveryArea,
    setDeliveryArea,
    searchQuery,
    setSearchQuery,
    openQRScanner,
    goToScreen,
    isAuthenticated,
    currentUser,
  } = useApp();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 bg-[#234D33] text-white px-4 pt-3 pb-3.5 shadow-md">
      {/* Location Row & QR Scanner Button */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-1.5 text-left group cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] uppercase tracking-wider text-emerald-200/90 font-semibold">
                Delivering to
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-300 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <p className="text-xs font-bold text-white truncate max-w-[200px]">
              {deliveryArea}, Kumasi ▾
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => goToScreen({ type: 'auth', initialMode: 'login' })}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#E8622C] hover:bg-[#d05322] text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goToScreen({ type: 'account' })}
              className="w-7 h-7 rounded-full overflow-hidden border border-emerald-300 shadow-xs cursor-pointer flex items-center justify-center bg-emerald-800"
              title="View Profile"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-bold text-emerald-100">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </span>
              )}
            </button>
          )}

          {/* Quick QR Package Scanner button */}
          <button
            type="button"
            onClick={openQRScanner}
            title="Scan package QR trace code"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-full text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer border border-white/20"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Trace QR</span>
          </button>
        </div>
      </div>

      {/* Search Bar + Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fresh yams, tomatoes, palm oil..."
            className="w-full bg-white text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm font-medium rounded-full pl-9.5 pr-8 py-2.5 outline-none shadow-inner border border-transparent focus:border-emerald-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (onOpenFilter) {
              onOpenFilter();
            } else {
              goToScreen({ type: 'categories' });
            }
          }}
          aria-label="Filter produce categories"
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white flex items-center justify-center shrink-0 transition-colors border border-white/20 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white text-stone-900 w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading text-base font-bold text-stone-900">
                  Select Delivery Location
                </h3>
                <p className="text-xs text-stone-500">
                  Kumasi Metro & Peri-Urban Coverage
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {KUMASI_AREAS.map((loc) => {
                const isSelected = deliveryArea.toLowerCase().includes(loc.name.split(' ')[0].toLowerCase());
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setDeliveryArea(loc.name);
                      setIsLocationModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#234D33] bg-emerald-50/60 font-semibold'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin
                        className={`w-4 h-4 ${
                          isSelected ? 'text-[#234D33]' : 'text-stone-400'
                        }`}
                      />
                      <div>
                        <p className="text-xs font-semibold text-stone-900">
                          {loc.name}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Estimated ETA: {loc.eta}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#234D33] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#234D33] text-white text-xs font-semibold"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
