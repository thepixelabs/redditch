'use client'

import type { BikeSpec } from '@/lib/types'
import { ExternalLink } from '@/components/ui/ExternalLink'

interface BikeReferencePanelProps {
  bike: BikeSpec
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-body), system-ui, sans-serif',
        fontSize: 'clamp(0.6rem, 0.75vw, 0.75rem)',
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--re-gold)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {children}
    </h2>
  )
}

// ─── Engine & fluids card ─────────────────────────────────────────────────────

function EngineCard({ bike }: { bike: BikeSpec }) {
  const { engine } = bike
  const rows: { label: string; value: string }[] = [
    { label: 'Engine', value: engine.type },
    { label: 'Displacement', value: `${engine.displacement_cc} cc` },
    { label: 'Oil type', value: engine.oil_type },
    {
      label: 'Oil capacity',
      value: engine.oil_capacity_with_filter_liters
        ? `${engine.oil_capacity_liters} L (${engine.oil_capacity_with_filter_liters} L w/ filter)`
        : `${engine.oil_capacity_liters} L`,
    },
    ...(engine.spark_plug ? [{ label: 'Spark plug', value: engine.spark_plug }] : []),
    ...(engine.valve_clearance_intake_mm
      ? [{ label: 'Valve clearance (in)', value: `${engine.valve_clearance_intake_mm} mm` }]
      : []),
    ...(engine.valve_clearance_exhaust_mm
      ? [{ label: 'Valve clearance (ex)', value: `${engine.valve_clearance_exhaust_mm} mm` }]
      : []),
    ...(engine.coolant_type ? [{ label: 'Coolant', value: engine.coolant_type }] : []),
    ...(engine.coolant_capacity_liters
      ? [{ label: 'Coolant capacity', value: `${engine.coolant_capacity_liters} L` }]
      : []),
  ]

  return (
    <div className="spec-card">
      <p className="spec-card-title">Engine &amp; Fluids</p>
      {rows.map(({ label, value }) => (
        <div key={label} className="spec-row">
          <span className="spec-row-label">{label}</span>
          <span className="spec-row-value">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Tyres card ───────────────────────────────────────────────────────────────

function TyresCard({ bike }: { bike: BikeSpec }) {
  const { tires } = bike
  if (!tires) return null

  const rows: { label: string; value: string }[] = [
    ...(tires.front ? [{ label: 'Front tyre', value: tires.front }] : []),
    ...(tires.rear  ? [{ label: 'Rear tyre',  value: tires.rear  }] : []),
    ...(tires.pressure_front_psi
      ? [{ label: 'Front pressure', value: `${tires.pressure_front_psi} psi` }]
      : []),
    ...(tires.pressure_rear_psi
      ? [{ label: 'Rear pressure (solo)', value: `${tires.pressure_rear_psi} psi` }]
      : []),
    ...(tires.pressure_rear_pillion_psi
      ? [{ label: 'Rear pressure (pillion)', value: `${tires.pressure_rear_pillion_psi} psi` }]
      : []),
  ]
  if (rows.length === 0) return null

  return (
    <div className="spec-card">
      <p className="spec-card-title">Tyres &amp; Pressures</p>
      {rows.map(({ label, value }) => (
        <div key={label} className="spec-row">
          <span className="spec-row-label">{label}</span>
          <span className="spec-row-value">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Chain & brakes card ──────────────────────────────────────────────────────

function ChainBrakesCard({ bike }: { bike: BikeSpec }) {
  const rows: { label: string; value: string }[] = []

  if (bike.chain) {
    if (bike.chain.type)     rows.push({ label: 'Chain type',   value: bike.chain.type })
    if (bike.chain.slack_mm) rows.push({ label: 'Chain slack',  value: `${bike.chain.slack_mm} mm` })
    if (bike.chain.lubricant) rows.push({ label: 'Chain lube',  value: bike.chain.lubricant })
  }

  if (bike.brakes) {
    if (bike.brakes.front_type)  rows.push({ label: 'Front brake',  value: bike.brakes.front_type })
    if (bike.brakes.rear_type)   rows.push({ label: 'Rear brake',   value: bike.brakes.rear_type  })
    if (bike.brakes.brake_fluid) rows.push({ label: 'Brake fluid',  value: bike.brakes.brake_fluid })
  }

  if (rows.length === 0) return null

  return (
    <div className="spec-card">
      <p className="spec-card-title">Chain &amp; Brakes</p>
      {rows.map(({ label, value }) => (
        <div key={label} className="spec-row">
          <span className="spec-row-label">{label}</span>
          <span className="spec-row-value">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Torque specs card ────────────────────────────────────────────────────────

function TorqueCard({ bike }: { bike: BikeSpec }) {
  if (!bike.torque_specs || bike.torque_specs.length === 0) return null

  return (
    <div className="spec-card" style={{ gridColumn: 'span 1' }}>
      <p className="spec-card-title">Torque Specs</p>
      <table className="torque-table">
        <thead>
          <tr>
            <th>Component</th>
            <th style={{ textAlign: 'right', paddingRight: 0 }}>Nm</th>
          </tr>
        </thead>
        <tbody>
          {bike.torque_specs.map((spec) => (
            <tr key={spec.component}>
              <td>
                {spec.component}
                {spec.notes && (
                  <span style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {spec.notes}
                  </span>
                )}
              </td>
              <td>{spec.torque_nm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Manuals & resources card ─────────────────────────────────────────────────

function ResourcesCard({ bike }: { bike: BikeSpec }) {
  const communityLinks = [
    { title: 'RE Owners Forum', url: 'https://www.royalenfieldforum.com/' },
    { title: 'RE Reddit Community', url: 'https://www.reddit.com/r/royalenfield/' },
    { title: 'RE Parts Finder', url: 'https://www.royalenfield.com/in/en/owners/genuine-accessories/' },
  ]

  return (
    <div className="spec-card">
      <p className="spec-card-title">Manuals &amp; Resources</p>

      {bike.manuals && bike.manuals.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {bike.manuals.map((manual) => (
            <ExternalLink
              key={manual.url}
              href={manual.url}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 0',
                fontSize: 'clamp(0.75rem, 0.85vw, 0.9rem)',
                color: 'var(--re-gold)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-body), system-ui, sans-serif',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {manual.title}
            </ExternalLink>
          ))}
        </div>
      )}

      <div>
        {communityLinks.map((link) => (
          <ExternalLink
            key={link.url}
            href={link.url}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 0',
              fontSize: 'clamp(0.75rem, 0.85vw, 0.9rem)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {link.title}
          </ExternalLink>
        ))}
      </div>
    </div>
  )
}

// ─── BikeReferencePanel ───────────────────────────────────────────────────────

export function BikeReferencePanel({ bike }: BikeReferencePanelProps) {
  return (
    <section
      aria-labelledby="bike-reference-heading"
      style={{ marginTop: 'clamp(24px, 3vw, 48px)' }}
    >
      {/* Divider + heading */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '0',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            height: '1px',
            flex: 1,
            background: 'linear-gradient(90deg, var(--re-gold), transparent)',
            opacity: 0.3,
          }}
        />
        <SectionHeading>
          <span id="bike-reference-heading">
            {bike.name} — Quick Reference
          </span>
        </SectionHeading>
        <div
          aria-hidden="true"
          style={{
            height: '1px',
            flex: 1,
            background: 'linear-gradient(270deg, var(--re-gold), transparent)',
            opacity: 0.3,
          }}
        />
      </div>

      {/* Spec card grid */}
      <div className="garage-reference-grid">
        <EngineCard bike={bike} />
        <TyresCard bike={bike} />
        <ChainBrakesCard bike={bike} />
        <TorqueCard bike={bike} />
        <ResourcesCard bike={bike} />
      </div>

      {/* Year range note */}
      {bike.year_range && (
        <p
          style={{
            marginTop: '12px',
            fontSize: 'clamp(0.65rem, 0.75vw, 0.75rem)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body), system-ui, sans-serif',
            textAlign: 'right',
          }}
        >
          Data covers model years {bike.year_range}
          {bike.meta?.last_verified ? ` · Verified ${bike.meta.last_verified}` : ''}
        </p>
      )}
    </section>
  )
}
