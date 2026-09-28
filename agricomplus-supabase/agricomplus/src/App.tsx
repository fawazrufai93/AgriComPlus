import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingView } from './pages/OnboardingView';
import { AuthView } from './pages/AuthView';
import { MarketplaceHomeView } from './pages/MarketplaceHomeView';
import { ProductDetailsView } from './pages/ProductDetailsView';
import { FarmerProfileView } from './pages/FarmerProfileView';
import { ShoppingCartView } from './pages/ShoppingCartView';
import { CheckoutDeliveryView } from './pages/CheckoutDeliveryView';
import { TraceabilityReportView } from './pages/TraceabilityReportView';
import { UserProfileOrdersView } from './pages/UserProfileOrdersView';
import { BottomNavBar } from './components/common/BottomNavBar';
import { QRScannerModal } from './components/common/QRScannerModal';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

const MainNavigator: React.FC = () => {
  const { screen } = useApp();

  const renderActiveScreen = () => {
    switch (screen.type) {
      case 'onboarding':
        return <OnboardingView />;
      case 'auth':
        return <AuthView initialMode={screen.initialMode} />;
      case 'home':
      case 'categories':
        return <MarketplaceHomeView />;
      case 'product_details':
        return <ProductDetailsView />;
      case 'farmer_profile':
        return <FarmerProfileView />;
      case 'cart':
        return <ShoppingCartView />;
      case 'checkout':
      case 'order_success':
        return <CheckoutDeliveryView />;
      case 'traceability':
        return <TraceabilityReportView />;
      case 'account':
        return <UserProfileOrdersView />;
      default:
        return <MarketplaceHomeView />;
    }
  };

  // Determine if bottom nav bar should be visible
  const showBottomNav =
    screen.type === 'home' ||
    screen.type === 'categories' ||
    screen.type === 'cart' ||
    screen.type === 'account';

  return (
    <div className="relative min-h-screen bg-[#F6F8F6] text-stone-900 flex flex-col font-sans">
      {renderActiveScreen()}
      {showBottomNav && <BottomNavBar />}
      <QRScannerModal />
    </div>
  );
};

export default function App() {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);

  return (
    <AppProvider>
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-start text-stone-900">
        {/* Top Desktop Helper bar (visible only on md/lg screens) */}
        <div className="hidden md:flex w-full bg-[#1b3d28] text-white py-2 px-6 items-center justify-between text-xs z-50 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center overflow-hidden">
              <img src="/logo-mark.png" alt="AgriCom+ logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-heading font-bold text-emerald-100">
              AgriCom+
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-300 font-medium">
              Kumasi Farm-to-Door Produce Marketplace & QR Traceability
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-200/80 text-[11px]">
              Currency: Ghanaian Cedi (GH₵)
            </span>
            <button
              type="button"
              onClick={() => setDeviceFrameMode(!deviceFrameMode)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer border border-white/15"
            >
              {deviceFrameMode ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Full Width View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile Phone Frame</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Container: If frame mode is enabled on desktop, render authentic mobile shell */}
        {deviceFrameMode ? (
          <div className="w-full flex-1 flex items-center justify-center p-0 md:py-6 md:px-4">
            <div className="w-full md:max-w-[430px] md:rounded-[42px] md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] md:border-[10px] md:border-stone-800 bg-[#F6F8F6] overflow-hidden min-h-screen md:min-h-[860px] md:max-h-[92vh] flex flex-col relative">
              {/* Native Mobile Status Bar simulation on desktop */}
              <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 bg-[#234D33] text-white text-[11px] font-semibold select-none z-50">
                <span>09:41</span>
                {/* Notch */}
                <div className="w-24 h-4 bg-stone-900 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Scrollable Mobile Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar relative">
                <MainNavigator />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg min-h-screen bg-[#F6F8F6] shadow-xl">
            <MainNavigator />
          </div>
        )}
      </div>
    </AppProvider>
  );
}
