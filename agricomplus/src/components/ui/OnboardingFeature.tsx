import React from 'react';

interface OnboardingFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const OnboardingFeature: React.FC<OnboardingFeatureProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex items-start gap-3.5 text-left p-3.5 rounded-2xl bg-white/80 border border-stone-200/70 shadow-xs">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#234D33] flex items-center justify-center shrink-0 shadow-xs">
        {icon}
      </div>
      <div>
        <h4 className="font-heading text-sm font-bold text-stone-900 leading-snug">
          {title}
        </h4>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
