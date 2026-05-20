import type { Metadata } from 'next'
import { getBulletinData } from '@/lib/bulletin'
import { BulletinBoard } from '@/components/bulletin/BulletinBoard'

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
    <div className="garage-wall bulletin-page" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <BulletinBoard data={data} mode="full" />
    </div>
  )
}
