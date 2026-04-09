'use client'

import { useEffect, useState } from 'react'
import { formatKm } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { UrgencyLevel } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY_VIEWBOX   = 200
const PRIMARY_CENTER    = 100
const PRIMARY_RADIUS    = 80
const PRIMARY_STROKE    = 10

const SAT_VIEWBOX       = 120
const SAT_CENTER        = 60
const SAT_RADIUS        = 50
const SAT_STROKE        = 8

// A 270° arc. The full circumference of the circle is 2π·r; the dasharray
// uses the *full* circumference as the period so the gap swallows the unused
// 90° segment and nothing bleeds around the back.
const PRIMARY_CIRC      = 2 * Math.PI * PRIMARY_RADIUS  // ≈ 502.65
const PRIMARY_ARC       = (270 / 360) * PRIMARY_CIRC    // ≈ 376.99  → 377

const SAT_CIRC          = 2 * Math.PI * SAT_RADIUS      // ≈ 314.16
const SAT_ARC           = (270 / 360) * SAT_CIRC        // ≈ 235.62  → 236

// Tick positions: 0%, 25%, 50%, 75%, 100% along the 270° sweep
const TICK_PERCENTS = [0, 0.25, 0.5, 0.75, 1]

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

// ─── Urgency colour map ───────────────────────────────────────────────────────
// We can't read CSS custom properties at render time in RSC-safe code, so we
// supply explicit colour values and let the CSS variable override via a wrapper
// class on the SVG element.  The inline fill/stroke on the arc always wins in
// SVG, so we resolve directly to the token hex values that globals.css defines.

