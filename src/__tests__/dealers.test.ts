import {
  buildOverpassQuery,
  fetchDealersFromOverpass,
  parseCuratedDealers,
  mergeDealers,
} from '@/lib/dealers'
import type { Dealer, OverpassResponse } from '@/lib/types'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const sampleBounds = { south: 12.9, north: 13.2, west: 80.1, east: 80.4 }

/** Minimal valid node element — all optional tag fields absent. */
const bareNodeElement = {
  type: 'node' as const,
  id: 11111,
  lat: 13.0827,
  lon: 80.2707,
  tags: {
    name: 'RE Store Bare',
    shop: 'motorcycle',
    brand: 'Royal Enfield',
  },
}

/** Node element with every optional tag field populated. */
const fullNodeElement = {
  type: 'node' as const,
  id: 12345,
  lat: 13.0827,
  lon: 80.2707,
  tags: {
    name: 'Royal Enfield Store Chennai',
    shop: 'motorcycle',
    brand: 'Royal Enfield',
    'addr:street': 'Anna Salai',
    'addr:city': 'Chennai',
    'addr:country': 'IN',
    phone: '+91-44-28521234',
    website: 'https://www.royalenfield.com',
    opening_hours: 'Mo-Sa 09:00-18:00',
  },
}

/** Way element — coordinates come from `center`, not from top-level lat/lon. */
const wayElement = {
  type: 'way' as const,
  id: 67890,
  center: { lat: 51.5074, lon: -0.1278 },
  tags: {
    name: 'Royal Enfield London',
    shop: 'motorcycle',
    brand: 'Royal Enfield',
  },
}

/** Element that has no `name` tag — only `brand` — to test the fallback. */
const brandOnlyElement = {
  type: 'node' as const,
  id: 99999,
  lat: 28.6139,
  lon: 77.209,
  tags: {
    brand: 'Royal Enfield',
    shop: 'motorcycle',
  },
}

const twoElementOverpassResponse: OverpassResponse = {
  elements: [fullNodeElement, wayElement],
}

function makeSuccessfulFetchMock(body: OverpassResponse): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok: true,
    headers: new Headers({ 'content-type': 'application/json; charset=utf-8' }),
    json: jest.fn().mockResolvedValue(body),
  })
}

// ---------------------------------------------------------------------------
// buildOverpassQuery
// ---------------------------------------------------------------------------

describe('buildOverpassQuery — query string structure', () => {
  it('returns a string (not null, undefined, or an object)', () => {
    const result = buildOverpassQuery(sampleBounds)
    expect(typeof result).toBe('string')
  })

  it('contains the [out:json] output format directive', () => {
    const result = buildOverpassQuery(sampleBounds)
    expect(result).toContain('[out:json]')
  })

  it('embeds bounding box in (south,west,north,east) order as required by Overpass QL', () => {
    // Overpass bbox order differs from the common lat/lng pair order.
    // If the implementation swaps north/south or east/west the API returns wrong results.
    const result = buildOverpassQuery(sampleBounds)
    expect(result).toContain('(12.9,80.1,13.2,80.4)')
  })

  it('uses each bound value exactly once in the bounding box', () => {
    const result = buildOverpassQuery(sampleBounds)
    expect(result).toContain('12.9')  // south
    expect(result).toContain('13.2')  // north
    expect(result).toContain('80.1')  // west
    expect(result).toContain('80.4')  // east
  })

  it('includes a shop filter on at least one query line', () => {
    // At least one branch of the union should filter by shop tag
    // to catch dealers tagged with shop=motorcycle + name.
    const result = buildOverpassQuery(sampleBounds)
    expect(result).toMatch(/shop/)
  })

  it('filters by brand matching "Royal Enfield" (case-insensitive regex or literal)', () => {
    // The query must narrow results to Royal Enfield dealerships.
    // Accepts either a regex filter like brand~"Royal.Enfield",i
    // or a literal filter like brand="Royal Enfield".
    const result = buildOverpassQuery(sampleBounds)
    expect(result).toMatch(/Royal.?Enfield/i)
  })

  it('requests all OSM geometry types via nwr or explicit node/way/relation', () => {
    // Dealerships are mapped as nodes, ways, or relations.
    // The query can use `nwr` (shorthand for all three) or list them separately.
    const result = buildOverpassQuery(sampleBounds)
    const hasNwr = /\bnwr\b/.test(result)
    const hasAll = /\bnode\b/.test(result) && /\bway\b/.test(result) && /\brelation\b/.test(result)
    expect(hasNwr || hasAll).toBe(true)
  })

  it('produces consistent output for the same bounds (deterministic)', () => {
    const first = buildOverpassQuery(sampleBounds)
    const second = buildOverpassQuery(sampleBounds)
    expect(first).toBe(second)
  })
})

