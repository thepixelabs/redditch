#!/usr/bin/env tsx
/**
 * generate-og.ts
 *
 * Generates the default Open Graph image at public/og-image.png (1200x630).
 * This image appears when any page on redditch.pixelabs.net is shared on
 * Twitter/X, LinkedIn, iMessage, Slack, etc.
 *
 * Run whenever the brand or tagline changes:
 *
 *   npx tsx scripts/generate-og.ts
 *
 * The SVG is rendered via Sharp (libvips) — no browser or Puppeteer required.
 * Note: system fonts are used for the SVG text. If the build machine does not
 * have Georgia installed, libvips will fall back to a generic serif.
 * For fully deterministic font rendering, embed a WOFF2 font via a <defs>
 * data-URI or switch to a Google Fonts @import in the SVG <style>.
 */

import sharp from 'sharp'
import { join, resolve } from 'path'

const ROOT = resolve(process.cwd())
const OUT = join(ROOT, 'public/og-image.png')

// 1200x630 is the canonical OG image size.
// Keeping the design minimal and text large ensures legibility in small previews.
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Dark background -->
  <rect width="1200" height="630" fill="#1A1A1A"/>

  <!-- Royal Enfield red accent bars (top & bottom) -->
  <rect x="0"   y="0"   width="1200" height="8" fill="#B5121B"/>
  <rect x="0"   y="622" width="1200" height="8" fill="#B5121B"/>

  <!-- Gold left accent stripe -->
  <rect x="0" y="8" width="4" height="614" fill="#C8962C"/>

  <!-- RE monogram circle -->
  <circle cx="600" cy="235" r="100" fill="#242424"/>
  <circle cx="600" cy="235" r="92"  fill="none" stroke="#C8962C" stroke-width="4"/>
  <text
    x="600" y="275"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="80"
    font-weight="700"
    letter-spacing="-4"
    fill="#C8962C"
  >RE</text>

  <!-- App name -->
  <text
    x="600" y="395"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="52"
    font-weight="700"
    letter-spacing="-1"
    fill="#F0EDE8"
  >REDDITCH</text>

  <!-- Subtitle -->
  <text
    x="600" y="447"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="22"
    fill="#B0B3B8"
  >Royal Enfield Service Companion</text>

  <!-- Tagline -->
  <text
    x="600" y="528"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="16"
    letter-spacing="2"
    fill="#C8962C"
  >Know your machine.</text>

  <!-- Domain — bottom-right, muted -->
  <text
    x="1140" y="590"
    text-anchor="end"
    font-family="Arial, sans-serif"
    font-size="14"
    fill="#4A4A4A"
  >redditch.pixelabs.net</text>
</svg>
`

async function main() {
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(OUT)
  console.log(`og-image.png generated at ${OUT}`)
}

main().catch(err => {
  console.error('OG image generation failed:', err)
  process.exit(1)
})
