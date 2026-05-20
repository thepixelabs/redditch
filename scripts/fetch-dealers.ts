/**
 * fetch-dealers.ts — Fetch Royal Enfield dealers via Google Places API (New)
 *
 * Replaces the legacy HTML scraping of locate-us.royalenfield.com and
 * dealers.royalenfield.com (which constantly hit 429s and broke whenever
 * RE changed their page structure).
 *
 * Strategy:
 *   - Tile the world into ~13 regional bounding boxes
 *   - For each region, call Places Text Search with "Royal Enfield dealer"
 *     biased to the region's rectangle, paginating via nextPageToken
 *   - Deduplicate by Google place.id across regions
 *   - Map to the existing Dealer shape with source='google-places'
 *
 * Output:
 *   - data/dealers/scraped.json  — raw combined results (committed to repo)
 *
 * Env:
 *   - NEXT_PUBLIC_GOOGLE_PLACES_API_KEY  (required)
 *
 * Run:
 *   npx tsx scripts/fetch-dealers.ts            # real run
 *   npx tsx scripts/fetch-dealers.ts --dry-run  # no API calls, log plan only
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
  source: 'google-places'
}

interface BBox {
  south: number
  west: number
  north: number
  east: number
}

interface Region {
  name: string
  bbox: BBox
}

interface PlacesAddressComponent {
  longText?: string
  shortText?: string
  types?: string[]
}

interface PlacesOpeningHours {
  weekdayDescriptions?: string[]
}

interface PlacesLocation {
  latitude?: number
  longitude?: number
}

interface PlacesDisplayName {
  text?: string
  languageCode?: string
}

interface PlacesResult {
  id?: string
  displayName?: PlacesDisplayName
  formattedAddress?: string
  location?: PlacesLocation
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  regularOpeningHours?: PlacesOpeningHours
  addressComponents?: PlacesAddressComponent[]
  types?: string[]
}

interface PlacesResponse {
  places?: PlacesResult[]
  nextPageToken?: string
}

// ─── Config ─────────────────────────────────────────────────────────────────

const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText'

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.regularOpeningHours',
  'places.addressComponents',
  'places.types',
  'nextPageToken',
].join(',')

const TEXT_QUERY = 'Royal Enfield dealer'
const MAX_RESULT_COUNT = 20
const MAX_PAGES_PER_REGION = 3 // Google currently caps at ~60 results total
const REGION_DELAY_MS = 1_000
const PAGE_DELAY_MS = 2_000 // nextPageToken needs a short activation delay
const MAX_RETRIES = 3

const REGIONS: Region[] = [
  { name: 'India-North',  bbox: { south: 24,  west: 68,   north: 36,  east: 90  } },
  { name: 'India-South',  bbox: { south: 8,   west: 68,   north: 24,  east: 90  } },
  { name: 'Europe-West',  bbox: { south: 35,  west: -10,  north: 60,  east: 20  } },
  { name: 'Europe-East',  bbox: { south: 35,  west: 20,   north: 60,  east: 45  } },
  { name: 'UK-Ireland',   bbox: { south: 49,  west: -11,  north: 61,  east: 2   } },
  { name: 'SE-Asia',      bbox: { south: -11, west: 92,   north: 28,  east: 142 } },
  { name: 'Australia-NZ', bbox: { south: -48, west: 110,  north: -10, east: 180 } },
  { name: 'USA',          bbox: { south: 25,  west: -125, north: 49,  east: -66 } },
  { name: 'Canada',       bbox: { south: 42,  west: -140, north: 70,  east: -52 } },
  { name: 'LATAM',        bbox: { south: -55, west: -120, north: 32,  east: -35 } },
  { name: 'Middle-East',  bbox: { south: 12,  west: 34,   north: 42,  east: 63  } },
  { name: 'Africa-North', bbox: { south: 0,   west: -18,  north: 38,  east: 52  } },
  { name: 'Africa-South', bbox: { south: -35, west: 10,   north: 0,   east: 52  } },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!key || key.trim() === '') {
    console.error(
      'ERROR: NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not set.\n' +
      '       Set it in your shell env or GitHub Actions secrets before running.'
    )
    process.exit(1)
  }
  return key
}

/**
 * POST to Places Text Search with exponential backoff on 429/5xx.
 * Returns parsed JSON or null on permanent failure.
 */
