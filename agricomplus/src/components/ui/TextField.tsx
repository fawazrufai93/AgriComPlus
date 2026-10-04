import React, { forwardRef } from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, error, icon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full space-y-1.5 text-left">
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-xl border transition-all duration-150 outline-none
              ${icon ? 'pl-10' : 'pl-3.5'}
              ${rightElement ? 'pr-11' : 'pr-3.5'}
              py-3
              ${
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-[#234D33] focus:ring-2 focus:ring-[#234D33]/10 hover:border-slate-300'
              }
              ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-slate-400 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-500 font-medium pl-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 pl-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
