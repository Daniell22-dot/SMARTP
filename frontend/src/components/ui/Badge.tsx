'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'primary' | 'gold';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#18191b] text-[#94979e]',
      secondary: 'bg-[#18191b] text-[#c9cbcf]',
      success: 'bg-green-500/10 text-green-400',
      warning: 'bg-amber-500/10 text-amber-400',
      danger: 'bg-[#ff3621]/10 text-[#ff3621]',
      info: 'bg-[#00e599]/10 text-[#00e599]',
      outline: 'border border-[#303236] text-[#c9cbcf]',
      primary: 'bg-[#00e599]/10 text-[#00e599]',
      gold: 'bg-[#34d59a]/10 text-[#34d59a]',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-[#18191b] text-[#c9cbcf] overflow-hidden',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-medium">{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';