import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBikeBySlug, getAllBikeSlugs } from '@/lib/bikes'
import { SITE_URL } from '@/lib/constants'
import { GarageClient } from './GarageClient'

interface Props {
  params: { bike: string }
}

// ─── Static generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllBikeSlugs().map(slug => ({ bike: slug }))
}

// ─── Per-bike metadata ────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bike = getBikeBySlug(params.bike)
  if (!bike) return {}

  return {
    title: `${bike.name} Service Schedule`,
    description: `Complete maintenance schedule for the Royal Enfield ${bike.name}. Oil change intervals, valve clearance specs, torque values, and part numbers.`,
    openGraph: {
      title: `${bike.name} — Maintenance Schedule | Redditch`,
      description: `Service intervals, torque specs, and part numbers for the Royal Enfield ${bike.name}.`,
      images: [
        {
          url: `${SITE_URL}/${params.bike}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Royal Enfield ${bike.name} service schedule`,
        },
      ],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BikePage({ params }: Props) {
  const bike = getBikeBySlug(params.bike)
  if (!bike) notFound()
  return <GarageClient bike={bike} />
}
