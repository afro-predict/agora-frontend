'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { getVisiblePrimaryNavLinks } from '@/lib/navigation'

type BetStatus = 'open' | 'won' | 'lost'

type Bet = {
  id: string
  date: string
  market: string
  side: 'YES' | 'NO'
  amount: number
  entry: number
  currentProbability?: number
  estimatedPayout?: number
  pnl?: number
  result?: 'WON' | 'LOST'
  actualPayout?: number
  status: BetStatus
  category: 'Nigeria' | 'Africa' | 'Global'
}

const demoWallet = '0x1234...5678'

const bets: Bet[] = [
  {
    id: '1',
    date: '2026-05-18',
    market: 'Will CBN hold rates above 26.5% at the May MPC?',
    side: 'YES',
    amount: 320,
    entry: 0.73,
    currentProbability: 0.76,
    estimatedPayout: 438,
    pnl: 32,
    status: 'open',
    category: 'Nigeria',
  },
  {
    id: '2',
    date: '2026-05-13',
    market: 'Naira parallel market rate below 1400/$ by June?',
    side: 'NO',
    amount: 540,
    entry: 0.55,
    currentProbability: 0.58,
    estimatedPayout: 981,
    pnl: 41,
    status: 'open',
    category: 'Nigeria',
  },
  {
    id: '3',
    date: '2026-04-26',
    market: 'South Africa Reserve Bank rate cut in May?',
    side: 'NO',
    amount: 220,
    entry: 0.75,
    result: 'WON',
    actualPayout: 293,
    pnl: 73,
    status: 'won',
    category: 'Africa',
  },
  {
    id: '4',
    date: '2026-04-11',
    market: 'Will Nigeria CPI exceed 33% in April?',
    side: 'NO',
    amount: 180,
    entry: 0.15,
    result: 'LOST',
    actualPayout: 0,
    pnl: -180,
    status: 'lost',
    category: 'Nigeria',
  },
  {
    id: '5',
    date: '2026-05-19',
    market: 'Fed rate cut at June FOMC meeting?',
    side: 'NO',
    amount: 460,
    entry: 0.85,
    status: 'open',
    currentProbability: 0.84,
    estimatedPayout: 541,
    pnl: -9,
    category: 'Global',
  },
]

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function MyBetsDashboard() {
  const pathname = usePathname()
  const openBets = bets.filter(bet => bet.status === 'open')
  const settledBets = bets.filter(bet => bet.status !== 'open')
  const totalStaked = bets.reduce((sum, bet) => sum + bet.amount, 0)
  const currentValue =
    openBets.reduce((sum, bet) => sum + (bet.estimatedPayout ?? 0), 0) +
    settledBets.reduce((sum, bet) => sum + (bet.actualPayout ?? 0), 0)
  const totalPnl = bets.reduce((sum, bet) => sum + (bet.pnl ?? 0), 0)
  const wins = settledBets.filter(bet => bet.result === 'WON').length
  const winRate = settledBets.length > 0 ? wins / settledBets.length : 0
  const exposureByRegion = [
    { label: 'Nigeria', value: 3, tone: 'gold' },
    { label: 'Africa', value: 1, tone: 'teal' },
    { label: 'Global', value: 1, tone: 'coral' },
  ]

  const visibleNavLinks = getVisiblePrimaryNavLinks(pathname)

  return (
    <section className="markets-blackout portfolio-native-shell my-bets-dashboard-shell">
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

          <nav className="minimal-nav" aria-label="My bets navigation">
            {visibleNavLinks.map(link => (
              <Link key={`${link.href}-${link.label}`} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="minimal-topbar-actions">
            <Link href="/markets" className="minimal-account-link markets-blackout-connect">
              Connect Wallet
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="portfolio-native-layout">
        <section className="portfolio-native-hero">
          <div className="portfolio-native-hero-copy">
            <p className="section-kicker">Active</p>
            <h1>Bets</h1>
            <p>Open and settled positions across Nigeria, Africa, and global macro.</p>
          </div>

          <div className="portfolio-native-wallet">
            <span>Wallet</span>
            <strong>{demoWallet}</strong>
          </div>
        </section>

        <section className="portfolio-native-summary">
          <article className="portfolio-native-stat">
            <span>Staked</span>
            <strong>{formatUsd(totalStaked)}</strong>
          </article>
          <article className="portfolio-native-stat">
            <span>Value</span>
            <strong>{formatUsd(currentValue)}</strong>
          </article>
          <article className={`portfolio-native-stat ${totalPnl >= 0 ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}`}>
            <span>P&L</span>
            <strong>{totalPnl >= 0 ? '+' : ''}{formatUsd(totalPnl)}</strong>
          </article>
          <article className="portfolio-native-stat">
            <span>Wins</span>
            <strong>{Math.round(winRate * 100)}%</strong>
          </article>
        </section>

        <div className="portfolio-native-grid">
          <section className="portfolio-native-main">
            <div className="portfolio-native-section-head">
              <div>
                <p className="section-kicker">Open</p>
                <h2>Positions</h2>
              </div>
            </div>

            <div className="portfolio-native-table">
              <div className="portfolio-native-table-head portfolio-native-open-grid">
                <span>Market</span>
                <span>Side</span>
                <span>Staked</span>
                <span>Current</span>
                <span>Payout</span>
                <span>Unrealized P&L</span>
              </div>
              {openBets.map(bet => (
                <div key={bet.id} className="portfolio-native-row portfolio-native-open-grid">
                  <strong data-label="Market">{bet.market}</strong>
                  <span data-label="Side" className={`portfolio-side portfolio-side-${bet.side.toLowerCase()}`}>{bet.side}</span>
                  <span data-label="Staked">{formatUsd(bet.amount)}</span>
                  <span data-label="Current">{formatPercent(bet.currentProbability ?? 0)}</span>
                  <span data-label="Payout">{formatUsd(bet.estimatedPayout ?? 0)}</span>
                  <span data-label="Unrealized P&L" className={(bet.pnl ?? 0) >= 0 ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}>
                    {(bet.pnl ?? 0) >= 0 ? '+' : ''}{formatUsd(bet.pnl ?? 0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="portfolio-native-section-head">
              <div>
                <p className="section-kicker">Settled</p>
                <h2>Results</h2>
              </div>
            </div>

            <div className="portfolio-native-table">
              <div className="portfolio-native-table-head portfolio-native-resolved-grid">
                <span>Market</span>
                <span>Side</span>
                <span>Result</span>
                <span>Staked</span>
                <span>Payout</span>
                <span>Realized P&L</span>
              </div>
              {settledBets.map(bet => (
                <div key={bet.id} className="portfolio-native-row portfolio-native-resolved-grid">
                  <strong data-label="Market">{bet.market}</strong>
                  <span data-label="Side" className={`portfolio-side portfolio-side-${bet.side.toLowerCase()}`}>{bet.side}</span>
                  <span data-label="Result" className={bet.result === 'WON' ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}>
                    {bet.result}
                  </span>
                  <span data-label="Staked">{formatUsd(bet.amount)}</span>
                  <span data-label="Payout">{formatUsd(bet.actualPayout ?? 0)}</span>
                  <span data-label="Realized P&L" className={(bet.pnl ?? 0) >= 0 ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}>
                    {(bet.pnl ?? 0) >= 0 ? '+' : ''}{formatUsd(bet.pnl ?? 0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="portfolio-native-section-head">
              <div>
                <p className="section-kicker">Bet history</p>
                <h2>History</h2>
              </div>
            </div>

            <div className="portfolio-native-table">
              <div className="portfolio-native-table-head portfolio-native-history-grid">
                <span>Date</span>
                <span>Market</span>
                <span>Side</span>
                <span>Amount</span>
                <span>Entry</span>
              </div>
              {bets.map(bet => (
                <div key={`history-${bet.id}`} className="portfolio-native-row portfolio-native-history-grid">
                  <span data-label="Date">{formatDate(bet.date)}</span>
                  <strong data-label="Market">{bet.market}</strong>
                  <span data-label="Side" className={`portfolio-side portfolio-side-${bet.side.toLowerCase()}`}>{bet.side}</span>
                  <span data-label="Amount">{formatUsd(bet.amount)}</span>
                  <span data-label="Entry">{Math.round(bet.entry * 100)}c</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="portfolio-native-side">
            <section className="portfolio-native-panel">
              <p className="section-kicker">Exposure</p>
              <h2>By region</h2>
              <div className="portfolio-native-side-grid">
                {exposureByRegion.map(item => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value} bets</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="portfolio-native-panel">
              <p className="section-kicker">Wallet</p>
              <h2>Wallet sync</h2>
              <p>Tracks deposits, settlements, and active positions.</p>
              <div className="portfolio-native-actions">
                <button type="button" className="button button-primary">
                  Connect Wallet
                </button>
                <button type="button" className="button button-secondary">
                  Open Markets
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}
