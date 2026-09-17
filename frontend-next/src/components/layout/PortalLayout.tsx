'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NavItem } from '@/types';
import { cn } from '@/lib/utils';

interface PortalLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title?: string;
}

export function PortalLayout({ children, navItems, title }: PortalLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        items={navItems}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300 lg:pl-64',
          isSidebarCollapsed ? 'lg:pl-16' : ''
        )}
      >
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 lg:p-6" role="main">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}