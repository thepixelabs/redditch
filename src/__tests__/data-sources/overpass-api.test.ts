/**
 * Live data source tests — Overpass API
 *
 * These tests make real HTTP requests to the Overpass API to verify
 * the response format has not changed. They run in the weekly data-check
 * workflow and can also be run locally with:
 *
 *   DATA_CHECK_LIVE=true npx jest --testPathPattern=data-sources
 *
 * They are SKIPPED in normal CI to avoid flaky failures from network
 * issues or API rate limits.
 */

import { buildOverpassQuery } from '@/lib/dealers'

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter'
import type { OverpassResponse } from '@/lib/types'

const LIVE = process.env.DATA_CHECK_LIVE === 'true'
const describeIfLive = LIVE ? describe : describe.skip

// Chennai, India — known to have multiple RE dealers
const CHENNAI_BOUNDS = { south: 12.9, north: 13.2, west: 80.1, east: 80.4 }

// Extended timeout for real API calls
const API_TIMEOUT = 30_000

describeIfLive('Overpass API — live data source check', () => {
  let response: Response
  let data: OverpassResponse

  beforeAll(async () => {
    const query = buildOverpassQuery(CHENNAI_BOUNDS)
    response = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    data = (await response.json()) as OverpassResponse
  }, API_TIMEOUT)

  it('responds with HTTP 200', () => {
    expect(response.status).toBe(200)
  })

  it('returns valid JSON with an elements array', () => {
    expect(data).toBeDefined()
    expect(Array.isArray(data.elements)).toBe(true)
  })

  it('returns at least one element for the Chennai bounding box', () => {
    // Chennai has many RE dealers — if this returns 0, the query is broken
    expect(data.elements.length).toBeGreaterThan(0)
  })

  it('every element has a type field that is node, way, or relation', () => {
    for (const el of data.elements) {
      expect(['node', 'way', 'relation']).toContain(el.type)
    }
  })

  it('every element has a numeric id', () => {
    for (const el of data.elements) {
      expect(typeof el.id).toBe('number')
    }
  })

  it('every element has a tags object', () => {
    for (const el of data.elements) {
      expect(el.tags).toBeDefined()
      expect(typeof el.tags).toBe('object')
    }
  })

  it('every node element has lat and lon as numbers', () => {
    const nodes = data.elements.filter(el => el.type === 'node')
    for (const node of nodes) {
      expect(typeof node.lat).toBe('number')
      expect(typeof node.lon).toBe('number')
      expect(isFinite(node.lat!)).toBe(true)
      expect(isFinite(node.lon!)).toBe(true)
    }
  })

  it('every way/relation element has a center object with lat and lon', () => {
    const nonNodes = data.elements.filter(el => el.type !== 'node')
    for (const el of nonNodes) {
      expect(el.center).toBeDefined()
      expect(typeof el.center!.lat).toBe('number')
      expect(typeof el.center!.lon).toBe('number')
    }
  })

  it('at least one element has a name or brand tag mentioning Royal Enfield', () => {
    const hasRE = data.elements.some(el => {
      const name = el.tags?.name ?? ''
      const brand = el.tags?.brand ?? ''
      return /royal.enfield/i.test(name) || /royal.enfield/i.test(brand)
    })
    expect(hasRE).toBe(true)
  })

  it('response content-type is JSON', () => {
    const ct = response.headers.get('content-type') ?? ''
    expect(ct).toMatch(/json/i)
  })
})
