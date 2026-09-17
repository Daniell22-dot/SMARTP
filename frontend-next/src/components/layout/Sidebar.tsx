'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  items: NavItem[];
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function Sidebar({ items, isCollapsed = false, onToggle, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn('flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700', isCollapsed && 'justify-center')}>
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">RMS</span>
              </div>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Rental RMS</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="flex items-center justify-center">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">RMS</span>
              </div>
            </Link>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn('h-8 w-8', isCollapsed && 'ml-auto')}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main menu">
          {items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} isCollapsed={isCollapsed} />
          ))}
        </nav>

        {/* Footer */}
        <div className={cn('p-4 border-t border-gray-200 dark:border-gray-700', isCollapsed && 'hidden')}>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Rental Management System v1.0
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
}

function NavLink({ item, pathname, isCollapsed }: NavLinkProps) {
  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
            isCollapsed && 'justify-center px-2'
          )}
          aria-expanded={isActive}
        >
          <span className={cn('flex-shrink-0', item.icon && 'h-5 w-5')} aria-hidden="true">
            {item.icon}
          </span>
          {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
          {!isCollapsed && <ChevronRight className={cn('h-4 w-4 transition-transform', isActive && 'rotate-90')} />}
        </button>
        {!isCollapsed && (
          <div className="ml-8 mt-1 space-y-1 pl-2 border-l border-gray-200 dark:border-gray-700">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'block px-3 py-1.5 rounded-md text-sm transition-colors',
                  pathname === child.href
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
        isCollapsed && 'justify-center px-2'
      )}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : undefined}
    >
      <span className={cn('flex-shrink-0', item.icon && 'h-5 w-5')} aria-hidden="true">
        {item.icon}
      </span>
      {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
    </Link>
  );
}