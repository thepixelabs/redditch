import { ImageResponse } from 'next/og'
import { getBikeBySlug, getAllBikeSlugs } from '@/lib/bikes'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// ─── Static generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllBikeSlugs().map(slug => ({ bike: slug }))
}

// ─── OG Image ─────────────────────────────────────────────────────────────────

export default async function OgImage({ params }: { params: Promise<{ bike: string }> }) {
  const { bike: slug } = await params
  const bike = getBikeBySlug(slug)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A1A1A',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* RE Red top border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            backgroundColor: '#B5121B',
          }}
        />

        {/* Gold left accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#C8962C',
          }}
        />

        {/* RE monogram */}
        <div
          style={{
            fontSize: '48px',
            color: '#C8962C',
            fontWeight: 700,
            letterSpacing: '-2px',
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          RE
        </div>

        {/* Bike name */}
        <div
          style={{
            fontSize: '64px',
            color: '#F0EDE8',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          {bike?.name ?? 'Royal Enfield'}
        </div>

        {/* Thin gold divider */}
        <div
          style={{
            width: '80px',
            height: '2px',
            backgroundColor: '#C8962C',
            marginBottom: '24px',
            borderRadius: '1px',
            display: 'flex',
          }}
        />

        {/* Service label */}
        <div
          style={{
            fontSize: '24px',
            color: '#B0B3B8',
            display: 'flex',
          }}
        >
          Service Schedule &amp; Specs
        </div>

        {/* Engine displacement badge — shown when available */}
        {bike?.engine?.displacement_cc && (
          <div
            style={{
              marginTop: '28px',
              padding: '8px 20px',
              border: '1px solid rgba(200,150,44,0.4)',
              borderRadius: '4px',
              fontSize: '18px',
              color: '#C8962C',
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            {bike.engine.displacement_cc} cc · {bike.engine.type}
          </div>
        )}

        {/* Bottom wordmark */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontSize: '18px',
            color: '#C8962C',
            letterSpacing: '0.2em',
            display: 'flex',
          }}
        >
          REDDITCH
        </div>

        {/* RE Red bottom border */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            backgroundColor: '#B5121B',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
