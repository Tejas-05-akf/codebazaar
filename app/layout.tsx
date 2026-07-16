import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminModeBanner } from '@/components/layout/AdminModeBanner';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeBazaar | Premium Marketplace for Websites & Business Solutions',
  description: 'Discover premium websites, SaaS templates, dashboards, CRMs and business solutions built for Indian businesses. Buy once, customize forever.',
  keywords: 'code marketplace, Indian marketplace, website templates, SaaS templates, CRM, business solutions, developer tools, Indian businesses',
  authors: [{ name: 'CodeBazaar' }],
  creator: 'CodeBazaar',
  publisher: 'CodeBazaar',
  metadataBase: new URL('https://codebazaar.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://codebazaar.in',
    siteName: 'CodeBazaar',
    title: 'CodeBazaar | Premium Marketplace for Websites & Business Solutions',
    description: 'Discover premium websites, SaaS templates, dashboards, CRMs and business solutions built for Indian businesses.',
    images: [
      {
        url: 'https://codebazaar.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CodeBazaar - Premium Marketplace for Indian Businesses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeBazaar | Premium Marketplace for Websites & Business Solutions',
    description: 'Discover premium websites, SaaS templates, dashboards, CRMs and business solutions built for Indian businesses.',
    site: '@codebazaar_in',
    creator: '@codebazaar_in',
    images: ['https://codebazaar.in/og-image.jpg'],
  },
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
  verification: {
    google: 'google-site-verification-placeholder',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  category: 'marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="min-h-screen flex flex-col overflow-x-hidden">
              <AdminModeBanner />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