function urgencyColor(urgency: UrgencyLevel, dark = false): string {
  switch (urgency) {
    case 'good':    return dark ? '#22c55e' : '#16a34a'
    case 'soon':    return dark ? '#E6A817' : '#b45309'
    case 'overdue': return dark ? '#FF4D4D' : '#B5121B'
  }
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

// ─── Tick mark component ──────────────────────────────────────────────────────

function TickMarks({
  cx,
  cy,
  r,
  strokeWidth,
  startDeg,
  sweepDeg,
}: {
  cx: number
  cy: number
  r: number
  strokeWidth: number
  startDeg: number
  sweepDeg: number
}) {
  const outerR = r + strokeWidth * 0.5
  const innerR = outerR - strokeWidth * 1.1   // tick extends inward from arc edge

  return (
    <g aria-hidden="true">
      {TICK_PERCENTS.map((pct) => {
        const angleDeg = startDeg + pct * sweepDeg
        const outer = polar(cx, cy, outerR, angleDeg)
        const inner = polar(cx, cy, innerR, angleDeg)
        return (
          <line
            key={pct}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke="var(--re-gunmetal)"
            strokeWidth={pct === 0 || pct === 1 ? 1.5 : 1}
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

  const isPrimary  = size === 'primary'
  const vb         = isPrimary ? PRIMARY_VIEWBOX : SAT_VIEWBOX
  const cx         = isPrimary ? PRIMARY_CENTER  : SAT_CENTER
  const cy         = isPrimary ? PRIMARY_CENTER  : SAT_CENTER
  const r          = isPrimary ? PRIMARY_RADIUS  : SAT_RADIUS
  const sw         = isPrimary ? PRIMARY_STROKE  : SAT_STROKE
  const circ       = isPrimary ? PRIMARY_CIRC    : SAT_CIRC
  const arcLen     = isPrimary ? PRIMARY_ARC     : SAT_ARC

  // The 270° arc starts at the 225° position (bottom-left at 7 o'clock) and
  // ends at the 135° position (bottom-right at 5 o'clock), sweeping clockwise.
  // In "clockwise from 12 o'clock" convention: start = 225, end = 225+270 = 495 = 135.
  const ARC_START_DEG = 225
  const ARC_SWEEP_DEG = 270

  // Percent filled: clamp 0–1, 0 when overdue or at the service boundary.
  const percentFilled = animated
    ? Math.max(0, Math.min(1, kmRemaining / intervalKm))
    : 0

  const fillLength    = percentFilled * arcLen

  // Needle angle: -135° (empty, 7 o'clock) → +135° (full, 5 o'clock), centred at 0° (top)
  const needleAngle   = -135 + percentFilled * 270

  // Colour resolved from urgency — we emit both dark and light variants and
  // rely on CSS class toggling from the theme wrapper.  SVG has no native
  // media-query colour switching on fills, so we use a CSS custom property
  // defined via an inline style on the SVG element itself.
  const fillColor     = `var(--urgency-${urgency === 'overdue' ? 'over' : urgency})`

  // ── Arc paths ──────────────────────────────────────────────────────────────
  const trackPath = arcPath(cx, cy, r, ARC_START_DEG, ARC_START_DEG + ARC_SWEEP_DEG)

  // For the animated fill arc we use stroke-dasharray on a full-circle <circle>
  // rotated so its "start" aligns with our arc origin — cleaner than
  // reconstructing partial path data on every render.
  //
  // stroke-dasharray: fillLength, circ  → fills fillLength px of the arc,
  //                                       gap swallows the rest.
  // The circle is rotated 135° (225° from top = 90° + 135°) so the dash
  // starts at the bottom-left.

  const isOverdue       = kmRemaining < 0
  const displayKm       = Math.abs(kmRemaining)
  const formattedKm     = formatKm(displayKm)
  const ariaValueText   = isOverdue
    ? `${label} is overdue by ${formattedKm} km`
    : `${formattedKm} km remaining until ${label}`
  const titleText       = isOverdue
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

  // ── Overdue pulse animation class ─────────────────────────────────────────
  // Defined in globals.css via @keyframes — we only attach the class; the
  // CSS media query for prefers-reduced-motion is handled there.
  const pulseClass = isOverdue ? 'gauge-overdue-pulse' : ''

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

        {/* ── Background disc ────────────────────────────────────────────────── */}
        <circle
          cx={cx}
          cy={cy}
          r={r + sw}
          fill="var(--bg-surface)"
          stroke="var(--re-gunmetal)"
          strokeWidth={0.5}
          aria-hidden="true"
        />

        {/* ── Track arc ──────────────────────────────────────────────────────── */}
        <path
          d={trackPath}
          fill="none"
          stroke="var(--re-gunmetal)"
          strokeWidth={sw}
          strokeLinecap="round"
          opacity={0.4}
          aria-hidden="true"
        />

        {/* ── Filled arc (animated via stroke-dasharray) ─────────────────────── */}
        {/*
          We rotate the circle element 135° around its centre so that angle 0
          (rightward, 3 o'clock) maps to our 225° start (7 o'clock):
          SVG 0° is 3 o'clock, we need 7 o'clock = 225°, rotate by 135°.
          stroke-dasharray draws dashLength then gap; the gap covers the rest
          of the circumference including the hidden 90° bottom segment.
        */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${animated ? fillLength : 0} ${circ}`}
          transform={`rotate(135 ${cx} ${cy})`}
          className={cn('gauge-fill', pulseClass)}
          aria-hidden="true"
        />

        {/* ── Tick marks ────────────────────────────────────────────────────── */}
        <TickMarks
          cx={cx}
          cy={cy}
          r={r}
          strokeWidth={sw}
          startDeg={ARC_START_DEG}
          sweepDeg={ARC_SWEEP_DEG}
        />

        {/* ── Needle (primary only) ──────────────────────────────────────────── */}
        {isPrimary && (
          <g aria-hidden="true">
            {/* Needle shadow for depth */}
            <line
              x1={cx}
              y1={cy + 6}
              x2={cx}
              y2={cy - r + 16}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={3}
              strokeLinecap="round"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: `rotate(${needleAngle}deg) translateX(1px)`,
                transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
            {/* Needle body */}
            <line
              x1={cx}
              y1={cy + 6}
              x2={cx}
              y2={cy - r + 14}
              stroke="var(--re-gold)"
              strokeWidth={2.5}
              strokeLinecap="round"
              className="gauge-needle"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: `rotate(${needleAngle}deg)`,
                transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
            {/* Needle tip accent */}
            <line
              x1={cx}
              y1={cy - r + 14}
              x2={cx}
              y2={cy - r + 4}
              stroke={fillColor}
              strokeWidth={2}
              strokeLinecap="round"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: `rotate(${needleAngle}deg)`,
                transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
            {/* Centre pivot dot */}
            <circle
              cx={cx}
              cy={cy}
              r={5}
              fill="var(--re-gold)"
              stroke="var(--bg-surface)"
              strokeWidth={1.5}
            />
            <circle
              cx={cx}
              cy={cy}
              r={2}
              fill="var(--re-gunmetal)"
            />
          </g>
        )}

        {/* ── Centre pivot dot (satellite — no needle) ───────────────────────── */}
        {!isPrimary && (
          <circle
            cx={cx}
            cy={cy}
            r={3.5}
            fill="var(--re-gold)"
            aria-hidden="true"
          />
        )}

        {/* ── Centre text: primary ───────────────────────────────────────────── */}
        {isPrimary && (
          <g aria-hidden="true">
            {/* km value */}
            <text
              x={cx}
              y={isOverdue ? cy - 8 : cy - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isOverdue ? 22 : 26}
              fontFamily="var(--font-mono), monospace"
              fill={isOverdue ? fillColor : 'var(--text-primary)'}
              fontWeight="600"
              letterSpacing="-0.5"
            >
              {isOverdue ? '−' : ''}{formattedKm}
            </text>
            {/* "km" unit */}
            <text
              x={cx}
              y={isOverdue ? cy + 12 : cy + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontFamily="var(--font-mono), monospace"
              fill={isOverdue ? fillColor : 'var(--text-secondary)'}
              letterSpacing="1.5"
            >
              {isOverdue ? 'OVERDUE' : 'KM LEFT'}
            </text>
            {/* Label */}
            <text
              x={cx}
              y={cy + 28}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fontFamily="var(--font-display), Georgia, serif"
              fill="var(--text-secondary)"
              letterSpacing="1"
              opacity={0.8}
            >
              {label.toUpperCase()}
            </text>
          </g>
        )}

        {/* ── Centre text: satellite ─────────────────────────────────────────── */}
        {!isPrimary && (
          <g aria-hidden="true">
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isOverdue ? 11 : 13}
              fontFamily="var(--font-mono), monospace"
              fill={isOverdue ? fillColor : 'var(--text-primary)'}
              fontWeight="600"
            >
              {isOverdue ? '−' : ''}{formattedKm}
            </text>
            <text
              x={cx}
              y={cy + 9}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={7}
              fontFamily="var(--font-mono), monospace"
              fill="var(--text-secondary)"
              letterSpacing="0.8"
            >
              KM
            </text>
          </g>
        )}
      </svg>
    </Wrapper>
  )
}
