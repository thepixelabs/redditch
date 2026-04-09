'use client'

/**
 * NeonSign — Royal Enfield neon badge
 *
 * Pure SVG, no background, no image file.
 * The glow is built entirely with SVG feGaussianBlur filters so it
 * reads as real neon gas on a dark surface at any size.
 *
 * Composition: outer ring → "ROYAL ENFIELD" arc text → inner ring
 *              → cannon silhouette centred inside → "EST. 1901" bottom arc
 *
 * Animations come from .neon-logo (red, 4 s) and .neon-logo-gold (amber, 4 s + 0.6 s offset)
 * defined in globals.css.
 */
export default function NeonSign({ className = '' }: { className?: string }) {
  const cx = 140
  const cy = 140
  const outerR = 112
  const innerR = 96

  // Arc paths — the text rides along these invisible paths
  // Top arc: ROYAL ENFIELD
  const topArc = `M ${cx - outerR + 8},${cy} A ${outerR - 8},${outerR - 8} 0 0,1 ${cx + outerR - 8},${cy}`
  // Bottom arc: EST. 1901
  const botArc = `M ${cx - innerR + 4},${cy + 14} A ${innerR - 4},${innerR - 4} 0 0,0 ${cx + innerR - 4},${cy + 14}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 280"
      width="260"
      height="260"
      role="img"
      aria-label="Royal Enfield neon sign"
      style={{ display: 'block', overflow: 'visible' }}
      className={className}
    >
      <defs>
        {/* ── Red neon tube filter ─────────────────────────────────────── */}
        <filter id="neon-r" x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
          {/* White-hot core */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="c0" />
          <feColorMatrix in="c0" type="matrix"
            values="1 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.85  0 0 0 4 0" result="core" />
          {/* Warm red mid-halo */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="c1" />
          <feColorMatrix in="c1" type="matrix"
            values="1 0 0 0 1  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 2.5 0" result="mid" />
          {/* Diffuse red-amber wall bleed */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="c2" />
          <feColorMatrix in="c2" type="matrix"
            values="1 0 0 0 0.9  0 0 0 0 0.25  0 0 0 0 0.05  0 0 0 1.6 0" result="outer" />
          <feMerge>
            <feMergeNode in="outer" />
            <feMergeNode in="mid" />
            <feMergeNode in="core" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Amber/gold neon tube filter ──────────────────────────────── */}
        <filter id="neon-g" x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
          {/* White-warm core */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="g0" />
          <feColorMatrix in="g0" type="matrix"
            values="1 0 0 0 1  0 0 0 0 0.96  0 0 0 0 0.65  0 0 0 4 0" result="gcore" />
          {/* Amber mid */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="g1" />
          <feColorMatrix in="g1" type="matrix"
            values="1 0 0 0 1  0 0 0 0 0.7  0 0 0 0 0.1  0 0 0 2.2 0" result="gmid" />
          {/* Warm amber wall bleed */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="g2" />
          <feColorMatrix in="g2" type="matrix"
            values="1 0 0 0 0.9  0 0 0 0 0.55  0 0 0 0 0.05  0 0 0 1.4 0" result="gouter" />
          <feMerge>
            <feMergeNode in="gouter" />
            <feMergeNode in="gmid" />
            <feMergeNode in="gcore" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Arc text paths */}
        <path id="arc-top" d={topArc} />
        <path id="arc-bot" d={botArc} />
      </defs>

      {/* ── Outer ring ──────────────────────────────────────────────────── */}
      <circle cx={cx} cy={cy} r={outerR}
        fill="none" stroke="#FF2828" strokeWidth="3"
        filter="url(#neon-r)" className="neon-logo" />

      {/* ── Inner ring ──────────────────────────────────────────────────── */}
      <circle cx={cx} cy={cy} r={innerR}
        fill="none" stroke="#FF2828" strokeWidth="1.8" strokeOpacity="0.6"
        filter="url(#neon-r)" className="neon-logo" />

      {/* ── "ROYAL ENFIELD" arc text ─────────────────────────────────────── */}
      <text
        fill="none" stroke="#FF2828" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        fontFamily="'Arial Narrow', 'Arial', sans-serif"
        fontSize="16" fontWeight="800" letterSpacing="5"
        filter="url(#neon-r)" className="neon-logo"
      >
        <textPath href="#arc-top" startOffset="50%" textAnchor="middle" dy="-7">
          ROYAL ENFIELD
        </textPath>
      </text>

      {/* ── "EST. 1901" arc text (gold) ──────────────────────────────────── */}
      <text
        fill="none" stroke="#FFB020" strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round"
        fontFamily="'Arial Narrow', 'Arial', sans-serif"
        fontSize="12" fontWeight="700" letterSpacing="4"
        filter="url(#neon-g)" className="neon-logo-gold"
      >
        <textPath href="#arc-bot" startOffset="50%" textAnchor="middle" dy="16">
          EST. 1901
        </textPath>
      </text>

      {/* ── Cannon (gold) — faces left per RE device ────────────────────── */}
      <g filter="url(#neon-g)" className="neon-logo-gold">
        {/* Barrel — long horizontal tube */}
        <line x1="88" y1="136" x2="178" y2="136"
          stroke="#FFB020" strokeWidth="6" strokeLinecap="round" />
        {/* Barrel highlight */}
        <line x1="90" y1="136" x2="176" y2="136"
          stroke="#FFF4C0" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.65" />

        {/* Muzzle ring (left) */}
        <circle cx="88" cy="136" r="4" fill="none" stroke="#FFB020" strokeWidth="2.5" />

        {/* Breech / cascabel (right) */}
        <circle cx="180" cy="136" r="6" fill="none" stroke="#FFB020" strokeWidth="3" />

        {/* Trunnion block */}
        <rect x="148" y="132" width="16" height="9" rx="2"
          fill="none" stroke="#FFB020" strokeWidth="2" />

        {/* Carriage left strut */}
        <line x1="148" y1="141" x2="124" y2="162"
          stroke="#FFB020" strokeWidth="2.5" strokeLinecap="round" />
        {/* Carriage right strut */}
        <line x1="164" y1="141" x2="164" y2="162"
          stroke="#FFB020" strokeWidth="2.5" strokeLinecap="round" />

        {/* Axle */}
        <line x1="114" y1="162" x2="174" y2="162"
          stroke="#FFB020" strokeWidth="2.5" strokeLinecap="round" />

        {/* Left wheel */}
        <circle cx="122" cy="166" r="11" fill="none" stroke="#FFB020" strokeWidth="2.8" />
        <circle cx="122" cy="166" r="2.5" fill="#FFB020" strokeWidth="0" />
        {/* Left spokes */}
        <line x1="122" y1="155" x2="122" y2="177" stroke="#FFB020" strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="111" y1="166" x2="133" y2="166" stroke="#FFB020" strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="114" y1="158" x2="130" y2="174" stroke="#FFB020" strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="130" y1="158" x2="114" y2="174" stroke="#FFB020" strokeWidth="1.2" strokeOpacity="0.5" />

        {/* Right wheel */}
        <circle cx="166" cy="166" r="11" fill="none" stroke="#FFB020" strokeWidth="2.8" />
        <circle cx="166" cy="166" r="2.5" fill="#FFB020" strokeWidth="0" />
        {/* Right spokes */}
        <line x1="166" y1="155" x2="166" y2="177" stroke="#FFB020" strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="155" y1="166" x2="177" y2="166" stroke="#FFB020" strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="158" y1="158" x2="174" y2="174" stroke="#FFB020" strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="174" y1="158" x2="158" y2="174" stroke="#FFB020" strokeWidth="1.2" strokeOpacity="0.5" />
      </g>

      {/* ── Separator ticks (3 and 9 o'clock) ───────────────────────────── */}
      <g filter="url(#neon-r)" className="neon-logo">
        <line x1="28" y1={cy} x2="44" y2={cy} stroke="#FF2828" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="236" y1={cy} x2="252" y2={cy} stroke="#FF2828" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}
