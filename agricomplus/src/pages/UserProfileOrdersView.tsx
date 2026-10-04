import React, { useState } from 'react';
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  QrCode,
  Package,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  LogIn,
  UserPlus,
  Heart,
  ShoppingBag,
} from 'lucide-react';
import { SettingsRowWidget } from '../components/ui/SettingsRowWidget';
import { ProduceCard } from '../components/ui/ProduceCard';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export const UserProfileOrdersView: React.FC = () => {
  const {
    currentUser,
    orders,
    savedItemIds,
    addToCart,
    supabaseUser,
    isAuthenticated,
    logOutUser,
    viewTraceability,
    openQRScanner,
    startOnboarding,
    goToScreen,
    isAdmin,
    products: PRODUCTS,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'settings'>('orders');
  const [notificationStatus, setNotificationStatus] = useState('SMS & WhatsApp Enabled');
  const [addedAllNotification, setAddedAllNotification] = useState(false);

  // Filter products that user has saved to wishlist
  const savedProducts = PRODUCTS.filter((p) => savedItemIds.includes(p.id));

  const handleAddAllToCart = () => {
    savedProducts.forEach((prod) => {
      addToCart(prod, 1);
    });
    setAddedAllNotification(true);
    setTimeout(() => setAddedAllNotification(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      {/* 1. PROFILE HEADER */}
      <header className="bg-[#234D33] text-white pt-6 pb-6 px-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3.5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-400/80 bg-emerald-900/60 shadow-md flex items-center justify-center">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading text-xl font-bold text-emerald-200">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#E8622C] text-white flex items-center justify-center text-[10px] font-bold border border-white">
              GH
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-base sm:text-lg font-bold text-white truncate">
                {currentUser.name}
              </h1>
              {isAuthenticated && (
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded-full font-bold">
                  Verified
                </span>
              )}
            </div>

            <p className="text-xs text-emerald-200 truncate mt-0.5">
              {currentUser.email || `@${currentUser.username}`}
            </p>

            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-300" />
                <span>Kumasi, Ghana</span>
              </span>
              <span>•</span>
              <span className="text-emerald-300 font-medium">
                {currentUser.joinedDate}
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => goToScreen({ type: 'admin' })}
            className="max-w-md mx-auto mt-4 w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white text-[#234D33] text-xs font-bold shadow-xs cursor-pointer"
          >
            <span>Open Admin Dashboard</span>
            <span aria-hidden>→</span>
          </button>
        )}

        {/* Authentication Callout Banner if not logged in */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto mt-4 p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xs flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">
                Sync Orders with the Cloud
              </p>
              <p className="text-[10px] text-emerald-200">
                Log in or sign up to save order history & addresses
              </p>
            </div>
            <button
              type="button"
              onClick={() => goToScreen({ type: 'auth', initialMode: 'login' })}
              className="px-3.5 py-1.5 rounded-full bg-[#E8622C] text-white text-xs font-bold shadow-xs hover:bg-[#d05322] cursor-pointer"
            >
              Log In / Sign Up
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-3.5 pt-2.5 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-200">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Cloud Sync Active</span>
            </span>
            <button
              type="button"
              onClick={logOutUser}
              className="text-stone-300 hover:text-white font-medium underline text-[11px] cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Quick QR Package Scanner button in profile */}
        <div className="max-w-md mx-auto mt-3 pt-3 border-t border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Produce Authenticity Seal</span>
          </div>

          <button
            type="button"
            onClick={openQRScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span>Scan Packaging QR</span>
          </button>
        </div>
      </header>

      {/* 2. TAB TOGGLE: ORDERS vs FAVORITES vs SETTINGS */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="grid grid-cols-3 p-1 bg-stone-200/80 rounded-xl text-xs font-bold text-stone-600">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-[#234D33] shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'favorites'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                activeTab === 'favorites'
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-stone-400'
              }`}
            />
            <span>Saved ({savedItemIds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-[#234D33] shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/80 shadow-xs">
                <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-stone-800">
                  No orders yet
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Your fresh produce deliveries will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => goToScreen({ type: 'home' })}
                  className="mt-4 px-5 py-2.5 rounded-full bg-[#234D33] text-white text-xs font-bold cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-stone-900">
                        {ord.id}
                      </span>
                      <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{ord.placedAt}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-[#234D33]'
                            : ord.status === 'Out for Delivery'
                            ? 'bg-orange-100 text-[#E8622C] animate-pulse'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <p className="font-heading text-sm font-bold text-stone-900 mt-1">
                        GH₵ {ord.total}
                      </p>
                    </div>
                  </div>

                  {/* Order items snippet */}
                  <div className="text-xs text-stone-600 space-y-1">
                    {ord.items.slice(0, 3).map((it) => (
                      <div
                        key={it.product.id}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate max-w-[75%]">
                          {it.quantity}× {it.product.name}
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          GH₵ {it.product.price * it.quantity}
                        </span>
                      </div>
                    ))}
                    {ord.items.length > 3 && (
                      <p className="text-[11px] text-stone-400 italic">
                        +{ord.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Payment: always visible, no need to open Settings */}
                  <div className="flex items-center justify-between gap-2 text-[11px] bg-stone-50 rounded-xl px-3 py-2">
                    <span className="text-stone-500 truncate">
                      {ord.paymentMethod?.details || 'Payment'}
                    </span>
                    <span
                      className={`font-bold shrink-0 ${
                        ord.paymentStatus === 'paid'
                          ? 'text-emerald-700'
                          : ord.paymentStatus === 'failed'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {ord.paymentStatus === 'paid'
                        ? 'Paid'
                        : ord.paymentStatus === 'pay_on_delivery'
                        ? 'Pay on delivery'
                        : ord.paymentStatus === 'failed'
                        ? 'Payment failed'
                        : 'Awaiting payment'}
                    </span>
                  </div>

                  {/* Destination summary */}
                  <div className="text-[11px] text-stone-500 flex items-center gap-1 pt-1 border-t border-stone-100">
                    <MapPin className="w-3.5 h-3.5 text-[#3A7D44] shrink-0" />
                    <span className="truncate">
                      {ord.deliveryAddress.title} • {ord.deliveryAddress.area}
                    </span>
                  </div>

                  {/* Actions: View Traceability / Track */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => viewTraceability(ord.traceCode, ord.id)}
                      className="flex-1 py-2 px-3 rounded-full bg-[#234D33] text-white text-xs font-bold shadow-xs hover:bg-[#1b3d28] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                      <span>View Traceability Report</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: FAVORITES / SAVED ITEMS */}
        {activeTab === 'favorites' && (
          <div className="space-y-3.5">
            {/* Added all notification */}
            {addedAllNotification && (
              <div className="p-3 rounded-2xl bg-[#234D33] text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>Added {savedProducts.length} saved produce items to cart!</span>
                </div>
                <button
                  type="button"
                  onClick={() => goToScreen({ type: 'cart' })}
                  className="text-emerald-200 underline font-bold cursor-pointer"
                >
                  View Cart
                </button>
              </div>
            )}

            {savedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/80 shadow-xs space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                  <Heart className="w-8 h-8 fill-rose-100 text-rose-400 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-stone-900">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Heart your favorite farm produce while browsing the marketplace to save them here for quick reordering.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => goToScreen({ type: 'home' })}
                    className="px-5 py-2.5 rounded-full bg-[#234D33] text-white text-xs font-bold shadow-xs hover:bg-[#1b3d28] cursor-pointer"
                  >
                    Browse Fresh Produce
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header row with count & Add All to Cart */}
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-stone-900">
                      Saved Produce ({savedProducts.length})
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Direct from verified Kumasi farms
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAllToCart}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-[#234D33] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#234D33]" />
                    <span>Add All to Cart</span>
                  </button>
                </div>

                {/* 2-column ProduceCard grid of saved items */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {savedProducts.map((prod) => (
                    <ProduceCard key={prod.id} product={prod} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS (SettingsRowWidget) */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Delivery Addresses list */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-stone-700">
                  Account Preferences
                </h3>
                {isAuthenticated ? (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    Supabase Connected
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                    Guest Mode
                  </span>
                )}
              </div>

              {!isAuthenticated && (
                <SettingsRowWidget
                  icon={<LogIn className="w-4 h-4" />}
                  label="Log In / Sign Up"
                  subtitle="Sign in with Google or Email via Supabase"
                  badge="Recommended"
                  onClick={() => goToScreen({ type: 'auth', initialMode: 'login' })}
                />
              )}

              <SettingsRowWidget
                icon={<Heart className="w-4 h-4 text-rose-500" />}
                label="Saved Items (Wishlist)"
                subtitle={`${savedItemIds.length} produce items saved`}
                badge={savedItemIds.length > 0 ? `${savedItemIds.length}` : undefined}
                onClick={() => setActiveTab('favorites')}
              />

              <SettingsRowWidget
                icon={<MapPin className="w-4 h-4" />}
                label="Delivery Addresses"
                subtitle={`${currentUser.addresses.length} saved ${currentUser.addresses.length === 1 ? 'address' : 'addresses'}`}
                onClick={() => goToScreen({ type: 'checkout' })}
              />

              <SettingsRowWidget
                icon={<CreditCard className="w-4 h-4" />}
                label="Payments & receipts"
                subtitle={`${orders.filter((o) => o.paymentStatus === 'paid').length} paid, ${orders.filter((o) => o.paymentStatus === 'pending').length} awaiting payment`}
                onClick={() => setActiveTab('orders')}
              />

              <SettingsRowWidget
                icon={<Bell className="w-4 h-4" />}
                label="Delivery Notifications"
                subtitle={notificationStatus}
                badge="Active"
                onClick={() => {
                  setNotificationStatus((prev) =>
                    prev.includes('Enabled') ? 'Muted' : 'SMS & WhatsApp Enabled'
                  );
                }}
              />

              <SettingsRowWidget
                icon={<HelpCircle className="w-4 h-4" />}
                label="Help & Farmer Support"
                subtitle="Call Kumasi Hub: +233 24 412 8990"
                onClick={() => {
                  alert(
                    'AgriCom+ Kumasi Customer Support:\n\nPhone: +233 24 412 8990\nWhatsApp: +233 50 891 3244\nHub Location: Kaase Industrial Area, Kumasi, Ghana\nHours: Mon–Sat 06:00 AM – 08:00 PM'
                  );
                }}
              />

              <SettingsRowWidget
                icon={<RefreshCw className="w-4 h-4" />}
                label="Replay Onboarding Tour"
                subtitle="Restart welcome splash & walkthrough"
                onClick={startOnboarding}
              />

              {isAuthenticated ? (
                <SettingsRowWidget
                  icon={<LogOut className="w-4 h-4" />}
                  label="Sign Out"
                  subtitle={`Signed in as ${currentUser.email || currentUser.username}`}
                  destructive={true}
                  onClick={logOutUser}
                />
              ) : (
                <SettingsRowWidget
                  icon={<LogOut className="w-4 h-4" />}
                  label="Reset Session"
                  subtitle="Clear local session & restart"
                  destructive={true}
                  onClick={startOnboarding}
                />
              )}
            </div>

            {/* Platform Tagline card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center space-y-1">
              <p className="font-heading text-xs font-bold text-[#234D33]">
                AgriCom+ Kumasi Agro Network
              </p>
              <p className="text-[11px] text-stone-500 italic">
                "The Choice Of Healthy Food."
              </p>
              <p className="text-[10px] text-stone-400 font-mono pt-1">
                Connected to Supabase Auth & DB ({supabaseUser?.id ? `UID: ${supabaseUser.id.slice(0, 8)}...` : 'Local Sync'})
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
