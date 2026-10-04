import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingsRowWidgetProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  badge?: string;
  onClick: () => void;
  destructive?: boolean;
}

export const SettingsRowWidget: React.FC<SettingsRowWidgetProps> = ({
  icon,
  label,
  subtitle,
  badge,
  onClick,
  destructive = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-stone-50/80 active:bg-stone-100 transition-colors text-left border-b border-stone-100 last:border-b-0 cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            destructive
              ? 'bg-red-50 text-red-600'
              : 'bg-emerald-50 text-[#234D33]'
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p
            className={`text-sm font-semibold truncate ${
              destructive ? 'text-red-600' : 'text-stone-900'
            }`}
          >
            {label}
          </p>
          {subtitle && (
            <p className="text-xs text-stone-500 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-[#234D33]">
            {badge}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </div>
    </button>
  );
};
