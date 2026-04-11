/**
 * fetch-dealers.ts — Scrape Royal Enfield dealer data from official sources + OSM
 *
 * Data sources:
 *   1. locate-us.royalenfield.com (ROE — worldwide excluding India/US)
 *      - Fetches a country page to extract all ~700 map markers (lat/lng/id)
 *      - Batch-fetches /ajax/card/{id} for details (name, address, phone, etc.)
 *   2. dealers.royalenfield.com (India)
 *      - Extracts embedded Next.js/React JSON with dealer data from page source
 *   3. Overpass API (OSM — worldwide, as fallback/supplement)
 *
 * Output:
 *   - data/dealers/scraped.json  — raw combined results (committed to repo)
 *
 * Run:
 *   npx tsx scripts/fetch-dealers.ts
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'

const root = resolve(process.cwd())
const outDir = join(root, 'data/dealers')

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScrapedDealer {
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
  source: 're-official' | 'osm'
}

interface ROEMarker {
  id: number
  lat: number
  lng: number
  url: string
  visible: boolean
}

interface SchemaOrgStore {
  '@type': string
  '@id'?: string
  name?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressCountry?: string
    postalCode?: string
  }
  geo?: {
    latitude?: number
    longitude?: number
  }
  telephone?: string
  url?: string
}

interface OverpassElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags: Record<string, string>
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent': 'Redditch/1.0 (https://redditch.pixelabs.net; open-source RE service manual)',
  'Accept': 'text/html,application/json',
}

/** Fetch with timeout and retries */
async function robustFetch(
  url: string,
  opts: RequestInit = {},
  { timeoutMs = 30_000, retries = 2, retryDelay = 3_000 } = {}
): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...opts,
        headers: { ...DEFAULT_HEADERS, ...(opts.headers as Record<string, string> ?? {}) },
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (res.ok) return res
      if (res.status === 429 || res.status >= 500) {
        const backoff = res.status === 429 ? retryDelay * (attempt + 1) * 3 : retryDelay * (attempt + 1)
        console.warn(`  HTTP ${res.status} from ${url}, retry ${attempt + 1}/${retries} after ${backoff}ms`)
        if (attempt < retries) await sleep(backoff)
        continue
      }
      // 4xx (not 429) — no point retrying
      console.warn(`  HTTP ${res.status} from ${url}, not retrying`)
      return null
    } catch (err) {
      console.warn(`  Error fetching ${url}: ${(err as Error).message}`)
      if (attempt < retries) await sleep(retryDelay * (attempt + 1))
    }
  }
  return null
}

// ─── Source 1: ROE locate-us (worldwide excl India) ─────────────────────────

const ROE_BASE = 'https://locate-us.royalenfield.com/roe/en'

/**
 * Fetches a single ROE country page and extracts the global markers array.
 * Every country page loads ALL markers for the entire ROE network, so we
 * only need to fetch one page successfully.
 */
async function fetchROEMarkers(): Promise<ROEMarker[]> {
  // Try a few country pages — they all contain the same global marker set
  const tryCountries = ['germany', 'france', 'spain', 'united-kingdom', 'italy']

  for (const country of tryCountries) {
    const url = `${ROE_BASE}/${country}`
    console.log(`  Fetching ROE markers from ${url}...`)
    const res = await robustFetch(url)
    if (!res) continue

    const html = await res.text()

    // Extract markers from window.maps["map"].markers or similar.
    // The markers array is on a single line, so .*? (non-greedy, single-line) works.
    const markersMatch = html.match(/"markers"\s*:\s*(\[.*?\])/)
    if (!markersMatch) {
      console.warn(`  Could not find markers array in ${url}`)
      continue
    }

    try {
      const markers = JSON.parse(markersMatch[1]) as ROEMarker[]
      console.log(`  Found ${markers.length} ROE markers`)
      return markers
    } catch (err) {
      console.warn(`  Failed to parse markers JSON from ${url}:`, (err as Error).message)
      continue
    }
  }

  console.warn('  All ROE country pages failed, no markers extracted')
  return []
}

/**
 * Fetches dealer details from the AJAX card endpoint.
 * Returns a ScrapedDealer or null on failure.
 */
