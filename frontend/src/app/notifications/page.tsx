'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Bell, BellRing, Check, Loader2 } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string | null;
  notification_type: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await apiClient.get<Notification[]>('/notifications?limit=50');
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#00e599]" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-16 text-center">
        <Bell className="h-16 w-16 mx-auto text-[#61646b] mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Notifications</h2>
        <p className="text-[#94979e]">You're all caught up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <Card key={n.id} className={n.is_read ? 'opacity-70' : ''}>
          <CardContent className="flex items-start gap-4 p-5">
            <div
              className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                n.is_read ? 'bg-[#18191b] text-[#61646b]' : 'bg-[#00e599]/10 text-[#00e599]'
              }`}
            >
              {n.is_read ? <Bell className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-medium text-white">{n.title}</h3>
                {!n.is_read && <Badge variant="success">New</Badge>}
              </div>
              {n.message && <p className="mt-1 text-sm text-[#94979e] leading-relaxed">{n.message}</p>}
              <div className="mt-2 flex items-center gap-3">
                {n.created_at && (
                  <span className="text-xs text-[#61646b]">{formatDate(n.created_at)}</span>
                )}
                {n.notification_type && (
                  <span className="font-mono text-caps uppercase tracking-widest text-[#61646b]">
                    {n.notification_type}
                  </span>
                )}
              </div>
            </div>
            {!n.is_read && (
              <button
                onClick={() => markAsRead(n.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#303236] text-[#94979e] transition-colors hover:border-[#00e599] hover:text-[#00e599]"
                aria-label="Mark as read"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}