'use client'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: '404 — Road Not Found',
}

export default function NotFound() {
  return (
    <div className="not-found-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main
        role="main"
        aria-labelledby="not-found-heading"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--bg)',
        }}
      >
        {/* Motorcycle silhouette */}
        <svg
          aria-hidden="true"
          focusable="false"
          width="180"
          height="80"
          viewBox="0 0 180 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: '32px', opacity: 0.35 }}
        >
          {/* Rear wheel */}
          <circle cx="38" cy="58" r="20" stroke="#C8962C" strokeWidth="4" />
          <circle cx="38" cy="58" r="8" stroke="#C8962C" strokeWidth="2" />
          {/* Front wheel */}
          <circle cx="142" cy="58" r="20" stroke="#C8962C" strokeWidth="4" />
          <circle cx="142" cy="58" r="8" stroke="#C8962C" strokeWidth="2" />
          {/* Frame — main spine */}
          <path
            d="M38 38 L65 20 L100 20 L125 38"
            stroke="#C8962C"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Frame — rear strut */}
          <path
            d="M38 38 L55 55"
            stroke="#C8962C"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Frame — seat rail */}
          <path
            d="M65 20 L80 32 L100 32 L110 20"
            stroke="#C8962C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Engine block */}
          <rect x="68" y="36" width="30" height="18" rx="3" stroke="#C8962C" strokeWidth="2" />
          {/* Exhaust */}
          <path
            d="M68 50 Q50 60 38 57"
            stroke="#C8962C"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Fork */}
          <path
            d="M125 38 L135 55 L142 55"
            stroke="#C8962C"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Handlebar */}
          <path
            d="M118 20 L132 14 M118 20 L120 30"
            stroke="#C8962C"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Headlight */}
          <circle cx="140" cy="20" r="6" stroke="#C8962C" strokeWidth="2" />
          {/* Seat */}
          <ellipse cx="85" cy="30" rx="18" ry="4" stroke="#C8962C" strokeWidth="2" />
          {/* Fuel tank */}
          <ellipse cx="95" cy="22" rx="14" ry="5" stroke="#C8962C" strokeWidth="2" />
        </svg>

        {/* 404 number */}
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '80px',
            fontWeight: 700,
            lineHeight: 1,
            color: '#C8962C',
            margin: '0 0 16px',
            letterSpacing: '-2px',
          }}
          aria-hidden="true"
        >
          404
        </p>

        {/* Heading */}
        <h1
          id="not-found-heading"
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '28px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 16px',
          }}
        >
          Road not found.
        </h1>

        {/* Divider */}
        <div
          aria-hidden="true"
          style={{
            width: '48px',
            height: '2px',
            backgroundColor: '#B5121B',
            margin: '0 auto 20px',
            borderRadius: '1px',
          }}
        />

        {/* Body copy */}
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '360px',
            margin: '0 0 40px',
          }}
        >
          This page doesn&apos;t exist. Maybe you took a wrong turn — it happens
          on mountain passes too.
        </p>

        {/* CTA */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '48px',
            padding: '0 32px',
            backgroundColor: '#B5121B',
            color: '#F0EDE8',
            fontFamily: 'var(--font-body, sans-serif)',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textDecoration: 'none',
            borderRadius: '4px',
            transition: 'background-color 0.15s ease',
          }}
          onMouseOver={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#8F0E15'
          }}
          onMouseOut={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#B5121B'
          }}
        >
          Back to Garage
        </Link>
      </main>

      <Footer />
    </div>
  )
}
