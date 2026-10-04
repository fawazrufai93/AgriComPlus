import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, ShieldCheck, Download, Share2 } from 'lucide-react';

interface QRCodeDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  traceCode: string;
  orderId?: string;
  title?: string;
}

export const QRCodeDisplayModal: React.FC<QRCodeDisplayModalProps> = ({
  isOpen,
  onClose,
  traceCode,
  orderId,
  title = 'Package Traceability QR Code',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !traceCode) return;
    QRCode.toDataURL(
      `https://agricomplus.gh/trace/${encodeURIComponent(traceCode)}`,
      {
        width: 280,
        margin: 2,
        color: {
          dark: '#234D33',
          light: '#FFFFFF',
        },
      }
    )
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR generation error', err));
  }, [isOpen, traceCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white text-stone-900 w-full max-w-xs sm:max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-center">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="text-left">
            <h3 className="font-heading text-sm font-bold text-stone-900">
              {title}
            </h3>
            {orderId && (
              <p className="text-[11px] text-stone-500 font-mono">
                Order #{orderId}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Canvas */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 inline-block shadow-inner">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR Trace Code ${traceCode}`}
              className="w-48 h-48 mx-auto rounded-lg shadow-xs"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-stone-400 text-xs">
              Generating QR...
            </div>
          )}
          <p className="font-mono text-xs font-bold text-[#234D33] mt-2.5 tracking-wider">
            {traceCode}
          </p>
        </div>

        <div className="space-y-1.5 text-xs text-stone-600 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
          <div className="flex items-center justify-center gap-1.5 text-[#234D33] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Printed on Delivery Packaging</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Anyone receiving this package in Kumasi can scan this code with any smartphone camera to inspect the source farm and harvest certificate.
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#234D33] text-white text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
