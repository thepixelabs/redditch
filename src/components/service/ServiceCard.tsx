'use client'

import { useState, useCallback } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import type { ServiceDue, ServiceTask, UrgencyLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { SpecHighlight } from './SpecHighlight'

interface ServiceCardProps {
  service: ServiceDue
  defaultOpen?: boolean
  id?: string
}

// ─── Action icons ─────────────────────────────────────────────────────────────
// Inline SVGs — no import overhead, inherits currentColor from wrapper.

function ActionIcon({ action }: { action?: string }) {
  const cls = 'flex-shrink-0 text-[var(--re-gold)]'
  const sharedProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (action) {
    case 'inspect':
      return (
        <svg {...sharedProps} className={cls}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    case 'adjust':
      return (
        <svg {...sharedProps} className={cls}>
          <line x1="4" y1="12" x2="20" y2="12" />
          <polyline points="14 6 20 12 14 18" />
        </svg>
      )
    case 'clean':
      return (
        <svg {...sharedProps} className={cls}>
          <path d="M3 6h18M3 12h15M3 18h9" />
        </svg>
      )
    case 'lubricate':
      return (
        <svg {...sharedProps} className={cls}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" />
          <path d="M12 8v4l3 3" />
        </svg>
      )
    case 'top_up':
      return (
        <svg {...sharedProps} className={cls}>
          <polyline points="8 17 12 21 16 17" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      )
    case 'replace':
    default:
      return (
        <svg {...sharedProps} className={cls}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
  }
}

// ─── Urgency badge ────────────────────────────────────────────────────────────

function UrgencyBadge({
  urgency,
  kmRemaining,
}: {
  urgency: UrgencyLevel
  kmRemaining: number
}) {
  const isOverdue = kmRemaining < 0

  const colorMap: Record<UrgencyLevel, string> = {
    good:    'bg-[var(--urgency-good)] text-white',
    soon:    'bg-[var(--urgency-soon)] text-white',
    overdue: 'bg-[var(--re-red)] text-white',
  }

  const label = isOverdue
    ? 'OVERDUE'
    : urgency === 'soon'
    ? `Due in ${Math.abs(kmRemaining).toLocaleString()} km`
    : `${Math.abs(kmRemaining).toLocaleString()} km`

  return (
    <span
      className={cn(
        'flex-shrink-0 text-[11px] font-bold uppercase tracking-wide',
        'px-2 py-1 rounded-[4px] leading-none',
        colorMap[urgency],
      )}
      style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
    >
      {label}
    </span>
  )
}

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms ease',
        color:      'var(--text-muted)',
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ─── Copy-to-clipboard button ─────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available — silently ignore
    }
  }, [text])

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : `Copy part number ${text}`}
      title={copied ? 'Copied' : 'Copy part number'}
      className={cn(
        'inline-flex items-center justify-center',
        'min-h-[28px] min-w-[28px] rounded-[4px] px-1.5',
        'text-[10px] uppercase tracking-wide transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--re-gold)] focus-visible:ring-offset-1',
        'focus-visible:ring-offset-[var(--bg-surface)]',
        copied
          ? 'bg-[var(--urgency-good)] text-white'
          : 'bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]',
      )}
      style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
    >
      {copied ? (
        // Checkmark
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        // Clipboard
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

// ─── Task detail renderer ─────────────────────────────────────────────────────

function TaskDetail({ task, isLast }: { task: ServiceTask; isLast: boolean }) {
  const torqueLabel = `${task.name.toUpperCase()} TORQUE`

  return (
    <div
      className={cn(
        'py-4',
        !isLast && 'border-b border-[var(--border)]',
      )}
    >
      {/* Task name */}
      <p
        className="mb-3 text-[12px] font-bold uppercase tracking-widest text-[var(--text-secondary)]"
        style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
      >
        {task.name}
      </p>

      {/* Torque spec — most prominent element */}
      {task.torque_nm != null && (
        <div className="mb-3">
          <SpecHighlight
            label={torqueLabel}
            value={`${task.torque_nm} Nm`}
          />
        </div>
      )}

      {/* Part name + number */}
      {(task.part_name ?? task.part_number) && (
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          {task.part_name && (
            <span
              className="text-[14px] text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
            >
              {task.part_name}
            </span>
          )}
          {task.part_number && (
            <div className="flex items-center gap-1.5">
              <span
                className="text-[14px] text-[var(--text-secondary)]"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {task.part_number}
              </span>
              <span
                className="text-[11px] text-[var(--text-muted)]"
                style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
              >
                (OEM)
              </span>
              <CopyButton text={task.part_number} />
            </div>
          )}
        </div>
      )}

      {/* Tools list */}
      {task.tools && task.tools.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Tools required">
          {task.tools.map((tool) => (
            <span
              key={tool}
              className={cn(
                'text-[12px] px-2.5 py-1 rounded-[3px]',
                'bg-[var(--bg-card,#2A2A2A)] border border-[var(--border-subtle)]',
                'text-[var(--text-muted)]',
              )}
              style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
            >
              {tool}
            </span>
          ))}
        </div>
      )}

      {/* Note block — amber left accent */}
      {task.notes && (
        <div
          className="mt-2 px-3 py-2.5 rounded-r-[4px]"
          style={{
            borderLeft:  '3px solid var(--re-gold)',
            background:  'rgba(200, 150, 44, 0.06)',
            borderRadius: '0 4px 4px 0',
          }}
        >
          <p
            className="text-[13px] italic leading-relaxed text-[var(--text-secondary)]"
            style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
          >
            {task.notes}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────

export function ServiceCard({ service, defaultOpen = false, id }: ServiceCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      id={id}
    >
      {/* ── Card shell ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          'rounded-[6px] overflow-hidden',
          'bg-[var(--bg-card,#2A2A2A)]',
          'border border-l-[4px]',
          'transition-colors duration-150',
          // Left border urgency coding — visible whether open or closed
          service.urgency === 'overdue' && 'border-l-[var(--re-red)]',
          service.urgency === 'soon'    && 'border-l-[var(--re-gold)]',
          service.urgency === 'good'    && 'border-l-[var(--urgency-good)]',
          // Full border color when open
          open
            ? 'border-[var(--border-subtle,rgba(74,74,74,0.5))]'
            : 'border-[var(--border-subtle,rgba(74,74,74,0.4))]',
        )}
      >
        {/* ── Trigger / header ─────────────────────────────────────────── */}
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className={cn(
              // Layout
              'w-full flex flex-col gap-1 px-4 py-3',
              'min-h-[60px] text-left',
              // Interaction
              'cursor-pointer select-none',
              'transition-colors duration-150',
              'hover:bg-[var(--bg)] active:brightness-95',
              // Focus ring — inset so it doesn't overflow the card
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--re-gold)] focus-visible:ring-inset',
            )}
            aria-expanded={open}
          >
            {/* Top row: icon + label + badge + chevron */}
            <div className="flex items-center gap-3">
              <ActionIcon action={service.tasks[0]?.action} />

              <span
                className="flex-1 text-[17px] font-bold text-[var(--text-primary)] leading-snug"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                {service.label}
              </span>

              <UrgencyBadge
                urgency={service.urgency}
                kmRemaining={service.kmRemaining}
              />

              <ChevronIcon open={open} />
            </div>

            {/* Second row: repeat interval */}
            <p
              className="pl-[32px] text-[12px] text-[var(--text-secondary)] leading-none"
              style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
            >
              Every {service.intervalKm.toLocaleString()} km
            </p>
          </button>
        </Collapsible.Trigger>

        {/* ── Expanded content ──────────────────────────────────────────── */}
        <Collapsible.Content
          // Radix sets data-state="open|closed" and exposes the content height
          // as --radix-collapsible-content-height for CSS animations.
          // overflow-hidden clips the content during the height animation.
          className="overflow-hidden data-[state=open]:[animation:collapsibleDown_250ms_ease] data-[state=closed]:[animation:collapsibleUp_250ms_ease]"
        >
          <div className="px-4 border-t border-[var(--border)]">
            {service.tasks.length === 0 ? (
              <p
                className="py-4 text-[14px] italic text-[var(--text-muted)]"
                style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
              >
                No additional tasks for this interval.
              </p>
            ) : (
              service.tasks.map((task, idx) => (
                <TaskDetail
                  key={`${task.name}-${idx}`}
                  task={task}
                  isLast={idx === service.tasks.length - 1}
                />
              ))
            )}
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}
