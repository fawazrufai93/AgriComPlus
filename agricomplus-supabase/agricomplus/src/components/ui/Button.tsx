import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#234D33] text-white hover:bg-[#1b3d28] focus-visible:outline-[#234D33] shadow-sm hover:shadow',
    secondary:
      'bg-[#3A7D44] text-white hover:bg-[#2e6436] focus-visible:outline-[#3A7D44]',
    accent:
      'bg-[#E8622C] text-white hover:bg-[#d05322] focus-visible:outline-[#E8622C] shadow-sm',
    outline:
      'border-2 border-[#234D33] text-[#234D33] hover:bg-[#234D33]/5 focus-visible:outline-[#234D33]',
    ghost:
      'text-[#234D33] hover:bg-black/5 focus-visible:outline-transparent',
  };

  const sizes = {
    sm: 'text-xs py-2 px-4 gap-1.5',
    md: 'text-sm py-3 px-6 gap-2 min-h-[46px]',
    lg: 'text-base py-3.5 px-8 gap-2.5 min-h-[52px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
