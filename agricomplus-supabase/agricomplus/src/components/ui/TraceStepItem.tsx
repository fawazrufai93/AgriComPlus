import React from 'react';
import {
  Sprout,
  Scissors,
  PackageCheck,
  Truck,
  Check,
  Clock,
  MapPin,
  UserCheck,
  Thermometer,
} from 'lucide-react';
import { TraceEvent } from '../../types';

interface TraceStepProps {
  event: TraceEvent;
  isFirst?: boolean;
  isLast?: boolean;
}

export const TraceStepItem: React.FC<TraceStepProps> = ({
  event,
  isFirst = false,
  isLast = false,
}) => {
  const getStageIcon = () => {
    switch (event.stage) {
      case 'Farm':
        return <Sprout className="w-4 h-4 text-white" />;
      case 'Harvest':
        return <Scissors className="w-4 h-4 text-white" />;
      case 'Pack':
        return <PackageCheck className="w-4 h-4 text-white" />;
      case 'Delivery':
        return <Truck className="w-4 h-4 text-white" />;
    }
  };

  const getStatusStyles = () => {
    switch (event.status) {
      case 'completed':
        return {
          iconBg: 'bg-[#234D33]',
          lineColor: 'bg-[#234D33]',
          badgeText: 'Completed',
          badgeBg: 'bg-emerald-100 text-emerald-800',
        };
      case 'in-progress':
        return {
          iconBg: 'bg-[#E8622C] ring-4 ring-orange-100',
          lineColor: 'bg-orange-300',
          badgeText: 'Live / En Route',
          badgeBg: 'bg-orange-100 text-[#E8622C] animate-pulse',
        };
      case 'pending':
      default:
        return {
          iconBg: 'bg-stone-300',
          lineColor: 'bg-stone-200',
          badgeText: 'Pending',
          badgeBg: 'bg-stone-100 text-stone-500',
        };
    }
  };

  const status = getStatusStyles();

  return (
    <div className="relative flex gap-3.5 pb-6 last:pb-1">
      {/* Vertical Connecting Line */}
      {!isLast && (
        <div
          className={`absolute left-4 top-8 bottom-0 w-0.5 ${status.lineColor} transition-colors`}
          aria-hidden="true"
        />
      )}

      {/* Node Icon */}
      <div
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${status.iconBg} shadow-xs`}
      >
        {event.status === 'completed' ? (
          <Check className="w-4 h-4 text-white stroke-[2.5]" />
        ) : (
          getStageIcon()
        )}
      </div>

      {/* Node Content */}
      <div className="flex-1 bg-white rounded-xl p-3 border border-stone-200/80 shadow-xs">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A7D44]">
                Stage {event.stage}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.badgeBg}`}>
                {status.badgeText}
              </span>
            </div>
            <h4 className="font-heading text-sm font-bold text-stone-900 mt-0.5">
              {event.title}
            </h4>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium shrink-0">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{event.timestamp}</span>
          </div>
        </div>

        {/* Location & Details */}
        <div className="mt-2 space-y-1.5 text-xs text-stone-600">
          <div className="flex items-start gap-1.5 text-stone-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#3A7D44] shrink-0 mt-0.5" />
            <span>{event.location}</span>
          </div>

          <p className="text-stone-600 leading-relaxed text-[12px] bg-stone-50/70 p-2 rounded-lg border border-stone-100">
            {event.description}
          </p>

          <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-[11px] text-stone-500 border-t border-stone-100">
            <div className="flex items-center gap-1 text-[#234D33] font-medium">
              <UserCheck className="w-3 h-3 text-[#234D33]" />
              <span>{event.verifiedBy}</span>
            </div>

            {event.temperature && (
              <div className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-mono">
                <Thermometer className="w-3 h-3" />
                <span>{event.temperature}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
