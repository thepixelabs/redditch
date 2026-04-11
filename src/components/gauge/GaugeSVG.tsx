'use client'

import { useEffect, useState } from 'react'
import { formatKm } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { UrgencyLevel } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY_VIEWBOX = 220
const PRIMARY_CENTER  = 110
const PRIMARY_RADIUS  = 84
const PRIMARY_STROKE  = 14

const SAT_VIEWBOX     = 140
const SAT_CENTER      = 70
const SAT_RADIUS      = 54
const SAT_STROKE      = 10

// A 270° arc sweeping clockwise from 7:30 (225°) through 12 to 4:30 (135°).
const ARC_START_DEG = 225
const ARC_SWEEP_DEG = 270

// Color band thresholds along the *elapsed* axis — these match
// URGENCY_THRESHOLDS in constants.ts (remaining ≤ 40% = soon, ≤ 0 = overdue).
// Expressed as the fraction of the arc sweep from the left start.
const GREEN_END_PCT  = 0.60   // 0–60% elapsed → green zone
const YELLOW_END_PCT = 0.85   // 60–85% elapsed → yellow zone
// 85–100% → red zone (redline)

// Tick positions: 0%, 25%, 50%, 75%, 100% along the 270° sweep
const TICK_PERCENTS = [0, 0.25, 0.5, 0.75, 1]

