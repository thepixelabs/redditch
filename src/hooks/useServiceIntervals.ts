'use client'
import { useMemo } from 'react'
import { calculateServiceDue } from '@/lib/service-calculator'
import type { ServiceInterval, ServiceDue } from '@/lib/types'

export function useServiceIntervals(
  schedule: ServiceInterval[],
  odometerKm: number
): ServiceDue[] {
  return useMemo(
    () => calculateServiceDue(schedule, odometerKm),
    [schedule, odometerKm]
  )
}
