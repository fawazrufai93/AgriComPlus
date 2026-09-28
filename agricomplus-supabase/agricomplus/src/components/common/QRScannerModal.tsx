import React, { useState } from 'react';
import { X, QrCode, Camera, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QRScannerModal: React.FC = () => {
  const { isQRScannerOpen, closeQRScanner, viewTraceability } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  if (!isQRScannerOpen) return null;

  const handleScanSample = (code: string) => {
    closeQRScanner();
    viewTraceability(code);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      closeQRScanner();
      viewTraceability(manualCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 text-white w-full max-w-sm rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#234D33] flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white">
                AgriCom+ QR Verifier
              </h3>
              <p className="text-[11px] text-stone-400">
                Scan package seal to trace source farm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeQRScanner}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Simulation */}
        <div className="relative aspect-square bg-stone-950 flex flex-col items-center justify-center p-6 overflow-hidden">
          {/* Background subtle grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#234D33_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

          {/* Scanner Reticle Frame */}
          <div className="relative w-56 h-56 rounded-2xl border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center p-4">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

            {/* Scanning Laser Beam */}
            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2.5s_infinite]" />

            <Camera className="w-8 h-8 text-emerald-400/60 mb-2" />
            <p className="text-center text-xs text-stone-300 font-medium px-2">
              Align camera over the QR code on your delivered AgriCom+ package
            </p>
          </div>

          <div className="absolute bottom-3 flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Digital Farm-to-Fork Authenticity</span>
          </div>
        </div>

        {/* Quick Demo Batch Selector */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Simulate Scan With Verified Batches:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleScanSample('TRACE-KMS-YAM-904')}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-[#234D33]/40 border border-stone-700 hover:border-emerald-500/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Pona Yam Batch</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[10px] text-stone-400 truncate mt-0.5">
                  TRACE-KMS-YAM-904
                </p>
                <p className="text-[9px] text-emerald-400 mt-1 font-mono">
                  Offinso Valley Farm
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleScanSample('TRACE-KMS-OIL-812')}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-[#234D33]/40 border border-stone-700 hover:border-emerald-500/50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Red Palm Oil</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[10px] text-stone-400 truncate mt-0.5">
                  TRACE-KMS-OIL-812
                </p>
                <p className="text-[9px] text-emerald-400 mt-1 font-mono">
                  Barekese Basin Farm
                </p>
              </button>
            </div>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-stone-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Or enter trace code e.g. TRACE-KMS..."
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#234D33] hover:bg-[#1b3d28] text-white text-xs font-semibold cursor-pointer"
              >
                Lookup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
