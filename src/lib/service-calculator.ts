import type { BikeTask, BucketDue, ServiceDue, ServiceLogEntry, UrgencyLevel } from './types'
import { URGENCY_THRESHOLDS } from './constants'
import { getServiceBuckets } from './service-buckets'

/**
 * Per-task service projection.
 *
 * For each task, compute "when is it next due?" by:
 * - one_shot_at_km: nextDueAt = that mark. Excluded entirely once the owner
 *   passes it (logged or not — the moment has passed, surfacing it later is
 *   just noise).
 * - every_km: nextDueAt = lastDoneKm + every_km, where lastDoneKm comes from
 *   the most recent service-log entry. If no log entry exists, the first
 *   occurrence is at every_km — meaning a fresh bike at 0 km shows the
 *   first service "DUE IN N km", and a used bike at high mileage with no
 *   log shows OVERDUE until the owner logs at least one completion.
 *
 * Sort: overdue first, then by smallest km-remaining.
 */
export function calculateServiceDue(
  tasks: BikeTask[],
  odometerKm: number,
  log: Record<string, ServiceLogEntry[]> = {},
): ServiceDue[] {
  const results: ServiceDue[] = []

  for (const task of tasks) {
    const taskLog = log[task.id] ?? []
    const lastDone = taskLog[0]

    if (task.one_shot_at_km != null) {
      // Already logged → done forever.
      if (lastDone) continue
      // Window passed without a log → drop from view.
      if (odometerKm > task.one_shot_at_km) continue

      const nextDueAt = task.one_shot_at_km
      const kmRemaining = nextDueAt - odometerKm
      // For one-shot urgency we use the remaining km against a fixed
      // "soon window" of 200 km — this is a one-time event, not an interval.
      const soonWindow = 200
      const percentRemaining = Math.min(kmRemaining / soonWindow, 1)
      results.push({
        task,
        lastDone,
        nextDueAt,
        kmRemaining,
        percentRemaining,
        urgency: getUrgency(percentRemaining),
      })
      continue
    }

    // Recurring: every_km is required (Zod enforces it).
    const every = task.every_km
    if (every == null || every <= 0) continue

    const baseKm = lastDone ? lastDone.doneAtKm : 0
    const nextDueAt = lastDone ? baseKm + every : every
    const kmRemaining = nextDueAt - odometerKm
    const percentRemaining = Math.min(kmRemaining / every, 1)

    results.push({
      task,
      lastDone,
      nextDueAt,
      kmRemaining,
      percentRemaining,
      urgency: getUrgency(percentRemaining),
    })
  }

  results.sort((a, b) => {
    const order: Record<UrgencyLevel, number> = { overdue: 0, soon: 1, good: 2 }
    const orderDiff = order[a.urgency] - order[b.urgency]
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

const URGENCY_RANK: Record<UrgencyLevel, number> = { good: 0, soon: 1, overdue: 2 }

function maxUrgency(a: UrgencyLevel, b: UrgencyLevel): UrgencyLevel {
  return URGENCY_RANK[a] >= URGENCY_RANK[b] ? a : b
}

/**
 * Bucket-level projection. Groups tasks into Minor/Major/Extended/Break-in
 * buckets and aggregates urgency across the tasks each bucket holds:
 * - urgency = max across tasks (overdue beats soon beats good)
 * - kmRemaining = min across tasks (the worst-offender drives the headline)
 *
 * Buckets where every task has been completed (one-shot logged, or no due
 * tasks survive filtering) are omitted from the output.
 */
export function calculateBucketDue(
  tasks: BikeTask[],
  odometerKm: number,
  log: Record<string, ServiceLogEntry[]> = {},
): BucketDue[] {
  const dueByTaskId = new Map<string, ServiceDue>()
  for (const d of calculateServiceDue(tasks, odometerKm, log)) {
    dueByTaskId.set(d.task.id, d)
  }

  const buckets = getServiceBuckets(tasks)
  const result: BucketDue[] = []

  for (const b of buckets) {
    const dueTasks: ServiceDue[] = []
    for (const taskId of b.taskIds) {
      const d = dueByTaskId.get(taskId)
      if (d) dueTasks.push(d)
    }
    if (dueTasks.length === 0) continue

    let urgency: UrgencyLevel = 'good'
    let kmRemaining = Number.POSITIVE_INFINITY
    let nextDueAt = Number.POSITIVE_INFINITY
    for (const t of dueTasks) {
      urgency = maxUrgency(urgency, t.urgency)
      if (t.kmRemaining < kmRemaining) {
        kmRemaining = t.kmRemaining
        nextDueAt = t.nextDueAt
      }
    }

    result.push({
      intervalKm: b.interval_km,
      label: b.label,
      one_shot: b.one_shot,
      tasks: dueTasks,
      urgency,
      kmRemaining,
      nextDueAt,
    })
  }

  result.sort((a, b) => {
    const orderDiff = URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]
    if (orderDiff !== 0) return orderDiff
    return a.kmRemaining - b.kmRemaining
  })

  return result
}

/**
 * Returns the single most urgent service item, or null if no tasks are due.
 */
export function getNextServiceSummary(
  tasks: BikeTask[],
  odometerKm: number,
  log: Record<string, ServiceLogEntry[]> = {},
): { name: string; kmRemaining: number; nextDueAt: number } | null {
  const due = calculateServiceDue(tasks, odometerKm, log)
  if (due.length === 0) return null
  const first = due[0]
  return {
    name: first.task.name,
    kmRemaining: first.kmRemaining,
    nextDueAt: first.nextDueAt,
  }
}
