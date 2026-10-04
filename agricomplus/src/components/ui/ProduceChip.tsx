import React from 'react';

interface ProduceChipProps {
  label: string;
  variant?: 'neutral' | 'fresh' | 'accent';
  className?: string;
}

export const ProduceChip: React.FC<ProduceChipProps> = ({
  label,
  variant = 'neutral',
  className = '',
}) => {
  const styles = {
    neutral: 'bg-stone-100 text-stone-700 border border-stone-200/60',
    fresh: 'bg-emerald-50 text-[#234D33] border border-emerald-100',
    accent: 'bg-amber-50 text-amber-800 border border-amber-200/60',
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium tracking-tight px-2 py-0.5 rounded-md ${styles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};
