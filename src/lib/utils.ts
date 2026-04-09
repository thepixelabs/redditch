import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKm(km: number): string {
  return Math.abs(km).toLocaleString('en-US')
}

export function miToKm(mi: number): number {
  return Math.round(mi * 1.60934)
}

export function kmToMi(km: number): number {
  return Math.round(km / 1.60934)
}
