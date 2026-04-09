import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
const parseYaml = yaml.load.bind(yaml)
import { z } from 'zod'
import type { BikeSpec } from './types'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const ServiceTaskSchema = z.object({
  name: z.string(),
  action: z
    .enum(['replace', 'inspect', 'adjust', 'clean', 'lubricate', 'top_up'])
    .optional(),
  torque_nm: z.number().optional(),
  part_number: z.string().optional(),
  part_name: z.string().optional(),
  tools: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

const ServiceIntervalSchema = z.object({
  interval_km: z.number().int().positive(),
  label: z.string(),
  tasks: z.array(ServiceTaskSchema),
})

const TorqueSpecSchema = z.object({
  component: z.string(),
  torque_nm: z.number(),
  notes: z.string().optional(),
})

const ManualLinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
})

const EngineSchema = z.object({
  displacement_cc: z.number(),
  type: z.string(),
  oil_type: z.string(),
  oil_capacity_liters: z.number(),
  oil_capacity_with_filter_liters: z.number().optional(),
  coolant_type: z.string().optional(),
  coolant_capacity_liters: z.number().optional(),
  spark_plug: z.string().optional(),
  valve_clearance_intake_mm: z.string().optional(),
  valve_clearance_exhaust_mm: z.string().optional(),
})

const BrakesSchema = z.object({
  front_type: z.string().optional(),
  rear_type: z.string().optional(),
  brake_fluid: z.string().optional(),
})

const TiresSchema = z.object({
  front: z.string().optional(),
  rear: z.string().optional(),
  pressure_front_psi: z.number().optional(),
  pressure_rear_psi: z.number().optional(),
  pressure_rear_pillion_psi: z.number().optional(),
})

const ChainSchema = z.object({
  type: z.string().optional(),
  slack_mm: z.string().optional(),
  lubricant: z.string().optional(),
})

const BikeMetaSchema = z.object({
  last_verified: z.string(),
  source: z.string().optional(),
  contributors: z.array(z.string()).optional(),
})

const BikeSpecSchema = z.object({
  slug: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  year_range: z.string().optional(),
  engine: EngineSchema,
  brakes: BrakesSchema.optional(),
  tires: TiresSchema.optional(),
  chain: ChainSchema.optional(),
  service_schedule: z.array(ServiceIntervalSchema),
  torque_specs: z.array(TorqueSpecSchema).optional(),
  manuals: z.array(ManualLinkSchema).optional(),
  meta: BikeMetaSchema.optional(),
})

// ─── Data Directory ───────────────────────────────────────────────────────────

function getBikesDir(): string {
  return join(process.cwd(), 'data', 'bikes')
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all bikes from data/bikes/*.yaml
 * Called at build time only (Next.js generateStaticParams / page generation)
 */
export function getAllBikes(): BikeSpec[] {
  const dir = getBikesDir()
  const files = readdirSync(dir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))

  return files.map(file => {
    const raw = readFileSync(join(dir, file), 'utf-8')
    const parsed = parseYaml(raw)
    const result = BikeSpecSchema.safeParse(parsed)
    if (!result.success) {
      throw new Error(
        `Invalid bike data in ${file}:\n${result.error.toString()}`
      )
    }
    return result.data as BikeSpec
  })
}

/**
 * Returns a single bike by slug, or throws if not found
 */
export function getBikeBySlug(slug: string): BikeSpec {
  const bikes = getAllBikes()
  const bike = bikes.find(b => b.slug === slug)
  if (!bike) {
    throw new Error(`Bike not found: ${slug}`)
  }
  return bike
}

/**
 * Returns all bike slugs (for generateStaticParams)
 */
export function getAllBikeSlugs(): string[] {
  return getAllBikes().map(b => b.slug)
}
