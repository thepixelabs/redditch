/**
 * WorkshopWall — atmospheric SVG background that sits behind the homepage
 * neon sign / platform selector. Slot 1 from the illustrator's brief.
 *
 * Aged ochre limewash plaster, raw brick patches, oil stain spreading from a
 * hung spanner shadow, single overhead pendant glow. The whole composition
 * is muted enough that the foreground UI stays dominant — a textured plane,
 * not a hero image.
 *
 * Positioned absolute behind the homepage `.spotlight` overlay so the
 * existing warm glow continues to bloom over it.
 */

export function WorkshopWall() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.55,
        mixBlendMode: 'screen',
      }}
    >
      <svg
        viewBox="0 0 1600 1100"
        preserveAspectRatio="xMidYMin slice"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          {/* Pendant lamp glow from top-centre */}
          <radialGradient id="wall-lamp" cx="0.5" cy="0.0" r="0.65">
            <stop offset="0%"  stopColor="#ffd48a" stopOpacity="0.45" />
            <stop offset="20%" stopColor="#c8962c" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#3a2014" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Plaster base */}
          <linearGradient id="wall-plaster" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#1a1510" />
            <stop offset="50%" stopColor="#0f0a06" />
            <stop offset="100%" stopColor="#050302" />
          </linearGradient>

          {/* Brick patch tone */}
          <linearGradient id="wall-brick" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#5a3018" />
            <stop offset="100%" stopColor="#2a1408" />
          </linearGradient>

          {/* Oil stain — radial dark patch */}
          <radialGradient id="wall-oil" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"  stopColor="#000000" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#1a0e06" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1a0e06" stopOpacity="0" />
          </radialGradient>

          {/* Plaster grain */}
          <filter id="wall-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.78  0 0 0 0 0.5  0 0 0 0.18 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        {/* Plaster base */}
        <rect x="0" y="0" width="1600" height="1100" fill="url(#wall-plaster)" />
        <rect x="0" y="0" width="1600" height="1100" fill="url(#wall-lamp)" />

        {/* Brick patch — top-right — exposed where plaster has fallen */}
        <g transform="translate(1180 80)" opacity="0.62">
          {/* Patch outline (rough edge) */}
          <path
            d="M 0 0 L 280 -20 L 320 60 L 300 200 L 220 240 L 80 220 L 20 140 Z"
            fill="url(#wall-brick)"
          />
          {/* Brick courses */}
          {Array.from({ length: 6 }).map((_, row) => {
            const offset = row % 2 === 0 ? 0 : 38
            const y = row * 30 + 5
            return Array.from({ length: 5 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={offset + col * 76 - 10}
                y={y}
                width="72"
                height="26"
                fill="none"
                stroke="#3a1a08"
                strokeWidth="1.2"
                opacity="0.7"
              />
            ))
          })}
        </g>

        {/* Brick patch — bottom-left, smaller */}
        <g transform="translate(80 720)" opacity="0.55">
          <path
            d="M 0 0 L 180 -10 L 200 50 L 170 130 L 80 140 L 10 100 Z"
            fill="url(#wall-brick)"
          />
          {Array.from({ length: 4 }).map((_, row) => {
            const offset = row % 2 === 0 ? 0 : 30
            const y = row * 25
            return Array.from({ length: 4 }).map((_, col) => (
              <rect
                key={`bl-${row}-${col}`}
                x={offset + col * 60}
                y={y}
                width="56"
                height="22"
                fill="none"
                stroke="#3a1a08"
                strokeWidth="1"
                opacity="0.7"
              />
            ))
          })}
        </g>

        {/* Oil stain — centre-right, large soft shadow */}
        <g transform="translate(900 600)">
          <ellipse cx="0" cy="0" rx="280" ry="180" fill="url(#wall-oil)" />
          <ellipse cx="40" cy="20" rx="180" ry="120" fill="url(#wall-oil)" opacity="0.7" />
          {/* Drip trails downward */}
          <path d="M -40 60 Q -30 120 -50 180 Q -60 220 -45 260" stroke="#000" strokeWidth="3" opacity="0.45" fill="none" />
          <path d="M  20 80 Q  30 140 15 200 Q 0 240 20 290" stroke="#000" strokeWidth="2.5" opacity="0.35" fill="none" />
        </g>

        {/* Hung open-end spanner — silhouette + cast shadow */}
        {/* Rotated so the jaw end reads clearly at the top */}
        <g transform="translate(420 260) rotate(-72)" opacity="0.52">
          {/* Cast shadow — slightly offset, softer */}
          <g transform="translate(8 8)" opacity="0.6">
            <rect x="0" y="-3" width="220" height="6" fill="#000" />
            <circle cx="220" cy="0" r="14" fill="#000" />
            {/* Open-end jaw shadow */}
            <path d="M -18 -8 L 0 -8 L 0 8 L -18 8 L -18 4 L -6 4 L -6 -4 L -18 -4 Z" fill="#000" />
          </g>
          {/* Spanner shaft */}
          <rect x="0" y="-3" width="220" height="6" fill="#1a1510" stroke="#3a2514" strokeWidth="0.8" />
          {/* Ring end (closed) */}
          <circle cx="220" cy="0" r="14" fill="#1a1510" stroke="#3a2514" strokeWidth="0.8" />
          <circle cx="220" cy="0" r="9"  fill="#0a0806" />
          {/* Ring hex impression */}
          <polygon
            points="220,-7 226,-3.5 226,3.5 220,7 214,3.5 214,-3.5"
            fill="none" stroke="#2a2018" strokeWidth="0.7"
          />
          {/* Open-end jaw */}
          <path
            d="M -18 -8 L 0 -8 L 0 -3 L -6 -3 L -6 3 L 0 3 L 0 8 L -18 8 L -18 4 L -6 4 L -6 -4 L -18 -4 Z"
            fill="#1a1510" stroke="#3a2514" strokeWidth="0.8"
          />
          {/* Subtle highlight on shaft */}
          <rect x="20" y="-3" width="180" height="1.5" fill="#3a2e24" opacity="0.5" />
        </g>

        {/* Hook above the spanner */}
        <g transform="translate(420 240)">
          <circle cx="0" cy="0" r="3" fill="#5a4430" />
          <line x1="0" y1="0" x2="0" y2="-14" stroke="#5a4430" strokeWidth="1.4" />
        </g>

        {/* Second tool — Allen key set hanging on right wall, adds depth */}
        <g transform="translate(1380 380) rotate(-20)" opacity="0.38">
          {/* L-bar handle */}
          <rect x="-8" y="-3" width="70" height="6" rx="2" fill="#1a1510" stroke="#3a2514" strokeWidth="0.6" />
          <rect x="-8" y="-3" width="6" height="36" rx="2" fill="#1a1510" stroke="#3a2514" strokeWidth="0.6" />
        </g>
        <g transform="translate(1380 360)">
          <circle cx="0" cy="0" r="2.5" fill="#4a3828" />
        </g>

        {/* Plaster grain overlay */}
        <rect
          x="0" y="0" width="1600" height="1100"
          fill="#ffffff"
          opacity="0.06"
          filter="url(#wall-grain)"
        />

        {/* Vignette to dark corners */}
        <radialGradient id="wall-vignette" cx="0.5" cy="0.4" r="0.85">
          <stop offset="0%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
        </radialGradient>
        <rect x="0" y="0" width="1600" height="1100" fill="url(#wall-vignette)" />
      </svg>
    </div>
  )
}
