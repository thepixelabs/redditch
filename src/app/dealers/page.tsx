import type { Metadata } from 'next'
import DealersClient from './DealersClient'

export const metadata: Metadata = {
  title: 'Dealer Finder',
  description: 'Find Royal Enfield dealers and service centers worldwide.',
  openGraph: {
    title: 'Dealer Finder | Redditch',
    description: 'Find Royal Enfield dealers and service centers worldwide.',
  },
}

export default function DealersPage() {
  return <DealersClient />
}
