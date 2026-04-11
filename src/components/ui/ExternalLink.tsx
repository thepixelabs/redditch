import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ExternalLinkProps {
  href: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  /** Skip the default gold/underline styling — use when a parent class takes over */
  unstyled?: boolean
}

/**
 * ExternalLink — opens in a new tab, always.
 *
 * The external-arrow icon carries an accessible label so screen readers
 * announce "(opens in new tab)" without repeating it in the visible text.
 * rel="noopener noreferrer" is non-negotiable for any cross-origin link.
 *
 * Pass `unstyled` when a parent className (e.g. `.enamel-link`) owns the visual.
 */
export function ExternalLink({
  href,
  children,
  className,
  style,
  unstyled = false,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      className={cn(
        !unstyled && [
          'inline-flex items-center gap-1',
          'underline underline-offset-2 decoration-1',
          'text-[var(--re-gold)] hover:text-[var(--re-red)]',
          'transition-colors duration-150',
        ],
        className
      )}
    >
      {children}
      {/* Box-with-arrow icon — universally understood "opens elsewhere" signal */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="(opens in new tab)"
        role="img"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  )
}
