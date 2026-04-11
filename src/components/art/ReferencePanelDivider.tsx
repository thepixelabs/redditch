/**
 * ReferencePanelDivider — wide cinematic strip illustration above the
 * BikeReferencePanel section heading.
 *
 * Slot 6 from the illustrator's brief: "Overhead shot of a Royal Enfield 650
 * twin engine bay, hands adjusting valve shims, torque wrench on air filter
 * housing." Rendered as a 1200×220 inline SVG so it ships in the bundle.
 *
 * The composition leaves the right third dark on purpose — the gold
 * "Quick Reference" heading rule sits over that area in the parent.
 */

export function ReferencePanelDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '60 / 11',
        minHeight: '120px',
        marginBottom: 'clamp(16px, 2vw, 28px)',
        overflow: 'hidden',
        borderRadius: '3px',
        border: '1px solid rgba(200, 150, 44, 0.18)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(200, 150, 44, 0.05)',
      }}
    >
      <svg
        viewBox="0 0 1200 220"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          {/* Workshop lamp from upper left */}
          <radialGradient id="ref-lamp" cx="0.18" cy="0.1" r="0.85">
            <stop offset="0%"  stopColor="#ffd48a" stopOpacity="0.55" />
            <stop offset="20%" stopColor="#c8962c" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#3a2014" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Right-side darkness for heading overlay */}
          <linearGradient id="ref-fade-right" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#000000" stopOpacity="0" />
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
          </linearGradient>

          {/* Engine block tone */}
          <linearGradient id="ref-engine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#3a3530" />
            <stop offset="50%" stopColor="#2a2520" />
            <stop offset="100%" stopColor="#1a1510" />
          </linearGradient>

          <linearGradient id="ref-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#1a1410" />
            <stop offset="100%" stopColor="#0a0806" />
          </linearGradient>

          <linearGradient id="ref-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#3a3530" />
            <stop offset="50%" stopColor="#9a9088" />
            <stop offset="100%" stopColor="#3a3530" />
          </linearGradient>

          {/* Grain */}
          <filter id="ref-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.8  0 0 0 0 0.5  0 0 0 0.10 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        {/* Background bench */}
        <rect x="0" y="0" width="1200" height="220" fill="url(#ref-bench)" />
        <rect x="0" y="0" width="1200" height="220" fill="url(#ref-lamp)" />

        {/* Engine — parallel-twin valve cover, viewed from above, occupies left half */}
        <g transform="translate(60 30)">
          {/* Outer head shadow */}
          <rect x="-6" y="-6" width="540" height="172" fill="#000" opacity="0.5" rx="6" />

          {/* Valve cover plate */}
          <rect x="0" y="0" width="528" height="160" rx="6" fill="url(#ref-engine)" stroke="#0a0604" strokeWidth="1.4" />

          {/* Eight bolts around the perimeter */}
          {[
            [22, 22], [264, 12], [506, 22],
            [22, 80], [506, 80],
            [22, 138], [264, 148], [506, 138],
          ].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              <circle r="9" fill="#1a1510" />
              <circle r="6" fill="#5a544a" />
              {/* Hex faces */}
              <polygon points="-5,-3 -5,3 0,6 5,3 5,-3 0,-6" fill="none" stroke="#3a3530" strokeWidth="0.8" />
              <circle r="1" fill="#c8962c" opacity="0.45" />
            </g>
          ))}

          {/* Two camshaft cover ridges running horizontally */}
          <rect x="44" y="40" width="440" height="22" rx="3" fill="#2a2520" stroke="#1a1510" strokeWidth="0.8" />
          <rect x="44" y="98" width="440" height="22" rx="3" fill="#2a2520" stroke="#1a1510" strokeWidth="0.8" />

          {/* Cooling fins — vertical ridges along the centre of each cam ridge */}
          {Array.from({ length: 16 }).map((_, i) => {
            const x = 60 + i * 26
            return (
              <g key={i}>
                <line x1={x} y1="42" x2={x} y2="60" stroke="#1a1510" strokeWidth="1.2" />
                <line x1={x} y1="100" x2={x} y2="118" stroke="#1a1510" strokeWidth="1.2" />
              </g>
            )
          })}

          {/* RE crest engraving — between the two cam covers */}
          <g transform="translate(264 80)">
            <circle r="14" fill="none" stroke="#c8962c" strokeWidth="0.8" opacity="0.55" />
            <text
              x="0" y="3"
              textAnchor="middle"
              fill="#c8962c"
              fontFamily="Georgia, serif"
              fontWeight="800"
              fontSize="11"
              letterSpacing="0.06em"
              opacity="0.75"
            >
              RE
            </text>
          </g>

          {/* Specular highlight from upper-left lamp */}
          <path
            d="M 0 0 L 200 0 L 240 28 L 200 60 L 60 60 L 0 30 Z"
            fill="#ffd48a"
            opacity="0.06"
          />
        </g>

        {/* Torque wrench — diagonal across the right side of the engine */}
        <g transform="translate(330 110) rotate(-12)">
          {/* Shaft shadow */}
          <rect x="0" y="6" width="320" height="14" rx="3" fill="#000" opacity="0.55" />
          {/* Shaft */}
          <rect x="0" y="0" width="320" height="14" rx="3" fill="url(#ref-metal)" />
          {/* Knurled grip */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1={4 + i * 4} y1="2" x2={4 + i * 4} y2="12" stroke="#1a1510" strokeWidth="0.7" />
          ))}
          {/* Setting window */}
          <rect x="62" y="3" width="34" height="8" fill="#1a1510" />
          <text
            x="79" y="9.5"
            textAnchor="middle"
            fill="#c8962c"
            fontFamily="JetBrains Mono, monospace"
            fontSize="6.5"
            letterSpacing="0.1em"
          >
            25 Nm
          </text>
          {/* Box-end head */}
          <circle cx="332" cy="7" r="14" fill="#5a544a" stroke="#1a1510" strokeWidth="1.2" />
          <circle cx="332" cy="7" r="8" fill="#1a1510" />
          <polygon
            points="324,3 328,0 336,0 340,3 340,11 336,14 328,14 324,11"
            fill="none"
            stroke="#3a3530"
            strokeWidth="0.7"
          />
        </g>

        {/* Feeler gauge — a single blade resting on the head */}
        <g transform="translate(160 50) rotate(8)">
          <rect x="0" y="0" width="120" height="2" fill="#9a9088" stroke="#3a3530" strokeWidth="0.4" />
          <circle cx="0" cy="1" r="2" fill="#3a3530" />
          <text
            x="100" y="-2"
            textAnchor="end"
            fill="#c8962c"
            fontFamily="JetBrains Mono, monospace"
            fontSize="5"
            opacity="0.7"
          >
            0.15 mm
          </text>
        </g>

        {/* Oil rag — left edge */}
        <path
          d="M 0 180 Q 30 168 60 175 Q 80 182 100 178 L 105 220 L 0 220 Z"
          fill="#3a2a18"
          opacity="0.7"
        />
        <path
          d="M 0 184 Q 28 174 58 180 Q 78 186 96 184"
          stroke="#5a4430"
          strokeWidth="0.8"
          fill="none"
          opacity="0.8"
        />

        {/* Right vignette for heading overlay */}
        <rect x="0" y="0" width="1200" height="220" fill="url(#ref-fade-right)" />

        {/* Grain */}
        <rect
          x="0" y="0" width="1200" height="220"
          fill="#ffffff"
          opacity="0.045"
          filter="url(#ref-grain)"
        />

        {/* Top + bottom inner shadows for depth */}
        <rect x="0" y="0" width="1200" height="14" fill="#000" opacity="0.45" />
        <rect x="0" y="206" width="1200" height="14" fill="#000" opacity="0.55" />
      </svg>

      {/* Right-side stamp overlay — gives the strip a "data verified" feel */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: 'clamp(20px, 3vw, 48px)',
          transform: 'translateY(-50%) rotate(-2deg)',
          padding: '6px 14px',
          border: '1.5px solid rgba(200, 150, 44, 0.55)',
          borderRadius: '2px',
          background: 'rgba(13, 13, 13, 0.65)',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--re-gold)',
          pointerEvents: 'none',
        }}
      >
        Quick Reference
      </div>
    </div>
  )
}