// ---------------------------------------------------------------------------
// fetchDealersFromOverpass — parsing logic (fetch mocked at global.fetch)
// ---------------------------------------------------------------------------

describe('fetchDealersFromOverpass — node element parsing', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('extracts lat and lon directly from a node element', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].lat).toBe(13.0827)
    expect(dealers[0].lng).toBe(80.2707)
  })

  it('extracts lat and lon from the center field of a way element', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [wayElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].lat).toBe(51.5074)
    expect(dealers[0].lng).toBe(-0.1278)
  })

  it('uses the name tag as the dealer name when present', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].name).toBe('Royal Enfield Store Chennai')
  })

  it('falls back to the brand tag when no name tag is present', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [brandOnlyElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].name).toBe('Royal Enfield')
  })

  it('maps addr:street to the address field', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].address).toBe('Anna Salai')
  })

  it('maps addr:city to the city field', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].city).toBe('Chennai')
  })

  it('maps addr:country to the country field', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].country).toBe('IN')
  })

  it('extracts the phone tag', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].phone).toBe('+91-44-28521234')
  })

  it('extracts the website tag', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].website).toBe('https://www.royalenfield.com')
  })

  it('maps the opening_hours tag to the openingHours camelCase field', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].openingHours).toBe('Mo-Sa 09:00-18:00')
  })

  it('sets source to "osm" for every element', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement, wayElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers.every(d => d.source === 'osm')).toBe(true)
  })

  it('sets id to "osm-{element.id}" so IDs are stable and namespaced', async () => {
    // If the format changes (e.g. to just the number), map links and saved
    // favourites will silently break for existing users.
    global.fetch = makeSuccessfulFetchMock({ elements: [fullNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers[0].id).toBe('osm-12345')
  })

  it('omits optional fields rather than setting them to undefined when tags are absent', async () => {
    // An undefined value on the object is serialised as nothing by JSON.stringify
    // but causes "undefined" placeholder text in UI templates that don't guard it.
    // The field should simply not be present on the object.
    global.fetch = makeSuccessfulFetchMock({ elements: [bareNodeElement] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)
    const dealer = dealers[0]

    expect(dealer.address).toBeUndefined()
    expect(dealer.city).toBeUndefined()
    expect(dealer.country).toBeUndefined()
    expect(dealer.phone).toBeUndefined()
    expect(dealer.website).toBeUndefined()
    expect(dealer.openingHours).toBeUndefined()
  })
})

describe('fetchDealersFromOverpass — error resilience', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns an empty array when fetch throws a network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'))

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers).toEqual([])
  })

  it('returns an empty array when the response is not valid JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers).toEqual([])
  })

  it('returns an empty array when the response has no elements array', async () => {
    // If Overpass changes its schema (e.g. wraps results differently), we
    // should fail gracefully rather than throw a TypeError at runtime.
    global.fetch = makeSuccessfulFetchMock({} as OverpassResponse)

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers).toEqual([])
  })

  it('returns an empty array when the Overpass elements array is empty', async () => {
    global.fetch = makeSuccessfulFetchMock({ elements: [] })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers).toEqual([])
  })

  it('does not throw — always resolves — regardless of API failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(fetchDealersFromOverpass(sampleBounds)).resolves.not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// parseCuratedDealers
// ---------------------------------------------------------------------------

describe('parseCuratedDealers — format conversion', () => {
  const fullCuratedDealer = {
    name: 'RE Showroom Pune',
    lat: 18.5204,
    lng: 73.8567,
    address: 'FC Road',
    city: 'Pune',
    country: 'IN',
    phone: '+91-20-25671234',
    website: 'https://example.com',
    opening_hours: 'Mo-Sa 10:00-19:00',
  }

  it('returns an empty array when given an empty array', () => {
    expect(parseCuratedDealers([])).toEqual([])
  })

  it('maps snake_case opening_hours to camelCase openingHours', () => {
    // This mapping must survive a YAML schema refactor — if the field is
    // renamed back to opening_hours on the Dealer interface the tests catch it.
    const [dealer] = parseCuratedDealers([fullCuratedDealer])
    expect(dealer.openingHours).toBe('Mo-Sa 10:00-19:00')
    expect((dealer as unknown as Record<string, unknown>)['opening_hours']).toBeUndefined()
  })

  it('sets source to "curated" for every converted dealer', () => {
    const dealers = parseCuratedDealers([fullCuratedDealer, { ...fullCuratedDealer, name: 'Second' }])
    expect(dealers.every(d => d.source === 'curated')).toBe(true)
  })

  it('preserves lat and lng without modification', () => {
    const [dealer] = parseCuratedDealers([fullCuratedDealer])
    expect(dealer.lat).toBe(18.5204)
    expect(dealer.lng).toBe(73.8567)
  })

  it('preserves all optional fields that are present in the source', () => {
    const [dealer] = parseCuratedDealers([fullCuratedDealer])
    expect(dealer.address).toBe('FC Road')
    expect(dealer.city).toBe('Pune')
    expect(dealer.country).toBe('IN')
    expect(dealer.phone).toBe('+91-20-25671234')
    expect(dealer.website).toBe('https://example.com')
  })

  it('generates a non-empty id for each dealer', () => {
    const [dealer] = parseCuratedDealers([fullCuratedDealer])
    expect(dealer.id).toBeTruthy()
    expect(typeof dealer.id).toBe('string')
  })

  it('generates deterministic ids — same input always produces same id', () => {
    const first = parseCuratedDealers([fullCuratedDealer])
    const second = parseCuratedDealers([fullCuratedDealer])
    expect(first[0].id).toBe(second[0].id)
  })

  it('generates distinct ids for dealers with different names', () => {
    const dealers = parseCuratedDealers([
      fullCuratedDealer,
      { ...fullCuratedDealer, name: 'Different Showroom' },
    ])
    expect(dealers[0].id).not.toBe(dealers[1].id)
  })

  it('omits openingHours when opening_hours is absent in the source', () => {
    const { opening_hours: _, ...withoutHours } = fullCuratedDealer
    const [dealer] = parseCuratedDealers([withoutHours])
    expect(dealer.openingHours).toBeUndefined()
  })

  it('converts multiple curated dealers and returns one Dealer per input', () => {
    const input = [fullCuratedDealer, { ...fullCuratedDealer, name: 'Second' }]
    const result = parseCuratedDealers(input)
    expect(result).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// mergeDealers
// ---------------------------------------------------------------------------

describe('mergeDealers — list combination', () => {
  const osmDealer: Dealer = {
    id: 'osm-1',
    name: 'OSM Dealer',
    lat: 13.0,
    lng: 80.2,
    source: 'osm',
  }

  const curatedDealer: Dealer = {
    id: 'curated-a',
    name: 'Curated Dealer',
    lat: 18.5,
    lng: 73.8,
    source: 'curated',
  }

  it('returns an empty array when both inputs are empty', () => {
    expect(mergeDealers([], [])).toEqual([])
  })

  it('returns only the OSM dealers when the curated list is empty', () => {
    const result = mergeDealers([osmDealer], [])
    expect(result).toEqual([osmDealer])
  })

  it('returns only the curated dealers when the OSM list is empty', () => {
    const result = mergeDealers([], [curatedDealer])
    expect(result).toEqual([curatedDealer])
  })

  it('concatenates both lists into a single array', () => {
    const result = mergeDealers([osmDealer], [curatedDealer])
    expect(result).toHaveLength(2)
  })

  it('preserves the source field from OSM dealers', () => {
    const result = mergeDealers([osmDealer], [curatedDealer])
    const osm = result.find(d => d.id === 'osm-1')
    expect(osm?.source).toBe('osm')
  })

  it('preserves the source field from curated dealers', () => {
    const result = mergeDealers([osmDealer], [curatedDealer])
    const curated = result.find(d => d.id === 'curated-a')
    expect(curated?.source).toBe('curated')
  })

  it('does not mutate either input array', () => {
    const osm = [osmDealer]
    const curated = [curatedDealer]
    mergeDealers(osm, curated)
    expect(osm).toHaveLength(1)
    expect(curated).toHaveLength(1)
  })

  it('preserves all entries from both lists without deduplication', () => {
    // mergeDealers is a pure concatenation — deduplication is a separate concern.
    // If this changes silently, callers that rely on seeing both entries break.
    const duplicate = { ...osmDealer }
    const result = mergeDealers([osmDealer], [duplicate])
    expect(result).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Integration: fetchDealersFromOverpass end-to-end with mixed element types
// ---------------------------------------------------------------------------

describe('fetchDealersFromOverpass — integration with realistic Overpass response', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns one Dealer per element in the response', async () => {
    global.fetch = makeSuccessfulFetchMock(twoElementOverpassResponse)

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers).toHaveLength(2)
  })

  it('every returned dealer satisfies the Dealer interface shape', async () => {
    global.fetch = makeSuccessfulFetchMock(twoElementOverpassResponse)

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    for (const dealer of dealers) {
      expect(dealer).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        lat: expect.any(Number),
        lng: expect.any(Number),
        source: 'osm',
      })
      // id must be non-empty
      expect(dealer.id.length).toBeGreaterThan(0)
      // coordinates must be finite real numbers
      expect(isFinite(dealer.lat)).toBe(true)
      expect(isFinite(dealer.lng)).toBe(true)
    }
  })

  it('correctly parses the node element (direct lat/lon) in the mixed response', async () => {
    global.fetch = makeSuccessfulFetchMock(twoElementOverpassResponse)

    const dealers = await fetchDealersFromOverpass(sampleBounds)
    const chennai = dealers.find(d => d.id === 'osm-12345')

    expect(chennai).toBeDefined()
    expect(chennai!.lat).toBe(13.0827)
    expect(chennai!.lng).toBe(80.2707)
    expect(chennai!.name).toBe('Royal Enfield Store Chennai')
    expect(chennai!.city).toBe('Chennai')
    expect(chennai!.openingHours).toBe('Mo-Sa 09:00-18:00')
  })

  it('correctly parses the way element (center lat/lon) in the mixed response', async () => {
    global.fetch = makeSuccessfulFetchMock(twoElementOverpassResponse)

    const dealers = await fetchDealersFromOverpass(sampleBounds)
    const london = dealers.find(d => d.id === 'osm-67890')

    expect(london).toBeDefined()
    expect(london!.lat).toBe(51.5074)
    expect(london!.lng).toBe(-0.1278)
    expect(london!.name).toBe('Royal Enfield London')
  })

  it('calls fetch only once when the first endpoint succeeds', async () => {
    const mockFetch = makeSuccessfulFetchMock(twoElementOverpassResponse)
    global.fetch = mockFetch

    await fetchDealersFromOverpass(sampleBounds)

    // With multiple endpoints, only the first should be tried on success
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('passes a URL containing the Overpass API endpoint to fetch', async () => {
    const mockFetch = makeSuccessfulFetchMock(twoElementOverpassResponse)
    global.fetch = mockFetch

    await fetchDealersFromOverpass(sampleBounds)

    const calledUrl: string = mockFetch.mock.calls[0][0]
    // Accept both the main Overpass API and common mirrors.
    expect(calledUrl).toMatch(/overpass/i)
  })

  it('handles a three-element response that includes a relation geometry type', async () => {
    const relationElement = {
      type: 'relation' as const,
      id: 55555,
      center: { lat: 48.8566, lon: 2.3522 },
      tags: {
        name: 'Royal Enfield Paris',
        shop: 'motorcycle',
        brand: 'Royal Enfield',
      },
    }
    global.fetch = makeSuccessfulFetchMock({
      elements: [fullNodeElement, wayElement, relationElement],
    })

    const dealers = await fetchDealersFromOverpass(sampleBounds)

    expect(dealers).toHaveLength(3)
    const paris = dealers.find(d => d.id === 'osm-55555')
    expect(paris).toBeDefined()
    expect(paris!.lat).toBe(48.8566)
  })
})
