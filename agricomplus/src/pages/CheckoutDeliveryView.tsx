import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { QRCodeDisplayModal } from '../components/common/QRCodeDisplayModal';
import { Address, PaymentMethodType, Order } from '../types';
import { useApp } from '../context/AppContext';

export const CheckoutDeliveryView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    currentUser,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    placeOrder,
    goToScreen,
    viewTraceability,
    screen,
    activeOrder,
  } = useApp();

  // Progress step: 1 (Cart), 2 (Delivery & Payment), 3 (Confirmation)
  const [currentStep, setCurrentStep] = useState<2 | 3>(2);

  // Address modal
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPhone, setNewPhone] = useState(currentUser.phone);

  // Payment states
  const [paymentType, setPaymentType] = useState<PaymentMethodType>('momo');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'telecel' | 'at'>('mtn');
  const [momoPhone, setMomoPhone] = useState(currentUser.phone);

  // Placed order record
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Returning from Paystack lands on 'order_success' with the verified order
  const successOrder = confirmedOrder || (screen.type === 'order_success' ? activeOrder : null);

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newArea) return;
    addAddress({
      title: newTitle,
      area: newArea,
      landmark: newLandmark || 'Kumasi',
      city: 'Kumasi, Ghana',
      recipientPhone: newPhone || currentUser.phone,
      isDefault: false,
    });
    setIsAddingAddress(false);
    setNewTitle('');
    setNewArea('');
    setNewLandmark('');
  };

  const handlePlaceOrder = async () => {
    setErrorMsg(null);
    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }
    if (paymentType === 'momo' && !/^\+?[0-9\s]{9,15}$/.test(momoPhone.trim())) {
      setErrorMsg('Enter a valid Mobile Money number.');
      return;
    }
    setIsPlacing(true);
    try {
      const { order, redirecting } = await placeOrder(selectedAddress, {
        type: paymentType,
        momoProvider,
        momoPhone: momoPhone.trim(),
      });
      if (redirecting) return; // browser is heading to Paystack's secure page

      setConfirmedOrder(order);
      setCurrentStep(3);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#234D33', '#3A7D44', '#E8622C', '#F59E0B'],
        });
      } catch (err) {
        console.warn('Confetti error', err);
      }
    } catch (err: any) {
      console.error('Order placement error', err);
      setErrorMsg(err?.message || 'Could not place your order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  // STEP 3: ORDER CONFIRMED SCREEN
  if ((currentStep === 3 && confirmedOrder) || successOrder) {
    const confirmedOrder = successOrder!;
    return (
      <div className="min-h-screen bg-[#F6F8F6] p-4 pb-20 max-w-md mx-auto flex flex-col justify-between animate-in fade-in duration-300">
        <div className="pt-8 text-center space-y-4">
          {/* Success Checkmark Badge */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#234D33] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3A7D44]">
              Order Placed Successfully
            </span>
            <h1 className="font-heading text-2xl font-extrabold text-stone-900 mt-1">
              Thank You, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Your farm produce order has been sent to our Kumasi dispatch hub.
            </p>
          </div>

          {/* Order Details Ticket */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm text-left space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">
                  Order Number
                </span>
                <p className="font-mono text-xs font-bold text-stone-900">
                  {confirmedOrder.id}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 font-bold uppercase">
                  Estimated Delivery
                </span>
                <p className="text-xs font-bold text-[#234D33]">
                  Today in ~2 Hours
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] text-stone-400 font-bold uppercase">
                Delivery Location
              </span>
              <p className="font-semibold text-stone-800">
                {confirmedOrder.deliveryAddress.title}
              </p>
              <p className="text-stone-500 text-[11px]">
                {confirmedOrder.deliveryAddress.area},{' '}
                {confirmedOrder.deliveryAddress.landmark}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-bold">
              <span>
                {confirmedOrder.paymentMethod.type === 'cod'
                  ? 'Pay on delivery (cash)'
                  : `Paid via ${confirmedOrder.paymentMethod.details}`}
              </span>
              <span className="text-sm font-extrabold text-[#234D33]">
                GH₵ {confirmedOrder.total}
              </span>
            </div>
          </div>

          {/* Instant QR Traceability Callout */}
          <div className="bg-emerald-50/90 rounded-2xl p-4 border border-emerald-200 text-left space-y-2">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#234D33]" />
              <h3 className="font-heading text-xs font-bold text-[#234D33]">
                Packaging QR Code Ready
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              A tamper-evident QR seal (<span className="font-mono font-semibold">{confirmedOrder.traceCode}</span>) has been generated for your box. You can trace its journey from harvest to your door anytime.
            </p>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-full bg-white text-[#234D33] text-xs font-bold border border-emerald-300 shadow-xs hover:bg-emerald-50"
              >
                View Package QR Code
              </button>

              <button
                type="button"
                onClick={() =>
                  viewTraceability(confirmedOrder.traceCode, confirmedOrder.id)
                }
                className="flex-1 py-2 px-3 rounded-full bg-[#234D33] text-white text-xs font-bold shadow-xs hover:bg-[#1b3d28]"
              >
                Open Trace Report
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-2">
          <Button
            size="lg"
            onClick={() => goToScreen({ type: 'home' })}
            variant="outline"
          >
            Back to Marketplace
          </Button>
        </div>

        {/* Scannable QR modal */}
        <QRCodeDisplayModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          traceCode={confirmedOrder.traceCode}
          orderId={confirmedOrder.id}
          title="Your Delivery Package QR Tag"
        />
      </div>
    );
  }

  // STEP 2: CHECKOUT (DELIVERY & PAYMENT)
  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToScreen({ type: 'cart' })}
          aria-label="Back to cart"
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="font-heading text-sm font-bold text-stone-900">
          Checkout & Delivery
        </h1>

        <div className="w-9" />
      </header>

      {/* 3-Step Progress Indicator */}
      <div className="bg-white border-b border-stone-200 px-4 py-2.5">
        <div className="flex items-center justify-center gap-2 text-xs font-medium max-w-xs mx-auto">
          {/* Step 1: Cart */}
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#234D33] flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span>Cart</span>
          </div>

          <div className="w-6 h-0.5 bg-[#234D33]" />

          {/* Step 2: Delivery & Payment (Active) */}
          <div className="flex items-center gap-1.5 text-[#234D33] font-bold">
            <span className="w-5 h-5 rounded-full bg-[#234D33] text-white flex items-center justify-center text-[10px] font-bold">
              2
            </span>
            <span>Details</span>
          </div>

          <div className="w-6 h-0.5 bg-stone-200" />

          {/* Step 3: Confirm */}
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-[10px] font-bold">
              3
            </span>
            <span>Confirm</span>
          </div>
        </div>
      </div>

      <main className="px-4 pt-4 max-w-md mx-auto space-y-4">
        {/* 1. DELIVERY ADDRESS SECTION */}
        <section className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#234D33]" />
              <span>Delivery Address</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="text-xs font-bold text-[#234D33] hover:text-[#3A7D44] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingAddress ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* Saved Addresses Radio Selection */}
          <div className="space-y-2">
            {currentUser.addresses.map((addr) => {
              const isSelected = selectedAddress.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-[#234D33] bg-emerald-50/50 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="addressSelection"
                    checked={isSelected}
                    onChange={() => setSelectedAddress(addr)}
                    className="mt-0.5 text-[#234D33] focus:ring-[#234D33]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900">
                      {addr.title}
                    </p>
                    <p className="text-[11px] text-stone-600 mt-0.5 truncate">
                      {addr.area}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {addr.landmark} • {addr.recipientPhone}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Address Form Modal/Drawer */}
          {isAddingAddress && (
            <form
              onSubmit={handleAddNewAddress}
              className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5 animate-in fade-in duration-150"
            >
              <p className="text-xs font-bold text-stone-800">
                Add Kumasi Address
              </p>
              <TextField
                label="Address Label"
                placeholder="e.g. My Apartment, Ahodwo"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <TextField
                label="Area & Street"
                placeholder="e.g. Ahodwo Roundabout near Lancaster"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                required
              />
              <TextField
                label="Landmark / House No."
                placeholder="e.g. Plot 12, Blue Gate"
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
              />
              <div className="pt-1">
                <Button size="sm" type="submit">
                  Save & Use Address
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* 2. PAYMENT METHOD SECTION */}
        <section className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#234D33]" />
            <span>Payment Method</span>
          </h2>

          <div className="space-y-2">
            {/* Mobile Money */}
            <div
              onClick={() => setPaymentType('momo')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                paymentType === 'momo'
                  ? 'border-[#234D33] bg-emerald-50/50 shadow-xs'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'momo'}
                    onChange={() => setPaymentType('momo')}
                    className="text-[#234D33] focus:ring-[#234D33]"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Mobile Money (MTN / Telecel / AT)
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Approve the prompt on your phone — secured by Paystack
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Popular
                </span>
              </div>

              {/* MoMo Provider Selector if chosen */}
              {paymentType === 'momo' && (
                <div className="mt-3 pt-3 border-t border-emerald-100/80 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMomoProvider('mtn')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        momoProvider === 'mtn'
                          ? 'bg-[#FFCC00] text-black border-amber-400 shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600'
                      }`}
                    >
                      MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setMomoProvider('telecel')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        momoProvider === 'telecel'
                          ? 'bg-[#E30613] text-white border-red-500 shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600'
                      }`}
                    >
                      Telecel Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setMomoProvider('at')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        momoProvider === 'at'
                          ? 'bg-[#002B49] text-white border-blue-900 shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600'
                      }`}
                    >
                      AT Money
                    </button>
                  </div>

                  <TextField
                    label="Mobile Money Number"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder="024 XXX XXXX"
                    required
                  />
                </div>
              )}
            </div>

            {/* Credit/Debit Card */}
            <div
              onClick={() => setPaymentType('card')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentType === 'card'
                  ? 'border-[#234D33] bg-emerald-50/50 shadow-xs'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentType === 'card'}
                  onChange={() => setPaymentType('card')}
                  className="text-[#234D33] focus:ring-[#234D33]"
                />
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    Credit / Debit Card (Visa, Mastercard)
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Visa / Mastercard — secured by Paystack
                  </p>
                </div>
              </div>
              <CreditCard className="w-4 h-4 text-stone-400" />
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => setPaymentType('cod')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentType === 'cod'
                  ? 'border-[#234D33] bg-emerald-50/50 shadow-xs'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentType === 'cod'}
                  onChange={() => setPaymentType('cod')}
                  className="text-[#234D33] focus:ring-[#234D33]"
                />
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    Cash on Delivery
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Pay the courier when you inspect your produce
                  </p>
                </div>
              </div>
              <Banknote className="w-4 h-4 text-stone-400" />
            </div>
          </div>
        </section>

        {/* 3. ORDER SUMMARY RECAP */}
        <section className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2.5">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-stone-900">
            Order Items Recap ({cart.length})
          </h2>

          <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar pr-1">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-b-0"
              >
                <span className="text-stone-700 truncate max-w-[70%]">
                  {item.quantity}× {item.product.name}
                </span>
                <span className="font-semibold text-stone-900">
                  GH₵ {item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-1 text-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span>Produce Subtotal</span>
              <span>GH₵ {cartSubtotal}</span>
            </div>
            <div className="flex items-center justify-between text-stone-500">
              <span>Delivery Fee (Kumasi Metro)</span>
              <span>GH₵ {deliveryFee}</span>
            </div>
            <div className="pt-1 flex items-center justify-between font-bold text-stone-900 text-sm">
              <span>Total Due</span>
              <span className="font-heading text-base font-black text-[#234D33]">
                GH₵ {cartTotal}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Footer: Place Order */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 max-w-md mx-auto shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3 mb-2 text-xs">
          <span className="text-stone-500 font-medium">
            Delivery to {selectedAddress.title.split(' ')[0]}
          </span>
          <span className="font-heading text-base font-extrabold text-[#234D33]">
            GH₵ {cartTotal}
          </span>
        </div>

        <Button
          size="lg"
          onClick={handlePlaceOrder}
          isLoading={isPlacing}
          icon={<ShieldCheck className="w-4 h-4" />}
        >
          {paymentType === 'cod' ? 'Place Order & Generate QR Seal' : `Pay GH₵ ${cartTotal} Securely`}
        </Button>
        {errorMsg && (
          <p role="alert" className="mt-2 text-xs font-semibold text-red-600 text-center">
            {errorMsg}
          </p>
        )}
      </footer>
    </div>
  );
};
