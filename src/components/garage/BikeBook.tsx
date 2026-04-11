'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { BikeSpec, ServiceInterval, TorqueSpec } from '@/lib/types'
import { ExternalLink } from '@/components/ui/ExternalLink'

// ─── Props ────────────────────────────────────────────────────────────────────

interface BikeBookProps {
  bike: BikeSpec
}

// ─── Small shared primitives ──────────────────────────────────────────────────

function Diamond() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 4,
        height: 4,
        background: '#8B4513',
        transform: 'rotate(45deg)',
        flexShrink: 0,
        opacity: 0.7,
      }}
    />
  )
}

function SectionRule() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        margin: 'clamp(6px,1vw,10px) 0',
      }}
    >
      <div style={{ flex: 1, height: '0.5px', background: 'rgba(140,100,40,0.4)' }} />
      <Diamond />
      <div style={{ flex: 1, height: '0.5px', background: 'rgba(140,100,40,0.4)' }} />
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="book-spec-row">
      <span className="book-spec-label">{label}</span>
      <span className="book-spec-value">{value}</span>
    </div>
  )
}

function PageNum({ n, side }: { n: number; side: 'left' | 'right' }) {
  return (
    <div className={`book-page-number book-page-number--${side}`}>{n}</div>
  )
}

function ChapterHead({
  label,
  title,
}: {
  label: string
  title: string
}) {
  return (
    <div style={{ marginBottom: 'clamp(8px,1.5vw,16px)' }}>
      <div className="book-chapter-label">{label}</div>
      <h2 className="book-chapter-title">{title}</h2>
      <SectionRule />
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="book-section-head">{children}</div>
  )
}

function TaskItem({
  task,
  idx,
}: {
  task: ServiceInterval['tasks'][0]
  idx: number
}) {
  return (
    <div className="book-task-item">
      <div className="book-task-header">
        <div style={{ display: 'flex', gap: 5, alignItems: 'baseline', minWidth: 0 }}>
          <span className="book-task-index">{idx + 1}.</span>
          <span className="book-task-name">{task.name}</span>
        </div>
        {task.action && (
          <span className="book-task-action">{task.action}</span>
        )}
      </div>
      {(task.part_number || task.part_name || task.torque_nm) && (
        <div className="book-task-meta">
          {task.part_number && `Part No.\u202F${task.part_number}`}
          {task.part_name && (task.part_number ? ` · ${task.part_name}` : task.part_name)}
          {task.torque_nm && ((task.part_number || task.part_name) ? ` · ` : '') + `Torque\u202F${task.torque_nm}\u202FNm`}
        </div>
      )}
      {task.notes && (
        <div className="book-task-notes">{task.notes}</div>
      )}
    </div>
  )
}

// ─── Cover — left page (leather) ──────────────────────────────────────────────

