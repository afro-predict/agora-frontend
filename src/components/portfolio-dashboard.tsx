'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { getVisiblePrimaryNavLinks } from '@/lib/navigation'

type BalanceBucket = {
  label: string
  value: number
  tone: 'gold' | 'teal' | 'coral' | 'slate'
}

type AssetRow = {
  market: string
  side: 'YES' | 'NO'
  invested: number
  currentValue: number
  pnl: number
}

const demoWallet = '0x1234...5678'

const buckets: BalanceBucket[] = [
  { label: 'USDC balance', value: 12540, tone: 'gold' },
  { label: 'Allocated capital', value: 4230, tone: 'teal' },
  { label: 'Unrealized P&L', value: 128, tone: 'coral' },
  { label: 'Available cash', value: 8310, tone: 'slate' },
]

const assets: AssetRow[] = [
  {
    market: 'Will CBN hold rates above 26.5% at the May MPC?',
    side: 'YES',
    invested: 320,
    currentValue: 438,
    pnl: 32,
  },
  {
    market: 'Naira parallel market rate below 1400/$ by June?',
    side: 'NO',
    invested: 540,
    currentValue: 981,
    pnl: 41,
  },
  {
    market: 'Fed rate cut at June FOMC meeting?',
    side: 'NO',
    invested: 460,
    currentValue: 541,
    pnl: -9,
  },
]

const recentActivity = [
  { date: 'May 19', action: 'Deposited USDC', amount: 2400 },
  { date: 'May 18', action: 'Opened CBN bet', amount: 320 },
  { date: 'May 18', action: 'Opened Naira bet', amount: 540 },
  { date: 'May 17', action: 'Settled SARB position', amount: 293 },
]

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function PortfolioDashboard() {
  const pathname = usePathname()
  const visibleNavLinks = getVisiblePrimaryNavLinks(pathname)

  return (
    <section className="markets-blackout portfolio-native-shell portfolio-dashboard-shell">
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

          <nav className="minimal-nav" aria-label="Portfolio navigation">
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
            <p className="section-kicker">Wallet balance</p>
            <h1>Portfolio</h1>
            <p>
              A clean balance view for your wallet, allocated exposure, and recent movement across the
              platform.
            </p>
          </div>

          <div className="portfolio-native-wallet">
            <span>Connected wallet</span>
            <strong>{demoWallet}</strong>
          </div>
        </section>

        <section className="portfolio-native-summary">
          {buckets.map(bucket => (
            <article key={bucket.label} className={`portfolio-native-stat portfolio-native-stat-${bucket.tone}`}>
              <span>{bucket.label}</span>
              <strong>{formatUsd(bucket.value)}</strong>
            </article>
          ))}
        </section>

        <div className="portfolio-native-grid">
          <section className="portfolio-native-main">
            <div className="portfolio-native-section-head">
              <div>
                <p className="section-kicker">Allocated capital</p>
                <h2>Exposure</h2>
              </div>
            </div>

            <div className="portfolio-native-table">
              <div className="portfolio-native-table-head portfolio-native-open-grid">
                <span>Market</span>
                <span>Side</span>
                <span>Invested</span>
                <span>Current value</span>
                <span>P&L</span>
              </div>
              {assets.map(asset => (
                <div key={asset.market} className="portfolio-native-row portfolio-native-open-grid">
                  <strong data-label="Market">{asset.market}</strong>
                  <span data-label="Side" className={`portfolio-side portfolio-side-${asset.side.toLowerCase()}`}>{asset.side}</span>
                  <span data-label="Invested">{formatUsd(asset.invested)}</span>
                  <span data-label="Current value">{formatUsd(asset.currentValue)}</span>
                  <span data-label="P&L" className={asset.pnl >= 0 ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}>
                    {asset.pnl >= 0 ? '+' : ''}{formatUsd(asset.pnl)}
                  </span>
                </div>
              ))}
            </div>

            <div className="portfolio-native-section-head">
              <div>
                <p className="section-kicker">Recent activity</p>
                <h2>Activity</h2>
              </div>
            </div>

            <div className="portfolio-native-table">
              <div className="portfolio-native-table-head portfolio-native-history-grid">
                <span>Date</span>
                <span>Action</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {recentActivity.map(item => (
                <div key={`${item.date}-${item.action}`} className="portfolio-native-row portfolio-native-history-grid">
                  <span data-label="Date">{item.date}</span>
                  <strong data-label="Action">{item.action}</strong>
                  <span data-label="Amount">{formatUsd(item.amount)}</span>
                  <span data-label="Status" className="portfolio-summary-positive">Done</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="portfolio-native-side">
            <section className="portfolio-native-panel">
              <p className="section-kicker">Balance breakdown</p>
              <h2>Wallet composition</h2>
              <div className="portfolio-native-side-grid">
                <div>
                  <span>Cash available</span>
                  <strong>{formatUsd(8310)}</strong>
                </div>
                <div>
                  <span>Allocated capital</span>
                  <strong>{formatUsd(4230)}</strong>
                </div>
                <div>
                  <span>Settled gains</span>
                  <strong>{formatUsd(293)}</strong>
                </div>
                <div>
                  <span>Net P&L</span>
                  <strong className="portfolio-summary-positive">+{formatUsd(128)}</strong>
                </div>
              </div>
            </section>

            <section className="portfolio-native-panel">
              <p className="section-kicker">Actions</p>
              <h2>Manage funds</h2>
              <p>
                Fund your wallet, review allocations, or jump back to the market list.
              </p>
              <div className="portfolio-native-actions">
                <button type="button" className="button button-primary">
                  Add Funds
                </button>
                <button type="button" className="button button-secondary">
                  Open My Bets
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}