async function placesSearchText(
  apiKey: string,
  body: Record<string, unknown>
): Promise<PlacesResponse | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(PLACES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      })

      if (res.ok) {
        return (await res.json()) as PlacesResponse
      }

      const text = await res.text().catch(() => '')

      if (res.status === 429 || res.status >= 500) {
        const backoff = 2_000 * Math.pow(2, attempt)
        console.warn(
          `  HTTP ${res.status} from Places API (attempt ${attempt + 1}/${MAX_RETRIES + 1}), ` +
          `backing off ${backoff}ms. Body: ${text.slice(0, 200)}`
        )
        if (attempt < MAX_RETRIES) {
          await sleep(backoff)
          continue
        }
        return null
      }

      // 4xx (other than 429) — likely a config/auth problem, don't retry
      console.error(`  HTTP ${res.status} from Places API (not retrying): ${text.slice(0, 500)}`)
      return null
    } catch (err) {
      const msg = (err as Error).message
      const backoff = 2_000 * Math.pow(2, attempt)
      console.warn(
        `  Fetch error (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${msg}, ` +
        `backing off ${backoff}ms`
      )
      if (attempt < MAX_RETRIES) {
        await sleep(backoff)
        continue
      }
      return null
    }
  }
  return null
}

/**
 * Extract city (locality) and country (ISO-2) from Places addressComponents.
 */
function extractCityCountry(
  components: PlacesAddressComponent[] | undefined
): { city?: string; country?: string } {
  if (!components) return {}
  let city: string | undefined
  let country: string | undefined

  for (const c of components) {
    const types = c.types ?? []
    if (!city && types.includes('locality')) {
      city = c.longText ?? c.shortText
    } else if (!city && types.includes('postal_town')) {
      city = c.longText ?? c.shortText
    } else if (!city && types.includes('administrative_area_level_2')) {
      city = c.longText ?? c.shortText
    }
    if (!country && types.includes('country')) {
      country = c.shortText ?? c.longText
    }
  }

  return { city, country }
}

/**
 * Collapse weekdayDescriptions (["Monday: 9:00 AM – 6:00 PM", ...]) into a
 * single short string. Matches the existing openingHours field convention.
 */
function formatOpeningHours(oh: PlacesOpeningHours | undefined): string | undefined {
  const days = oh?.weekdayDescriptions
  if (!days || days.length === 0) return undefined
  return days.join('; ')
}

