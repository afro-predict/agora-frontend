'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { WalletButton } from '@/components/wallet-button'
import { getVisiblePrimaryNavLinks } from '@/lib/navigation'

const newlyListed = [
  {
    title: 'Nigeria CPI to exceed 34% by July',
    badge: 'New',
    badgeTone: 'gold',
    category: 'Nigerian Macro',
    probability: 62,
    volume: '14.2K',
  },
  {
    title: 'CBN holds rate at 27.75% in May',
    badge: 'New',
    badgeTone: 'gold',
    category: 'Nigerian Macro',
    probability: 55,
    volume: '9.8K',
  },
  {
    title: 'Kenya Shilling below 130/USD by Q3',
    badge: 'New',
    badgeTone: 'gold',
    category: 'African & EM Macro',
    probability: 48,
    volume: '6.3K',
  },
  {
    title: 'South Africa GDP growth above 2% in 2026',
    badge: 'New',
    badgeTone: 'gold',
    category: 'African & EM Macro',
    probability: 38,
    volume: '11.1K',
  },
  {
    title: 'GH¢ below 12/USD before June',
    badge: 'New',
    badgeTone: 'gold',
    category: 'African & EM Macro',
    probability: 52,
    volume: '4.7K',
  },
  {
    title: 'AFCON 2027 — Host nation to reach semi-finals',
    badge: 'New',
    badgeTone: 'gold',
    category: 'Global Macro',
    probability: 44,
    volume: '8.2K',
  },
] as const

const educationCards = [
  {
    title: 'What Are Prediction Markets?',
    body: 'Prediction markets let you trade on the outcome of future events — from inflation data to election results. Prices reflect the market\'s collective probability estimate, making them powerful forecasting tools.',
    link: '/markets',
    linkLabel: 'Explore Markets',
  },
  {
    title: 'How to Hedge African Macro Risk',
    body: 'Hedging lets you protect against adverse movements in FX, inflation, or policy. Buy "No" on outcomes you want to avoid, just like buying insurance. If the event happens, your payout offsets your real-world losses.',
    link: '/markets',
    linkLabel: 'Start Trading',
  },
  {
    title: 'Reading the Odds',
    body: 'A market trading at 65¢ implies a 65% probability. When new information emerges, prices adjust. Track changes over time to spot trends before they hit mainstream news.',
    link: '/markets',
    linkLabel: 'View Markets',
  },
] as const

const calendarEvents = [
  {
    date: 'May 28',
    title: 'CBN Monetary Policy Committee Meeting',
    description: 'Interest rate decision & inflation outlook. Could move NGN markets.',
    category: 'Central Bank',
  },
  {
    date: 'Jun 5',
    title: 'South Africa GDP — Q1 2026',
    description: 'First-quarter growth figures. Key indicator for SARB policy path.',
    category: 'Economic Data',
  },
  {
    date: 'Jun 15',
    title: 'Nigeria CPI Report — May',
    description: 'Year-on-year inflation print. Market expects moderation or fresh highs.',
    category: 'Inflation',
  },
  {
    date: 'Jun 20',
    title: 'Kenya Central Bank Rate Decision',
    description: 'CBK signals on shilling support and inflation management.',
    category: 'Central Bank',
  },
  {
    date: 'Jul 4',
    title: 'US Non-Farm Payrolls',
    description: 'Global risk appetite driver. EM currencies and commodities react.',
    category: 'Global Macro',
  },
  {
    date: 'Jul 14',
    title: 'Ghana CPI — June',
    description: 'Disinflation progress check. Cedi outlook catalyst.',
    category: 'Inflation',
  },
] as const

