import type { BikeTask, ServiceInterval, ServiceTask } from './types'

/**
 * Standard RE service-bucket labels. Map every_km (or one_shot_at_km) to the
 * familiar manual term so the UI reads like a workshop log: "Minor Service",
 * "Major Service", "Extended Service". Anything outside the known set falls
 * back to a generic "Every N km" / "At N km" label.
 */
function bucketLabel(every_km: number | undefined, one_shot_at_km: number | undefined): string {
  if (one_shot_at_km != null) {
    if (one_shot_at_km <= 1000) return 'Break-in Service'
    return `${one_shot_at_km.toLocaleString()} km — one-time`
  }
  switch (every_km) {
    case 5000:  return 'Minor Service'
    case 10000: return 'Major Service'
    case 20000: return 'Extended Service'
    case 40000: return 'Long-term Service'
    default:    return `Every ${every_km?.toLocaleString() ?? '—'} km`
  }
}

function taskView(task: BikeTask): ServiceTask {
  return {
    name: task.name,
    action: task.action,
    torque_nm: task.torque_nm,
    part_number: task.part_number,
    part_name: task.part_name,
    tools: task.tools,
    notes: task.notes,
  }
}

/**
 * Groups a bike's tasks into Minor/Major/Extended/Break-in buckets — the
 * familiar service-event view that mechanics and owners think in. The
 * underlying per-task cadence is preserved (each task knows its own
 * every_km), so the service log still works at task granularity; this is
 * a pure derivation for display.
 *
 * Sort order: one-shots first (by ascending one_shot_at_km), then recurring
 * buckets by ascending every_km.
 */
export function getServiceBuckets(tasks: BikeTask[]): ServiceInterval[] {
  const buckets = new Map<string, { intervalKm: number; oneShot: boolean; tasks: BikeTask[] }>()

  for (const task of tasks) {
    let key: string
    let intervalKm: number
    let oneShot: boolean
    if (task.one_shot_at_km != null) {
      key = `os:${task.one_shot_at_km}`
      intervalKm = task.one_shot_at_km
      oneShot = true
    } else if (task.every_km != null) {
      key = `re:${task.every_km}`
      intervalKm = task.every_km
      oneShot = false
    } else {
      continue // schema rejects this, but guard anyway
    }
    const existing = buckets.get(key)
    if (existing) {
      existing.tasks.push(task)
    } else {
      buckets.set(key, { intervalKm, oneShot, tasks: [task] })
    }
  }

  return [...buckets.values()]
    .sort((a, b) => {
      if (a.oneShot !== b.oneShot) return a.oneShot ? -1 : 1
      return a.intervalKm - b.intervalKm
    })
    .map((b) => ({
      interval_km: b.intervalKm,
      label: bucketLabel(b.oneShot ? undefined : b.intervalKm, b.oneShot ? b.intervalKm : undefined),
      one_shot: b.oneShot || undefined,
      tasks: b.tasks.map(taskView),
      taskIds: b.tasks.map((t) => t.id),
    }))
}
