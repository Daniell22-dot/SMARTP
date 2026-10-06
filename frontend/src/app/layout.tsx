import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geistmono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://tuiyabelong.com'),
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
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-black font-sans antialiased text-white">
        <AuthProvider>
          {children}
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