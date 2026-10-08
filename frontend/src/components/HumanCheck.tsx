'use client';

import { useRef, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: any;
  }
}

// Falls back to Cloudflare's always-pass test key so the widget works out of
// the box. Replace with a real site key (dash.cloudflare.com) in production.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export function HumanCheck({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () =>
      new Promise<void>((resolve) => {
        if (window.turnstile) return resolve();
        const existing = document.getElementById('cf-turnstile-script');
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          return;
        }
        const s = document.createElement('script');
        s.id = 'cf-turnstile-script';
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.onload = () => resolve();
        document.head.appendChild(s);
      });

    load().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (containerRef.current.dataset.rendered === 'true') return;
      containerRef.current.dataset.rendered = 'true';
      window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: (value: string) => {
          setToken(value);
          onToken(value);
        },
        'expired-callback': () => {
          setToken(null);
          onToken('');
        },
        'error-callback': () => {
          setToken(null);
          onToken('');
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [onToken]);

  return (
    <div className="rounded-lg border border-[#303236] bg-[#0c0d0d] p-3">
      <div ref={containerRef} />
      {token && (
        <p className="mt-2 text-xs text-[#00e599] flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          Human verification passed
        </p>
      )}
    </div>
  );
}