async function fetchROECard(marker: ROEMarker): Promise<ScrapedDealer | null> {
  const url = `${ROE_BASE}/ajax/card/${marker.id}`
  const res = await robustFetch(url, {}, { timeoutMs: 15_000, retries: 1, retryDelay: 1_000 })
  if (!res) return null

  const html = await res.text()

  // Extract JSON-LD schema.org Store data
  const ldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)
  let name: string | undefined
  let address: string | undefined
  let city: string | undefined
  let country: string | undefined
  let phone: string | undefined
  let website: string | undefined

  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]) as SchemaOrgStore
      name = ld.name
      if (ld.address) {
        address = ld.address.streetAddress
        city = ld.address.addressLocality
        country = ld.address.addressCountry
      }
      phone = ld.telephone
      // ld.url is the store-locator page URL, not the dealer's own site.
      // We extract the dealer website from the HTML below instead.
    } catch {
      // Fall through to HTML parsing
    }
  }

  // Extract dealer's own website (linked from icon-website element)
  const websiteMatch =
    html.match(/icon-website[\s\S]*?href="(https?:\/\/(?!locate-us\.royalenfield)[^"]+)"/) ||
    html.match(/href="(https?:\/\/(?!locate-us\.royalenfield|maps\.google|facebook|instagram|twitter|youtube|google\.com|googletagmanager)[^"]+)"[^>]*data-tracking/)
  if (websiteMatch) {
    website = websiteMatch[1]
  }

  // Fallback: extract name from HTML if JSON-LD failed
  if (!name) {
    const nameMatch = html.match(/<h[23][^>]*class="[^"]*card-title[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/h[23]>/i)
      || html.match(/<h[23][^>]*>\s*([\s\S]*?)\s*<\/h[23]>/i)
    if (nameMatch) {
      name = nameMatch[1].replace(/<[^>]+>/g, '').trim()
    }
  }

  // Extract opening hours from HTML
  let openingHours: string | undefined
  const hoursMatches = html.matchAll(
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^<]*?(\d{1,2}:\d{2})\s*(?:to|-)\s*(\d{1,2}:\d{2})/gi
  )
  const hoursArr = Array.from(hoursMatches)
  if (hoursArr.length > 0) {
    // Simplify: take the first weekday hours as representative
    const firstHour = hoursArr[0]
    if (firstHour) {
      openingHours = `${firstHour[1]}-${firstHour[2]}`
    }
  }

  if (!name) {
    name = 'Royal Enfield Dealer'
  }

  return {
    id: `re-roe-${marker.id}`,
    name,
    lat: marker.lat,
    lng: marker.lng,
    address,
    city,
    country,
    phone,
    website,
    openingHours,
    source: 're-official',
  }
}

/**
 * Fetches all ROE dealers by extracting markers, then batch-fetching details.
 * Uses concurrency control to avoid overwhelming the server.
 */
async function fetchROEDealers(): Promise<ScrapedDealer[]> {
  console.log('\n=== Source 1: ROE (locate-us.royalenfield.com) ===')
  const markers = await fetchROEMarkers()
  if (markers.length === 0) return []

  console.log(`  Fetching details for ${markers.length} dealers (batches of 5, 3s delay)...`)
  const dealers: ScrapedDealer[] = []
  const BATCH_SIZE = 5
  const BATCH_DELAY = 3_000 // ms between batches — RE rate-limits aggressively

  for (let i = 0; i < markers.length; i += BATCH_SIZE) {
    const batch = markers.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map((m) => fetchROECard(m)))
    for (const d of results) {
      if (d) dealers.push(d)
    }

    const progress = Math.min(i + BATCH_SIZE, markers.length)
    if (progress % 100 === 0 || progress === markers.length) {
      console.log(`  ... ${progress}/${markers.length} fetched (${dealers.length} successful)`)
    }

    if (i + BATCH_SIZE < markers.length) {
      await sleep(BATCH_DELAY)
    }
  }

  // Log per-country counts
  const byCo = new Map<string, number>()
  for (const d of dealers) {
    byCo.set(d.country ?? 'Unknown', (byCo.get(d.country ?? 'Unknown') ?? 0) + 1)
  }
  console.log(`  ROE totals: ${dealers.length} dealers across ${byCo.size} countries`)
  for (const [co, n] of [...byCo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`    ${co}: ${n}`)
  }

  return dealers
}

