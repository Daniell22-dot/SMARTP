'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00e599] focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-white text-black hover:bg-white/85 active:bg-white/80',
      secondary: 'bg-transparent text-white border border-[#303236] hover:bg-[#0c0d0d] active:bg-[#18191b]',
      gold: 'bg-[#00e599] text-black hover:bg-[#00cc88] active:bg-[#0a9e6a] font-medium',
      outline: 'border border-[#303236] bg-[#0c0d0d] text-[#c9cbcf] hover:bg-[#18191b] active:bg-[#18191b]',
      ghost: 'bg-transparent text-[#c9cbcf] hover:text-white hover:bg-white/5',
      danger: 'bg-[#ff3621] text-white hover:bg-[#e8301e] active:bg-[#c92a1a]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';