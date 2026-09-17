import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Rental Management System (RMS)',
    template: '%s | RMS',
  },
  description: 'Complete rental property management for landlords and tenants in Kenya. M-Pesa payments, maintenance tracking, financial reports.',
  keywords: ['rental', 'property management', 'landlord', 'tenant', 'payments', 'maintenance', 'M-Pesa', 'Kenya'],
  authors: [{ name: 'RMS Team' }],
  creator: 'RMS',
  publisher: 'RMS',
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
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://tuiyabelong.com',
    siteName: 'Rental Management System',
    title: 'Rental Management System (RMS)',
    description: 'Complete rental property management for landlords and tenants in Kenya',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RMS Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rental Management System (RMS)',
    description: 'Complete rental property management for landlords and tenants',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#18181b' },
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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#18181b',
                color: '#fafafa',
                borderRadius: '0.75rem',
                padding: '1rem',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fafafa',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fafafa',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}