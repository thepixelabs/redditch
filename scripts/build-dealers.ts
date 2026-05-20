import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import yaml from 'js-yaml'
import { join, resolve } from 'path'

const root = resolve(process.cwd())
const curatedPath = join(root, 'data/dealers/curated.yaml')
const scrapedPath = join(root, 'data/dealers/scraped.json')
const outDir = join(root, 'public/dealers')

interface CuratedDealer {
  name: string
  lat: number
  lng: number
  address?: string
  city?: string
  country?: string
  phone?: string
  website?: string
  opening_hours?: string
}

interface CuratedYaml {
  dealers: CuratedDealer[]
}

interface Dealer {
  id: string
  name: string
  lat: number
  lng: number
  address?: string
  city?: string
  country?: string
  phone?: string
  website?: string
  openingHours?: string
  source: 'osm' | 'curated' | 're-official' | 'google-places'
}

interface OverpassElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags: Record<string, string>
}

interface ScrapedJson {
  scraped_at: string
  total: number
  dealers: Dealer[]
}

// ─── Parse curated YAML ──────────────────────────────────────────────────────

function buildCuratedDealers(): Dealer[] {
  const raw = readFileSync(curatedPath, 'utf-8')
  const data = yaml.load(raw) as CuratedYaml

  if (!data?.dealers || !Array.isArray(data.dealers)) {
    console.error('Invalid curated.yaml: missing "dealers" array')
    process.exit(1)
  }

  return data.dealers.map((d) => ({
    id: `curated-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    name: d.name,
    lat: d.lat,
    lng: d.lng,
    address: d.address,
    city: d.city,
    country: d.country,
    phone: d.phone,
    website: d.website,
    openingHours: d.opening_hours,
    source: 'curated' as const,
  }))
}

// ─── Load scraped dealers ───────────────────────────────────────────────────

function loadScrapedDealers(): Dealer[] {
  if (!existsSync(scrapedPath)) {
    console.log('  No scraped.json found, skipping scraped data')
    return []
  }

  try {
    const raw = readFileSync(scrapedPath, 'utf-8')
    const data = JSON.parse(raw) as ScrapedJson

    if (!Array.isArray(data.dealers)) {
      console.warn('  scraped.json has no dealers array')
      return []
    }

    console.log(`  Loaded ${data.dealers.length} scraped dealers (from ${data.scraped_at})`)
    return data.dealers
  } catch (err) {
    console.warn('  Failed to read scraped.json:', (err as Error).message)
    return []
  }
}

function readScrapedAt(): string | null {
  try {
    const raw = readFileSync(scrapedPath, 'utf-8')
    const data = JSON.parse(raw) as ScrapedJson
    return data.scraped_at ?? null
  } catch {
    return null
  }
}

// ─── Fetch ALL RE dealers from Overpass (worldwide) ──────────────────────────

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]

const GLOBAL_QUERY = `
[out:json][timeout:120];
(
  nwr["brand"~"Royal.Enfield",i];
  nwr["name"~"Royal.Enfield",i]["shop"];
);
out center body;
`.trim()

async function fetchGlobalDealers(): Promise<Dealer[]> {
  const body = `data=${encodeURIComponent(GLOBAL_QUERY)}`

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`  Trying ${endpoint}...`)
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(90_000),
      })

      if (!res.ok) {
        console.warn(`  HTTP ${res.status} from ${endpoint}, trying next`)
        continue
      }

      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('json')) {
        console.warn(`  Non-JSON response from ${endpoint}, trying next`)
        continue
      }

      const json = await res.json() as { elements?: OverpassElement[] }
      if (!Array.isArray(json.elements)) {
        console.warn(`  No elements array from ${endpoint}, trying next`)
        continue
      }

      console.log(`  Got ${json.elements.length} elements from Overpass`)

      return json.elements
        .map((el): Dealer | null => {
          const lat = el.lat ?? el.center?.lat
          const lon = el.lon ?? el.center?.lon
          if (lat == null || lon == null) return null

          const tags = el.tags ?? {}
          const addressParts = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean)

          return {
            id: `osm-${el.id}`,
            name: tags['name'] ?? tags['brand'] ?? 'Royal Enfield',
            lat,
            lng: lon,
            address: addressParts.length > 0 ? addressParts.join(' ') : tags['addr:full'],
            city: tags['addr:city'],
            country: tags['addr:country'],
            phone: tags['phone'] ?? tags['contact:phone'],
            website: tags['website'] ?? tags['contact:website'] ?? tags['url'],
            openingHours: tags['opening_hours'],
            source: 'osm' as const,
          }
        })
        .filter((d): d is Dealer => d !== null)
    } catch (err) {
      console.warn(`  Error from ${endpoint}:`, (err as Error).message)
      continue
    }
  }

  console.warn('  All Overpass endpoints failed, using curated data only')
  return []
}

// ─── Haversine distance for deduplication ───────────────────────────────────

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Deduplicate by proximity ────────────────────────────────────────────────

function dedup(dealers: Dealer[]): Dealer[] {
  // Priority: google-places > re-official > curated > osm
  const sourcePriority: Record<string, number> = {
    'google-places': 0,
    're-official': 1,
    curated: 2,
    osm: 3,
  }

  // Sort by source priority so higher-priority sources come first
  const sorted = [...dealers].sort(
    (a, b) => (sourcePriority[a.source] ?? 9) - (sourcePriority[b.source] ?? 9)
  )

  const result: Dealer[] = []
  const used = new Set<number>()

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue

    const d = sorted[i]
    result.push(d)

    // Mark nearby duplicates as used
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue
      const dist = haversineM(d.lat, d.lng, sorted[j].lat, sorted[j].lng)
      if (dist < 50) {
        used.add(j)
      }
    }
  }

  return result
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(outDir, { recursive: true })

  // 1. Build curated dealers
  const curated = buildCuratedDealers()
  console.log(`Curated: ${curated.length} dealer(s)`)
  writeFileSync(join(outDir, 'curated.json'), JSON.stringify(curated, null, 2))

  // 2. Load scraped dealers (from previous fetch-dealers run)
  console.log('Loading scraped dealers...')
  const scraped = loadScrapedDealers()
  console.log(`Scraped: ${scraped.length} dealer(s)`)

  // 3. Fetch global OSM dealers
  console.log('Fetching worldwide RE dealers from Overpass...')
  const osm = await fetchGlobalDealers()
  console.log(`OSM: ${osm.length} dealer(s)`)

  // 4. Merge all sources and deduplicate
  // Priority: google-places > re-official > curated > osm
  const merged = dedup([...scraped, ...curated, ...osm])
  console.log(`After dedup: ${merged.length} dealer(s)`)

  // 5. Write global index
  writeFileSync(join(outDir, 'global.json'), JSON.stringify(merged, null, 2))
  console.log(`\nBuilt → ${join(outDir, 'global.json')}`)

  // 6. Compute country stats
  const countries = new Map<string, number>()
  for (const d of merged) {
    const c = d.country ?? 'Unknown'
    countries.set(c, (countries.get(c) ?? 0) + 1)
  }
  const stats = Object.fromEntries(
    [...countries.entries()].sort((a, b) => b[1] - a[1])
  )
  writeFileSync(join(outDir, 'countries.json'), JSON.stringify(stats, null, 2))
  console.log(`Countries: ${Object.keys(stats).length}`)
  console.log(Object.entries(stats).slice(0, 15).map(([k, v]) => `  ${k}: ${v}`).join('\n'))

  // 7. Freshness meta — read at runtime by DealersClient to gate the map.
  const meta = {
    scraped_at: readScrapedAt(),
    built_at: new Date().toISOString(),
    total: merged.length,
  }
  writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2))
  console.log(`Meta: ${JSON.stringify(meta)}`)
}

main().catch((err) => {
  console.error('build-dealers failed:', err)
  process.exit(1)
})
