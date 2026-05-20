// ─── Bike Data Types ───────────────────────────────────────────────────────────

export type ServiceAction =
  | 'replace'
  | 'inspect'
  | 'adjust'
  | 'clean'
  | 'lubricate'
  | 'top_up'

/**
 * ServiceTask — the legacy task shape used by display code that groups
 * tasks into service buckets (Minor / Major / Extended). This is a *view*
 * of a BikeTask, not a separate data source.
 */
export interface ServiceTask {
  name: string
  action?: ServiceAction
  torque_nm?: number
  part_number?: string
  part_name?: string
  tools?: string[]
  notes?: string
}

/**
 * ServiceInterval — a derived bucket: "Minor Service at every 5,000 km",
 * "Major Service at every 10,000 km", etc. Produced by `getServiceBuckets`
 * from a bike's per-task cadence. Used by BikeBook and ServiceList for
 * familiar grouped presentation.
 */
export interface ServiceInterval {
  interval_km: number
  label: string
  /** True for break-in / one-shot buckets (don't recur). */
  one_shot?: boolean
  tasks: ServiceTask[]
  /** The underlying task ids, in display order. Used by the service log. */
  taskIds: string[]
}

/**
 * BikeTask — a single maintenance task with its own cadence.
 *
 * Exactly one of `every_km` or `one_shot_at_km` must be set:
 * - `every_km` — recurring distance interval. With no log entry, first
 *   occurrence is at `every_km`. With a log entry, next occurrence is
 *   `lastDoneKm + every_km`. Use a separate one-shot task to model
 *   break-in services that don't recur.
 * - `every_months` — optional time interval. Currently ignored by the
 *   calculator; surface time-based reminders in `notes` for now.
 * - `one_shot_at_km` — fires exactly once at that odometer mark. Excluded
 *   from the due list once odometer passes it (whether or not logged).
 *
 * `id` is the stable key used by the service log to record completions —
 * kebab-case, unique within a bike. Never rename without a migration.
 */
export interface BikeTask {
  id: string
  name: string
  action?: ServiceAction
  every_km?: number
  every_months?: number
  one_shot_at_km?: number
  torque_nm?: number
  part_number?: string
  part_name?: string
  tools?: string[]
  notes?: string
}

export interface TorqueSpec {
  component: string
  torque_nm: number
  notes?: string
}

export interface ManualLink {
  title: string
  url: string
}

export interface Engine {
  displacement_cc: number
  type: string
  oil_type: string
  oil_capacity_liters: number
  oil_capacity_with_filter_liters?: number
  coolant_type?: string
  coolant_capacity_liters?: number
  spark_plug?: string
  valve_clearance_intake_mm?: string
  valve_clearance_exhaust_mm?: string
  power_bhp?: number
  torque_nm_peak?: number
  compression_ratio?: number
}

export interface Fuel {
  capacity_liters?: number
  reserve_capacity_liters?: number
  consumption_kmpl_range?: [number, number]
}

export interface Dimensions {
  seat_height_mm?: number
  seat_height_high_mm?: number
  kerb_weight_kg?: number
  wheelbase_mm?: number
  ground_clearance_mm?: number
}

export interface FuseEntry {
  label: string
  amps: number
  location?: string
}

export interface Electrical {
  battery_voltage_v?: number
  battery_capacity_ah?: number
  fuse_layout?: FuseEntry[]
}

export interface WearLimits {
  chain_wear_limit_20links_mm?: number
  brake_pad_thickness_min_mm?: number
  tire_tread_depth_min_mm?: number
}

export interface KnownIssue {
  id: string
  title: string
  affects?: string
  description: string
  source_url?: string
  date?: string
}

export interface Brakes {
  front_type?: string
  rear_type?: string
  brake_fluid?: string
}

export interface Tires {
  front?: string
  rear?: string
  pressure_front_psi?: number
  pressure_rear_psi?: number
  pressure_rear_pillion_psi?: number
}

export interface Chain {
  type?: string
  slack_mm?: string
  lubricant?: string
}

export interface BikeMeta {
  last_verified: string
  source?: string
  contributors?: string[]
}

