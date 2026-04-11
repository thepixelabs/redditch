import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBikeBySlug, getAllBikeSlugs } from '@/lib/bikes'
import { SITE_URL } from '@/lib/constants'
import { BikeBook } from '@/components/garage/BikeBook'

interface Props {
  params: Promise<{ bike: string }>
}

export function generateStaticParams() {
  return getAllBikeSlugs().map(slug => ({ bike: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bike: slug } = await params
  const bike = getBikeBySlug(slug)
  if (!bike) return {}

  return {
    title: `${bike.name} — My Bike`,
    description: `Complete specifications, service data, torque values, and reference manual for the Royal Enfield ${bike.name}.`,
    openGraph: {
      title: `${bike.name} — Owner's Reference Manual | Redditch`,
      description: `Engine specs, service intervals, torque values, and tyre data for the Royal Enfield ${bike.name}.`,
      images: [
        {
          url: `${SITE_URL}/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Royal Enfield ${bike.name} reference manual`,
        },
      ],
    },
  }
}

export default async function MyBikePage({ params }: Props) {
  const { bike: slug } = await params
  const bike = getBikeBySlug(slug)
  if (!bike) notFound()
  return <BikeBook bike={bike} />
}
