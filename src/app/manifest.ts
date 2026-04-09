import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Redditch — Royal Enfield Service Tracker',
    short_name: 'Redditch',
    description:
      'Know exactly when your Royal Enfield needs service. Offline-ready torque specs, part numbers, and service intervals.',
    start_url: '/?source=pwa',
    display: 'standalone',
    background_color: '#1A1A1A',
    theme_color: '#B5121B',
    orientation: 'portrait-primary',
    categories: ['utilities', 'automotive'],
    icons: [
      { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
      { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
