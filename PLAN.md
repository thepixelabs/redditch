# Redditch — Master Implementation Plan
**Project:** Royal Enfield Digital Service Manual  
**Domain:** redditch.pixelabs.net  
**Hosted:** GitHub Pages + Cloudflare CDN  
**Date:** April 9, 2026  
**Contributors:** CEO, System Architect, Staff Engineer, Product Engineer + Brand Research

---

## Table of Contents

1. [Brand Identity & Design System](#1-brand-identity--design-system)
2. [Community & Audience Intelligence](#2-community--audience-intelligence)
3. [Product Vision & Strategic Priorities](#3-product-vision--strategic-priorities)
4. [Technical Architecture](#4-technical-architecture)
5. [Data Schema](#5-data-schema)
6. [UI/UX Design Specification](#6-uiux-design-specification)
7. [Component Architecture](#7-component-architecture)
8. [State Management](#8-state-management)
9. [PWA & Icons](#9-pwa--icons)
10. [SEO, Metadata & Social Sharing](#10-seo-metadata--social-sharing)
11. [Accessibility Architecture](#11-accessibility-architecture)
12. [CI/CD & Infrastructure](#12-cicd--infrastructure)
13. [Analytics Instrumentation](#13-analytics-instrumentation)
14. [Phased Rollout Plan](#14-phased-rollout-plan)
15. [Build Sequence](#15-build-sequence)

---

## 1. Brand Identity & Design System

### Royal Enfield Color Palette

These are the only colors used throughout the app. No exceptions.

| Token | Hex | Usage |
|---|---|---|
| `--re-red` | `#B5121B` | Primary CTAs, gauge overdue state, brand anchor |
| `--re-red-deep` | `#7B0D1E` | Hover states, depth layers, pressed states |
| `--re-black` | `#1A1A1A` | Dark mode background, near-black (not pure #000) |
| `--re-surface` | `#242424` | Dark mode card/surface background |
| `--re-gold` | `#C8962C` | Accent — gauge tick marks, badge highlights, icons — use sparingly |
| `--re-gold-muted` | `#9E7F3C` | Secondary gold — dividers, inactive states |
| `--re-cream` | `#F5ECD7` | Light mode base, inspired by classic parchment pages |
| `--re-cream-warm` | `#EDE0C8` | Light mode secondary surface |
| `--re-silver` | `#B0B3B8` | Secondary text, dividers, gauge tick marks |
| `--re-gunmetal` | `#4A4A4A` | Tertiary text in dark mode |
| `--re-text-dark` | `#F0EDE8` | Primary text on dark backgrounds (warm off-white, NOT #FFF) |
| `--re-text-light` | `#1A1A1A` | Primary text on light backgrounds |

**Urgency Palette (gauges and status badges):**
| State | Dark Mode | Light Mode |
|---|---|---|
| Good (>60% remaining) | `#22c55e` | `#16a34a` |
| Due Soon (30–60%) | `#E6A817` | `#b45309` |
| Overdue (<30% / past) | `#FF4D4D` | `#B5121B` |

> **Design rule:** RE Red is the brand, not an error color. Error/overdue states use a brighter, more saturated red (`#FF4D4D` dark mode) to distinguish from brand red. Never use RE Gold for overdue states — it reads as "fine."

### Typography

- **Display / Headings:** Slab serif — ITC Lubalin Graph or Zilla Slab (free, Google Fonts). Tight tracking. Conveys precision and mechanical weight.
- **Body / Navigation:** Gill Sans or Aktiv Grotesk substitute — use Inter (Google Fonts, already in Next.js). Clean, British feel.
- **Spec values (torque, part numbers, fluid specs):** `font-family: 'JetBrains Mono', monospace`. These are data, not prose. Monospace makes them feel like instrument readouts. Self-host via `next/font`.
- **Base font size:** 16px minimum on all elements. Never smaller. Spec numbers at 20px+.
- **All fonts:** Self-hosted via `next/font` — no external DNS lookup, no render-blocking.

### Logo & Icon Usage

Royal Enfield's logo exists in these configurations:
- **Full Crest (Roundel):** Circular badge with RE monogram + wings. Use for splash screen only.
- **Wordmark (horizontal):** "ROYAL ENFIELD" spaced wordmark. Use in header.
- **Monogram (RE):** Tank badge style. Use as favicon / PWA icon base.
- **Stacked:** Wordmark below crest. Use for OG images.

**Site Icon Concept:** The RE Pegasus (winged horse motif from the "Made Like A Gun" heritage) centered on an RE Black rounded square background, rendered in RE Gold. A thin gold border ring (4px inner) creates the roundel effect. No wordmark on the icon — the app name appears below it on home screens.

The SVG favicon supports `prefers-color-scheme`: gold Pegasus on dark background (dark mode) / dark Pegasus on cream background (light mode).

### Visual Language Rules

| Do | Don't |
|---|---|
| Warm, analog textures | Neon, high-gloss, gradients |
| Dense but organized information | Sparse, marketing-y whitespace |
| Mechanical iconography (wrench, chain, oil drop) | Rounded, playful emoji-style icons |
| Heritage serif for headings | Geometric sans for everything |
| Monospace for spec values | Regular font for torque numbers |
| Warm off-white text (not pure white) | Pure #FFFFFF text on dark |
| Deliberate, unhurried animations | Snappy, bouncy, gamified motion |
| Desaturated, warm photography | Studio shots, glamour imagery |

---

## 2. Community & Audience Intelligence

### Who is this for?

**Primary persona: Ravi — Interceptor 650 owner, Pune, 31.**
First-time bike owner upgrading from a 150cc commuter. Doing his first oil change himself. Phone is a cracked mid-range Android, hands are greasy, garage lighting is poor, signal is weak.

**Secondary persona: James — Continental GT 650 owner, Bristol, 44.**
Second motorcycle (also owns a Japanese standard). Attracted by British heritage. Checks the app before a long weekend ride to confirm nothing is due. Uses desktop occasionally.

**Demographic spread:**
- India: ~85-90% of global RE volumes. Age 22–38, urban/semi-urban middle class. 650 Twins and Classic 350 dominant.
- UK/Europe: Age 30–55, higher disposable income. Interceptor 650 / Continental GT 650 hero models.
- Southeast Asia: Age 25–45, Thailand, Indonesia, Malaysia. Café racer and adventure sub-cultures.
- North America: Age 35–55, "accessible retro" segment.

### What does this community value?

In priority order — these values must inform every UI and copy decision:

1. **Authenticity** — no corporate polish, no fake enthusiasm. Real roads, real specs, real patina.
2. **Heritage and craft** — Royal Enfield has been "Made Like A Gun" since 1901. This brand has weight.
3. **Brotherhood/community** — Bulleteers culture. Riding together, helping each other.
4. **Mechanical connection** — they want to know their machine. The thumper sound is a feature.
5. **Simplicity** — low-tech is not a limitation, it's the point.
6. **Adventure/wanderlust** — especially the Himalayan as spiritual pilgrimage.

### Brand Voice for This App

**"Workshop manual meets knowledgeable riding buddy."**

- Use proper technical language: "15W-50 API SL/MA2, 2.9L with filter" — not "you'll need some oil"
- Be precise with units. Nm, not ft-lbs. This is a metric-first world.
- No exclamation marks. No "Awesome!" No gamification. Competence earns respect.
- Never corporate. Never "bro." Never "revolutionary platform."
- Understated pride. The specs are self-evidently useful — no hard sell needed.

**The positioning statement:**

> "Know your machine. Enter your odometer. Get your service specs. Every torque value, every fluid, every part number — for your specific Royal Enfield."

**The app's elevator pitch:**

> "The service manual your dealer wishes they had."

### Key Marketing Context

- **"Pure Motorcycling"** — Royal Enfield's current global brand platform. This app embodies it.
- **"Made Like A Gun, Goes Like A Bullet"** — oldest tagline, enormous emotional weight with Bulleteers.
- **"One Ride"** — annual global event, first Sunday of May, high social media reach — opportunity for the app.
- RE riders share in WhatsApp groups and Telegram. Social sharing metadata must be excellent.
- The community already organizes through WhatsApp groups, Facebook groups, Instagram. Don't try to replace that.

---

## 3. Product Vision & Strategic Priorities

### The Core Hypothesis

**"Royal Enfield owners will return to a tool that tells them exactly what to do at their current mileage, faster than digging through a PDF manual or a forum thread."**

Every Phase 1 decision serves this hypothesis. Nothing else.

### Phase 1 — MVP: "The 650 Blueprint" (Ship first)

**MUST have:**
- [ ] Bike selector (650 Twins: Interceptor 650, Continental GT 650, Super Meteor 650)
- [ ] Odometer input (km / miles toggle)
- [ ] Service interval calculator: what's due NOW, what's coming next
- [ ] Task expansion cards with full specs: torque values, oil type/quantity, part numbers, tools required
- [ ] Dark mode as default (garage use — non-negotiable)
- [ ] Mobile-first responsive layout (phones, iPads, desktop)
- [ ] PWA manifest + high-res icon (add to home screen)
- [ ] Open Graph / social sharing metadata (WhatsApp, Telegram, Facebook)
- [ ] WCAG 2.1 AA accessibility minimum (semantic HTML, contrast, keyboard nav)
- [ ] Lighthouse ≥95 performance, 100 accessibility, 100 SEO, 100 best practices
- [ ] Animated SVG gauge dashboard (the visual centrepiece — see CEO note below)
- [ ] RE branding colors throughout
- [ ] Splash screen with RE logo fade-in (first visit only, CSS-only, no JS block)

**CEO note on gauge prioritization:** The CEO recommended deferring gauges to Phase 1.5 to ship faster. The engineering team recommends building them in Phase 1 because the SVG gauge is ~150 lines, CSS-animated, and zero dependencies. It is the app's "moment of delight" and the community will recognize it as authentic to motorcycle culture. Build it — but do not let it block shipping the core calculation engine.

**DEFER to Phase 2:**
- LocalStorage persistence of bike + odometer
- Completed task checkboxes
- Calendar export (ICS)
- News/bulletins section

**DEFER to Phase 3:**
- Community PR contribution flow
- CI/CD YAML schema validation
- Aftermarket parts cross-references
- "Submit a correction" button

**DEFER to Phase 4 (or never):**
- Regional bulletin board — see below

### On the Bulletin Board

**Recommendation: Do not build it.** The CEO is clear and correct here:

The Bulleteers community already organizes through WhatsApp groups, Facebook groups, and Instagram. A web-based bulletin board requires moderation infrastructure, solves a solved problem, and dilutes focus from the maintenance tool's core value proposition. It would also require a backend, breaking the static-site architecture.

**Alternative (Phase 3):** Add a curated "Community" page with links to major RE riding groups by region. Static YAML, no moderation burden, zero backend. Points people to where the community already lives.

**If regional event posting is truly wanted later:** Use a GitHub-PR-based workflow (submit events as PRs to a YAML file) or embed a Telegram channel widget. Both are static-compatible and zero-maintenance.

### Monetization & Sustainability

- **Phases 1–2:** No monetization. Build trust first.
- **Phase 3+:** GitHub Sponsors / "Buy me a coffee" — single tasteful link. "This project is maintained by riders, for riders."
- **Never:** Ads. Ads destroy the brand positioning. Hosting is free — there is nothing to offset.
- **Maybe (Phase 3):** Transparent affiliate links on verified aftermarket parts. Only if disclosed clearly and only for genuinely recommended parts.
- **The real sustainability challenge:** Maintainer burnout. The YAML-in-repo model distributes data maintenance to the community. Invest in CI validation early.

---

## 4. Technical Architecture

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router, `output: 'export'`) | Static generation, per-bike routes, built-in OG image generation |
| Language | TypeScript strict | Type safety for community YAML data |
| Styling | TailwindCSS 3 (`darkMode: 'class'`) | Utility-first, dark mode support, no runtime CSS |
| Data | YAML files + JSON Schema validation | Human-readable, community-contributable via PRs |
| PWA | Serwist (NOT next-pwa — unmaintained) | Maintained Workbox fork, App Router compatible |
| Dropdowns/Popovers | Radix UI primitives | Accessible, unstyled, keyboard navigation built-in |
| Icon generation | Sharp (build script) | Automated, no manual export steps |
| YAML validation | `js-yaml` + `ajv` + `ajv-formats` | Build-time and CI validation |
| Animation | CSS transitions on SVG attributes | Compositor thread, no JS loop, respects reduced motion |
| Analytics | Plausible Analytics | GDPR-compliant, no cookies, no consent banner |
| Hosting | GitHub Pages + Cloudflare CDN | Free, global edge, Brotli, HTTP/3 |

**No state management library.** Three pieces of user state do not justify Redux/Zustand.  
**No animation library.** Pure CSS handles everything — Framer Motion (~35KB gzipped) is not worth it.  
**No component library.** Radix UI primitives only — the UI surface is small enough.

### Folder Structure

```
redditch/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # lint + validate + build on PRs
│       └── deploy.yml                # build + deploy to GitHub Pages on main
│
├── data/
│   └── bikes/
│       ├── _schema.json              # JSON Schema for YAML validation
│       ├── interceptor-650.yaml
│       ├── continental-gt-650.yaml
│       ├── super-meteor-650.yaml
│       └── ...
│
├── assets/
│   └── logo.svg                      # Source 1024x1024 SVG — single source of truth
│
├── public/
│   ├── icons/                        # Generated by scripts/generate-icons.ts
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   ├── maskable-512x512.png      # Android adaptive icon (safe zone padded)
│   │   └── apple-touch-icon.png      # 180x180, no transparency
│   ├── splash/                       # iOS PWA splash screens
│   │   ├── apple-splash-1170x2532.png
│   │   └── apple-splash-1284x2778.png
│   ├── og-image.png                  # 1200x630 default Open Graph image
│   ├── favicon.ico                   # 32x32 multi-res
│   ├── favicon.svg                   # Scalable, supports prefers-color-scheme
│   └── robots.txt
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout: theme, metadata, fonts, splash
│   │   ├── page.tsx                  # Home: bike selector + onboarding
│   │   ├── manifest.ts               # Dynamic Web App Manifest
│   │   ├── sitemap.ts                # Generated sitemap
│   │   ├── not-found.tsx             # In-brand 404
│   │   ├── sw.ts                     # Service worker (Serwist)
│   │   └── [bike]/
│   │       ├── page.tsx              # Garage view: gauges + service cards
│   │       └── opengraph-image.tsx   # Per-bike OG image (build-time)
│   │
│   ├── components/
│   │   ├── splash/
│   │   │   └── SplashScreen.tsx      # RE logo fade-in, first visit only
│   │   ├── gauge/
│   │   │   ├── GaugeSVG.tsx          # Pure SVG arc + needle, CSS animated
│   │   │   ├── GaugeLabel.tsx        # km remaining + service type text
│   │   │   └── GaugeDashboard.tsx    # Layout: 1 primary + 2-3 satellites
│   │   ├── service/
│   │   │   ├── ServiceCard.tsx       # Expandable card: collapsed → full specs
│   │   │   ├── ServiceList.tsx       # Sorted list: overdue first, then upcoming
│   │   │   └── SpecTable.tsx         # Torque values / part numbers table
│   │   ├── bike-selector/
│   │   │   ├── PlatformGrid.tsx      # Platform cards (650 Twins, 350 Platform…)
│   │   │   ├── ModelCards.tsx        # Model cards within a platform
│   │   │   └── OdometerInput.tsx     # Numeric input with km/mi toggle
│   │   ├── ui/
│   │   │   ├── ThemeToggle.tsx       # Light/dark/system — icon-only button
│   │   │   ├── StatBar.tsx           # Persistent: bike name + odometer, always visible
│   │   │   └── ExternalLink.tsx      # target=_blank, rel, icon
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── hooks/
│   │   ├── usePersistedState.ts      # Generic localStorage-backed useState
│   │   ├── useTheme.ts               # prefers-color-scheme + manual override
│   │   └── useServiceIntervals.ts    # (odometer, schedule) → ServiceDue[]
│   │
│   ├── lib/
│   │   ├── bikes.ts                  # Build-time: reads YAML → TypeScript objects
│   │   ├── service-calculator.ts     # Pure function: (schedule, km) → ServiceDue[]
│   │   ├── types.ts                  # TypeScript interfaces for all bike data
│   │   └── constants.ts             # Storage keys, defaults, config
│   │
│   └── styles/
│       └── globals.css               # Tailwind + CSS custom properties (RE palette)
│
├── scripts/
│   ├── validate-yaml.ts              # ajv validation against _schema.json
│   └── generate-icons.ts            # Sharp: SVG → all PNG sizes
│
├── .lighthouserc.json
├── next.config.ts                    # output: 'export', images: unoptimized
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Data Flow

```
CONTRIBUTOR FLOW (write path)
──────────────────────────────────────────────

[Community member edits data/bikes/*.yaml]
              │
              ▼
     [GitHub Pull Request]
              │
              ▼
    ┌─────────────────────────┐
    │  CI Pipeline            │
    │  1. yamllint syntax     │
    │  2. ajv schema validate │
    │  3. tsc --noEmit        │
    │  4. next build          │
    │  5. Lighthouse CI gate  │
    └─────────────────────────┘
              │ passes
              ▼
     [Maintainer merges]


USER FLOW (read path)
──────────────────────────────────────────────

[Push to main]
      │
      ▼
┌──────────────────────────────────────┐
│  Deploy Pipeline                     │
│  1. npm ci                           │
│  2. validate-yaml.ts                 │
│  3. next build (static export)       │
│     ├─ reads data/bikes/*.yaml       │
│     ├─ generates /interceptor-650/   │
│     ├─ generates OG image per bike   │
│     ├─ generates sitemap.xml         │
│     └─ generates manifest            │
│  4. Writes to out/                   │
└──────────────────────────────────────┘
      │
      ▼
[GitHub Pages serves out/]
      │
      ▼
┌──────────────────────────────────────┐
│  Cloudflare CDN                      │
│  ├─ TLS termination (Full Strict)    │
│  ├─ Brotli compression               │
│  ├─ Edge caching (per cache rules)   │
│  └─ HTTP/3                           │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│  User's Browser                      │
│  1. Loads static HTML + JS           │
│  2. Service Worker installs          │
│  3. Reads localStorage               │
│  4. React hydrates → renders gauges  │
│  5. service-calculator.ts runs       │
│     (all computation client-side)    │
└──────────────────────────────────────┘
```

**Critical:** Bike data is embedded into the JS bundle at build time. Zero runtime API calls. Works fully offline after first visit via Service Worker.

---

## 5. Data Schema

### JSON Schema (`data/bikes/_schema.json`)

Full JSON Schema validation — enforced in CI and build. See the file for the complete schema. Key fields:

- `slug` — URL-safe identifier (e.g., `interceptor-650`)
- `name` — Display name
- `engine` — Oil type, capacity, spark plug, valve clearances
- `brakes` — Brake fluid type
- `tires` — Size and pressures
- `chain` — Type, slack, lubricant
- `service_schedule` — Array of `{ interval_km, label, tasks[] }`
- `torque_specs` — Top-level reference table (all torque values for the bike)
- `manuals` — Links to official RE PDFs
- `meta.last_verified` — Date field. Critical for community trust.

### Sample YAML: Interceptor 650 (abbreviated)

```yaml
slug: interceptor-650
name: Interceptor 650
manufacturer: Royal Enfield
year_range: 2019+

engine:
  displacement_cc: 648
  type: parallel-twin, air/oil-cooled, SOHC 4-valve
  oil_type: SAE 15W-50 (API SL / JASO MA2)
  oil_capacity_liters: 2.7
  oil_capacity_with_filter_liters: 3.0
  spark_plug: NGK MR8BI-8 (iridium)
  valve_clearance_intake_mm: "0.10-0.15"
  valve_clearance_exhaust_mm: "0.15-0.20"

service_schedule:
  - interval_km: 500
    label: Break-in service
    tasks:
      - name: Engine oil and filter
        action: replace
        part_number: "888464"
        torque_nm: 25
        tools: ["17mm socket", "oil filter wrench", "drain pan"]
        notes: "Break-in oil collects metal shavings — do not skip."

  - interval_km: 5000
    label: Minor service
    tasks:
      - name: Engine oil and filter
        action: replace
        part_number: "888464"
        torque_nm: 25
      - name: Air filter
        action: inspect
        part_number: "576591"
      - name: Chain slack
        action: adjust

  - interval_km: 10000
    label: Major service
    tasks:
      - name: Engine oil and filter
        action: replace
        torque_nm: 25
      - name: Spark plugs
        action: replace
        torque_nm: 12
      - name: Valve clearance
        action: inspect
        notes: "Shim-under-bucket. Dealer recommended for first time."
      - name: Brake fluid
        action: replace
        notes: "DOT 4, every 2 years or 10,000 km"

torque_specs:
  - component: Engine oil drain bolt
    torque_nm: 25
  - component: Spark plug
    torque_nm: 12
  - component: Front axle nut
    torque_nm: 65
  - component: Rear axle nut
    torque_nm: 100

manuals:
  - title: Owner's Manual (PDF)
    url: https://www.royalenfield.com/content/dam/royal-enfield/owners-manual/interceptor-650.pdf

meta:
  last_verified: "2025-12-01"
  source: "Royal Enfield Owner's Manual 2023"
  contributors: ["@pixelabs"]
```

**Schema design decisions:**
- `interval_km` is an integer for arithmetic. The calculator uses it directly.
- `action` is an enum (`replace`, `inspect`, `adjust`, `clean`, `lubricate`, `top_up`). Enables UI icons and filtering.
- `repeating: true/false` (implicit in most tasks — add as an explicit field for one-time tasks like break-in).
- `meta.last_verified` is critical — displayed in the UI so users know data freshness.

---

## 6. UI/UX Design Specification

### Screen Inventory

```
/ (Home — first visit)           Splash → Bike Selector → Odometer Entry
/{bike-slug} (Garage View)       Gauge Dashboard + Service Task List
/about                           What is Redditch, how to contribute
404                              In-brand, with a bike silhouette
```

No hamburger menu. No persistent nav sidebar on mobile. Navigation happens through the **StatBar** — a persistent strip at the top showing `[Bike Name] · [Current Mileage]`. Tapping it reopens the selection flow. This is the entire navigation system on mobile.

### Splash Screen

- **When:** First visit only. Controlled by `sessionStorage` key `redditch:splash-seen`.
- **Animation:** CSS keyframe only. RE logo (full crest) centered on RE Black background. Thin gold ring expands around the crest. After ~1.2s the ring completes. After 1.8s, the entire splash fades out (opacity 1 → 0, 400ms).
- **Implementation:** `position: fixed; z-index: 9999` — the actual page content renders below it. LCP is measured on the page content, not the splash. The splash never blocks LCP.
- **Returning users:** Session flag prevents replay within the same browser session.

```css
@keyframes splashFade {
  0%, 70% { opacity: 1; pointer-events: all; }
  100% { opacity: 0; pointer-events: none; }
}
.splash { animation: splashFade 2.2s ease-in-out forwards; }
```

### Onboarding Flow

```
[1] Splash (1.8s, auto-advances, CSS only)
        │
[2] Bike Selector — "Which Royal Enfield do you ride?"
    Platform cards: [650 Twins] [350 Platform] [Himalayan] [Scram] [Bullet]
    Tap platform → Model cards animate in below
    Each model card: name (large), engine platform note, year range chips
        │
[3] Odometer Entry — slides up inline below selector
    "How many km on the clock?"
    Large numeric input (inputmode="numeric")
    Unit toggle: [km] [mi] — km default
    CTA: "Open Garage" — RE Red, full width, 56px height
        │
[4] Garage View — two taps + one number to get here
```

**After first session:** Single prompt on close: "Save your bike for next time?" If saved, localStorage persists model + odometer. Return visits skip to Garage View with a small "Not your bike?" escape in the StatBar.

### Gauge Dashboard

**Layout:** 1 large primary gauge (center, dominant), 2–3 smaller satellite gauges (below or flanking).

**Primary Gauge — "KM to Next Service":**
- Dial arc: 270° sweep (starts bottom-left, ends bottom-right, like a classic speedo)
- Range: 0 to full service interval (e.g., 0–5,000 km for oil change)
- Color arc: Green → Amber → Red as remaining km decreases
- Center: Large number "1,200 km" with sub-label "until oil change"
- When overdue: Needle pins at max. Center shows "-200 km OVERDUE" in bright red.
- Animation: Needle sweeps from 0 to position on mount (1.2s cubic-bezier ease-out). Plays once per session.

**Satellite Gauges (smaller, simplified arc — no needle):**
- Think Apple Watch activity rings but in RE Gold/Amber on RE Black
- Show: chain lubrication, valve clearance, brake fluid interval
- Tap → scrolls task list to that task card, highlighted

**Gauge aesthetic:** Classic analog instrument cluster — deliberately not digital. RE Classic's speedo. Needle is deliberate and unhurried. This is a bike that cruises at 100 km/h.

**No-JS fallback:** The percentage and km value are always visible as `<text>` elements inside the SVG. The arc is visual reinforcement; the number is the content.

### Service Card UX

**Collapsed (list view):**
```
[ Engine Oil & Filter ]  [ Due in 200 km ]  [ ↓ ]
  Repeat every 5,000 km
```
- Task name: bold, 18px
- Badge: colored pill (green/amber/red) + text ("Due Soon", "Overdue")
- One line of context: repeat interval or "Overdue by X km"
- Tap anywhere on the card to expand (large tap target)
- Sort: Overdue first → Due soonest → Future

**Expanded (inline, no modal):**
```
┌─────────────────────────────────────────────────────┐
│ Engine Oil & Filter                    [ Due Soon ] │
├─────────────────────────────────────────────────────┤
│  DRAIN PLUG TORQUE                                  │
│  ┌──────────┐                                       │
│  │  25 Nm   │  ← DOMINANT. Largest element.         │
│  └──────────┘                                       │
│                                                     │
│  Oil Spec: SAE 15W-50 API SL/JASO MA2               │
│  Capacity: 2.7L (3.0L with filter)                  │
│                                                     │
│  OEM Filter: 888464                                 │
│  Tools: 17mm socket · oil filter wrench · drain pan │
│                                                     │
│  Notes: Break-in oil collects metal shavings...    │
└─────────────────────────────────────────────────────┘
```

Expand animation: smooth height transition, 250ms ease. Card expands in place — no navigation away. The torque value is the largest element in the expanded card. That is the number they need when the wrench is in their hand.

### Dark / Light Mode

- **Default:** Dark mode. Garage lighting is poor. Non-negotiable.
- **Toggle:** ThemeToggle icon button in the StatBar. Sun/moon icon. Immediate CSS variable transition (200ms). No flash.
- **FOUC prevention:** Inline script in `<head>` before React hydrates:
  ```html
  <script>
    (function() {
      var t = localStorage.getItem('redditch:theme');
      var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (t === 'dark' || (!t && d)) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
  ```
  `suppressHydrationWarning` on `<html>` element to suppress the expected hydration mismatch.
- **On first visit (light OS):** Still default to dark, surface a one-time toast: "Switched to dark mode (better for garage use). Tap to change."

### Error States

| Situation | Response |
|---|---|
| Odometer beyond all known intervals | Extrapolate repeating intervals, explain clearly, offer GitHub link to contribute |
| Odometer is 0 or invalid | Inline validation on blur (not on keypress), red border + message below field |
| Bike data missing/malformed | "Service data for this model is being finalized. Contribute on GitHub." |
| All services up to date | Success state: gauge in green zone, "All good. Next service: X km away." Show full future schedule collapsed. |

---

## 7. Component Architecture

### GaugeSVG — Implementation

Hand-rolled SVG. No libraries. ~150 lines.

```tsx
// Core technique: stroke-dasharray on a circle = arc fill
// stroke-dasharray = [fill_length, gap_length]
// Animate fill_length via CSS transition

<svg
  viewBox="0 0 200 200"
  role="meter"
  aria-label="Kilometers to next oil change"
  aria-valuenow={kmRemaining}
  aria-valuemin={0}
  aria-valuemax={intervalKm}
  aria-valuetext={`${kmRemaining.toLocaleString()} km remaining until oil change service`}
>
  {/* Track arc: 270° sweep, static */}
  <circle className="gauge-track" cx="100" cy="100" r="80"
    stroke="var(--re-gunmetal)" strokeWidth="12" fill="none"
    strokeDasharray="377 503"  // 270/360 * 2πr ≈ 377
    transform="rotate(135 100 100)" />

  {/* Fill arc: variable, CSS animated */}
  <circle className="gauge-fill" cx="100" cy="100" r="80"
    stroke={urgencyColor} strokeWidth="12" fill="none"
    strokeDasharray={`${fillLength} 503`}
    strokeLinecap="round"
    transform="rotate(135 100 100)"
    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />

  {/* Needle */}
  <line className="gauge-needle" x1="100" y1="100" x2="100" y2="30"
    stroke="var(--re-red)" strokeWidth="2" strokeLinecap="round"
    style={{
      transformOrigin: '100px 100px',
      transform: `rotate(${needleDegrees}deg)`,
      transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }} />

  {/* Center hub */}
  <circle cx="100" cy="100" r="5" fill="var(--re-red)" />

  {/* Always-visible text values */}
  <text x="100" y="112" textAnchor="middle" className="gauge-value">
    {kmRemaining.toLocaleString()} km
  </text>
  <text x="100" y="128" textAnchor="middle" className="gauge-label">
    to oil change
  </text>
</svg>
```

**Reduced motion:** 
```css
@media (prefers-reduced-motion: reduce) {
  .gauge-fill, .gauge-needle { transition: none !important; }
}
```

**Animate on mount:** Use `useEffect` to trigger the final value after mount. The CSS property starts at 0 (or its initial DOM value) and transitions to the computed value.

### Splash Screen — Implementation

```tsx
// SplashScreen.tsx — Client Component
'use client';
import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('redditch:splash-seen');
    if (!seen) {
      setVisible(true);
      sessionStorage.setItem('redditch:splash-seen', '1');
      // Unmount after animation completes
      setTimeout(() => setVisible(false), 2400);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="splash-container" aria-hidden="true">
      <img src="/icons/icon-512x512.png" alt="" className="splash-logo" />
      <span className="splash-wordmark">REDDITCH</span>
    </div>
  );
}
```

All animation in CSS. The component is `aria-hidden` — it is purely decorative.

### Radix UI — Popovers and Dropdowns

Install: `@radix-ui/react-select`, `@radix-ui/react-collapsible`, `@radix-ui/react-tooltip`

- Bike selector: `@radix-ui/react-select` — anchors to the trigger, keyboard navigable
- Task cards: `@radix-ui/react-collapsible` — accessible expand/collapse
- Tool tooltips: `@radix-ui/react-tooltip` — anchors to the element, not center-screen

**Gotcha:** Radix portals render into `document.body`. If the splash screen uses `overflow: hidden`, it clips portals. Use Radix's `container` prop or ensure overflow is removed after splash dismounts.

### YAML → TypeScript Pipeline

```
data/bikes/*.yaml
      │
      ▼  (build time, in lib/bikes.ts)
js-yaml.parse() → raw object
      │
      ▼
Zod schema validation → typed BikeSpec object
      │
      ▼
Used in [bike]/page.tsx generateStaticParams() + page component
```

```ts
// scripts/validate-yaml.ts (CI only, uses ajv for JSON Schema)
// lib/bikes.ts (build time, uses zod for TypeScript types)

// Run validation in package.json:
// "build": "tsx scripts/validate-yaml.ts && next build"
```

---

## 8. State Management

No library. Three pieces of user state + ephemeral UI state.

| State | Key | Storage | Notes |
|---|---|---|---|
| Selected bike slug | `redditch:bike` | localStorage | Also in URL path (`/interceptor-650`) |
| Odometer (km) | `redditch:odometer` | localStorage | Not in URL — personal data |
| Theme preference | `redditch:theme` | localStorage + `<html class>` | `light` / `dark` / `system` |
| Splash shown | `redditch:splash-seen` | sessionStorage | Per-session, not per-visit |
| Expanded card ID | — | React useState | Ephemeral, no persistence needed |
| Bike data / specs | — | Build-time bundle | Not state — it's content |

```typescript
// usePersistedState.ts
function usePersistedState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
```

**Navigation logic:**
1. User lands on `/`
2. If localStorage has saved bike → redirect to `/{bike-slug}`
3. If not → show onboarding flow
4. User selects bike + enters odometer → saved to localStorage → navigate to `/{bike-slug}`
5. Dashboard reads bike slug from URL, odometer from localStorage
6. `service-calculator.ts(bikeData.service_schedule, odometerKm)` → `ServiceDue[]`
7. Gauges and cards render from computed array

---

## 9. PWA & Icons

### Serwist Configuration

```js
// next.config.ts
import withSerwist from '@serwist/next';
export default withSerwist({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
})(nextConfig);
```

**Cache strategy:**
- HTML pages: Stale-while-revalidate (serve cached, update in background)
- JS/CSS bundles: Cache-first (immutable content hashes)
- Icons/images: Cache-first
- No runtime cache — there are no API calls

**iOS Safari requirements (all required):**
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1170x2532.png"
      media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
```

**GitHub Pages + PWA gotcha:** If hosted at a subpath (e.g., `user.github.io/redditch`), the Service Worker `scope` and `manifest.start_url` must include the basePath. Custom domain (`redditch.pixelabs.net`) avoids this — the scope is `/`.

### Icon Generation Script

```typescript
// scripts/generate-icons.ts
import sharp from 'sharp';

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const source = 'assets/logo.svg';

for (const size of sizes) {
  await sharp(source).resize(size, size).png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
}

// Maskable: smaller icon centered in safe zone (80% padding)
await sharp(source).resize(410, 410).extend({
  top: 51, bottom: 51, left: 51, right: 51,
  background: { r: 26, g: 26, b: 26, alpha: 1 }  // RE Black
}).png().toFile('public/icons/maskable-512x512.png');

// Apple touch icon (no transparency)
await sharp(source).resize(180, 180).flatten({ background: '#1A1A1A' }).png()
  .toFile('public/icons/apple-touch-icon.png');

// Favicon ICO
await sharp(source).resize(32, 32).toFile('public/favicon.ico');
```

### Web App Manifest

```typescript
// src/app/manifest.ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Redditch — Royal Enfield Service Tracker',
    short_name: 'Redditch',
    description: 'Know exactly when your Royal Enfield needs service. Offline-ready.',
    start_url: '/?source=pwa',  // UTM for Plausible PWA segment
    display: 'standalone',
    background_color: '#1A1A1A',
    theme_color: '#B5121B',
    orientation: 'portrait-primary',
    categories: ['utilities', 'automotive'],
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

---

## 10. SEO, Metadata & Social Sharing

### Root Metadata (`layout.tsx`)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://redditch.pixelabs.net'),
  title: {
    template: '%s | Redditch',
    default: 'Redditch — Royal Enfield Service Tracker',
  },
  description: 'Free, offline-ready service interval tracker for Royal Enfield motorcycles. Torque specs, part numbers, oil types — for every model.',
  keywords: ['Royal Enfield', 'service schedule', 'maintenance', 'torque specs', 'Interceptor 650', 'Classic 350'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Redditch',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Redditch — Royal Enfield Service Tracker' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};
```

### Per-Bike OG Image (`[bike]/opengraph-image.tsx`)

Generated at build time via `ImageResponse`. Shows bike name + gauge graphic + Redditch wordmark on RE Black background. 1200×630px. No Puppeteer, no server.

### Social Sharing States

**Generic share (the tool itself):**
- OG Title: "Redditch — The Royal Enfield Service Companion"
- OG Description: "Know exactly what your Royal Enfield needs. Select your bike, enter your mileage, get the specs. Free, open-source, built by Bulleteers."
- OG Image: RE logo centered on black with gold ring. 1200×630px.

**Bike-specific share:**
- URL: `redditch.pixelabs.net/interceptor-650` (bike slug is shareable + indexable)
- OG Title: "Royal Enfield Interceptor 650 — Full Service Schedule | Redditch"
- OG Image: Per-bike branded card with model name and gauge graphic

**Image requirements:**
- Must be absolute URL (include `https://redditch.pixelabs.net`)
- Minimum 1200×630 (WhatsApp/Telegram)
- Bold enough to read at 200px thumbnail width
- `alt` attribute on all OG images

### JSON-LD Structured Data

Each bike page: `HowTo` schema with service steps.  
Home page: `WebApplication` schema (free, utility, any OS).

### Sitemap

Auto-generated from all bike slugs at build time via `src/app/sitemap.ts`.

---

## 11. Accessibility Architecture

### Gauge Accessibility

```html
<svg
  role="meter"
  aria-label="Kilometers to next oil change"
  aria-valuenow={1200}
  aria-valuemin={0}
  aria-valuemax={5000}
  aria-valuetext="1,200 kilometers remaining until next oil change service"
>
  <title>1,200 km to oil change — status: due soon</title>
  <!-- visual arc elements here — decorative from a11y perspective -->
</svg>
```

- `aria-valuetext` is critical — screen readers announce the full text, not just the number.
- `<title>` inside SVG as belt-and-suspenders.
- **No `aria-live`** on gauges — would interrupt screen reader navigation.

### Color Independence

Every status communication uses three channels simultaneously:
1. **Color** (green/amber/red on gauge arc and badge)
2. **Icon** (checkmark / warning triangle / X circle)
3. **Text** ("Good" / "Due Soon" / "Overdue")

Never rely on color alone.

### Interactive Elements

All service cards use proper disclosure pattern:
```html
<button aria-expanded={isOpen} aria-controls="card-content-id">
  Engine Oil & Filter
</button>
<div id="card-content-id" role="region" aria-labelledby="trigger-id">
  <!-- specs -->
</div>
```

### Touch Targets

Minimum 44×44px on all interactive elements (WCAG 2.5.5 + Apple HIG). This is also the glove-use requirement — the two reinforce each other.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .gauge-fill, .gauge-needle, .splash-container { transition: none !important; }
}
```

All animations respect `prefers-reduced-motion`. The app is fully functional without any motion.

### Reading Order

Logical tab order matching visual order:
`StatBar (bike + mileage) → ThemeToggle → Primary gauge → Task list → Resources`

Screen reader users and visual users share the same mental model.

### Skip Navigation

Implement a "Skip to service schedule" link at the top — keyboard users bypass the gauge dashboard and go straight to the task list.

---

## 12. CI/CD & Infrastructure

### GitHub Actions — CI (on PR)

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]
jobs:
  validate-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - name: Lint YAML syntax
        run: npx yamllint data/bikes/*.yaml
      - name: Validate bike schemas
        run: npx tsx scripts/validate-yaml.ts
      - name: TypeScript check
        run: npx tsc --noEmit
      - name: Build
        run: npx next build
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: .lighthouserc.json
          uploadArtifacts: true
```

### GitHub Actions — Deploy (on push to main)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx tsx scripts/validate-yaml.ts
      - run: npx next build
        env: { NEXT_PUBLIC_SITE_URL: 'https://redditch.pixelabs.net' }
      - uses: actions/upload-pages-artifact@v3
        with: { path: out }
      - uses: actions/deploy-pages@v4
        id: deployment
      - name: Purge Cloudflare cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CF_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CF_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything": true}'
```

### Lighthouse CI Config

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "out",
      "url": ["/", "/interceptor-650/"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 1.0 }],
        "categories:best-practices": ["error", { "minScore": 1.0 }],
        "categories:seo": ["error", { "minScore": 1.0 }]
      }
    }
  }
}
```

### Cloudflare Configuration

**DNS:**
```
CNAME  redditch  →  <github-username>.github.io  (Proxied)
```

**SSL/TLS:** Full (Strict). Always Use HTTPS: On. HSTS: 1 year.

**Cache Rules:**

| Path | Edge TTL | Browser TTL |
|---|---|---|
| `/*.html` | 2 hours | 1 hour |
| `/_next/static/*` | 1 year | 1 year (immutable) |
| `/icons/*` | 1 year | 1 year |

**Critical settings:**
- **Rocket Loader: OFF** — it breaks React hydration on static exports. This is the most common "Cloudflare breaks my React site" issue.
- **Brotli: ON**
- **HTTP/3: ON**
- **Auto Minify: OFF** — Next.js already minifies. Double-minification risks breakage.
- **Early Hints: ON**

---

## 13. Analytics Instrumentation

**Tool: Plausible Analytics** (not Google Analytics)

Reasons: GDPR-compliant by design, no cookies, no consent banner required, sub-1KB script, open-source, aligns with the project's ethos. No PII collected.

### Event Taxonomy

| Event | When | Properties |
|---|---|---|
| `bike_selected` | User confirms bike | `platform`, `model`, `variant` |
| `odometer_entered` | User submits mileage | `unit` (km/mi), `interval_bucket` (e.g. "5000–10000") — never raw value |
| `garage_view_loaded` | Gauge + task list renders | `model` |
| `task_expanded` | Any task card opens | `task_name`, `model` |
| `unit_toggled` | km/mi switch | `from`, `to` |
| `theme_toggled` | Dark/light switch | `to_theme` |
| `bike_changed` | User changes saved bike | — |
| `saved_bike_used` | Return visit auto-loads saved bike | `model` |

**North Star Metric:** "% of sessions with at least one `task_expanded` event." This is the proxy for "user got the spec they needed."

**What we do NOT track:** Specific odometer values, full referrer URLs beyond domain, device fingerprint.

`start_url: '/?source=pwa'` in the manifest enables Plausible to segment PWA installs from browser sessions.

---

## 14. Phased Rollout Plan

### Phase 1 — "The 650 Blueprint" (Ship this)

**Bikes:** Interceptor 650, Continental GT 650, Super Meteor 650  
**Goal:** Validate the core hypothesis. One rider, one bike, gets to the spec in <15 seconds.

Deliverables:
- Complete YAML data for all three 650 Twin models (verified against official manuals)
- Bike selector (platform → model → variant chips)
- Odometer entry (km/mi)
- Service interval calculator (pure TS function, fully tested)
- SVG gauge dashboard (primary + satellite)
- Service task cards (collapsed + expanded with full specs)
- Dark mode default + light mode toggle (no FOUC)
- PWA manifest + icon (Serwist)
- Open Graph metadata for social sharing
- Splash screen (CSS-only, first visit only)
- Lighthouse: ≥95 performance, 100 accessibility, 100 SEO
- GitHub Actions CI/CD

### Phase 1.5 — Polish & Performance

- LocalStorage persistence (saved bike + odometer)
- Plausible analytics live
- Perfect Lighthouse 100 across all categories
- iOS splash screens for top 3 iPhone sizes
- Light mode polish (parchment manual aesthetic)
- StatBar "Not your bike?" escape
- Per-bike OG images (build-time ImageResponse)

### Phase 2 — "The J-Series & Singles"

**Bikes:** Classic 350, Meteor 350, Hunter 350, Himalayan 411, Himalayan 450, Scram 411  
New features:
- Completed task checkboxes (localStorage per bike per interval)
- Calendar export (ICS) — "Add oil change reminder to Google Calendar"
- News / service bulletin links (YAML-driven, per-model)
- Official manual links in the Resources section
- "New bulletin" indicator (localStorage-based unread dot)

### Phase 3 — "The Global Garage"

**Goal:** Community scale — data beyond what one maintainer can verify.

- "Submit a correction" button → GitHub PR template prefilled
- CI/CD YAML schema validation as a hard PR gate
- Aftermarket parts cross-references (K&N, etc.) in task cards with transparent disclosure
- GitHub Sponsors link ("This project is maintained by riders, for riders.")
- Community page: curated links to major RE riding groups by region

### Phase 4 — Community Surface (if warranted)

- Curated regional events via Telegram channel embed (zero backend)
- OR: GitHub PR-based event listing (static YAML)
- **Not:** A full user-generated bulletin board with accounts and moderation

---

## 15. Build Sequence

In dependency order — do not deviate:

1. **YAML schema + Interceptor 650 data** — All UI decisions depend on what fields exist. Get this right first.

2. **`service-calculator.ts`** — Pure TypeScript function `(schedule, odometerKm) → ServiceDue[]`. Write unit tests immediately. This is the core algorithmic risk.

3. **Project scaffold** — `npx create-next-app@latest`, configure TypeScript, Tailwind, `output: 'export'`, `next/font`, CSS custom properties for RE palette.

4. **FOUC prevention + theme system** — Inline `<head>` script + `suppressHydrationWarning` + `useTheme` hook. Get this right before building any UI.

5. **Bike selector + odometer entry** — The funnel. Deploy this before building the Garage View. Instrument `bike_selected` and `odometer_entered` immediately.

6. **Service card list (text-only, no gauges)** — Core value working before the visual centrepiece. A user can get specs from a list even without gauges.

7. **SVG gauge dashboard** — Build after the calculation engine and card list. It's the delight layer. Build the gauges last within Phase 1.

8. **Splash screen** — Pure CSS, 30 minutes to build correctly. Do this alongside the gauge work.

9. **CI/CD + GitHub Actions** — YAML validation + Lighthouse CI + deploy pipeline. Set up once, maintain automatically.

10. **PWA + icons** — `scripts/generate-icons.ts` + Serwist config + manifest + iOS meta tags. Configuration task, parallel to gauge work.

11. **SEO + metadata** — `generateMetadata` + JSON-LD + sitemap + OG image. Parallel to gauge work.

12. **Lighthouse audit + Cloudflare** — Final step. Run Lighthouse, fix findings, configure Cloudflare cache rules.

---

## Appendix: Key Technical Decisions Summary

| Decision | Choice | Why |
|---|---|---|
| Animation library | None — CSS transitions | 0KB bundle, compositor thread, respects reduced-motion |
| PWA library | Serwist | `next-pwa` is unmaintained; Serwist is the maintained fork |
| Dropdown/popover | Radix UI primitives | Accessibility built-in, Tailwind compatible, keyboard nav free |
| YAML parsing | `js-yaml` + Zod (runtime) + `ajv` (CI) | Zod gives TS types; ajv gives JSON Schema validation in CI |
| State management | `usePersistedState` hook | Three keys of state don't justify a library |
| Gauge rendering | SVG + CSS transition | Accessible, scalable, hardware-accelerated, zero deps |
| OG images | Build-time `ImageResponse` | Per-bike branded cards, zero runtime cost |
| Analytics | Plausible | No cookies, no consent banner, GDPR-compliant |
| Fonts | Self-hosted via `next/font` | No external DNS lookup, no render-blocking |
| Theme system | Tailwind `class` + inline `<head>` script | No FOUC on static export |
| Routing | One file-based route per bike slug | SEO, OG images, static generation |
| Backend | None (Phases 1–3) | Static site, zero ops burden, offline-first |
| Bulletin board | Not building it | Solved problem, wrong product, moderation overhead |
| Ads | Never | Destroys brand positioning. Hosting is free. |
