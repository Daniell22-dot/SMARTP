'use client';

import { useAuth } from '@/context/AuthContext';
import { Avatar, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Menu, LogOut, User, Bell, Moon, Sun, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    setIsDark(dark);
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    if (newIsDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const roleLabels: Record<string, string> = {
    tenant: 'Tenant',
    landlord: 'Landlord',
    admin: 'Admin',
    property_manager: 'Property Manager',
  };

  const roleColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
    tenant: 'info',
    landlord: 'success',
    admin: 'danger',
    property_manager: 'warning',
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#18191b] bg-black/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Menu button */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Toggle menu">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="h-5 w-5" />
            </Button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded border border-[#303236] bg-[#0c0d0d]">
                <div className="border-b border-[#18191b] p-4">
                  <h3 className="font-medium text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 text-center text-[#797d86]">
                    No notifications yet
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Moon className="h-5 w-5 hidden dark:block" />
            <Sun className="h-5 w-5 block dark:hidden" />
          </Button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <Avatar
                src={user?.profile_picture || undefined}
                name={`${user?.first_name} ${user?.last_name}`}
                size="md"
              />
              {!showUserMenu && (
                <span className="hidden sm:block font-medium text-gray-700 dark:text-gray-300">
                  {user?.first_name} {user?.last_name}
                </span>
              )}
              <ChevronDown className={cn('h-4 w-4 transition-transform', showUserMenu && 'rotate-180')} />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded border border-[#303236] bg-[#0c0d0d] py-1">
                <div className="border-b border-[#18191b] px-4 py-3">
                  <p className="font-medium text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-sm text-[#797d86]">{user?.email}</p>
                  <Badge variant="primary" className="mt-1">
                    {roleLabels[user?.role || '']}
                  </Badge>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#c9cbcf] hover:bg-[#18191b]"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#ff3621] hover:bg-[#18191b]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}