// ─── Source 2: India (dealers.royalenfield.com) ─────────────────────────────

/**
 * Fetches India dealer data from dealers.royalenfield.com.
 * The page embeds all dealer data as server-rendered JSON.
 */
async function fetchIndiaDealers(): Promise<ScrapedDealer[]> {
  console.log('\n=== Source 2: India (dealers.royalenfield.com) ===')
  const url = 'https://dealers.royalenfield.com/'
  const res = await robustFetch(url, {}, { timeoutMs: 30_000 })
  if (!res) {
    console.warn('  Failed to fetch India dealer page')
    return []
  }

  const html = await res.text()
  console.log(`  Page size: ${(html.length / 1024).toFixed(0)} KB`)

  // Strategy 1: Parse __NEXT_DATA__ script tag (most reliable)
  const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1])
      const storeData = nextData?.props?.pageProps?.storeData?.cityStateMap
      if (storeData && typeof storeData === 'object') {
        return parseIndiaCityStateMap(storeData)
      }
      console.warn('  __NEXT_DATA__ found but no cityStateMap inside')
    } catch (err) {
      console.warn('  Failed to parse __NEXT_DATA__:', (err as Error).message)
    }
  }

  // Strategy 2: Extract individual dealer records via regex fallback
  console.log('  Trying regex fallback for India dealers...')
  const dealers: ScrapedDealer[] = []
  const entries = html.matchAll(
    /\{"name":"([^"]+)"[^}]*?"latitude":"([^"]+)","longitude":"([^"]+)"[^}]*?"phoneNumber":"([^"]*)"[^}]*?"address":"([^"]*)"[^}]*?"city":"([^"]*)"/g
  )

  let count = 0
  for (const m of entries) {
    const lat = parseFloat(m[2])
    const lng = parseFloat(m[3])
    if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) continue

    dealers.push({
      id: `re-in-${count++}`,
      name: m[1],
      lat,
      lng,
      phone: m[4] || undefined,
      address: m[5] || undefined,
      city: m[6] || undefined,
      country: 'IN',
      source: 're-official',
    })
  }

  if (dealers.length > 0) {
    console.log(`  Extracted ${dealers.length} India dealers via regex fallback`)
    return dealers
  }

  console.warn('  Could not extract any India dealer data')
  return []
}

function parseIndiaCityStateMap(cityStateMap: Record<string, Record<string, unknown[]>>): ScrapedDealer[] {
  const dealers: ScrapedDealer[] = []
  let count = 0

  for (const [state, cities] of Object.entries(cityStateMap)) {
    for (const [city, entries] of Object.entries(cities)) {
      if (!Array.isArray(entries)) continue

      for (const entry of entries) {
        const d = entry as Record<string, unknown>
        const lat = parseFloat(String(d.latitude ?? ''))
        const lng = parseFloat(String(d.longitude ?? ''))
        if (!isFinite(lat) || !isFinite(lng)) continue
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue

        const name = String(d.name ?? 'Royal Enfield')
        const phone = d.phoneNumber ? String(d.phoneNumber) : undefined
        const address = d.address ? String(d.address) : undefined
        const dealerType = d.type ? String(d.type) : undefined

        // Build opening hours from operation hours if available
        let openingHours: string | undefined
        const hours = d.dealerOperationHours as Record<string, string> | undefined
        if (hours?.mondayOpenTime && hours?.mondayCloseTime) {
          openingHours = `Mo-Sa ${hours.mondayOpenTime}-${hours.mondayCloseTime}`
        }

        dealers.push({
          id: `re-in-${count++}`,
          name: dealerType ? `${name} (${dealerType})` : name,
          lat,
          lng,
          phone,
          address,
          city,
          country: 'IN',
          openingHours,
          source: 're-official',
        })
      }
    }
  }

  console.log(`  Parsed ${dealers.length} India dealers from cityStateMap`)
  return dealers
}

// ─── Source 3: Overpass API (OSM worldwide) ──────────────────────────────────

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