export function DiscoverMore() {
  const pathname = usePathname()
  const visibleNavLinks = getVisiblePrimaryNavLinks(pathname)

  return (
    <section className="markets-blackout portfolio-native-shell">
      <header className="markets-blackout-topbar">
        <div className="minimal-topbar markets-blackout-topbar-shell">
          <Link href="/" className="minimal-brand" aria-label="AfroMarkets home">
            <span className="minimal-brand-mark">
              <svg viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="17" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.92" />
                <path
                  d="M28.5 15.5A9.8 9.8 0 0 0 22 13c-5 0-9 4-9 9s4 9 9 9a9.7 9.7 0 0 0 6.4-2.4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path d="M18.5 22h10.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="minimal-brand-text">AfroMarkets</span>
          </Link>

          <nav className="minimal-nav" aria-label="Discover navigation">
            {visibleNavLinks.map(link => (
              <Link key={`${link.href}-${link.label}`} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="minimal-topbar-actions">
            <WalletButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="markets-blackout-hero">
        <div className="markets-blackout-hero-card">
          <div className="markets-blackout-hero-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <p className="section-kicker" style={{ color: 'var(--shell-muted)' }}>Discover More</p>
            <h1>Explore, learn, and stay ahead</h1>
            <p style={{ color: 'var(--shell-muted)', maxWidth: '42rem', lineHeight: 1.65, margin: '4px 0 0' }}>
              New markets, educational primers, and a calendar of upcoming events that shape African macro.
            </p>
          </div>
        </div>
      </section>

      <div className="portfolio-native-layout" style={{ paddingTop: 6 }}>
        <section className="portfolio-native-main">
          <div className="portfolio-native-section-head">
            <div>
              <p className="section-kicker">Fresh markets</p>
              <h2>Newly Listed</h2>
            </div>
          </div>

          <div className="markets-blackout-grid">
            {newlyListed.map(market => (
              <Link key={market.title} href="/markets" className="market-blackout-card-link">
                <article className="market-blackout-card">
                  <div className="market-blackout-card-top">
                    <div className={`market-tile-badge market-tile-badge-${market.badgeTone}`}>
                      {market.badge}
                    </div>
                    <span className="market-blackout-card-close">{market.category}</span>
                  </div>
                  <h2>{market.title}</h2>
                  <div className="market-blackout-probability">
                    <div>
                      <strong>{market.probability}%</strong>
                      <span>Yes</span>
                    </div>
                  </div>
                  <div className="market-blackout-probability-bar">
                    <span className="market-blackout-probability-yes" style={{ width: `${market.probability}%` }} />
                  </div>
                  <div className="market-blackout-meta">
                    <span>{market.volume} USDC volume</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div className="portfolio-native-section-head" style={{ marginTop: 22 }}>
            <div>
              <p className="section-kicker">Learn the basics</p>
              <h2>Educational Content</h2>
            </div>
          </div>

          <div className="markets-blackout-grid">
            {educationCards.map(card => (
              <article key={card.title} className="market-blackout-card" style={{ gap: 10 }}>
                <h2 style={{ fontSize: '1.2rem', lineHeight: 1.4, fontWeight: 600 }}>{card.title}</h2>
                <p style={{ color: 'var(--shell-muted)', lineHeight: 1.65, margin: 0, fontSize: '0.88rem' }}>
                  {card.body}
                </p>
                <Link
                  href={card.link}
                  className="button button-primary"
                  style={{ alignSelf: 'start', padding: '0 14px', minHeight: 36, fontSize: '0.82rem' }}
                >
                  {card.linkLabel}
                </Link>
              </article>
            ))}
          </div>

          <div className="portfolio-native-section-head" style={{ marginTop: 22 }}>
            <div>
              <p className="section-kicker">Upcoming events</p>
              <h2>Market Calendar</h2>
            </div>
          </div>

          <div className="markets-blackout-grid">
            {calendarEvents.map(event => (
              <article key={event.title} className="market-blackout-card" style={{ gap: 8 }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--accent)',
                }}>
                  {event.date}
                </span>
                <h2 style={{ fontSize: '1rem', lineHeight: 1.4, fontWeight: 600 }}>{event.title}</h2>
                <p style={{ color: 'var(--shell-muted)', lineHeight: 1.6, margin: 0, fontSize: '0.84rem' }}>
                  {event.description}
                </p>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--shell-muted)',
                  marginTop: 'auto',
                }}>
                  {event.category}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
