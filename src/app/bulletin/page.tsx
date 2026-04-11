import type { Metadata } from 'next'
import { getBulletinData } from '@/lib/bulletin'
import { BulletinBoard } from '@/components/bulletin/BulletinBoard'
import { BulletinHero } from '@/components/bulletin/BulletinHero'

export const metadata: Metadata = {
  title: 'Bulletin Board',
  description:
    'Community notices, technical service bulletins, upcoming rides, and data updates from the Redditch Royal Enfield community.',
  openGraph: {
    title: 'Bulletin Board — Redditch',
    description:
      'Community notices, technical service bulletins, upcoming rides, and data updates.',
  },
}

export default function BulletinPage() {
  const data = getBulletinData()

  return (
    <div className="garage-wall" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* Hero intro */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 72px) clamp(20px, 3vw, 40px) clamp(24px, 3vw, 40px)',
        }}
      >
        <p
          className="stamp"
          style={{ display: 'inline-block', marginBottom: '16px' }}
        >
          Community Notice Board
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '0.01em',
            lineHeight: 1.1,
            color: 'var(--re-cream)',
            margin: '0 0 16px',
          }}
        >
          Bulletin Board
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            maxWidth: '62ch',
            margin: '0 0 clamp(24px, 3vw, 40px)',
          }}
        >
          Upcoming rides, technical service bulletins, community events, and
          updates to the dataset. Pinned by date — most recent on top. Every
          entry is sourced.
        </p>

        <BulletinHero />
      </div>

      <BulletinBoard data={data} mode="full" />
    </div>
  )
}
