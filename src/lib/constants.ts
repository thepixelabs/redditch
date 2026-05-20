export const STORAGE_KEYS = {
  // v2 multi-bike storage
  GARAGE:    'redditch:garage',     // GarageEntry[]
  ACTIVE_ID: 'redditch:active-id', // string — active GarageEntry.id
  THEME:     'redditch:theme',
  SERVICE_LOG: 'redditch:log',
  // v1 legacy (kept for one-time migration read; never written after migration)
  BIKE:      'redditch:bike',
  ODOMETER:  'redditch:odometer',
  UNIT:      'redditch:unit',
} as const

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://redditch.pixelabs.net'

export const URGENCY_THRESHOLDS = {
  SOON: 0.40,   // < 40% remaining → "Due Soon"
  OVER: 0.00,   // < 0% remaining  → "Overdue"
} as const

export const PLATFORMS = [
  { id: '650-twins',    label: '650 Twins',      engine: 'Parallel Twin' },
  { id: '350-platform', label: '350 Platform',   engine: 'J-Series Single' },
  { id: 'himalayan',    label: 'Himalayan',      engine: 'Single Cylinder' },
  { id: 'scram',        label: 'Scram 411',      engine: 'Single Cylinder' },
  { id: 'bullet',       label: 'Bullet',         engine: 'Classic Single' },
] as const

export const PLATFORM_BIKE_MAP: Record<string, string[]> = {
  '650-twins':    ['interceptor-650', 'continental-gt-650', 'super-meteor-650'],
  '350-platform': ['classic-350', 'meteor-350', 'hunter-350'],
  'himalayan':    ['himalayan-450', 'himalayan-411'],
  'scram':        ['scram-411'],
  'bullet':       ['bullet-350'],
}
