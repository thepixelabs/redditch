'use client'

import { useState, useCallback } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import type { BucketDue, ServiceDue, UrgencyLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { SpecHighlight } from './SpecHighlight'

interface ServiceCardProps {
  bucket: BucketDue
  defaultOpen?: boolean
  id?: string
  /** Current odometer reading in km — used when logging completion. */
  odometerKm: number
  /** Called when the owner taps "Mark service done" — logs ALL tasks in the bucket. */
  onMarkBucketDone: (taskIds: string[], atKm: number) => void
  /** Called for the per-task "Mark this task done" button inside the expanded view. */
  onMarkTaskDone: (taskId: string, atKm: number) => void
}

// ─── Action icons ─────────────────────────────────────────────────────────────

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

// ─── Copy button (part numbers) ──────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
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

// ─── Memory line ─────────────────────────────────────────────────────────────

function relativeDays(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

// ─── Per-task row (inside the expanded bucket) ───────────────────────────────

function TaskRow({
  taskDue,
  isLast,
  odometerKm,
  onMarkDone,
}: {
  taskDue: ServiceDue
  isLast: boolean
  odometerKm: number
  onMarkDone: (taskId: string, atKm: number) => void
}) {
  const { task, lastDone } = taskDue

  return (
    <div
      className={cn(
        'py-4',
        !isLast && 'border-b border-[var(--border)]',
      )}
    >
      {/* Task name + per-task done button */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <p
          className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
        >
          {task.name}
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMarkDone(task.id, odometerKm) }}
          disabled={odometerKm <= 0}
          className={cn(
            'flex-shrink-0 px-2.5 py-1 rounded-[3px] min-h-[28px]',
            'text-[10px] font-bold uppercase tracking-[0.12em]',
            'border transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--re-gold)]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'bg-transparent text-[var(--text-secondary)] border-[var(--border-subtle)]',
            'hover:text-[var(--re-gold)] hover:border-[var(--re-gold-muted)]',
          )}
          style={{ fontFamily: 'var(--font-mono), monospace' }}
          aria-label={`Mark only ${task.name} done`}
        >
          Done
        </button>
      </div>

      {lastDone && (
        <p
          className="-mt-2 mb-2 text-[11px] text-[var(--text-muted)]"
          style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
        >
          Last done: {lastDone.doneAtKm.toLocaleString()} km · {relativeDays(lastDone.doneAt)}
        </p>
      )}

      {task.torque_nm != null && (
        <div className="mb-3">
          <SpecHighlight
            label={`${task.name.toUpperCase()} TORQUE`}
            value={`${task.torque_nm} Nm`}
          />
        </div>
      )}

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

      {task.tools && task.tools.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Tools required">
          {task.tools.map((tool) => (
            <span
              key={tool}
              className={cn(
                'text-[12px] px-2.5 py-1 rounded-[3px]',
                'bg-[var(--bg-card)] border border-[var(--border-subtle)]',
                'text-[var(--text-muted)]',
              )}
              style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
            >
              {tool}
            </span>
          ))}
        </div>
      )}

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

// ─── ServiceCard — one card per Minor/Major/Extended bucket ─────────────────

export function ServiceCard({
  bucket,
  defaultOpen = false,
  id,
  odometerKm,
  onMarkBucketDone,
  onMarkTaskDone,
}: ServiceCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  const recurrenceLine = bucket.one_shot
    ? `One-time at ${bucket.intervalKm.toLocaleString()} km · ${bucket.tasks.length} ${bucket.tasks.length === 1 ? 'task' : 'tasks'}`
    : `Every ${bucket.intervalKm.toLocaleString()} km · ${bucket.tasks.length} ${bucket.tasks.length === 1 ? 'task' : 'tasks'}`

  const headerAction = bucket.tasks[0]?.task.action

  const handleBulkDone = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onMarkBucketDone(bucket.tasks.map((t) => t.task.id), odometerKm)
    },
    [bucket.tasks, odometerKm, onMarkBucketDone],
  )

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} id={id}>
      <div
        className={cn(
          'rounded-[6px] overflow-hidden',
          'bg-[var(--bg-card)]',
          'border border-l-[4px]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.35),0_0_0_1px_rgba(200,150,44,0.04)]',
          'transition-colors duration-150',
          bucket.urgency === 'overdue' && 'border-l-[var(--re-red)]',
          bucket.urgency === 'soon'    && 'border-l-[var(--re-gold)]',
          bucket.urgency === 'good'    && 'border-l-[var(--urgency-good)]',
          open ? 'border-[var(--border)]' : 'border-[var(--border-subtle)]',
        )}
      >
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className={cn(
              'w-full flex flex-col gap-1 px-4 md:px-5 py-3 md:py-4',
              'min-h-[60px] md:min-h-[72px] text-left',
              'cursor-pointer select-none',
              'transition-colors duration-150',
              'hover:bg-[var(--bg)] active:brightness-95',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--re-gold)] focus-visible:ring-inset',
            )}
            aria-expanded={open}
          >
            <div className="flex items-center gap-3">
              <ActionIcon action={headerAction} />
              <span
                className="flex-1 text-[17px] md:text-[19px] font-bold text-[var(--text-primary)] leading-snug"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                {bucket.label}
              </span>
              <UrgencyBadge urgency={bucket.urgency} kmRemaining={bucket.kmRemaining} />
              <ChevronIcon open={open} />
            </div>
            <p
              className="pl-[32px] text-[12px] md:text-[13px] text-[var(--text-secondary)] leading-none"
              style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
            >
              {recurrenceLine}
            </p>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content
          className="overflow-hidden data-[state=open]:[animation:collapsibleDown_250ms_ease] data-[state=closed]:[animation:collapsibleUp_250ms_ease]"
        >
          <div className="px-4 md:px-5 border-t border-[var(--border)]">
            {bucket.tasks.map((taskDue, idx) => (
              <TaskRow
                key={taskDue.task.id}
                taskDue={taskDue}
                isLast={idx === bucket.tasks.length - 1}
                odometerKm={odometerKm}
                onMarkDone={onMarkTaskDone}
              />
            ))}

            {/* Bulk Mark Done — bottom action for the whole service */}
            <div className="py-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleBulkDone}
                disabled={odometerKm <= 0}
                className={cn(
                  'w-full min-h-[44px] px-4 rounded-[4px]',
                  'text-[13px] font-bold uppercase tracking-[0.14em]',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--re-gold)]',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'bg-[var(--re-gold)] text-[var(--re-black)] hover:brightness-110 active:brightness-95',
                )}
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                aria-label={`Mark all ${bucket.tasks.length} tasks in ${bucket.label} done at ${odometerKm.toLocaleString()} km`}
              >
                Mark whole service done at {odometerKm.toLocaleString()} km
              </button>
            </div>
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}
