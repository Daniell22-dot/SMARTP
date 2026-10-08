import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CookieBanner } from '@/components/CookieBanner';
import { SWRegister } from '@/components/SWRegister';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrainsmono' });

export const metadata: Metadata = {
  title: {
    default: 'Tuiyabelong',
    template: '%s | Tuiyabelong',
  },
  description: 'Complete rental property management for landlords and tenants in Kenya. M-Pesa payments, maintenance tracking, financial reports.',
  keywords: ['rental', 'property management', 'landlord', 'tenant', 'payments', 'maintenance', 'M-Pesa', 'Kenya'],
  authors: [{ name: 'Tuiyabelong' }],
  creator: 'Tuiyabelong',
  publisher: 'Tuiyabelong',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  applicationName: 'Tuiyabelong',
  appleWebApp: {
    capable: true,
    title: 'Tuiyabelong',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-black font-sans antialiased text-white">
        <AuthProvider>
          {children}
          <CookieBanner />
          <SWRegister />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#18191b',
                color: '#ffffff',
                borderRadius: '0.25rem',
                padding: '1rem',
                border: '1px solid #303236',
              },
              success: {
                iconTheme: {
                  primary: '#00e599',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff3621',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}