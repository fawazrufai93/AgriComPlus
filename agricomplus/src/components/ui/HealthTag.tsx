import React from 'react';
import { Leaf, ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface HealthTagProps {
  label: string;
  className?: string;
}

export const HealthTag: React.FC<HealthTagProps> = ({ label, className = '' }) => {
  const getIcon = () => {
    const l = label.toLowerCase();
    if (l.includes('organic') || l.includes('pesticide')) return <Leaf className="w-3 h-3 text-[#234D33]" />;
    if (l.includes('direct') || l.includes('fda') || l.includes('guarantee')) return <ShieldCheck className="w-3 h-3 text-[#3A7D44]" />;
    if (l.includes('heart') || l.includes('iron') || l.includes('fiber')) return <Heart className="w-3 h-3 text-rose-600" />;
    return <Sparkles className="w-3 h-3 text-amber-600" />;
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs font-medium text-[#234D33] ${className}`}
    >
      {getIcon()}
      <span>{label}</span>
    </div>
  );
};
