import type { ServiceInterval, ServiceDue, UrgencyLevel } from './types'
import { URGENCY_THRESHOLDS } from './constants'

const BREAK_IN_INTERVAL_KM = 500

/**
 * Given a bike's service schedule and the current odometer reading (in km),
 * returns an array of ServiceDue objects sorted by urgency (overdue first,
 * then by kmRemaining ascending).
 *
 * Handles:
 * - Repeating intervals: oil at 5000, 10000, 15000, etc.
 * - All defined intervals in the schedule (500, 5000, 10000, 20000)
 * - One-time intervals (break-in at 500 km only fires once)
 * - Overdue tasks (kmRemaining negative)
 * - Multiple overlapping intervals at same km mark
 */
export function calculateServiceDue(
  schedule: ServiceInterval[],
  odometerKm: number
): ServiceDue[] {
  const results: ServiceDue[] = []

  for (const interval of schedule) {
    // 500 km break-in is one-time only — skip if already past it
    if (interval.interval_km === BREAK_IN_INTERVAL_KM && odometerKm > BREAK_IN_INTERVAL_KM) {
      continue
    }

    const nextDueAt =
      Math.ceil(odometerKm / interval.interval_km) * interval.interval_km

    const kmRemaining = nextDueAt - odometerKm
    const percentRemaining = Math.min(kmRemaining / interval.interval_km, 1)
    const urgency = getUrgency(percentRemaining)

    results.push({
      intervalKm: interval.interval_km,
      label: interval.label,
      tasks: interval.tasks,
      kmRemaining,
      percentRemaining,
      urgency,
      nextDueAt,
    })
  }

  results.sort((a, b) => {
    const urgencyOrder: Record<UrgencyLevel, number> = { overdue: 0, soon: 1, good: 2 }
    const orderDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    if (orderDiff !== 0) return orderDiff
    return a.kmRemaining - b.kmRemaining
  })

  return results
}

function getUrgency(percentRemaining: number): UrgencyLevel {
  if (percentRemaining <= URGENCY_THRESHOLDS.OVER) return 'overdue'
  if (percentRemaining <= URGENCY_THRESHOLDS.SOON) return 'soon'
  return 'good'
}

/**
 * Returns the single most urgent service item, or null if schedule is empty.
 */
export function getNextServiceSummary(
  schedule: ServiceInterval[],
  odometerKm: number
): { label: string; kmRemaining: number; nextDueAt: number } | null {
  const due = calculateServiceDue(schedule, odometerKm)
  if (due.length === 0) return null
  const first = due[0]
  return {
    label: first.label,
    kmRemaining: first.kmRemaining,
    nextDueAt: first.nextDueAt,
  }
}
