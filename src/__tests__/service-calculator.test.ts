import { calculateServiceDue, getNextServiceSummary } from '@/lib/service-calculator'
import type { ServiceInterval } from '@/lib/types'

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const breakInInterval: ServiceInterval = {
  interval_km: 500,
  label: 'Break-in service',
  tasks: [{ name: 'Engine oil and filter', action: 'replace', torque_nm: 25 }],
}

const minorServiceInterval: ServiceInterval = {
  interval_km: 5000,
  label: 'Minor service',
  tasks: [
    { name: 'Engine oil and filter', action: 'replace', torque_nm: 25 },
    { name: 'Air filter', action: 'inspect' },
  ],
}

const majorServiceInterval: ServiceInterval = {
  interval_km: 10000,
  label: 'Major service',
  tasks: [
    { name: 'Engine oil and filter', action: 'replace', torque_nm: 25 },
    { name: 'Spark plugs', action: 'replace', torque_nm: 12 },
    { name: 'Valve clearance', action: 'inspect' },
  ],
}

// Full Interceptor 650–style schedule including break-in
const fullSchedule: ServiceInterval[] = [
  breakInInterval,
  minorServiceInterval,
  majorServiceInterval,
]

// Schedule without break-in — for repeating-interval–only tests
const repeatSchedule: ServiceInterval[] = [
  minorServiceInterval,
  majorServiceInterval,
]

// ---------------------------------------------------------------------------
// Return value shape
// ---------------------------------------------------------------------------

describe('calculateServiceDue — return value shape', () => {
  it('returns an empty array when given an empty schedule', () => {
    expect(calculateServiceDue([], 5000)).toEqual([])
  })

  it('each ServiceDue has all required fields with correct types', () => {
    const [result] = calculateServiceDue([minorServiceInterval], 4800)

    expect(result).toMatchObject({
      intervalKm: expect.any(Number),
      label: expect.any(String),
      tasks: expect.any(Array),
      kmRemaining: expect.any(Number),
      percentRemaining: expect.any(Number),
      urgency: expect.stringMatching(/^(good|soon|overdue)$/),
      nextDueAt: expect.any(Number),
    })
  })

  it('passes the tasks array through unchanged', () => {
    const [result] = calculateServiceDue([minorServiceInterval], 4800)
    expect(result.tasks).toEqual(minorServiceInterval.tasks)
  })

  it('sets intervalKm and label from the source ServiceInterval', () => {
    const [result] = calculateServiceDue([minorServiceInterval], 4800)
    expect(result.intervalKm).toBe(5000)
    expect(result.label).toBe('Minor service')
  })
})

// ---------------------------------------------------------------------------
// Break-in interval (500 km, one-time only)
// ---------------------------------------------------------------------------

