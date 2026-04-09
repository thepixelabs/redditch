#!/usr/bin/env tsx
/**
 * generate-icons.ts
 *
 * Generates all required PNG icon sizes from an inline SVG source using Sharp.
 * Run once after cloning, or whenever the brand mark changes:
 *
 *   npx tsx scripts/generate-icons.ts
 *   # or
 *   npm run generate-icons
 *
 * Outputs:
 *   public/icons/icon-{72,96,128,144,152,192,384,512}x*.png  — PWA manifest icons
 *   public/icons/apple-touch-icon.png                         — iOS home screen (180x180)
 *   public/icons/maskable-512x512.png                         — Maskable icon with safe-zone padding
 *   public/icons/favicon-32x32.png                            — Fallback favicon for older browsers
 *   public/splash/apple-splash-*.png                          — iOS launch screens
 */

import sharp from 'sharp'
import { existsSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'

const ROOT = resolve(process.cwd())
const ICONS_DIR = join(ROOT, 'public/icons')
const SPLASH_DIR = join(ROOT, 'public/splash')

if (!existsSync(ICONS_DIR)) mkdirSync(ICONS_DIR, { recursive: true })
if (!existsSync(SPLASH_DIR)) mkdirSync(SPLASH_DIR, { recursive: true })

// Inline SVG source — Royal Enfield "RE" monogram on a dark circle.
// Keeping this self-contained means the script has no external file dependency
// and always produces deterministic output.
const svgSource = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="256" fill="#1A1A1A"/>
  <circle cx="256" cy="256" r="224" fill="none" stroke="#C8962C" stroke-width="12"/>
  <text
    x="256" y="320"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="200"
    font-weight="700"
    letter-spacing="-8"
    fill="#C8962C"
  >RE</text>
</svg>
`)

// Standard PWA manifest icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

async function main() {
  console.log('Generating icons...')

  // PWA manifest icons
  for (const size of sizes) {
    await sharp(svgSource)
      .resize(size, size)
      .png()
      .toFile(join(ICONS_DIR, `icon-${size}x${size}.png`))
    console.log(`  icon-${size}x${size}.png`)
  }

  // Apple touch icon: 180x180 with opaque background (iOS ignores alpha on home screen)
  await sharp(svgSource)
    .resize(180, 180)
    .flatten({ background: { r: 26, g: 26, b: 26 } })
    .png()
    .toFile(join(ICONS_DIR, 'apple-touch-icon.png'))
  console.log('  apple-touch-icon.png')

  // Maskable icon: logo centred in safe zone (80% of canvas = 410px, leaving 10% padding on each side)
  // Per https://web.dev/maskable-icon/ the safe zone is the inscribed circle (80% diameter)
  const maskableCanvas = 512
  const logoSize = Math.round(maskableCanvas * 0.7) // 358px — comfortably inside safe zone
  const padding = Math.round((maskableCanvas - logoSize) / 2)

  await sharp(svgSource)
    .resize(logoSize, logoSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 26, g: 26, b: 26, alpha: 1 },
    })
    .png()
    .toFile(join(ICONS_DIR, 'maskable-512x512.png'))
  console.log('  maskable-512x512.png')

  // 32x32 PNG favicon (supplement to favicon.svg for legacy browsers)
  await sharp(svgSource)
    .resize(32, 32)
    .png()
    .toFile(join(ICONS_DIR, 'favicon-32x32.png'))
  console.log('  favicon-32x32.png')

  // iOS splash screens
  // Each splash screen is a solid dark background with the logo composited in the centre.
  const splashScreens = [
    { width: 1170, height: 2532, name: 'apple-splash-1170x2532.png' }, // iPhone 12/13/14
    { width: 1284, height: 2778, name: 'apple-splash-1284x2778.png' }, // iPhone 12/13/14 Pro Max
    { width: 1125, height: 2436, name: 'apple-splash-1125x2436.png' }, // iPhone X/XS/11 Pro
    { width: 828,  height: 1792, name: 'apple-splash-828x1792.png'  }, // iPhone XR/11
  ]

  const logoSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <circle cx="256" cy="256" r="256" fill="#1A1A1A"/>
      <circle cx="256" cy="256" r="224" fill="none" stroke="#C8962C" stroke-width="12"/>
      <text x="256" y="320" text-anchor="middle"
            font-family="Georgia, serif" font-size="200" font-weight="700"
            letter-spacing="-8" fill="#C8962C">RE</text>
    </svg>
  `)

  for (const screen of splashScreens) {
    // Logo occupies 30% of the shorter dimension
    const iconPx = Math.round(Math.min(screen.width, screen.height) * 0.3)
    const logoBuffer = await sharp(logoSvg).resize(iconPx).png().toBuffer()

    await sharp({
      create: {
        width: screen.width,
        height: screen.height,
        channels: 4,
        background: { r: 26, g: 26, b: 26, alpha: 1 },
      },
    })
      .composite([{ input: logoBuffer, gravity: 'centre' }])
      .png()
      .toFile(join(SPLASH_DIR, screen.name))

    console.log(`  ${screen.name}`)
  }

  console.log('\nAll icons generated successfully.')
}

main().catch(err => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
