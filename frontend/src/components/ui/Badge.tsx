'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'primary' | 'gold';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-spurs-navy/10 text-spurs-navy dark:bg-spurs-navy/20 dark:text-spurs-gold',
      secondary: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
      success: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      primary: 'bg-spurs-navy text-white',
      gold: 'bg-spurs-gold text-spurs-navy',
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
          'inline-flex items-center justify-center rounded-full bg-spurs-navy/10 dark:bg-spurs-navy/20 text-spurs-navy dark:text-spurs-gold overflow-hidden',
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