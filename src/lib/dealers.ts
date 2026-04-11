import type { Dealer, OverpassElement, OverpassResponse } from './types'

// ─── Overpass API ─────────────────────────────────────────────────────────────

// Multiple Overpass mirrors — if the primary is busy/down, try the next.
const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
] as const

// Per-request timeout in ms — prevents hanging on slow/dead endpoints.
const FETCH_TIMEOUT_MS = 15_000

export interface BoundingBox {
  south: number
  north: number
  west: number
  east: number
}

/**
 * Builds an Overpass QL query that finds Royal Enfield motorcycle shops within
 * the given bounding box.
 *
 * We cast a reasonably wide net:
 *  - shop=motorcycle with brand matching "Royal Enfield" (case-insensitive)
 *  - shop=motorcycle with name matching "Royal Enfield" as a fallback
 *
 * `out center body` ensures way/relation results include a centroid so we
 * always have a lat/lon to place on the map.
 */
export function buildOverpassQuery(bounds: BoundingBox): string {
  const { south, west, north, east } = bounds
  const bbox = `${south},${west},${north},${east}`

  // Cast a wide net: any node/way/relation tagged with brand or name
  // matching "Royal Enfield", regardless of shop type. Many OSM entries
  // use shop=motorcycle, but some use shop=yes, amenity=motorcycle_dealer,
  // or have no shop tag at all — just brand.
  return `
[out:json][timeout:25];
(
  nwr["brand"~"Royal.Enfield",i](${bbox});
  nwr["name"~"Royal.Enfield",i]["shop"](${bbox});
);
out center body;
`.trim()
}

/**
 * Resolves the lat/lng for an Overpass element. Nodes carry lat/lon directly;
 * ways and relations carry a `center` object when queried with `out center`.
 * Returns null if neither is present (shouldn't happen in practice, but
 * we guard rather than produce NaN coordinates).
 */
function resolveLatLng(el: OverpassElement): { lat: number; lng: number } | null {
  if (el.lat != null && el.lon != null) {
    return { lat: el.lat, lng: el.lon }
  }
  if (el.center != null) {
    return { lat: el.center.lat, lng: el.center.lon }
  }
  return null
}

/**
 * Converts a single OverpassElement into a Dealer. Returns null when we
 * cannot resolve coordinates — callers filter these out.
 */
function elementToDealer(el: OverpassElement): Dealer | null {
  const coords = resolveLatLng(el)
  if (coords === null) return null

  const tags = el.tags ?? {}

  // Build a human-readable address from OSM address tags when present.
  const addressParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
  ].filter(Boolean)
  const address = addressParts.length > 0 ? addressParts.join(' ') : tags['addr:full']

  return {
    id: `osm-${el.id}`,
    name: tags['name'] ?? tags['brand'] ?? 'Royal Enfield',
    lat: coords.lat,
    lng: coords.lng,
    address,
    city: tags['addr:city'],
    country: tags['addr:country'],
    phone: tags['phone'] ?? tags['contact:phone'],
    website: tags['website'] ?? tags['contact:website'] ?? tags['url'],
    openingHours: tags['opening_hours'],
    source: 'osm',
  }
}

/**
 * Fetches Royal Enfield dealers within a viewport bounding box from the
 * Overpass API. This is a browser-side call — do NOT call from server
 * components or getStaticProps (no Node.js `fetch` polyfill required for
 * Next.js 14 App Router).
 *
 * Returns an empty array on any network or parse error so the map degrades
 * gracefully when Overpass is unavailable.
 */
export async function fetchDealersFromOverpass(bounds: BoundingBox): Promise<Dealer[]> {
  const query = buildOverpassQuery(bounds)
  const body = `data=${encodeURIComponent(query)}`

  // Try each endpoint until one succeeds. The primary server is often
  // overloaded; the mirrors provide redundancy.
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        console.warn(`[dealers] ${endpoint} returned HTTP ${response.status}, trying next`)
        continue
      }

      // Overpass sometimes returns HTML error pages with 200 status.
      // Check content-type before parsing.
      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('json')) {
        console.warn(`[dealers] ${endpoint} returned non-JSON (${contentType}), trying next`)
        continue
      }

      const json = await response.json() as OverpassResponse

      if (!Array.isArray(json.elements)) {
        console.warn('[dealers] Unexpected response shape, trying next')
        continue
      }

      return json.elements
        .map(elementToDealer)
        .filter((d): d is Dealer => d !== null)
    } catch (err) {
      console.warn(`[dealers] ${endpoint} failed:`, err)
      continue
    }
  }

  // All endpoints failed
  console.warn('[dealers] All Overpass endpoints failed')
  return []
}

// ─── Curated Dealers ──────────────────────────────────────────────────────────

/**
 * Mirrors the YAML shape in data/dealers/curated.yaml.
 * Field names follow the YAML snake_case convention.
 */
export interface CuratedDealer {
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

/**
 * Slugifies a dealer name for use as a stable ID. Strips non-alphanumeric
 * characters and lowercases. Not cryptographically unique — duplicate names
 * in the same file will collide, so keep curated entries distinct.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Converts the parsed YAML dealer array into the canonical Dealer shape.
 * Called with data you've already loaded and parsed from YAML — this function
 * is pure and has no I/O, making it straightforward to unit-test.
 */
export function parseCuratedDealers(yamlData: CuratedDealer[]): Dealer[] {
  return yamlData.map(d => ({
    id: `curated-${slugify(d.name)}`,
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

// ─── Merge ────────────────────────────────────────────────────────────────────

/**
 * Merges OSM and curated dealer lists. v1 is a simple concat — curated
 * entries are appended after OSM results so OSM data (which is more likely
 * to be current) appears first in any sorted list.
 *
 * Future: dedup on proximity (within ~50 m) and prefer OSM over curated
 * when the same physical shop appears in both datasets.
 */
export function mergeDealers(osmDealers: Dealer[], curatedDealers: Dealer[]): Dealer[] {
  return [...osmDealers, ...curatedDealers]
}