export interface BikeSpec {
  slug: string
  name: string
  manufacturer: string
  year_range?: string
  engine: Engine
  fuel?: Fuel
  dimensions?: Dimensions
  electrical?: Electrical
  wear_limits?: WearLimits
  brakes?: Brakes
  tires?: Tires
  chain?: Chain
  tasks: BikeTask[]
  torque_specs?: TorqueSpec[]
  known_issues?: KnownIssue[]
  manuals?: ManualLink[]
  colors?: string[]
  accessories?: string[]
  meta?: BikeMeta
}

// ─── Service Log Types ────────────────────────────────────────────────────────

/**
 * A single completion entry written when the owner taps "Mark done".
 * Persists in localStorage under STORAGE_KEYS.SERVICE_LOG.
 */
export interface ServiceLogEntry {
  doneAtKm: number
  doneAt: string    // ISO timestamp
}

/**
 * Whole-app log shape: bike slug → task id → newest-first entries.
 */
export type ServiceLog = Record<string, Record<string, ServiceLogEntry[]>>

// ─── Calculator Output Types ───────────────────────────────────────────────────

export type UrgencyLevel = 'good' | 'soon' | 'overdue'

/**
 * One task's projected next-due state for the current odometer reading.
 */
export interface ServiceDue {
  task: BikeTask
  /** The most recent log entry for this task, if any. */
  lastDone?: ServiceLogEntry
  /** Resolved odometer mark at which the task is next due. */
  nextDueAt: number
  /** Negative when overdue. */
  kmRemaining: number
  /** Fraction of the interval remaining; clamped to ≤1. */
  percentRemaining: number
  urgency: UrgencyLevel
}

/**
 * Bucket-level projection — aggregates ServiceDue for every task in a
 * Minor/Major/Extended/Break-in bucket so the UI can show one card per
 * service event rather than one card per task.
 *
 * urgency: max across child tasks (overdue > soon > good)
 * kmRemaining: min across child tasks (most urgent wins the headline)
 */
export interface BucketDue {
  intervalKm: number
  label: string
  one_shot?: boolean
  tasks: ServiceDue[]
  urgency: UrgencyLevel
  kmRemaining: number
  nextDueAt: number
}

// ─── UI / App State Types ─────────────────────────────────────────────────────

export type ThemePreference = 'dark' | 'light' | 'system'
export type OdometerUnit = 'km' | 'mi'

/**
 * One bike in the user's garage. The service log is keyed by GarageEntry.id.
 * For migrated entries, id === slug so existing log data is preserved.
 */
export interface GarageEntry {
  id: string           // stable key — kebab slug for first of a model, slug-timestamp for dupes
  slug: string         // bike model slug (e.g. 'interceptor-650')
  nickname: string     // user's name for this bike (e.g. 'Cool Breeze')
  odometerKm: number
  unit: OdometerUnit
  createdAt: number    // unix ms
}

export const MI_TO_KM = 1.60934

// ─── Bulletin Board Types ─────────────────────────────────────────────────────

export type BulletinType =
  | 'event'       // rides, meets, camps
  | 'technical'   // TSBs, recalls, service notes
  | 'article'     // community writing, how-tos, data deep-dives
  | 'changelog'   // dataset updates
  | 'announcement'

export interface BulletinFeatured {
  title: string
  lede: string
  author?: string
  published: string   // ISO date
  tag?: string
  href?: string
}

export interface BulletinEntry {
  id: string
  type: BulletinType
  title: string
  body: string
  date: string        // ISO date
  pinned?: boolean
  author?: string
  source?: string
  source_url?: string
  location?: string
  tag?: string
  href?: string
}

export interface BulletinData {
  featured?: BulletinFeatured
  entries: BulletinEntry[]
}

// ─── Dealer Finder Types ──────────────────────────────────────────────────────

export interface Dealer {
  id: string
  name: string
  lat: number
  lng: number
  address?: string
  city?: string
  country?: string
  phone?: string
  website?: string
  openingHours?: string
  source: 'osm' | 'curated' | 're-official' | 'google-places'
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags: Record<string, string>
}

export interface OverpassResponse {
  elements: OverpassElement[]
}
