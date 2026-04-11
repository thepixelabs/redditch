import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
import { z } from 'zod'
import type { BulletinData } from './types'

/**
 * Custom YAML schema: force all scalars to parse as strings, not auto-typed
 * into Date/number. This avoids the js-yaml "timestamp" auto-conversion that
 * turns `2026-04-10` into a Date object — we always want ISO strings here.
 */
const parseYaml = (src: string) =>
  yaml.load(src, { schema: yaml.CORE_SCHEMA })

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const BulletinFeaturedSchema = z.object({
  title: z.string(),
  lede: z.string(),
  author: z.string().optional(),
  published: z.string(),
  tag: z.string().optional(),
  href: z.string().optional(),
})

const BulletinEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['event', 'technical', 'article', 'changelog', 'announcement']),
  title: z.string(),
  body: z.string(),
  date: z.string(),
  pinned: z.boolean().optional(),
  author: z.string().optional(),
  source: z.string().optional(),
  source_url: z.string().optional(),
  location: z.string().optional(),
  tag: z.string().optional(),
  href: z.string().optional(),
})

const BulletinDataSchema = z.object({
  featured: BulletinFeaturedSchema.optional(),
  entries: z.array(BulletinEntrySchema),
})

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reads /data/bulletin.yaml at build time and returns the typed bulletin board
 * dataset. Entries are sorted: pinned first, then reverse-chronological by date.
 *
 * Called only at build time (static export), so the file read is zero-cost
 * at runtime — the data is serialised into the page bundle.
 */
export function getBulletinData(): BulletinData {
  const path = join(process.cwd(), 'data', 'bulletin.yaml')
  const raw = readFileSync(path, 'utf-8')
  const parsed = parseYaml(raw)
  const result = BulletinDataSchema.safeParse(parsed)

  if (!result.success) {
    throw new Error(
      `Invalid bulletin data in data/bulletin.yaml:\n${result.error.toString()}`
    )
  }

  const data = result.data

  // Sort: pinned first, then most recent date first
  const sortedEntries = [...data.entries].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.date.localeCompare(a.date)
  })

  return {
    featured: data.featured,
    entries: sortedEntries,
  }
}

/**
 * Returns only the most recent N entries, for the homepage widget / garage
 * sidebar. Sort rules from getBulletinData() apply.
 */
export function getBulletinPreview(count = 4): BulletinData {
  const full = getBulletinData()
  return {
    featured: full.featured,
    entries: full.entries.slice(0, count),
  }
}
