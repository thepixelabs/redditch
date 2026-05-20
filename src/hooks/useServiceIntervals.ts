'use client'
import { useMemo } from 'react'
import { calculateBucketDue } from '@/lib/service-calculator'
import type { BikeTask, BucketDue, ServiceLogEntry } from '@/lib/types'

/**
 * Returns one BucketDue per Minor/Major/Extended/Break-in service group,
 * sorted by urgency (overdue first) then by smallest kmRemaining.
 */
export function useServiceIntervals(
  tasks: BikeTask[],
  odometerKm: number,
  bikeLog: Record<string, ServiceLogEntry[]> = {},
): BucketDue[] {
  return useMemo(
    () => calculateBucketDue(tasks, odometerKm, bikeLog),
    [tasks, odometerKm, bikeLog],
  )
}
