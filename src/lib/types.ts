// ─── Bike Data Types ───────────────────────────────────────────────────────────

export type ServiceAction =
  | 'replace'
  | 'inspect'
  | 'adjust'
  | 'clean'
  | 'lubricate'
  | 'top_up'

export interface ServiceTask {
  name: string
  action?: ServiceAction
  torque_nm?: number
  part_number?: string
  part_name?: string
  tools?: string[]
  notes?: string
}

export interface ServiceInterval {
  interval_km: number
  label: string
  tasks: ServiceTask[]
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
  brakes?: Brakes
  tires?: Tires
  chain?: Chain
  service_schedule: ServiceInterval[]
  torque_specs?: TorqueSpec[]
  manuals?: ManualLink[]
  colors?: string[]
  accessories?: string[]
  meta?: BikeMeta
}

// ─── Bike Personalization Types ───────────────────────────────────────────────

export interface BikePersonalization {
  nickname?: string
  color?: string
  accessories: string[]
}

// ─── Calculator Output Types ───────────────────────────────────────────────────

export type UrgencyLevel = 'good' | 'soon' | 'overdue'

export interface ServiceDue {
  intervalKm: number
  label: string
  tasks: ServiceTask[]
  kmRemaining: number        // negative = overdue
  percentRemaining: number   // 0–1; >1 would be negative (overdue)
  urgency: UrgencyLevel
  nextDueAt: number          // absolute km value
}

// ─── UI / App State Types ─────────────────────────────────────────────────────

export type ThemePreference = 'dark' | 'light' | 'system'
export type OdometerUnit = 'km' | 'mi'

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
  source: 'osm' | 'curated' | 're-official'
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