async function fetchOSMDealers(): Promise<ScrapedDealer[]> {
  console.log('\n=== Source 3: Overpass API (OSM worldwide) ===')
  const body = `data=${encodeURIComponent(GLOBAL_QUERY)}`

  for (const endpoint of OVERPASS_ENDPOINTS) {
    console.log(`  Trying ${endpoint}...`)
    const res = await robustFetch(
      endpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
      { timeoutMs: 120_000 }
    )

    if (!res) continue

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('json')) {
      console.warn(`  Non-JSON response from ${endpoint}, trying next`)
      continue
    }

    const json = (await res.json()) as { elements?: OverpassElement[] }
    if (!Array.isArray(json.elements)) {
      console.warn(`  No elements array from ${endpoint}, trying next`)
      continue
    }

    console.log(`  Got ${json.elements.length} elements from Overpass`)

    const dealers: ScrapedDealer[] = json.elements
      .map((el): ScrapedDealer | null => {
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
      .filter((d): d is ScrapedDealer => d !== null)

    console.log(`  OSM: ${dealers.length} dealers parsed`)
    return dealers
  }

  console.warn('  All Overpass endpoints failed')
  return []
}

// ─── Deduplication ──────────────────────────────────────────────────────────

/**
 * Haversine distance between two points in metres.
 * Used for proximity-based deduplication.
 */
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000 // Earth radius in metres
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Deduplicate dealers by proximity. If two dealers are within `thresholdM`
 * of each other, prefer 're-official' > 'curated' > 'osm'.
 */
function dedup(dealers: ScrapedDealer[], thresholdM = 500): ScrapedDealer[] {
  const sourcePriority: Record<string, number> = {
    're-official': 0,
    curated: 1,
    osm: 2,
  }

  // Sort by source priority so higher-priority sources come first
  const sorted = [...dealers].sort(
    (a, b) => (sourcePriority[a.source] ?? 9) - (sourcePriority[b.source] ?? 9)
  )

  const result: ScrapedDealer[] = []
  const used = new Set<number>()

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue

    const d = sorted[i]
    result.push(d)

    // Mark nearby duplicates as used
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue
      const dist = haversineM(d.lat, d.lng, sorted[j].lat, sorted[j].lng)
      if (dist < thresholdM) {
        used.add(j)
      }
    }
  }

  return result
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(outDir, { recursive: true })

  const startTime = Date.now()

  // Fetch from all sources (RE official in sequence, OSM in parallel)
  const roePromise = fetchROEDealers()
  const indiaPromise = fetchIndiaDealers()

  // Start OSM in parallel with the RE sources
  const osmPromise = fetchOSMDealers()

  const [roeDealers, indiaDealers, osmDealers] = await Promise.all([
    roePromise,
    indiaPromise,
    osmPromise,
  ])

  // Combine all sources
  const all = [...roeDealers, ...indiaDealers, ...osmDealers]
  console.log(`\n=== Merge ===`)
  console.log(`  Total before dedup: ${all.length}`)
  console.log(`    RE ROE: ${roeDealers.length}`)
  console.log(`    RE India: ${indiaDealers.length}`)
  console.log(`    OSM: ${osmDealers.length}`)

  const merged = dedup(all)
  console.log(`  After dedup (500m): ${merged.length}`)

  // Per-country stats
  const countries = new Map<string, number>()
  for (const d of merged) {
    const c = d.country ?? 'Unknown'
    countries.set(c, (countries.get(c) ?? 0) + 1)
  }
  const stats = Object.fromEntries(
    [...countries.entries()].sort((a, b) => b[1] - a[1])
  )

  console.log(`\n=== Per-country dealer counts ===`)
  for (const [co, n] of Object.entries(stats)) {
    console.log(`  ${co}: ${n}`)
  }

  // Write output
  const output = {
    scraped_at: new Date().toISOString(),
    total: merged.length,
    sources: {
      re_roe: roeDealers.length,
      re_india: indiaDealers.length,
      osm: osmDealers.length,
    },
    countries: stats,
    dealers: merged,
  }

  const outPath = join(outDir, 'scraped.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\nWrote ${merged.length} dealers to ${outPath}`)
  console.log(`Completed in ${elapsed}s`)
}

main().catch((err) => {
  console.error('fetch-dealers failed:', err)
  process.exit(1)
})
