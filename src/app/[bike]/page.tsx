import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBikeBySlug, getAllBikeSlugs } from '@/lib/bikes'
import { SITE_URL } from '@/lib/constants'
import { GarageClient } from './GarageClient'

interface Props {
  params: Promise<{ bike: string }>
}

// ─── Static generation ────────────────────────────────────────────────────────

// Only allow slugs returned by generateStaticParams. Any other path
// (e.g. /bulletin, /dealers, /about) falls through to its own static route
// instead of being caught by this dynamic [bike] route.
export const dynamicParams = false

export function generateStaticParams() {
  return getAllBikeSlugs().map(slug => ({ bike: slug }))
}

// ─── Per-bike metadata ────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bike: slug } = await params
  const bike = getBikeBySlug(slug)
  if (!bike) return {}

  return {
    title: `${bike.name} Service Schedule`,
    description: `Complete maintenance schedule for the Royal Enfield ${bike.name}. Oil change intervals, valve clearance specs, torque values, and part numbers.`,
    openGraph: {
      title: `${bike.name} — Maintenance Schedule | Redditch`,
      description: `Service intervals, torque specs, and part numbers for the Royal Enfield ${bike.name}.`,
      images: [
        {
          url: `${SITE_URL}/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Royal Enfield ${bike.name} service schedule`,
        },
      ],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BikePage({ params }: Props) {
  const { bike: slug } = await params
  const bike = getBikeBySlug(slug)
  if (!bike) return notFound()
  return <GarageClient bike={bike} />
}
