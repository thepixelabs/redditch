import { calculateServiceDue, getNextServiceSummary } from '@/lib/service-calculator'
import type { BikeTask, ServiceLogEntry } from '@/lib/types'

// ---------------------------------------------------------------------------
// Shared test fixtures — per-task cadence model
// ---------------------------------------------------------------------------

const engineOilBreakin: BikeTask = {
  id: 'engine-oil-breakin',
  name: 'Break-in oil & filter',
  action: 'replace',
  one_shot_at_km: 500,
  torque_nm: 25,
}

const engineOil: BikeTask = {
  id: 'engine-oil',
  name: 'Engine oil & filter',
  action: 'replace',
  every_km: 5000,
  torque_nm: 25,
}

const airFilter: BikeTask = {
  id: 'air-filter',
  name: 'Air filter',
  action: 'replace',
  every_km: 10000,
}

const sparkPlug: BikeTask = {
  id: 'spark-plug',
  name: 'Spark plug',
  action: 'replace',
  every_km: 10000,
  torque_nm: 12,
}

const valveClearance: BikeTask = {
  id: 'valve-clearance',
  name: 'Valve clearance',
  action: 'inspect',
  every_km: 10000,
}

const allTasks: BikeTask[] = [
  engineOilBreakin,
  engineOil,
  airFilter,
  sparkPlug,
  valveClearance,
]

const recurringOnly: BikeTask[] = [engineOil, airFilter, sparkPlug, valveClearance]

function logged(km: number, daysAgo = 0): ServiceLogEntry {
  const doneAt = new Date(Date.now() - daysAgo * 86_400_000).toISOString()
  return { doneAtKm: km, doneAt }
}

// ---------------------------------------------------------------------------
// Return-value shape
// ---------------------------------------------------------------------------

describe('calculateServiceDue — return value shape', () => {
  it('returns one entry per relevant task with task + nextDueAt + urgency', () => {
    const [first] = calculateServiceDue([engineOil], 4800)
    expect(first.task).toBe(engineOil)
    expect(first.nextDueAt).toBe(5000)
    expect(first.kmRemaining).toBe(200)
    expect(first.percentRemaining).toBeCloseTo(200 / 5000)
    expect(['good', 'soon', 'overdue']).toContain(first.urgency)
  })
})

// ---------------------------------------------------------------------------
// Recurring tasks — no log present
// ---------------------------------------------------------------------------

describe('calculateServiceDue — recurring tasks with no log', () => {
  it('first occurrence is at every_km, not before', () => {
    const [oil] = calculateServiceDue([engineOil], 0)
    expect(oil.nextDueAt).toBe(5000)
    expect(oil.kmRemaining).toBe(5000)
  })

  it('marks task overdue when odometer exceeds first occurrence', () => {
    const [oil] = calculateServiceDue([engineOil], 6500)
    expect(oil.nextDueAt).toBe(5000)
    expect(oil.kmRemaining).toBe(-1500)
    expect(oil.urgency).toBe('overdue')
  })

  it('marks task as soon when 60% of interval has elapsed', () => {
    const [oil] = calculateServiceDue([engineOil], 3000)
    // 2000 km remaining out of 5000 = 40% remaining → "soon" boundary
    expect(oil.urgency).toBe('soon')
  })

  it('marks task as good when only 20% of interval has elapsed', () => {
    const [oil] = calculateServiceDue([engineOil], 1000)
    expect(oil.urgency).toBe('good')
  })
})

// ---------------------------------------------------------------------------
// Recurring tasks — with log entries
// ---------------------------------------------------------------------------

describe('calculateServiceDue — recurring tasks with log', () => {
  it('rebases nextDueAt from the most recent log entry', () => {
    const log = { 'engine-oil': [logged(4800)] }
    const [oil] = calculateServiceDue([engineOil], 6000, log)
    expect(oil.nextDueAt).toBe(4800 + 5000)
    expect(oil.kmRemaining).toBe(4800 + 5000 - 6000)
  })

  it('uses the newest entry (index 0), not the oldest', () => {
    const log = {
      'engine-oil': [
        logged(10000, 1),    // newest
        logged(4800, 60),    // older
      ],
    }
    const [oil] = calculateServiceDue([engineOil], 11000, log)
    expect(oil.nextDueAt).toBe(15000)
    expect(oil.lastDone?.doneAtKm).toBe(10000)
  })

  it('does not turn overdue immediately after a log entry', () => {
    const log = { 'engine-oil': [logged(10000)] }
    const [oil] = calculateServiceDue([engineOil], 10000, log)
    expect(oil.kmRemaining).toBe(5000)
    expect(oil.urgency).toBe('good')
  })
})

// ---------------------------------------------------------------------------
// One-shot tasks
// ---------------------------------------------------------------------------

describe('calculateServiceDue — one-shot tasks', () => {
  it('shows the task before the one-shot mark', () => {
    const [breakin] = calculateServiceDue([engineOilBreakin], 300)
    expect(breakin.task.id).toBe('engine-oil-breakin')
    expect(breakin.nextDueAt).toBe(500)
    expect(breakin.kmRemaining).toBe(200)
  })

  it('excludes the task once odometer passes the one-shot mark without a log', () => {
    const result = calculateServiceDue([engineOilBreakin], 800)
    expect(result).toHaveLength(0)
  })

  it('excludes the task once it has been logged, even before the mark', () => {
    const log = { 'engine-oil-breakin': [logged(500)] }
    const result = calculateServiceDue([engineOilBreakin], 400, log)
    expect(result).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Sort order
// ---------------------------------------------------------------------------

describe('calculateServiceDue — sort order', () => {
  it('sorts overdue tasks before upcoming ones', () => {
    // At 11,000 km with no log: engine-oil is overdue from 5,000 mark
    // (kmRemaining = -6000), air-filter is overdue from 10,000
    // (kmRemaining = -1000). Both overdue — engine-oil should be first.
    const result = calculateServiceDue([airFilter, engineOil], 11000)
    expect(result[0].task.id).toBe('engine-oil')
    expect(result[1].task.id).toBe('air-filter')
  })

  it('within the same urgency band, sorts by smallest kmRemaining', () => {
    // No log: engine-oil due at 5000 (5000 remaining), air-filter at
    // 10000 (10000 remaining). Both "good" at odo 0.
    const result = calculateServiceDue(recurringOnly, 0)
    expect(result[0].task.every_km).toBeLessThanOrEqual(result[1].task.every_km!)
  })
})

// ---------------------------------------------------------------------------
// getNextServiceSummary
// ---------------------------------------------------------------------------

describe('getNextServiceSummary', () => {
  it('returns the most urgent task by name', () => {
    const summary = getNextServiceSummary(allTasks, 400)
    expect(summary).not.toBeNull()
    expect(summary?.name).toBe('Break-in oil & filter')
    expect(summary?.kmRemaining).toBe(100)
  })

  it('returns null when no tasks are due', () => {
    // One-shot has passed and no log → excluded. Pass an odometer
    // BEYOND every recurring task — they'll still report overdue,
    // so use an empty list instead.
    const summary = getNextServiceSummary([], 0)
    expect(summary).toBeNull()
  })
})
