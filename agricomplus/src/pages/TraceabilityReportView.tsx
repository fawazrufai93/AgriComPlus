import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Share2,
  Calendar,
  Truck,
  Sprout,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { TraceStepItem } from '../components/ui/TraceStepItem';
import { CredentialBadge } from '../components/ui/CredentialBadge';
import { QRCodeDisplayModal } from '../components/common/QRCodeDisplayModal';
import { FARMS as BUNDLED_FARMS } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { TraceEvent, Farm, Order } from '../types';
import { useApp } from '../context/AppContext';

export const TraceabilityReportView: React.FC = () => {
  const {
    activeTraceCode,
    activeOrder,
    orders,
    goToScreen,
    viewFarmerProfile,
    openQRScanner,
    farms,
  } = useApp();
  const FARMS = { ...BUNDLED_FARMS, ...farms };

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 1) the signed-in user's own order, 2) otherwise a public lookup by trace code
  const ownOrder: Order | null =
    activeOrder || orders.find((o) => o.traceCode === activeTraceCode) || null;
  const [publicOrder, setPublicOrder] = useState<Order | null>(null);
  const [lookupState, setLookupState] = useState<'loading' | 'found' | 'missing'>(
    ownOrder ? 'found' : 'loading'
  );

  useEffect(() => {
    if (ownOrder || !activeTraceCode) return;
    let cancelled = false;
    setLookupState('loading');
    supabase.rpc('get_order_trace', { p_trace_code: activeTraceCode }).then(({ data, error }) => {
      if (cancelled) return;
      const row = Array.isArray(data) ? data[0] : null;
      if (error || !row) {
        setPublicOrder(null);
        setLookupState('missing');
        return;
      }
      setPublicOrder({
        id: row.id,
        traceCode: row.trace_code,
        placedAt: row.placed_at,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        deliveryAddress: { id: '', title: '', area: 'Kumasi Metro', landmark: '', city: 'Kumasi', recipientPhone: '', isDefault: false },
        paymentMethod: { type: 'cod', details: '' },
        status: row.status,
        estimatedDelivery: row.estimated_delivery,
        farmIds: row.farm_ids || [],
        traceEvents: row.trace_events || [],
      } as Order);
      setLookupState('found');
    });
    return () => {
      cancelled = true;
    };
  }, [activeTraceCode, ownOrder?.id]);

  const order = ownOrder || publicOrder;

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] flex flex-col items-center justify-center px-8 text-center gap-4">
        <QrCode className="w-12 h-12 text-stone-300" />
        <h1 className="font-heading text-lg font-bold text-stone-900">
          {lookupState === 'loading' ? 'Checking this package…' : 'We could not verify this code'}
        </h1>
        {lookupState === 'missing' && (
          <p className="text-sm text-stone-500 max-w-xs">
            No AgriCom+ package matches {activeTraceCode}. Check the code on the seal, or scan again.
          </p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={openQRScanner} className="px-5 py-2.5 rounded-full bg-[#234D33] text-white text-sm font-bold">
            Scan again
          </button>
          <button type="button" onClick={() => goToScreen({ type: 'home' })} className="px-5 py-2.5 rounded-full bg-white border border-stone-200 text-sm font-bold text-stone-700">
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  const traceCode = activeTraceCode || order.traceCode;

  // Farm information
  const primaryFarmId = order.farmIds?.[0] || 'farm-offinso';
  const farm: Farm = FARMS[primaryFarmId] || FARMS['farm-offinso'];

  const events: TraceEvent[] = order.traceEvents || [];

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      {/* 1. TOP HEADER WITH AUDIT BADGE */}
      <header className="sticky top-0 z-30 bg-[#234D33] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToScreen({ type: 'account' })}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-sm font-bold text-white">
              Farm-to-Door Trace Report
            </h1>
            <p className="text-[11px] text-emerald-200/90 font-mono truncate max-w-[200px]">
              {traceCode}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsQRModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
        >
          <QrCode className="w-3.5 h-3.5 text-amber-300" />
          <span>Show QR</span>
        </button>
      </header>

      <main className="px-4 pt-4 max-w-md mx-auto space-y-4">
        {/* 2. AUTHENTICITY SEAL CARD */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 opacity-70" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-[#234D33] text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-[#234D33]" />
                <span>Verified Agricultural Origin</span>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                MoFA-GH-AUDIT
              </span>
            </div>

            <div>
              <h2 className="font-heading text-base font-extrabold text-stone-900 leading-tight">
                Authentic Kumasi Farm Harvest
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                This produce batch was harvested under standard organic protocols, checked by accredited inspectors, and dispatched within 6 hours.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 flex-wrap gap-2">
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-bold">
                  Order ID
                </span>
                <span className="font-mono font-semibold text-stone-900">
                  {order.id}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-bold">
                  Destination
                </span>
                <span className="font-semibold text-stone-900">
                  {order.deliveryAddress?.area || 'Kumasi Metro'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-bold">
                  Current Status
                </span>
                <span className="text-[#3A7D44] font-bold">
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SOURCE FARM PROFILE PREVIEW */}
        <section className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-stone-900">
              Source Farm & Farmer
            </h3>
            <button
              type="button"
              onClick={() => viewFarmerProfile(farm.id)}
              className="text-xs font-bold text-[#234D33] hover:underline flex items-center gap-0.5"
            >
              <span>View Full Farm</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div
            onClick={() => viewFarmerProfile(farm.id)}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 cursor-pointer hover:bg-stone-100/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0">
              <img
                src={farm.photo}
                alt={farm.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading text-xs sm:text-sm font-bold text-stone-900 truncate">
                {farm.name}
              </h4>
              <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#3A7D44]" />
                <span>{farm.location}</span>
              </p>
              <p className="text-[10px] text-[#3A7D44] font-semibold mt-0.5">
                Farmer: {farm.farmerName}
              </p>
            </div>
          </div>

          {/* Farm Certifications */}
          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
            {farm.certifications.slice(0, 2).map((cert) => (
              <CredentialBadge key={cert.id} credential={cert} />
            ))}
          </div>
        </section>

        {/* 4. TRACESTEP TIMELINE: FARM -> HARVEST -> PACK -> DELIVERY */}
        <section className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <div>
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-stone-900">
                Audit Timeline Journey
              </h3>
              <p className="text-[11px] text-stone-500">
                Farm → Harvest → Pack → Delivery
              </p>
            </div>
            <button
              type="button"
              onClick={openQRScanner}
              className="text-xs font-semibold text-[#234D33] hover:underline"
            >
              Scan Another
            </button>
          </div>

          <div className="pt-2">
            {events.map((event, idx) => (
              <TraceStepItem
                key={event.id}
                event={event}
                isFirst={idx === 0}
                isLast={idx === events.length - 1}
              />
            ))}
          </div>
        </section>

        {/* 5. PRODUCE IN THIS BATCH */}
        {order.items && order.items.length > 0 && (
          <section className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2.5">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-stone-900">
              Produce Included In This Batch
            </h3>

            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div
                  key={item.product.id}
                  className="py-2 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-stone-900">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {item.quantity}× {item.product.unit} ({item.product.weight})
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#234D33]">
                    GH₵ {item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => setIsQRModalOpen(true)}
            className="w-full py-3 px-4 rounded-full bg-[#234D33] text-white text-xs font-bold shadow-md hover:bg-[#1b3d28] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-300" />
            <span>View Encrypted Package QR Seal</span>
          </button>

          <button
            type="button"
            onClick={() => goToScreen({ type: 'home' })}
            className="w-full py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 text-center"
          >
            Return to Marketplace
          </button>
        </div>
      </main>

      {/* Scannable QR modal */}
      <QRCodeDisplayModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        traceCode={traceCode}
        orderId={order.id}
        title="Batch Cryptographic QR Tag"
      />
    </div>
  );
};
