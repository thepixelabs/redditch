import type { Metadata, Viewport } from 'next'
import { Zilla_Slab, Inter, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SplashScreen } from '@/components/splash/SplashScreen'
import { SITE_URL } from '@/lib/constants'

// ─── Fonts ────────────────────────────────────────────────────────────────────

const fontDisplay = Zilla_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Redditch',
    default: 'Redditch — Royal Enfield Service Tracker',
  },
  description:
    'Free, offline-ready service interval tracker for Royal Enfield motorcycles. Torque specs, part numbers, oil types — for every model.',
  keywords: [
    'Royal Enfield',
    'motorcycle maintenance',
    'service interval',
    'torque specs',
    'Interceptor 650',
    'Classic 350',
    'Bulleteers',
  ],
  authors: [{ name: 'Redditch Contributors' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Redditch',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Redditch — Royal Enfield Service Tracker',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Redditch',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#B5121B',
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * FOUC prevention — inline script runs synchronously before paint.
         * Reads the persisted theme preference and applies the .dark class
         * before React has a chance to hydrate, preventing a flash.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('redditch:theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />

        {/* Apple PWA icons */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Apple splash screens — iPhone 14 Pro / 14 Pro Max */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1284x2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />

        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>

      <body
        className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} antialiased`}
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
      >
        {/* Skip nav — visible on focus for keyboard / screen reader users */}
        <a href="#main-content" className="skip-nav">
          Skip to service schedule
        </a>

        <SplashScreen />
        <Header />

        <main id="main-content" role="main">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
