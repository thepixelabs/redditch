/**
 * BulletinHero — pure SVG hero illustration for /bulletin.
 *
 * Style covenant: pen-and-ink motorcycle silhouette on a dawn road, warm
 * amber shadows, cool blue-grey sky. Zero image dependencies, scales
 * infinitely, works offline, respects reduced motion.
 *
 * Design sources: warm-shadow-cool-highlight treatment from the digital
 * illustrator brief; the Himalayan pass archetype from the community
 * research. Composition leaves a dark bottom-left area for any overlay
 * caption or stamp.
 */
export function BulletinHero() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        aspectRatio: '24 / 9',
        minHeight: '200px',
        overflow: 'hidden',
        borderRadius: '3px',
        border: '1px solid rgba(200,150,44,0.18)',
        boxShadow:
          '0 6px 28px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(200,150,44,0.08)',
      }}
    >
      <svg
        viewBox="0 0 1200 450"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          {/* Sky: cool blue-grey dawn gradient */}
          <linearGradient id="bullet-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a1f2b" />
            <stop offset="40%"  stopColor="#2a2420" />
            <stop offset="70%"  stopColor="#3d2c1c" />
            <stop offset="100%" stopColor="#1a1410" />
          </linearGradient>

          {/* Warm sun glow */}
          <radialGradient id="bullet-sun" cx="0.72" cy="0.58" r="0.35">
            <stop offset="0%"   stopColor="#f4b860" stopOpacity="0.85" />
            <stop offset="30%"  stopColor="#c96b2f" stopOpacity="0.45" />
            <stop offset="65%"  stopColor="#8b3a1a" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Ground gradient */}
          <linearGradient id="bullet-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#1a1410" />
            <stop offset="100%" stopColor="#0a0806" />
          </linearGradient>

          {/* Left vignette — dark corner for overlay text */}
          <linearGradient id="bullet-vignette" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#000000" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Top vignette */}
          <linearGradient id="bullet-vignette-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#000000" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Grain pattern — Kodak Portra feel */}
          <filter id="bullet-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 0.8  0 0 0 0 0.5  0 0 0 0.12 0"
            />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="1200" height="450" fill="url(#bullet-sky)" />

        {/* Warm dawn sun glow */}
        <rect x="0" y="0" width="1200" height="450" fill="url(#bullet-sun)" />

        {/* Distant mountains — layered silhouettes */}
        <path
          d="M 0 270 L 80 230 L 140 250 L 220 200 L 310 235 L 400 195 L 480 220 L 560 180 L 640 215 L 720 185 L 820 225 L 900 200 L 990 230 L 1080 205 L 1200 235 L 1200 450 L 0 450 Z"
          fill="#2b2418"
          opacity="0.55"
        />
        <path
          d="M 0 310 L 100 285 L 200 305 L 290 270 L 380 295 L 470 265 L 560 290 L 660 260 L 750 285 L 840 265 L 940 295 L 1030 275 L 1130 300 L 1200 280 L 1200 450 L 0 450 Z"
          fill="#1f1a12"
          opacity="0.75"
        />

        {/* Road — perspective lines */}
        <path
          d="M 0 450 L 380 330 L 820 330 L 1200 450 Z"
          fill="url(#bullet-ground)"
        />

        {/* Road center line — pen-stroke dashes */}
        <line
          x1="600" y1="330" x2="600" y2="450"
          stroke="#c8962c"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          opacity="0.35"
        />

        {/* Horizon rule — golden hairline */}
        <line
          x1="0" y1="330" x2="1200" y2="330"
          stroke="#c8962c"
          strokeWidth="0.8"
          opacity="0.18"
        />

        {/* Motorcycle silhouette — stylised parallel-twin */}
        <g transform="translate(540 280)" opacity="0.88">
          {/* Rear wheel */}
          <circle cx="0" cy="40" r="22" fill="none" stroke="#0a0604" strokeWidth="4" />
          <circle cx="0" cy="40" r="18" fill="#1a1410" stroke="#3a2a18" strokeWidth="1" />
          {/* Spokes */}
          <line x1="-16" y1="40" x2="16" y2="40" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="0" y1="24" x2="0" y2="56" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="-11" y1="29" x2="11" y2="51" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="-11" y1="51" x2="11" y2="29" stroke="#4a3420" strokeWidth="0.8" />

          {/* Front wheel */}
          <circle cx="80" cy="40" r="22" fill="none" stroke="#0a0604" strokeWidth="4" />
          <circle cx="80" cy="40" r="18" fill="#1a1410" stroke="#3a2a18" strokeWidth="1" />
          <line x1="64" y1="40" x2="96" y2="40" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="80" y1="24" x2="80" y2="56" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="69" y1="29" x2="91" y2="51" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="69" y1="51" x2="91" y2="29" stroke="#4a3420" strokeWidth="0.8" />

          {/* Engine block — parallel twin */}
          <rect x="22" y="20" width="36" height="22" rx="2" fill="#0a0604" stroke="#3a2a18" strokeWidth="1" />
          <line x1="28" y1="20" x2="28" y2="42" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="34" y1="20" x2="34" y2="42" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="40" y1="20" x2="40" y2="42" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="46" y1="20" x2="46" y2="42" stroke="#4a3420" strokeWidth="0.8" />
          <line x1="52" y1="20" x2="52" y2="42" stroke="#4a3420" strokeWidth="0.8" />

          {/* Tank — teardrop */}
          <path
            d="M 18 18 Q 30 6 52 6 Q 68 8 72 18 L 72 22 L 18 22 Z"
            fill="#0a0604"
            stroke="#b5121b"
            strokeWidth="1"
          />

          {/* Seat */}
          <path d="M -4 14 L 18 14 L 18 20 L -4 20 Z" fill="#0a0604" />

          {/* Handlebars */}
          <line x1="68" y1="12" x2="86" y2="2" stroke="#3a2a18" strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="12" x2="78" y2="18" stroke="#3a2a18" strokeWidth="2" strokeLinecap="round" />

          {/* Exhaust pipe */}
          <path d="M 52 38 Q 70 42 86 42" stroke="#0a0604" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Rear fender */}
          <path d="M -22 28 Q -12 22 0 20" stroke="#0a0604" strokeWidth="2.5" fill="none" />
          {/* Front fender */}
          <path d="M 68 28 Q 78 22 92 22" stroke="#0a0604" strokeWidth="2.5" fill="none" />

          {/* Headlamp glow */}
          <circle cx="90" cy="14" r="4" fill="#f4b860" opacity="0.7" />
          <circle cx="90" cy="14" r="2.5" fill="#fff8f0" opacity="0.8" />
        </g>

        {/* Utility pole on the right — vertical line + crossbar */}
        <line x1="1050" y1="160" x2="1050" y2="310" stroke="#2a2018" strokeWidth="2" opacity="0.6" />
        <line x1="1035" y1="180" x2="1065" y2="180" stroke="#2a2018" strokeWidth="1.5" opacity="0.6" />
        <line x1="1040" y1="190" x2="1060" y2="190" stroke="#2a2018" strokeWidth="1.5" opacity="0.6" />

        {/* Thin wires sweeping out */}
        <path d="M 1035 180 Q 900 195 760 210" stroke="#2a2018" strokeWidth="0.7" fill="none" opacity="0.4" />
        <path d="M 1065 180 Q 1130 200 1200 210" stroke="#2a2018" strokeWidth="0.7" fill="none" opacity="0.4" />

        {/* Left-side vignette for text overlay */}
        <rect x="0" y="0" width="1200" height="450" fill="url(#bullet-vignette)" />
        {/* Top vignette */}
        <rect x="0" y="0" width="1200" height="450" fill="url(#bullet-vignette-top)" />

        {/* Film grain overlay */}
        <rect
          x="0" y="0" width="1200" height="450"
          fill="#ffffff"
          opacity="0.04"
          filter="url(#bullet-grain)"
        />

        {/* Bottom scan-line hint — gold machined fascia suggestion */}
        <rect x="0" y="442" width="1200" height="1" fill="#c8962c" opacity="0.25" />
      </svg>

      {/* Overlay caption — absolute positioned */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(20px, 4vw, 56px)',
          bottom: 'clamp(16px, 3vw, 36px)',
          maxWidth: '46ch',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            marginBottom: '10px',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--re-gold)',
            padding: '4px 10px',
            border: '1px solid rgba(200,150,44,0.4)',
            borderRadius: '2px',
            background: 'rgba(0,0,0,0.5)',
          }}
        >
          Pinned Since 1901
        </span>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display), Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
            lineHeight: 1.5,
            color: '#F0E6D0',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}
        >
          Where the community pins the news that matters — rides, recalls,
          and the quiet technical notes that keep every Bullet on the road.
        </p>
      </div>
    </div>
  )
}
