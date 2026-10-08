'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

interface ConsentChoices {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_KEY = 'rms_cookie_consent';

function saveConsent(choices: ConsentChoices) {
  const data = { necessary: true, ...choices, ts: Date.now() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(JSON.stringify(data))}; max-age=31536000; path=/; SameSite=Lax`;
  } catch {
    // Storage unavailable — the banner is non-blocking
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [choices, setChoices] = useState<ConsentChoices>({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }

    const reopen = () => {
      setVisible(true);
      setCustomizing(true);
    };
    window.addEventListener('open-cookie-settings', reopen);
    return () => window.removeEventListener('open-cookie-settings', reopen);
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    saveConsent({ preferences: true, analytics: true, marketing: true });
    setVisible(false);
  };

  const rejectAll = () => {
    saveConsent({ preferences: false, analytics: false, marketing: false });
    setVisible(false);
  };

  const saveCustomized = () => {
    saveConsent(choices);
    setVisible(false);
  };

  const toggle = (key: keyof ConsentChoices) =>
    setChoices((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4" role="dialog" aria-label="Cookie preferences">
      <div className="mx-auto max-w-3xl rounded-lg border border-[#303236] bg-[#0c0d0d] p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-[#00e599] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[#c9cbcf]">
                We use cookies and similar technologies on Tuiyabelong to keep the platform secure and
                working, and (with your permission) to remember your preferences. We never sell your data.
                Read our{' '}
                <Link href="/privacy" onClick={() => setVisible(false)} className="text-[#00e599] underline underline-offset-2 hover:text-white">
                  Privacy Policy
                </Link>
                .
              </p>

              {customizing ? (
                <div className="space-y-2 pt-1">
                  <ToggleRow label="Necessary" description="Required for the platform to function (sessions, security)." checked disabled />
                  <ToggleRow label="Preferences" description="Remembers your choices, e.g. language and theme." checked={choices.preferences} onChange={() => toggle('preferences')} />
                  <ToggleRow label="Analytics" description="Helps us understand how the platform is used so we can improve it." checked={choices.analytics} onChange={() => toggle('analytics')} />
                  <ToggleRow label="Marketing" description="Lets us show you relevant product updates." checked={choices.marketing} onChange={() => toggle('marketing')} />
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              {customizing ? (
                <>
                  <button onClick={rejectAll} className="rounded-full px-3 py-2 text-sm text-[#94979e] hover:text-white">
                    Reject all
                  </button>
                  <button onClick={saveCustomized} className="rounded-full border border-[#00e599] px-4 py-2 text-sm font-medium text-[#00e599] hover:bg-[#00e599]/10">
                    Save preferences
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setCustomizing(true)} className="rounded-full px-3 py-2 text-sm text-[#94979e] hover:text-white">
                    Customize
                  </button>
                  <button onClick={rejectAll} className="rounded-full border border-[#303236] px-4 py-2 text-sm font-medium text-[#c9cbcf] hover:bg-[#18191b]">
                    Reject non-essential
                  </button>
                  <button onClick={acceptAll} className="rounded-full bg-[#00e599] px-4 py-2 text-sm font-medium text-black hover:bg-[#00cc88]">
                    Accept all
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded border border-[#303236] px-3 py-2">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-[#797d86]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
        className={
          disabled
            ? 'h-5 w-9 rounded-full bg-[#303236] cursor-not-allowed'
            : `h-5 w-9 rounded-full transition-colors ${checked ? 'bg-[#00e599]' : 'bg-[#303236]'}`
        }
      >
        <span
          className={`block h-4 w-4 rounded-full bg-black transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}