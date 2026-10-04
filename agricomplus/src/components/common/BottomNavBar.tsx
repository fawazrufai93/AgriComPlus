import React from 'react';
import { Home, Layers, ShoppingBag, User } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useApp } from '../../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { activeTab, goToScreen, cartCount } = useApp();

  const navItems: { tab: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'categories', label: 'Categories', icon: Layers },
    { tab: 'cart', label: 'Cart', icon: ShoppingBag },
    { tab: 'account', label: 'Account', icon: User },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 sm:px-6 py-2 pb-safe max-w-md mx-auto shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-around">
        {navItems.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (tab === 'home') goToScreen({ type: 'home' });
                else if (tab === 'categories') goToScreen({ type: 'categories' });
                else if (tab === 'cart') goToScreen({ type: 'cart' });
                else if (tab === 'account') goToScreen({ type: 'account' });
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[64px] transition-all duration-200 cursor-pointer ${
                isActive ? 'text-[#234D33]' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {tab === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#E8622C] text-white text-[10px] font-bold min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 shadow-xs animate-in zoom-in-50">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 transition-all ${
                  isActive ? 'font-bold text-[#234D33]' : 'font-medium text-stone-500'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-[#234D33] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
