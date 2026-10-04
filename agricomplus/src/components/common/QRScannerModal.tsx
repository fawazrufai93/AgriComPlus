import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { X, CameraOff, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// A package seal can hold the bare code (TRACE-KMS-…) or a link like https://site/?trace=CODE
export function extractTraceCode(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    const q = url.searchParams.get('trace');
    if (q) return q.trim();
    const last = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
    if (/^TRACE-/i.test(last)) return last;
  } catch {
    /* not a URL, fall through */
  }
  return /^TRACE-[A-Z0-9-]+$/i.test(text) ? text.toUpperCase() : null;
}

export const QRScannerModal: React.FC = () => {
  const { isQRScannerOpen, closeQRScanner, viewTraceability } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [manualCode, setManualCode] = useState('');
  const [message, setMessage] = useState('Starting camera…');
  const [cameraFailed, setCameraFailed] = useState(false);

  const finish = (code: string) => {
    closeQRScanner();
    viewTraceability(code);
  };

  useEffect(() => {
    if (!isQRScannerOpen) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    setCameraFailed(false);
    setMessage('Starting camera…');

    const tick = () => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        const w = 480;
        const h = Math.round((video.videoHeight / video.videoWidth) * w);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const hit = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
          if (hit) {
            const code = extractTraceCode(hit.data);
            if (code) {
              stopped = true;
              finish(code);
              return;
            }
            setMessage('That QR code is not an AgriCom+ package seal.');
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera api');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current!;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();
        setMessage('Point the camera at the QR code on your package');
        raf = requestAnimationFrame(tick);
      } catch {
        setCameraFailed(true);
        setMessage('Camera is blocked. Allow camera access, or type the code below.');
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQRScannerOpen]);

  if (!isQRScannerOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = extractTraceCode(manualCode) || manualCode.trim();
    if (code) finish(code);
  };

  // Fallback: pick a photo of the QR code from the gallery
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hit = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
      const code = hit ? extractTraceCode(hit.data) : null;
      URL.revokeObjectURL(img.src);
      if (code) finish(code);
      else setMessage('No AgriCom+ QR code found in that photo. Try a clearer picture.');
    };
    img.src = URL.createObjectURL(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-stone-900 text-white w-full max-w-sm rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col max-h-[92vh]">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-stone-800">
          <div>
            <h3 className="font-heading text-sm font-bold">Scan package seal</h3>
            <p className="text-[11px] text-stone-400">See which farm your produce came from</p>
          </div>
          <button
            type="button"
            onClick={closeQRScanner}
            aria-label="Close scanner"
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative aspect-square bg-black overflow-hidden">
          <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          {cameraFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400">
              <CameraOff className="w-10 h-10" />
            </div>
          )}
          {!cameraFailed && (
            <div className="absolute inset-[18%] pointer-events-none">
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
            </div>
          )}
          <div className="absolute bottom-3 inset-x-3 flex justify-center">
            <p role="status" className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-black/70 px-3 py-1.5 rounded-full text-center">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{message}</span>
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3 border-t border-stone-800">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Type the code, e.g. TRACE-KMS-1234-AB12"
              autoCapitalize="characters"
              className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
            />
            <button type="submit" className="px-3.5 py-2 rounded-xl bg-[#234D33] hover:bg-[#1b3d28] text-white text-xs font-semibold">
              Look up
            </button>
          </form>
          <label className="flex items-center justify-center gap-2 text-xs text-stone-300 hover:text-white cursor-pointer py-1">
            <ImageIcon className="w-4 h-4" />
            <span>Choose a photo of the QR code instead</span>
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