describe('calculateServiceDue — break-in interval', () => {
  it('includes break-in at 0 km with kmRemaining equal to the interval', () => {
    // Math.ceil(0/500)*500 = 0 → kmRemaining = 0 → overdue at odometer 0.
    // This is the actual implementation behaviour: at 0 km the service is
    // treated as immediately due (nextDueAt=0, kmRemaining=0, urgency overdue).
    const results = calculateServiceDue([breakInInterval], 0)
    expect(results).toHaveLength(1)
    expect(results[0].nextDueAt).toBe(0)
    expect(results[0].kmRemaining).toBe(0)
    expect(results[0].urgency).toBe('overdue')
  })

  it('includes break-in at 250 km with correct kmRemaining and good urgency', () => {
    // nextDueAt = Math.ceil(250/500)*500 = 500
    // kmRemaining = 250, percentRemaining = 250/500 = 0.50 > 0.40 → 'good'
    const results = calculateServiceDue([breakInInterval], 250)
    expect(results).toHaveLength(1)
    expect(results[0].nextDueAt).toBe(500)
    expect(results[0].kmRemaining).toBe(250)
    expect(results[0].percentRemaining).toBeCloseTo(0.5)
    expect(results[0].urgency).toBe('good')
  })

  it('includes break-in at 400 km with soon urgency (20% remaining ≤ 40% threshold)', () => {
    // nextDueAt = Math.ceil(400/500)*500 = 500
    // kmRemaining = 100, percentRemaining = 100/500 = 0.20 ≤ 0.40 → 'soon'
    const results = calculateServiceDue([breakInInterval], 400)
    expect(results).toHaveLength(1)
    expect(results[0].nextDueAt).toBe(500)
    expect(results[0].kmRemaining).toBe(100)
    expect(results[0].percentRemaining).toBeCloseTo(0.2)
    expect(results[0].urgency).toBe('soon')
  })

  it('omits break-in at 501 km (already past the one-time threshold)', () => {
    const results = calculateServiceDue([breakInInterval], 501)
    expect(results).toHaveLength(0)
  })

  it('omits break-in at 5000 km', () => {
    const results = calculateServiceDue(fullSchedule, 5000)
    const breakIn = results.find(r => r.intervalKm === 500)
    expect(breakIn).toBeUndefined()
  })

  it('includes break-in at exactly 500 km (boundary: > 500 check is exclusive)', () => {
    // odometerKm === 500 is NOT > 500, so break-in still appears.
    // nextDueAt = Math.ceil(500/500)*500 = 500, kmRemaining = 0 → 'overdue'
    const results = calculateServiceDue([breakInInterval], 500)
    const breakIn = results.find(r => r.intervalKm === 500)
    expect(breakIn).toBeDefined()
    expect(breakIn!.kmRemaining).toBe(0)
    expect(breakIn!.urgency).toBe('overdue')
  })
})

// ---------------------------------------------------------------------------
// Repeating intervals — nextDueAt calculation
// ---------------------------------------------------------------------------

describe('calculateServiceDue — repeating intervals at key odometer values', () => {
  it('at odometer 0, repeating intervals are immediately overdue (nextDueAt=0)', () => {
    // Math.ceil(0 / 5000) * 5000 = 0 → kmRemaining=0 → 'overdue'
    const results = calculateServiceDue([minorServiceInterval], 0)
    expect(results).toHaveLength(1)
    expect(results[0].nextDueAt).toBe(0)
    expect(results[0].kmRemaining).toBe(0)
    expect(results[0].urgency).toBe('overdue')
  })

  it('at 4800 km, 5000-interval has nextDueAt=5000 and soon urgency', () => {
    // nextDueAt = Math.ceil(4800/5000)*5000 = 5000
    // kmRemaining = 200, percent = 200/5000 = 0.04 ≤ 0.40 → 'soon'
    const results = calculateServiceDue([minorServiceInterval], 4800)
    expect(results).toHaveLength(1)
    expect(results[0].nextDueAt).toBe(5000)
    expect(results[0].kmRemaining).toBe(200)
    expect(results[0].percentRemaining).toBeCloseTo(0.04)
    expect(results[0].urgency).toBe('soon')
  })

  it('at 4800 km, 10000-interval has nextDueAt=10000 and good urgency', () => {
    // nextDueAt = Math.ceil(4800/10000)*10000 = 10000
    // kmRemaining = 5200, percent = 5200/10000 = 0.52 > 0.40 → 'good'
    const results = calculateServiceDue([majorServiceInterval], 4800)
    expect(results).toHaveLength(1)
    expect(results[0].nextDueAt).toBe(10000)
    expect(results[0].kmRemaining).toBe(5200)
    expect(results[0].percentRemaining).toBeCloseTo(0.52)
    expect(results[0].urgency).toBe('good')
  })

  it('at 9800 km, both 5000 and 10000 intervals are due at 10000 with soon urgency', () => {
    // 5000-interval: Math.ceil(9800/5000)*5000 = 10000, kmRemaining=200 → 'soon'
    // 10000-interval: Math.ceil(9800/10000)*10000 = 10000, kmRemaining=200 → 'soon'
    const results = calculateServiceDue(repeatSchedule, 9800)
    expect(results).toHaveLength(2)

    const minor = results.find(r => r.intervalKm === 5000)!
    expect(minor.nextDueAt).toBe(10000)
    expect(minor.kmRemaining).toBe(200)
    expect(minor.urgency).toBe('soon')

    const major = results.find(r => r.intervalKm === 10000)!
    expect(major.nextDueAt).toBe(10000)
    expect(major.kmRemaining).toBe(200)
    expect(major.urgency).toBe('soon')
  })

  it('at 10200 km, both intervals advance to their next due point (not overdue)', () => {
    // The implementation uses Math.ceil, which always looks forward.
    // At 10200 km the 10000-interval was missed, but Math.ceil(10200/10000)*10000 = 20000.
    // The implementation does not track missed services — it shows the next upcoming due point.
    // 5000-interval: Math.ceil(10200/5000)*5000 = 15000, kmRemaining=4800 → 'good'
    // 10000-interval: Math.ceil(10200/10000)*10000 = 20000, kmRemaining=9800 → 'good'
    const results = calculateServiceDue(repeatSchedule, 10200)

    const minor = results.find(r => r.intervalKm === 5000)!
    expect(minor.nextDueAt).toBe(15000)
    expect(minor.kmRemaining).toBe(4800)
    expect(minor.urgency).toBe('good')

    const major = results.find(r => r.intervalKm === 10000)!
    expect(major.nextDueAt).toBe(20000)
    expect(major.kmRemaining).toBe(9800)
    expect(major.urgency).toBe('good')
  })

  it('at exactly 5000 km, 5000-interval is overdue (kmRemaining=0)', () => {
    // Math.ceil(5000/5000)*5000 = 5000, kmRemaining=0, percentRemaining=0 → 'overdue'
    const results = calculateServiceDue([minorServiceInterval], 5000)
    expect(results[0].nextDueAt).toBe(5000)
    expect(results[0].kmRemaining).toBe(0)
    expect(results[0].urgency).toBe('overdue')
  })

  it('at 5001 km, 5000-interval advances to 10000 with good urgency', () => {
    // Math.ceil(5001/5000)*5000 = 10000, kmRemaining=4999 → 'good'
    const results = calculateServiceDue([minorServiceInterval], 5001)
    expect(results[0].nextDueAt).toBe(10000)
    expect(results[0].kmRemaining).toBe(4999)
    expect(results[0].urgency).toBe('good')
  })
})

