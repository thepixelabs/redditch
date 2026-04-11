/**
 * EmptyRoadBackground — receding empty highway behind the 404 page content.
 * Slot 5 from the illustrator's brief.
 *
 * "Empty rural Indian highway to flat horizon, midday heat shimmer, no
 * vehicles, faded centre line, telegraph poles receding, pale overexposed
 * sky." Renders behind the existing 404 silhouette + heading + CTA so the
 * "road not found" metaphor reads visually.
 */

export function EmptyRoadBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.5,
      }}
    >
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          {/* Bleached midday sky */}
          <linearGradient id="road-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#3a2818" />
            <stop offset="40%" stopColor="#6a4a28" />
            <stop offset="80%" stopColor="#a87a48" />
            <stop offset="100%" stopColor="#c89858" />
          </linearGradient>

          {/* Distant haze */}
          <linearGradient id="road-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#c89858" stopOpacity="0" />
            <stop offset="100%" stopColor="#d8a868" stopOpacity="0.6" />
          </linearGradient>

          {/* Tarmac surface */}
          <linearGradient id="road-tarmac" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#3a2820" />
            <stop offset="50%" stopColor="#1a120c" />
            <stop offset="100%" stopColor="#0a0604" />
          </linearGradient>

          {/* Grain */}
          <filter id="road-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.82  0 0 0 0 0.55  0 0 0 0.10 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>

          {/* Heat shimmer — wavy displacement */}
          <filter id="road-shimmer">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" />
            <feDisplacementMap in="SourceGraphic" scale="3" />
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="1200" height="320" fill="url(#road-sky)" />

        {/* Distant haze fade */}
        <rect x="0" y="200" width="1200" height="120" fill="url(#road-haze)" />

        {/* Horizon line */}
        <line x1="0" y1="320" x2="1200" y2="320" stroke="#8a6848" strokeWidth="1" opacity="0.45" />

        {/* Tarmac — perspective trapezoid */}
        <path
          d="M 380 320 L 820 320 L 1200 800 L 0 800 Z"
          fill="url(#road-tarmac)"
        />

        {/* Faded painted centre line — dashed, vanishing into the horizon */}
        <line
          x1="600" y1="800" x2="600" y2="320"
          stroke="#c8962c"
          strokeWidth="6"
          strokeDasharray="40 70"
          opacity="0.18"
        />

        {/* Edge line — left */}
        <line
          x1="0" y1="800" x2="380" y2="320"
          stroke="#5a4430"
          strokeWidth="2"
          opacity="0.4"
        />
        {/* Edge line — right */}
        <line
          x1="1200" y1="800" x2="820" y2="320"
          stroke="#5a4430"
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Telegraph poles — receding into distance on the right side */}
        {[
          { x: 950, y: 280, h: 80, scale: 1.0 },
          { x: 880, y: 295, h: 60, scale: 0.78 },
          { x: 840, y: 305, h: 45, scale: 0.6 },
          { x: 815, y: 312, h: 32, scale: 0.45 },
          { x: 800, y: 316, h: 22, scale: 0.32 },
        ].map((pole, i) => (
          <g key={i} opacity={0.55 - i * 0.06}>
            {/* Vertical post */}
            <line
              x1={pole.x}
              y1={pole.y}
              x2={pole.x}
              y2={pole.y + pole.h}
              stroke="#1a1410"
              strokeWidth={2 * pole.scale}
            />
            {/* Crossbar */}
            <line
              x1={pole.x - 12 * pole.scale}
              y1={pole.y + 10}
              x2={pole.x + 12 * pole.scale}
              y2={pole.y + 10}
              stroke="#1a1410"
              strokeWidth={1.5 * pole.scale}
            />
            {/* Lower crossbar */}
            <line
              x1={pole.x - 8 * pole.scale}
              y1={pole.y + 18}
              x2={pole.x + 8 * pole.scale}
              y2={pole.y + 18}
              stroke="#1a1410"
              strokeWidth={1.2 * pole.scale}
            />
          </g>
        ))}

        {/* Wires sweeping out from the front pole */}
        <path
          d="M 938 290 Q 700 305 0 380"
          stroke="#1a1410"
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 962 290 Q 700 308 0 400"
          stroke="#1a1410"
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />

        {/* Heat-shimmer band just above the horizon */}
        <rect
          x="0" y="290" width="1200" height="40"
          fill="#d8a868"
          opacity="0.12"
          filter="url(#road-shimmer)"
        />

        {/* Grain */}
        <rect
          x="0" y="0" width="1200" height="800"
          fill="#ffffff"
          opacity="0.04"
          filter="url(#road-grain)"
        />

        {/* Heavy corner vignette */}
        <radialGradient id="road-vignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0%"  stopColor="#000" stopOpacity="0" />
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <rect x="0" y="0" width="1200" height="800" fill="url(#road-vignette)" />
      </svg>
    </div>
  )
}
