import type { MetadataRoute } from 'next'
import { getAllBikeSlugs } from '@/lib/bikes'
import { SITE_URL } from '@/lib/constants'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllBikeSlugs()
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...slugs.map(slug => ({
      url: `${SITE_URL}/${slug}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...slugs.map(slug => ({
      url: `${SITE_URL}/${slug}/mybike/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