function mapPlaceToDealer(place: PlacesResult): ScrapedDealer | null {
  const id = place.id
  const lat = place.location?.latitude
  const lng = place.location?.longitude
  if (!id || lat == null || lng == null) return null
  if (!isFinite(lat) || !isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null

  const { city, country } = extractCityCountry(place.addressComponents)

  return {
    id: `google-${id}`,
    name: place.displayName?.text ?? 'Royal Enfield Dealer',
    lat,
    lng,
    address: place.formattedAddress,
    city,
    country,
    phone: place.nationalPhoneNumber ?? place.internationalPhoneNumber,
    website: place.websiteUri,
    openingHours: formatOpeningHours(place.regularOpeningHours),
    source: 'google-places',
  }
}

// ─── Per-region fetch ───────────────────────────────────────────────────────

/**
 * Fetch all pages of Text Search results for a single region, paginated via
 * nextPageToken. Returns raw PlacesResult[] (dedup happens in main).
 */
async function fetchRegion(
  apiKey: string,
  region: Region
): Promise<PlacesResult[]> {
  const results: PlacesResult[] = []
  let pageToken: string | undefined

  for (let page = 0; page < MAX_PAGES_PER_REGION; page++) {
    const body: Record<string, unknown> = {
      textQuery: TEXT_QUERY,
      maxResultCount: MAX_RESULT_COUNT,
      locationBias: {
        rectangle: {
          low:  { latitude: region.bbox.south, longitude: region.bbox.west },
          high: { latitude: region.bbox.north, longitude: region.bbox.east },
        },
      },
    }
    if (pageToken) body.pageToken = pageToken

    const res = await placesSearchText(apiKey, body)
    if (!res) {
      console.warn(`  [${region.name}] page ${page + 1}: request failed, stopping region`)
      break
    }

    const places = res.places ?? []
    results.push(...places)
    console.log(`  [${region.name}] page ${page + 1}: ${places.length} place(s)`)

    if (!res.nextPageToken || places.length === 0) break
    pageToken = res.nextPageToken
    await sleep(PAGE_DELAY_MS)
  }

  return results
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  mkdirSync(outDir, { recursive: true })
  const startTime = Date.now()

  console.log('=== Google Places dealer fetch ===')
  console.log(`  Regions:  ${REGIONS.length}`)
  console.log(`  Query:    "${TEXT_QUERY}"`)
  console.log(`  Dry run:  ${dryRun ? 'YES (no API calls)' : 'no'}`)

  if (dryRun) {
    console.log('\n=== Planned requests ===')
    for (const region of REGIONS) {
      console.log(
        `  ${region.name.padEnd(14)} bbox=(` +
        `${region.bbox.south},${region.bbox.west}) → ` +
        `(${region.bbox.north},${region.bbox.east}) ` +
        `×${MAX_PAGES_PER_REGION} pages max`
      )
    }
    console.log(
      `\n  Estimated max requests: ${REGIONS.length * MAX_PAGES_PER_REGION} ` +
      `(~$${(REGIONS.length * MAX_PAGES_PER_REGION * 0.032).toFixed(2)} before free tier)`
    )
    console.log('  Dry run complete — no API calls made, no file written.')
    return
  }

  const apiKey = getApiKey()

  // Fetch each region sequentially (polite to the API, easy rate-limit accounting)
  const byId = new Map<string, ScrapedDealer>()
  let totalRawPlaces = 0
  let totalDuplicates = 0

  for (const region of REGIONS) {
    console.log(`\n--- Region: ${region.name} ---`)
    const places = await fetchRegion(apiKey, region)
    totalRawPlaces += places.length

    let newCount = 0
    let dupCount = 0
    for (const place of places) {
      const dealer = mapPlaceToDealer(place)
      if (!dealer) continue

      if (byId.has(dealer.id)) {
        dupCount++
      } else {
        byId.set(dealer.id, dealer)
        newCount++
      }
    }
    totalDuplicates += dupCount
    console.log(
      `  [${region.name}] +${newCount} new, ${dupCount} dup (running total: ${byId.size})`
    )

    await sleep(REGION_DELAY_MS)
  }

  const dealers = [...byId.values()]

  // ─── Per-country stats ────────────────────────────────────────────────────
  const countries = new Map<string, number>()
  for (const d of dealers) {
    const c = d.country ?? 'Unknown'
    countries.set(c, (countries.get(c) ?? 0) + 1)
  }
  const perCountry = Object.fromEntries(
    [...countries.entries()].sort((a, b) => b[1] - a[1])
  )

  console.log('\n=== Summary ===')
  console.log(`  Raw places returned: ${totalRawPlaces}`)
  console.log(`  Cross-region dupes:  ${totalDuplicates}`)
  console.log(`  Unique dealers:      ${dealers.length}`)
  console.log(`  Countries:           ${Object.keys(perCountry).length}`)
  console.log('\n=== Per-country dealer counts (top 20) ===')
  for (const [co, n] of Object.entries(perCountry).slice(0, 20)) {
    console.log(`  ${co}: ${n}`)
  }

  // ─── Validate before writing ──────────────────────────────────────────────
  const invalid = dealers.filter(
    (d) => !d.id || !d.name || !isFinite(d.lat) || !isFinite(d.lng)
  )
  if (invalid.length > 0) {
    console.error(`ERROR: ${invalid.length} dealer(s) failed validation, aborting write`)
    process.exit(1)
  }

  // ─── Write output ─────────────────────────────────────────────────────────
  const output = {
    scraped_at: new Date().toISOString(),
    fetchedAt: new Date().toISOString(), // alias — easier to grep for
    source: 'google-places',
    total: dealers.length,
    sources: {
      google_places: dealers.length,
    },
    perCountry,
    countries: perCountry, // legacy alias for compatibility with build-dealers
    regions: REGIONS.map((r) => r.name),
    dealers,
  }

  const outPath = join(outDir, 'scraped.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\nWrote ${dealers.length} dealers to ${outPath}`)
  console.log(`Completed in ${elapsed}s`)
}

main().catch((err) => {
  console.error('fetch-dealers failed:', err)
  process.exit(1)
})
