import React from 'react';
import {
  Layers,
  Carrot,
  Apple,
  Wheat,
  Flame,
  LayoutGrid,
} from 'lucide-react';
import { CategoryId } from '../../types';

interface CategoryChipProps {
  id: CategoryId;
  name: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  id,
  name,
  count,
  isActive,
  onClick,
}) => {
  const getIcon = () => {
    const iconClass = `w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#234D33]'}`;
    switch (id) {
      case 'tubers':
        return <Layers className={iconClass} />;
      case 'vegetables':
        return <Carrot className={iconClass} />;
      case 'fruits':
        return <Apple className={iconClass} />;
      case 'grains':
        return <Wheat className={iconClass} />;
      case 'oils':
        return <Flame className={iconClass} />;
      default:
        return <LayoutGrid className={iconClass} />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 select-none cursor-pointer border ${
        isActive
          ? 'bg-[#234D33] text-white border-[#234D33] shadow-sm shadow-[#234D33]/20 scale-[1.02]'
          : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span className="flex items-center justify-center">{getIcon()}</span>
      <span>{name}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