function CoverLeft() {
  return (
    <div className="book-page book-page--left book-page--leather">
      <div className="book-cover-wrap">
        <svg
          viewBox="0 0 200 200"
          style={{ width: 'clamp(90px, 13vw, 150px)', height: 'clamp(90px, 13vw, 150px)' }}
          aria-hidden="true"
        >
          {/* Outer dashed ring */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(200,150,44,0.35)" strokeWidth="1" strokeDasharray="3.5 3" />
          {/* Middle ring */}
          <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(200,150,44,0.2)" strokeWidth="0.5" />
          {/* Inner bold ring */}
          <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(200,150,44,0.55)" strokeWidth="1.5" />
          {/* Fill */}
          <circle cx="100" cy="100" r="60" fill="rgba(0,0,0,0.35)" />
          {/* Cardinal tick marks */}
          {[0, 90, 180, 270].map(deg => {
            const rad = (deg * Math.PI) / 180
            const x1 = 100 + 80 * Math.sin(rad)
            const y1 = 100 - 80 * Math.cos(rad)
            const x2 = 100 + 90 * Math.sin(rad)
            const y2 = 100 - 90 * Math.cos(rad)
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(200,150,44,0.35)" strokeWidth="0.8" />
          })}
          {/* Text */}
          <text x="100" y="94" textAnchor="middle" fill="rgba(200,150,44,0.8)" fontFamily="Georgia,'Times New Roman',serif" fontSize="11" letterSpacing="4.5" fontWeight="400">ROYAL</text>
          <text x="100" y="108" textAnchor="middle" fill="rgba(200,150,44,0.8)" fontFamily="Georgia,'Times New Roman',serif" fontSize="11" letterSpacing="4.5" fontWeight="400">ENFIELD</text>
          <text x="100" y="123" textAnchor="middle" fill="rgba(200,150,44,0.45)" fontFamily="Georgia,'Times New Roman',serif" fontSize="7.5" letterSpacing="3.5">EST. 1901</text>
        </svg>
        <div className="book-cover-label">Service Manual</div>
        <div className="book-cover-sub">Redditch · Field Edition</div>
      </div>
    </div>
  )
}

// ─── Title page — right page ──────────────────────────────────────────────────

function TitlePage({ bike, pageNum }: { bike: BikeSpec; pageNum: number }) {
  return (
    <div className="book-page book-page--right" style={{ position: 'relative' }}>
      <div className="book-margin" aria-hidden="true" />
      <div className="book-titlepage">
        <div className="book-rule-h" />
        <div className="book-titlepage-mfr">Royal Enfield</div>
        <div className="book-rule-h" />
        <div className="book-titlepage-model">{bike.name}</div>
        {bike.year_range && (
          <div className="book-titlepage-years">Model years {bike.year_range}</div>
        )}
        <div className="book-rule-h" />
        <div className="book-titlepage-descriptor">Owner&apos;s Reference Manual</div>
        <div className="book-rule-h" />
        <p className="book-titlepage-intro">
          This manual covers the complete service specifications,
          maintenance intervals, torque values, and running gear
          data for the {bike.name}. Keep it in your garage. Refer
          to it often.
        </p>
        <div className="book-rule-h" />
        <div className="book-titlepage-footer">
          <span>Redditch · Service Companion</span>
          {bike.meta?.last_verified && (
            <span>Data verified {bike.meta.last_verified}</span>
          )}
        </div>
      </div>
      <PageNum n={pageNum} side="right" />
    </div>
  )
}

// ─── Engine left ──────────────────────────────────────────────────────────────

function EngineLeft({ bike, pageNum }: { bike: BikeSpec; pageNum: number }) {
  const { engine } = bike
  return (
    <div className="book-page book-page--left" style={{ position: 'relative' }}>
      <div className="book-margin" aria-hidden="true" />
      <ChapterHead label="Chapter I" title="Engine &amp; Fluids" />
      <div className="book-spec-table">
        <SpecRow label="Engine type" value={engine.type} />
        <SpecRow label="Displacement" value={`${engine.displacement_cc} cc`} />
        <SpecRow label="Engine oil" value={engine.oil_type} />
        <SpecRow
          label="Oil capacity"
          value={
            engine.oil_capacity_with_filter_liters
              ? `${engine.oil_capacity_liters} L (${engine.oil_capacity_with_filter_liters} L w/ filter)`
              : `${engine.oil_capacity_liters} L`
          }
        />
        {engine.spark_plug && (
          <SpecRow label="Spark plug" value={engine.spark_plug} />
        )}
        {engine.coolant_type && (
          <SpecRow label="Coolant" value={engine.coolant_type} />
        )}
        {engine.coolant_capacity_liters && (
          <SpecRow label="Coolant capacity" value={`${engine.coolant_capacity_liters} L`} />
        )}
      </div>
      <PageNum n={pageNum} side="left" />
    </div>
  )
}

// ─── Engine right (valve clearances + brakes) ─────────────────────────────────

function EngineRight({ bike, pageNum }: { bike: BikeSpec; pageNum: number }) {
  const { engine } = bike
  const hasValves =
    engine.valve_clearance_intake_mm || engine.valve_clearance_exhaust_mm
  return (
    <div className="book-page book-page--right" style={{ position: 'relative' }}>
      <div className="book-margin" aria-hidden="true" />
      <div className="book-continued">continued — Engine &amp; Fluids</div>

      {hasValves && (
        <>
          <SectionHead>Valve Clearances</SectionHead>
          <SectionRule />
          <div className="book-spec-table">
            {engine.valve_clearance_intake_mm && (
              <SpecRow label="Intake" value={`${engine.valve_clearance_intake_mm} mm`} />
            )}
            {engine.valve_clearance_exhaust_mm && (
              <SpecRow label="Exhaust" value={`${engine.valve_clearance_exhaust_mm} mm`} />
            )}
          </div>
          <div className="book-spec-note">
            Check clearances cold, engine at room temperature.
          </div>
        </>
      )}

      {bike.brakes && (
        <>
          <SectionHead>Brakes</SectionHead>
          <SectionRule />
          <div className="book-spec-table">
            {bike.brakes.front_type && (
              <SpecRow label="Front brake" value={bike.brakes.front_type} />
            )}
            {bike.brakes.rear_type && (
              <SpecRow label="Rear brake" value={bike.brakes.rear_type} />
            )}
            {bike.brakes.brake_fluid && (
              <SpecRow label="Brake fluid" value={bike.brakes.brake_fluid} />
            )}
          </div>
        </>
      )}
      <PageNum n={pageNum} side="right" />
    </div>
  )
}

// ─── Service interval page ────────────────────────────────────────────────────

function IntervalPage({
  interval,
  side,
  pageNum,
  isFirstLeft,
}: {
  interval: ServiceInterval
  side: 'left' | 'right'
  pageNum: number
  isFirstLeft?: boolean
}) {
  return (
    <div
      className={`book-page book-page--${side}`}
      style={{ position: 'relative' }}
    >
      <div className="book-margin" aria-hidden="true" />

      {isFirstLeft && (
        <div
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '8px',
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#8B4513',
            marginBottom: 'clamp(4px,0.6vw,8px)',
          }}
        >
          Chapter II
        </div>
      )}

      <div className="book-interval-header">
        <div className="book-interval-km">
          Every {interval.interval_km.toLocaleString()} km
        </div>
        <h3 className="book-interval-label">{interval.label}</h3>
      </div>
      <SectionRule />

      <div>
        {interval.tasks.map((task, i) => (
          <TaskItem key={task.name} task={task} idx={i} />
        ))}
      </div>

      <PageNum n={pageNum} side={side} />
    </div>
  )
}

