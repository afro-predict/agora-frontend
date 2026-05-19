'use client'

import { useMemo, useState } from 'react'

type PositionStatus = 'open' | 'won' | 'lost'
type Position = {
  id: string
  date: string
  market: string
  side: 'YES' | 'NO'
  amount: number
  price: number
  currentProbability?: number
  estimatedPayout?: number
  pnl?: number
  result?: 'WON' | 'LOST'
  actualPayout?: number
  status: PositionStatus
}

const demoWallet = '0x1234...5678'

const positions: Position[] = [
  {
    id: '1',
    date: '2026-05-18',
    market: 'Will CBN hold rates above 26.5% at the May MPC?',
    side: 'YES',
    amount: 320,
    price: 0.73,
    currentProbability: 0.76,
    estimatedPayout: 438,
    pnl: 32,
    status: 'open',
  },
  {
    id: '2',
    date: '2026-05-13',
    market: 'Naira parallel market rate below 1400/$ by June?',
    side: 'NO',
    amount: 540,
    price: 0.55,
    currentProbability: 0.58,
    estimatedPayout: 981,
    pnl: 41,
    status: 'open',
  },
  {
    id: '3',
    date: '2026-04-26',
    market: 'South Africa Reserve Bank rate cut in May?',
    side: 'NO',
    amount: 220,
    price: 0.75,
    result: 'WON',
    actualPayout: 293,
    pnl: 73,
    status: 'won',
  },
  {
    id: '4',
    date: '2026-04-11',
    market: 'Will Nigeria CPI exceed 33% in April?',
    side: 'NO',
    amount: 180,
    price: 0.15,
    result: 'LOST',
    actualPayout: 0,
    pnl: -180,
    status: 'lost',
  },
  {
    id: '5',
    date: '2026-05-19',
    market: 'Fed rate cut at June FOMC meeting?',
    side: 'NO',
    amount: 460,
    price: 0.85,
    status: 'open',
    currentProbability: 0.84,
    estimatedPayout: 541,
    pnl: -9,
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

export function PortfolioDashboard() {
  const [showDemo, setShowDemo] = useState(false)

  const openPositions = useMemo(() => positions.filter(position => position.status === 'open'), [])
  const resolvedPositions = useMemo(() => positions.filter(position => position.status !== 'open'), [])

  const summary = useMemo(() => {
    const totalInvested = positions.reduce((sum, position) => sum + position.amount, 0)
    const currentValue =
      openPositions.reduce((sum, position) => sum + (position.estimatedPayout ?? 0), 0) +
      resolvedPositions.reduce((sum, position) => sum + (position.actualPayout ?? 0), 0)
    const totalPnl = positions.reduce((sum, position) => sum + (position.pnl ?? 0), 0)
    const wins = resolvedPositions.filter(position => position.result === 'WON').length
    const winRate = resolvedPositions.length > 0 ? wins / resolvedPositions.length : 0

    return { totalInvested, currentValue, totalPnl, winRate }
  }, [openPositions, resolvedPositions])

  if (!showDemo) {
    return (
      <section className="portfolio-page">
        <div className="portfolio-header">
          <p className="section-kicker">Wallet performance</p>
          <h1>Portfolio</h1>
          <p className="portfolio-subtitle">
            Connect your wallet to view active positions, resolved markets, and trade history.
          </p>
        </div>

        <div className="portfolio-empty-card">
          <h2>Connect your wallet to view your portfolio</h2>
          <p>
            Wallet auth is not wired yet, so live holdings cannot be loaded from the backend. You can
            preview the dashboard structure with demo data for now.
          </p>
          <div className="portfolio-empty-actions">
            <button type="button" className="button button-primary" onClick={() => setShowDemo(true)}>
              Preview demo portfolio
            </button>
            <button type="button" className="button button-ghost">
              Connect Wallet
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="portfolio-page">
      <div className="portfolio-header">
        <div>
          <p className="section-kicker">Wallet performance</p>
          <h1>Portfolio</h1>
          <p className="portfolio-subtitle">Demo portfolio view until wallet auth is connected.</p>
        </div>

        <div className="portfolio-identity">
          <span>{demoWallet}</span>
          <strong>{formatUsd(summary.currentValue)}</strong>
        </div>
      </div>

      <div className="portfolio-summary-grid">
        <article className="portfolio-summary-card">
          <span>Total invested</span>
          <strong>{formatUsd(summary.totalInvested)}</strong>
        </article>
        <article className="portfolio-summary-card">
          <span>Current value</span>
          <strong>{formatUsd(summary.currentValue)}</strong>
        </article>
        <article className={`portfolio-summary-card ${summary.totalPnl >= 0 ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}`}>
          <span>Total P&amp;L</span>
          <strong>{summary.totalPnl >= 0 ? '+' : ''}{formatUsd(summary.totalPnl)}</strong>
        </article>
        <article className="portfolio-summary-card">
          <span>Win rate</span>
          <strong>{Math.round(summary.winRate * 100)}%</strong>
        </article>
      </div>

      <section className="portfolio-section">
        <div className="portfolio-section-header">
          <div>
            <p className="section-kicker">Open positions</p>
            <h2>Markets still in play.</h2>
          </div>
        </div>

        <div className="portfolio-table">
          <div className="portfolio-table-head portfolio-open-grid">
            <span>Market</span>
            <span>Side</span>
            <span>Amount</span>
            <span>Probability</span>
            <span>Payout</span>
            <span>Unrealized P&amp;L</span>
          </div>
          {openPositions.map(position => (
            <div key={position.id} className="portfolio-table-row portfolio-open-grid">
              <strong>{position.market}</strong>
              <span className={`portfolio-side portfolio-side-${position.side.toLowerCase()}`}>{position.side}</span>
              <span>{formatUsd(position.amount)}</span>
              <span>{formatPercent(position.currentProbability ?? 0)}</span>
              <span>{formatUsd(position.estimatedPayout ?? 0)}</span>
              <span className={(position.pnl ?? 0) >= 0 ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}>
                {(position.pnl ?? 0) >= 0 ? '+' : ''}{formatUsd(position.pnl ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-header">
          <div>
            <p className="section-kicker">Resolved positions</p>
            <h2>Closed contracts and outcomes.</h2>
          </div>
        </div>

        <div className="portfolio-table">
          <div className="portfolio-table-head portfolio-resolved-grid">
            <span>Market</span>
            <span>Side</span>
            <span>Result</span>
            <span>Wagered</span>
            <span>Payout</span>
            <span>Realized P&amp;L</span>
          </div>
          {resolvedPositions.map(position => (
            <div key={position.id} className="portfolio-table-row portfolio-resolved-grid">
              <strong>{position.market}</strong>
              <span className={`portfolio-side portfolio-side-${position.side.toLowerCase()}`}>{position.side}</span>
              <span className={position.result === 'WON' ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}>
                {position.result}
              </span>
              <span>{formatUsd(position.amount)}</span>
              <span>{formatUsd(position.actualPayout ?? 0)}</span>
              <span className={(position.pnl ?? 0) >= 0 ? 'portfolio-summary-positive' : 'portfolio-summary-negative'}>
                {(position.pnl ?? 0) >= 0 ? '+' : ''}{formatUsd(position.pnl ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-header">
          <div>
            <p className="section-kicker">Trade history</p>
            <h2>Every bet, in time order.</h2>
          </div>
        </div>

        <div className="portfolio-table">
          <div className="portfolio-table-head portfolio-history-grid">
            <span>Date</span>
            <span>Market</span>
            <span>Side</span>
            <span>Amount</span>
            <span>Price</span>
          </div>
          {positions.map(position => (
            <div key={`history-${position.id}`} className="portfolio-table-row portfolio-history-grid">
              <span>{position.date}</span>
              <strong>{position.market}</strong>
              <span className={`portfolio-side portfolio-side-${position.side.toLowerCase()}`}>{position.side}</span>
              <span>{formatUsd(position.amount)}</span>
              <span>{Math.round(position.price * 100)}c</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