// Explicit colors — SVG stroke attributes can't reliably read CSS custom
// properties in every browser, so we resolve to the token hex values that
// globals.css defines for the urgency bands.
const BAND_GREEN  = '#22c55e'
const BAND_YELLOW = '#E6A817'
const BAND_RED    = '#FF4D4D'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GaugeSVGProps {
  /** Current km remaining (negative = overdue) */
  kmRemaining: number
  /** Total interval in km (e.g. 5000 for oil change every 5000 km) */
  intervalKm: number
  /** Service name label */
  label: string
  urgency: UrgencyLevel
  /** Size variant — primary is the hero gauge, satellite is a supporting ring */
  size?: 'primary' | 'satellite'
  /** Called when the user taps the gauge — used to scroll to the task card */
  onClick?: () => void
  className?: string
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/** Convert polar co-ordinates (angle in degrees from 12 o'clock, clockwise)
 *  to SVG cartesian, relative to a given centre point. */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

/** Build SVG path data for a circular arc segment.
 *  startDeg / endDeg are measured clockwise from 12 o'clock. */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polar(cx, cy, r, startDeg)
  const end   = polar(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
}

/** Arc path between two fractional positions (0–1) along the gauge sweep. */
function bandPath(
  cx: number,
  cy: number,
  r: number,
  startPct: number,
  endPct: number,
): string {
  return arcPath(
    cx,
    cy,
    r,
    ARC_START_DEG + startPct * ARC_SWEEP_DEG,
    ARC_START_DEG + endPct * ARC_SWEEP_DEG,
  )
}

// ─── Tick mark component ──────────────────────────────────────────────────────

function TickMarks({
  cx,
  cy,
  r,
  strokeWidth,
}: {
  cx: number
  cy: number
  r: number
  strokeWidth: number
}) {
  const outerR = r + strokeWidth * 0.65
  const innerR = r - strokeWidth * 0.65

  return (
    <g aria-hidden="true">
      {TICK_PERCENTS.map((pct) => {
        const angleDeg = ARC_START_DEG + pct * ARC_SWEEP_DEG
        const outer = polar(cx, cy, outerR, angleDeg)
        const inner = polar(cx, cy, innerR, angleDeg)
        return (
          <line
            key={pct}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={pct === 0 || pct === 1 ? 2 : 1.25}
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}

// ─── GaugeSVG ─────────────────────────────────────────────────────────────────

export function GaugeSVG({
  kmRemaining,
  intervalKm,
  label,
  urgency,
  size = 'primary',
  onClick,
  className,
}: GaugeSVGProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const isPrimary = size === 'primary'
  const vb  = isPrimary ? PRIMARY_VIEWBOX : SAT_VIEWBOX
  const cx  = isPrimary ? PRIMARY_CENTER  : SAT_CENTER
  const cy  = isPrimary ? PRIMARY_CENTER  : SAT_CENTER
  const r   = isPrimary ? PRIMARY_RADIUS  : SAT_RADIUS
  const sw  = isPrimary ? PRIMARY_STROKE  : SAT_STROKE

  // Elapsed fraction of the service interval (0 = fresh, 1 = due/overdue).
  // The needle sweeps *clockwise from the left* as km accumulate — so with
  // 4440 km left on a 5000 km interval, elapsed = 0.112 → needle sits near
  // the left (7:30) start.
  const isOverdue   = kmRemaining < 0
  const rawElapsed  = 1 - kmRemaining / intervalKm
  const elapsedPct  = isOverdue ? 1 : Math.max(0, Math.min(1, rawElapsed))

  // Animate needle from start position → actual position on mount.
  const renderedPct = animated ? elapsedPct : 0
  const needleAngle = ARC_START_DEG + renderedPct * ARC_SWEEP_DEG

  const displayKm    = Math.abs(kmRemaining)
  const formattedKm  = formatKm(displayKm)
  const ariaValueText = isOverdue
    ? `${label} is overdue by ${formattedKm} km`
    : `${formattedKm} km remaining until ${label}`
  const titleText = isOverdue
    ? `${label} overdue by ${formattedKm} km`
    : `${formattedKm} km to ${label}`

  // Wrap in a button if clickable, otherwise a plain div
  const Wrapper = onClick ? 'button' : 'div'
  const wrapperProps = onClick
    ? {
        type: 'button' as const,
        onClick,
        'aria-label': `${label}: ${ariaValueText}. Tap to view tasks.`,
        className: cn(
          'group inline-block cursor-pointer rounded-full',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--re-gold)] focus-visible:ring-offset-2',
          className,
        ),
      }
    : { className: cn('inline-block', className) }

  const pulseClass = isOverdue ? 'gauge-overdue-pulse' : ''

  // Needle length in user-units
  const needleLen = r - sw * 0.5 - (isPrimary ? 6 : 4)
  const needleTail = isPrimary ? 12 : 8
  const needleWidth = isPrimary ? 3 : 2.25

  return (
    <Wrapper {...(wrapperProps as React.HTMLAttributes<HTMLElement>)}>
      <svg
        viewBox={`0 0 ${vb} ${vb}`}
        width="100%"
        height="100%"
        role="meter"
        aria-label={`${label} interval gauge`}
        aria-valuenow={Math.max(0, kmRemaining)}
        aria-valuemin={0}
        aria-valuemax={intervalKm}
        aria-valuetext={ariaValueText}
        focusable="false"
        overflow="visible"
      >
        <title>{titleText}</title>

        {/* ── Background disc ──────────────────────────────────────────────── */}
        <circle
          cx={cx}
          cy={cy}
          r={r + sw * 0.9}
          fill="var(--bg-surface)"
          stroke="var(--re-gunmetal)"
          strokeWidth={0.75}
          aria-hidden="true"
        />

        {/* ── Dim base track (fills the 90° gap visual too) ────────────────── */}
        <path
          d={bandPath(cx, cy, r, 0, 1)}
          fill="none"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth={sw + 2}
          strokeLinecap="butt"
          aria-hidden="true"
        />

        {/* ── Color bands: green / yellow / red ────────────────────────────── */}
        <g className={cn('gauge-bands', pulseClass)} aria-hidden="true">
          <path
            d={bandPath(cx, cy, r, 0, GREEN_END_PCT)}
            fill="none"
            stroke={BAND_GREEN}
            strokeWidth={sw}
            strokeLinecap="butt"
            opacity={0.92}
          />
          <path
            d={bandPath(cx, cy, r, GREEN_END_PCT, YELLOW_END_PCT)}
            fill="none"
            stroke={BAND_YELLOW}
            strokeWidth={sw}
            strokeLinecap="butt"
            opacity={0.92}
          />
          <path
            d={bandPath(cx, cy, r, YELLOW_END_PCT, 1)}
            fill="none"
            stroke={BAND_RED}
            strokeWidth={sw}
            strokeLinecap="butt"
            opacity={0.92}
          />
        </g>

        {/* ── Tick marks ───────────────────────────────────────────────────── */}
        <TickMarks cx={cx} cy={cy} r={r} strokeWidth={sw} />

        {/* ── Needle — rotated via native SVG transform (rock solid) ───────── */}
        <g
          transform={`rotate(${needleAngle} ${cx} ${cy})`}
          style={{
            transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
          aria-hidden="true"
        >
          {/* Shadow */}
          <line
            x1={cx}
            y1={cy + needleTail + 1}
            x2={cx}
            y2={cy - needleLen + 1}
            stroke="rgba(0,0,0,0.45)"
            strokeWidth={needleWidth + 1}
            strokeLinecap="round"
          />
          {/* Needle body */}
          <line
            x1={cx}
            y1={cy + needleTail}
            x2={cx}
            y2={cy - needleLen}
            stroke="var(--re-gold)"
            strokeWidth={needleWidth}
            strokeLinecap="round"
          />
          {/* Needle tip accent */}
          <line
            x1={cx}
            y1={cy - needleLen + (isPrimary ? 10 : 7)}
            x2={cx}
            y2={cy - needleLen}
            stroke={
              urgency === 'good'
                ? BAND_GREEN
                : urgency === 'soon'
                  ? BAND_YELLOW
                  : BAND_RED
            }
            strokeWidth={needleWidth + 0.5}
            strokeLinecap="round"
          />
        </g>

        {/* ── Centre pivot hub ─────────────────────────────────────────────── */}
        <circle
          cx={cx}
          cy={cy}
          r={isPrimary ? 6 : 4.5}
          fill="var(--re-gold)"
          stroke="var(--bg-surface)"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <circle
          cx={cx}
          cy={cy}
          r={isPrimary ? 2.5 : 1.75}
          fill="var(--re-gunmetal)"
          aria-hidden="true"
        />

        {/* ── Centre text: primary ─────────────────────────────────────────── */}
        {isPrimary && (
          <g aria-hidden="true">
            {/* km value — lifted toward the needle hub */}
            <text
              x={cx}
              y={cy - 28}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isOverdue ? 24 : 28}
              fontFamily="var(--font-mono), monospace"
              fill={isOverdue ? BAND_RED : 'var(--text-primary)'}
              fontWeight="700"
              letterSpacing="-0.5"
            >
              {isOverdue ? '−' : ''}{formattedKm}
            </text>
            {/* "km" unit — directly under value */}
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontFamily="var(--font-mono), monospace"
              fill={isOverdue ? BAND_RED : 'var(--text-secondary)'}
              letterSpacing="1.8"
              fontWeight="600"
            >
              {isOverdue ? 'OVERDUE' : 'KM LEFT'}
            </text>
            {/* Service label — pushed below the hub so it sits at the foot */}
            <text
              x={cx}
              y={cy + 32}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontFamily="var(--font-display), Georgia, serif"
              fill="var(--text-secondary)"
              letterSpacing="1.2"
              opacity={0.9}
            >
              {label.toUpperCase()}
            </text>
          </g>
        )}

        {/* ── Centre text: satellite ───────────────────────────────────────── */}
        {!isPrimary && (
          <g aria-hidden="true">
            <text
              x={cx}
              y={cy - 18}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isOverdue ? 12 : 14}
              fontFamily="var(--font-mono), monospace"
              fill={isOverdue ? BAND_RED : 'var(--text-primary)'}
              fontWeight="700"
            >
              {isOverdue ? '−' : ''}{formattedKm}
            </text>
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={7}
              fontFamily="var(--font-mono), monospace"
              fill="var(--text-secondary)"
              letterSpacing="0.8"
              fontWeight="600"
            >
              KM
            </text>
          </g>
        )}
      </svg>
    </Wrapper>
  )
}