// ─── Empty page (filler when odd intervals) ───────────────────────────────────

function EmptyPage({ side, pageNum }: { side: 'left' | 'right'; pageNum: number }) {
  return (
    <div className={`book-page book-page--${side}`} style={{ position: 'relative' }}>
      <div className="book-margin" aria-hidden="true" />
      <PageNum n={pageNum} side={side} />
    </div>
  )
}

// ─── Torque specs ─────────────────────────────────────────────────────────────

function TorquePage({
  specs,
  side,
  pageNum,
  isFirst,
}: {
  specs: TorqueSpec[]
  side: 'left' | 'right'
  pageNum: number
  isFirst?: boolean
}) {
  return (
    <div className={`book-page book-page--${side}`} style={{ position: 'relative' }}>
      <div className="book-margin" aria-hidden="true" />
      {isFirst ? (
        <ChapterHead label="Chapter III" title="Torque Specifications" />
      ) : (
        <div className="book-continued">continued — Torque Specifications</div>
      )}
      <table className="book-torque-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Nm</th>
          </tr>
        </thead>
        <tbody>
          {specs.map(spec => (
            <tr key={spec.component}>
              <td>
                {spec.component}
                {spec.notes && (
                  <span className="book-torque-note">{spec.notes}</span>
                )}
              </td>
              <td>{spec.torque_nm}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PageNum n={pageNum} side={side} />
    </div>
  )
}

// ─── Wheels & chain ───────────────────────────────────────────────────────────

function WheelsPage({ bike, pageNum }: { bike: BikeSpec; pageNum: number }) {
  return (
    <div className="book-page book-page--left" style={{ position: 'relative' }}>
      <div className="book-margin" aria-hidden="true" />
      <ChapterHead label="Chapter IV" title="Wheels &amp; Running Gear" />

      {bike.tires && (
        <>
          <SectionHead>Tyres</SectionHead>
          <SectionRule />
          <div className="book-spec-table">
            {bike.tires.front && (
              <SpecRow label="Front tyre" value={bike.tires.front} />
            )}
            {bike.tires.rear && (
              <SpecRow label="Rear tyre" value={bike.tires.rear} />
            )}
            {bike.tires.pressure_front_psi && (
              <SpecRow
                label="Front pressure"
                value={`${bike.tires.pressure_front_psi} psi`}
              />
            )}
            {bike.tires.pressure_rear_psi && (
              <SpecRow
                label="Rear (solo)"
                value={`${bike.tires.pressure_rear_psi} psi`}
              />
            )}
            {bike.tires.pressure_rear_pillion_psi && (
              <SpecRow
                label="Rear (pillion)"
                value={`${bike.tires.pressure_rear_pillion_psi} psi`}
              />
            )}
          </div>
        </>
      )}

      {bike.chain && (
        <>
          <SectionHead>Drive Chain</SectionHead>
          <SectionRule />
          <div className="book-spec-table">
            {bike.chain.type && (
              <SpecRow label="Chain type" value={bike.chain.type} />
            )}
            {bike.chain.slack_mm && (
              <SpecRow label="Chain slack" value={`${bike.chain.slack_mm} mm`} />
            )}
            {bike.chain.lubricant && (
              <SpecRow label="Lubricant" value={bike.chain.lubricant} />
            )}
          </div>
        </>
      )}

      <PageNum n={pageNum} side="left" />
    </div>
  )
}

// ─── Resources page ───────────────────────────────────────────────────────────

const COMMUNITY = [
  { title: 'RE Owners Forum', url: 'https://www.royalenfieldforum.com/' },
  { title: 'RE Reddit Community', url: 'https://www.reddit.com/r/royalenfield/' },
  { title: 'RE Parts Finder', url: 'https://www.royalenfield.com/in/en/owners/genuine-accessories/' },
]

function ResourcesPage({ bike, pageNum }: { bike: BikeSpec; pageNum: number }) {
  return (
    <div className="book-page book-page--right" style={{ position: 'relative' }}>
      <div className="book-margin" aria-hidden="true" />
      <ChapterHead label="Chapter V" title="Manuals &amp; Resources" />

      {bike.manuals && bike.manuals.length > 0 && (
        <>
          <SectionHead>Official Manuals</SectionHead>
          <SectionRule />
          <div style={{ marginBottom: 'clamp(10px,1.5vw,18px)' }}>
            {bike.manuals.map(m => (
              <ExternalLink
                key={m.url}
                href={m.url}
                style={{
                  display: 'block',
                  padding: '5px 0',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 'clamp(9px,1vw,12px)',
                  color: '#5C3010',
                  textDecoration: 'none',
                  borderBottom: '0.5px solid rgba(140,100,40,0.2)',
                }}
              >
                ↗ {m.title}
              </ExternalLink>
            ))}
          </div>
        </>
      )}

      <SectionHead>Community</SectionHead>
      <SectionRule />
      {COMMUNITY.map(link => (
        <ExternalLink
          key={link.url}
          href={link.url}
          style={{
            display: 'block',
            padding: '5px 0',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(9px,1vw,12px)',
            color: '#7A5030',
            textDecoration: 'none',
            borderBottom: '0.5px solid rgba(140,100,40,0.12)',
          }}
        >
          § {link.title}
        </ExternalLink>
      ))}

      {(bike.year_range || bike.meta?.last_verified) && (
        <div className="book-closing-note">
          {bike.year_range && `Covers model years ${bike.year_range}.`}
          {bike.meta?.last_verified && ` Verified ${bike.meta.last_verified}.`}
        </div>
      )}

      <PageNum n={pageNum} side="right" />
    </div>
  )
}

// ─── Spread builder ───────────────────────────────────────────────────────────

interface Spread {
  left: React.ReactNode
  right: React.ReactNode
}

function buildSpreads(bike: BikeSpec): Spread[] {
  const result: Spread[] = []
  let pg = 1

  // Spread 0: Cover + Title
  result.push({ left: <CoverLeft />, right: <TitlePage bike={bike} pageNum={pg} /> })
  pg += 1

  // Spread 1: Engine & Fluids
  result.push({
    left: <EngineLeft bike={bike} pageNum={pg} />,
    right: <EngineRight bike={bike} pageNum={pg + 1} />,
  })
  pg += 2

  // Service schedule spreads (pair intervals 2 per spread)
  const sched = bike.service_schedule
  for (let i = 0; i < sched.length; i += 2) {
    result.push({
      left: (
        <IntervalPage
          interval={sched[i]}
          side="left"
          pageNum={pg}
          isFirstLeft={i === 0}
        />
      ),
      right: sched[i + 1] ? (
        <IntervalPage interval={sched[i + 1]} side="right" pageNum={pg + 1} />
      ) : (
        <EmptyPage side="right" pageNum={pg + 1} />
      ),
    })
    pg += 2
  }

  // Torque specs
  if (bike.torque_specs && bike.torque_specs.length > 0) {
    const half = Math.ceil(bike.torque_specs.length / 2)
    result.push({
      left: <TorquePage specs={bike.torque_specs.slice(0, half)} side="left" pageNum={pg} isFirst />,
      right: <TorquePage specs={bike.torque_specs.slice(half)} side="right" pageNum={pg + 1} />,
    })
    pg += 2
  }

  // Wheels & Resources
  result.push({
    left: <WheelsPage bike={bike} pageNum={pg} />,
    right: <ResourcesPage bike={bike} pageNum={pg + 1} />,
  })

  return result
}

// ─── The Book ─────────────────────────────────────────────────────────────────

export function BikeBook({ bike }: BikeBookProps) {
  const spreads = buildSpreads(bike)
  const totalSpreads = spreads.length
  const totalMobilePages = totalSpreads * 2

  // Desktop: spreadIdx (0 … totalSpreads-1)
  // Mobile: mobilePageIdx (0 … totalMobilePages-1)
  const [spreadIdx, setSpreadIdx] = useState(0)
  const [mobilePageIdx, setMobilePageIdx] = useState(0)
  const [animDir, setAnimDir] = useState<'forward' | 'backward'>('forward')
  const [animKey, setAnimKey] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const mouseDragged = useRef(false)
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX
    mouseDragged.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current !== null && Math.abs(e.clientX - mouseStartX.current) > 6) {
      mouseDragged.current = true
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return
    const delta = mouseStartX.current - e.clientX
    if (Math.abs(delta) > 55) {
      if (delta > 0) goNext()
      else goPrev()
    }
    mouseStartX.current = null
    mouseDragged.current = false
  }

  // Derived display values
  const displaySpread = isMobile ? Math.floor(mobilePageIdx / 2) : spreadIdx
  const mobileSide = mobilePageIdx % 2 === 0 ? 'left' : 'right'

  const canGoPrev = isMobile ? mobilePageIdx > 0 : spreadIdx > 0
  const canGoNext = isMobile
    ? mobilePageIdx < totalMobilePages - 1
    : spreadIdx < totalSpreads - 1

  const goNext = useCallback(() => {
    if (!canGoNext) return
    setAnimDir('forward')
    setAnimKey(k => k + 1)
    if (isMobile) {
      setMobilePageIdx(p => p + 1)
      // Keep desktop spread in sync
      setSpreadIdx(Math.floor((mobilePageIdx + 1) / 2))
    } else {
      setSpreadIdx(s => s + 1)
    }
  }, [canGoNext, isMobile, mobilePageIdx])

  const goPrev = useCallback(() => {
    if (!canGoPrev) return
    setAnimDir('backward')
    setAnimKey(k => k + 1)
    if (isMobile) {
      setMobilePageIdx(p => p - 1)
      setSpreadIdx(Math.floor((mobilePageIdx - 1) / 2))
    } else {
      setSpreadIdx(s => s - 1)
    }
  }, [canGoPrev, isMobile, mobilePageIdx])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 55) {
      if (delta > 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  const spread = spreads[displaySpread]

  // Mobile progress display: "Page X of Y"
  const mobileLabel = `Page ${mobilePageIdx + 1} of ${totalMobilePages}`
  const desktopLabel = `${displaySpread + 1} · ${totalSpreads}`

  return (
    <div
      className="book-table"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* The open book */}
      <div
        key={animKey}
        className={`book-open book-open--${animDir}`}
        data-mobile-side={mobileSide}
        aria-label={`${bike.name} reference manual — ${isMobile ? mobileLabel : `spread ${displaySpread + 1}`}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Left page */}
        <div className="book-page-slot book-page-slot--left">
          {spread.left}
        </div>

        {/* Spine */}
        <div className="book-spine" aria-hidden="true">
          <div className="book-spine-highlight" aria-hidden="true" />
        </div>

        {/* Right page */}
        <div className="book-page-slot book-page-slot--right">
          {spread.right}
        </div>
      </div>

      {/* Prev arrow */}
      <button
        className="book-nav book-nav--prev"
        onClick={goPrev}
        disabled={!canGoPrev}
        aria-label="Previous page"
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        className="book-nav book-nav--next"
        onClick={goNext}
        disabled={!canGoNext}
        aria-label="Next page"
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Navigation hint — fades out after a few seconds */}
      <div
        aria-hidden="true"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: 'italic',
          fontSize: 'clamp(9px, 0.9vw, 11px)',
          color: 'rgba(200,150,44,0.55)',
          letterSpacing: '0.08em',
          textAlign: 'center',
          marginTop: 8,
          opacity: showHint ? 1 : 0,
          transition: 'opacity 900ms ease',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          textShadow: '0 1px 4px rgba(0,0,0,0.7)',
          userSelect: 'none',
        }}
      >
        {isMobile ? 'swipe left or right to turn pages' : 'drag or use the ← → arrows to turn pages'}
      </div>

      {/* Page counter */}
      <div className="book-counter" aria-live="polite">
        {isMobile ? mobileLabel : desktopLabel}
      </div>
    </div>
  )
}