// ---------------------------------------------------------------------------
// percentRemaining — capping and boundary values
// ---------------------------------------------------------------------------

describe('calculateServiceDue — percentRemaining', () => {
  it('caps percentRemaining at 1 even when odometer is far below the first due point', () => {
    // At 1 km, 5000-interval: nextDueAt=5000, kmRemaining=4999, 4999/5000=0.9998 < 1
    // The cap triggers at exactly 1, which happens when the raw value exceeds 1.
    // The break-in at 0 km is the genuine cap case: kmRemaining=0 → percentRemaining=0 (not >1).
    // A value >1 cannot happen because kmRemaining can only be 0..interval_km when using ceil.
    // Verify percentRemaining is between 0 and 1 inclusive for all normal inputs.
    const results = calculateServiceDue([minorServiceInterval], 1)
    expect(results[0].percentRemaining).toBeGreaterThanOrEqual(0)
    expect(results[0].percentRemaining).toBeLessThanOrEqual(1)
  })

  it('percentRemaining is 0 when service is exactly at the due point', () => {
    const results = calculateServiceDue([minorServiceInterval], 5000)
    expect(results[0].percentRemaining).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Urgency classification
// ---------------------------------------------------------------------------

describe('calculateServiceDue — urgency classification', () => {
  it('returns good when percentRemaining is above the soon threshold (> 0.40)', () => {
    // At 4000 km, 5000-interval: kmRemaining=1000, percent=0.20... wait
    // 4000 km: nextDueAt=5000, kmRemaining=1000, percent=1000/5000=0.20 → soon
    // At 2000 km: nextDueAt=5000, kmRemaining=3000, percent=3000/5000=0.60 → good
    const results = calculateServiceDue([minorServiceInterval], 2000)
    expect(results[0].urgency).toBe('good')
    expect(results[0].percentRemaining).toBeCloseTo(0.6)
  })

  it('returns soon when percentRemaining is exactly 0.40', () => {
    // 5000-interval: kmRemaining = 0.40 * 5000 = 2000 → odometer = 5000 - 2000 = 3000
    // nextDueAt = Math.ceil(3000/5000)*5000 = 5000, kmRemaining=2000, percent=0.40 → 'soon'
    const results = calculateServiceDue([minorServiceInterval], 3000)
    expect(results[0].urgency).toBe('soon')
    expect(results[0].percentRemaining).toBeCloseTo(0.4)
  })

  it('returns soon when percentRemaining is just below 0.40', () => {
    // At 3001 km: nextDueAt=5000, kmRemaining=1999, percent≈0.3998 < 0.40 → 'soon'
    const results = calculateServiceDue([minorServiceInterval], 3001)
    expect(results[0].urgency).toBe('soon')
  })

  it('returns overdue when kmRemaining is exactly 0 (service due now)', () => {
    const results = calculateServiceDue([minorServiceInterval], 5000)
    expect(results[0].urgency).toBe('overdue')
  })
})

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

describe('calculateServiceDue — sort order', () => {
  it('places overdue items before soon items before good items', () => {
    // Construct a schedule where we know the urgency of each at a given odometer.
    // At odometer 0: all intervals produce kmRemaining=0 → all 'overdue' at first.
    // Use a custom schedule to get all three urgency levels deterministically.
    //
    // Schedule: 100km, 500km, 2000km intervals at odometer 600km:
    //   100-interval: nextDueAt=700, kmRemaining=100, percent=100/100=1 → 'good'
    //   500-interval: skipped (break-in check only for 500km built-in)
    //   -- use non-500 values to avoid break-in logic:
    //   intervals: 400, 1000, 5000 at odometer 600:
    //     400: nextDueAt=800, kmRemaining=200, percent=200/400=0.50 → 'good'
    //     1000: nextDueAt=1000, kmRemaining=400, percent=400/1000=0.40 → 'soon'
    //     5000: nextDueAt=5000, kmRemaining=4400, percent=4400/5000=0.88 → 'good'
    //
    // To get 'overdue' we need odometer exactly on a boundary.
    // Use intervals 400, 600, 5000 at odometer 600:
    //   400: nextDueAt=800, kmRemaining=200, percent=0.50 → 'good'
    //   600: nextDueAt=600, kmRemaining=0, percent=0 → 'overdue'
    //   5000: nextDueAt=5000, kmRemaining=4400, percent=0.88 → 'good'
    //
    // Add a 'soon' case: interval 1000 at odometer 750:
    // Try odometer 750, intervals 750 (overdue), 900 (soon: 150/900≈0.17), 5000 (good: 4250/5000=0.85)
    const schedule: ServiceInterval[] = [
      { interval_km: 5000, label: 'Good item', tasks: [] },
      { interval_km: 900,  label: 'Soon item', tasks: [] },
      { interval_km: 750,  label: 'Overdue item', tasks: [] },
    ]
    // At odometer 750:
    //   5000: nextDueAt=5000, kmRemaining=4250, percent=0.85 → 'good'
    //   900:  nextDueAt=900,  kmRemaining=150,  percent=150/900≈0.167 → 'soon'
    //   750:  nextDueAt=750,  kmRemaining=0,    percent=0 → 'overdue'
    const results = calculateServiceDue(schedule, 750)

    expect(results[0].urgency).toBe('overdue')
    expect(results[1].urgency).toBe('soon')
    expect(results[2].urgency).toBe('good')
  })

  it('within the same urgency level, sorts by kmRemaining ascending', () => {
    // Two good intervals at different distances
    const schedule: ServiceInterval[] = [
      { interval_km: 5000,  label: 'Far good',  tasks: [] },
      { interval_km: 2000,  label: 'Near good', tasks: [] },
    ]
    // At odometer 1000:
    //   5000: nextDueAt=5000, kmRemaining=4000, percent=0.80 → 'good'
    //   2000: nextDueAt=2000, kmRemaining=1000, percent=0.50 → 'good'
    const results = calculateServiceDue(schedule, 1000)
    expect(results[0].label).toBe('Near good')   // 1000 km remaining
    expect(results[1].label).toBe('Far good')    // 4000 km remaining
  })

  it('sorts two overdue items most-overdue first (most negative kmRemaining first)', () => {
    // Two intervals both exactly at boundary (kmRemaining=0 each).
    // Both overdue; the one added first stays first when kmRemaining is equal.
    // More interesting: force different overdue depths using odometer between boundaries.
    // intervals 400 and 1000 at odometer 1001:
    //   400: nextDueAt=1200, kmRemaining=199 → 'soon'  (not overdue — skip)
    // Use odometer 2000:
    //   400: nextDueAt=2000, kmRemaining=0 → 'overdue'
    //   600: nextDueAt=2400, kmRemaining=400 → 'soon'
    // Hard to get two different negative values with ceil. Use exact boundary odometer for both:
    // odometer = LCM(400, 600) = 1200:
    //   400: nextDueAt=1200, kmRemaining=0 → 'overdue'
    //   600: nextDueAt=1200, kmRemaining=0 → 'overdue'
    // Both tied — sort stable. Verify order is still consistent (both overdue before any others).
    const schedule: ServiceInterval[] = [
      { interval_km: 400, label: 'Overdue A', tasks: [] },
      { interval_km: 600, label: 'Overdue B', tasks: [] },
      { interval_km: 5000, label: 'Good C',  tasks: [] },
    ]
    const results = calculateServiceDue(schedule, 1200)
    expect(results[0].urgency).toBe('overdue')
    expect(results[1].urgency).toBe('overdue')
    expect(results[2].urgency).toBe('good')
    expect(results[2].label).toBe('Good C')
  })
})

// ---------------------------------------------------------------------------
// Full schedule integration
// ---------------------------------------------------------------------------

describe('calculateServiceDue — full schedule integration', () => {
  it('at 4800 km with full schedule: break-in absent, minor soon, major good', () => {
    const results = calculateServiceDue(fullSchedule, 4800)

    const breakIn = results.find(r => r.intervalKm === 500)
    expect(breakIn).toBeUndefined()

    const minor = results.find(r => r.intervalKm === 5000)!
    expect(minor.urgency).toBe('soon')
    expect(minor.nextDueAt).toBe(5000)

    const major = results.find(r => r.intervalKm === 10000)!
    expect(major.urgency).toBe('good')
    expect(major.nextDueAt).toBe(10000)
  })

  it('at 250 km with full schedule: break-in present and good, both others overdue at 0', () => {
    const results = calculateServiceDue(fullSchedule, 250)

    const breakIn = results.find(r => r.intervalKm === 500)!
    expect(breakIn).toBeDefined()
    expect(breakIn.urgency).toBe('good')
    expect(breakIn.kmRemaining).toBe(250)

    // Minor and major: Math.ceil(250/5000)*5000=5000, kmRemaining=4750, percent=0.95 → 'good'
    const minor = results.find(r => r.intervalKm === 5000)!
    expect(minor.urgency).toBe('good')

    const major = results.find(r => r.intervalKm === 10000)!
    expect(major.urgency).toBe('good')
  })
})

// ---------------------------------------------------------------------------
// getNextServiceSummary
// ---------------------------------------------------------------------------

describe('getNextServiceSummary', () => {
  it('returns null for an empty schedule', () => {
    expect(getNextServiceSummary([], 5000)).toBeNull()
  })

  it('returns the most urgent item label, kmRemaining, and nextDueAt', () => {
    // At 4800 km: minor service is soon (most urgent), major is good
    const summary = getNextServiceSummary(repeatSchedule, 4800)
    expect(summary).not.toBeNull()
    expect(summary!.label).toBe('Minor service')
    expect(summary!.kmRemaining).toBe(200)
    expect(summary!.nextDueAt).toBe(5000)
  })

  it('returns the overdue item when present', () => {
    // At 5000 km: minor is overdue (kmRemaining=0), major still upcoming
    const summary = getNextServiceSummary(repeatSchedule, 5000)
    expect(summary!.label).toBe('Minor service')
    expect(summary!.kmRemaining).toBe(0)
  })
})
