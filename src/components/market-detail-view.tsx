'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { WalletButton } from '@/components/wallet-button'
import { useWallet } from '@/lib/wallet'
import { placeBet, type BetPlacementResponse } from '@/lib/bets'
import { getVisiblePrimaryNavLinks } from '@/lib/navigation'

type TradeSide = 'yes' | 'no'
type DetailTab = 'rules' | 'context'
type Timeframe = '1H' | '1D' | '1W' | '1M' | 'All'

type Source = {
  title: string
  url: string
  type: string
}

type OrderBookLevel = {
  price: number
  amount: number
}

export type MarketDetailData = {
  id: string
  title: string
  description: string
  vertical: string
  probabilityYes: number
  probabilityNo: number
  totalYesUsdc: number
  totalNoUsdc: number
  totalVolumeUsdc: number
  closesAt: string
  resolutionCriteria: string
  sourceOfTruth: string
  orderBook: {
    yesOrders: OrderBookLevel[]
    noOrders: OrderBookLevel[]
  }
}

export type MarketAiRationale = {
  marketTitle: string
  probabilityYes: number
  confidence: string
  generatedAt: string
  rationale: string
  keyFactors: string[]
  riskFactors: string[]
  sources: Source[]
}

type Props = {
  market: MarketDetailData
  rationale: MarketAiRationale | null
}

const timeframes: Timeframe[] = ['1H', '1D', '1W', '1M', 'All']
const amountPresets = [25, 50, 100, 250]
function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPrice(probability: number) {
  return `${Math.round(probability * 100)}c`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function marketLabel(vertical: string) {
  if (vertical === 'nigerian_macro') return { label: 'NG', tone: 'gold', name: 'Nigerian Macro' }
  if (vertical === 'african_macro') return { label: 'AFRICA', tone: 'teal', name: 'African & EM Macro' }
  return { label: 'GLOBAL', tone: 'coral', name: 'Global Macro' }
}

function generateSeries(target: number, timeframe: Timeframe) {
  const points = timeframe === 'All' ? 22 : timeframe === '1M' ? 18 : timeframe === '1W' ? 12 : timeframe === '1D' ? 9 : 7
  const start = Math.max(0.08, Math.min(0.86, target - (timeframe === 'All' ? 0.16 : 0.08)))

  return Array.from({ length: points }, (_, index) => {
    const progress = index / (points - 1)
    const drift = Math.sin(progress * Math.PI * 1.8) * 0.02
    const lateMove = progress > 0.72 ? (progress - 0.72) * 0.22 : 0
    const current = start + (target - start) * progress + drift + lateMove
    return Math.max(0.05, Math.min(0.95, current))
  })
}

function buildPath(series: number[], width: number, height: number) {
  return series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width
      const y = height - value * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function buildAreaPath(series: number[], width: number, height: number) {
  return `${buildPath(series, width, height)} L ${width} ${height} L 0 ${height} Z`
}

function kellySuggestion(price: number, side: TradeSide, confidence: string | undefined) {
  const sharePrice = side === 'yes' ? price : 1 - price
  if (sharePrice <= 0 || sharePrice >= 1) return 0

  const confidenceBoost = confidence === 'high' ? 0.05 : confidence === 'medium' ? 0.03 : 0.015
  const belief = side === 'yes' ? Math.min(price + confidenceBoost, 0.95) : Math.min(1 - price + confidenceBoost, 0.95)
  const b = (1 - sharePrice) / sharePrice
  const q = 1 - belief
  return Math.min(Math.max(0, (b * belief - q) / b), 0.12)
}

export function MarketDetailView({ market, rationale }: Props) {
  const pathname = usePathname()
  const [marketData, setMarketData] = useState(market)
  const [side, setSide] = useState<TradeSide>('yes')
  const [timeframe, setTimeframe] = useState<Timeframe>('All')
  const [amount, setAmount] = useState(50)
  const [activeTab, setActiveTab] = useState<DetailTab>('rules')
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [betError, setBetError] = useState<string | null>(null)
  const [confirmationData, setConfirmationData] = useState<BetPlacementResponse['data'] | null>(null)
  const { isConnected, address: walletAddress, connect } = useWallet()

  async function refreshMarket() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) return
    try {
      const response = await fetch(`${baseUrl}/markets/${marketData.id}`, { cache: 'no-store' })
      if (response.ok) {
        const payload = await response.json()
        if (payload.success && payload.data?.market) {
          const m = payload.data.market
          setMarketData({
            ...marketData,
            probabilityYes: m.probability_yes,
            probabilityNo: m.probability_no,
            totalYesUsdc: m.total_yes_usdc,
            totalNoUsdc: m.total_no_usdc,
            totalVolumeUsdc: m.total_yes_usdc + m.total_no_usdc,
            closesAt: m.closes_at,
          })
        }
      }
    } catch {
      // Background refresh failed — market data stays unchanged
    }
  }

  async function handlePlaceBet(outcome: TradeSide) {
    if (!isConnected || !walletAddress) {
      await connect()
      return
    }

    setBetError(null)
    setIsPlacingBet(true)

    const result = await placeBet({
      market_id: marketData.id,
      outcome,
      amount_usdc: String(amount),
      wallet_address: walletAddress,
    })

    setIsPlacingBet(false)

    if (!result.success) {
      setBetError(result.error ?? 'Failed to place bet')
      return
    }

    setConfirmationData(result.data ?? null)
    await refreshMarket()
  }

  const yesSeries = useMemo(() => generateSeries(marketData.probabilityYes, timeframe), [marketData.probabilityYes, timeframe])
  const label = marketLabel(marketData.vertical)
  const sharePrice = side === 'yes' ? marketData.probabilityYes : marketData.probabilityNo
  const shares = amount / Math.max(sharePrice, 0.01)
  const payout = shares
  const kelly = kellySuggestion(marketData.probabilityYes, side, rationale?.confidence)
  const visibleNavLinks = getVisiblePrimaryNavLinks(pathname)

  return (
    <section className="markets-blackout market-detail-native">
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

          <nav className="minimal-nav" aria-label="Market detail navigation">
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

      <div className="market-detail-native-stack">
        <section className="markets-blackout-hero">
          <div className="markets-blackout-hero-card market-detail-native-hero">
            <div className="market-detail-native-title-row">
              <div className="market-detail-native-title-copy">
                <div className="market-detail-native-kicker">
                  <Link href="/markets" className="market-detail-native-back">
                    Markets
                  </Link>
                  <span className={`market-tile-badge market-tile-badge-${label.tone}`}>{label.label}</span>
                  <span>{label.name}</span>
                </div>
                <h1>{marketData.title}</h1>
              </div>

              <div className="market-detail-native-header-tools">
                <div className="market-detail-native-snapshot">
                  <div>
                    <span>Closes</span>
                    <strong>{formatDate(marketData.closesAt)}</strong>
                  </div>
                  <div>
                    <span>Total volume</span>
                    <strong>{formatUsd(marketData.totalVolumeUsdc)}</strong>
                  </div>
                </div>

                <div className="market-detail-native-hero-actions">
                  <button type="button" className="market-detail-action-button" aria-label="Share market">
                    Share
                  </button>
                  <button type="button" className="market-detail-action-button" aria-label="Save market">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="market-detail-native-layout">
          <div className="market-detail-native-main">
            <section className="market-blackout-card market-detail-native-chart-card">
              <div className="market-detail-native-chart-head">
                <div>
                  <p className="section-kicker">Live pricing</p>
                  <h2>{Math.round(marketData.probabilityYes * 100)}% yes conviction</h2>
                </div>

                <div className="market-detail-native-timeframes" aria-label="Chart timeframe">
                  {timeframes.map(tab => (
                    <button
                      key={tab}
                      type="button"
                      className={`detail-timeframe-tab${timeframe === tab ? ' detail-timeframe-tab-active' : ''}`}
                      onClick={() => setTimeframe(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="market-detail-native-legend">
                <div>
                  <span className="market-detail-native-legend-dot market-detail-native-legend-dot-yes" />
                  Yes {Math.round(marketData.probabilityYes * 100)}%
                </div>
                <div>
                  <span className="market-detail-native-legend-dot market-detail-native-legend-dot-no" />
                  No {Math.round(marketData.probabilityNo * 100)}%
                </div>
              </div>

              <div className="market-detail-native-chart-shell">
                <div className="market-detail-native-chart-meta">
                  <span>{formatTime(marketData.closesAt)} close</span>
                  <span>{formatUsd(marketData.totalVolumeUsdc)} vol.</span>
                </div>

                <svg viewBox="0 0 100 100" className="market-detail-native-chart" aria-hidden="true">
                  <defs>
                    <linearGradient id="marketDetailArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(30, 143, 255, 0.3)" />
                      <stop offset="100%" stopColor="rgba(30, 143, 255, 0)" />
                    </linearGradient>
                  </defs>
                  {[20, 40, 60, 80].map(line => (
                    <line key={line} x1="0" y1={100 - line} x2="100" y2={100 - line} className="market-detail-native-gridline" />
                  ))}
                  <path d={buildAreaPath(yesSeries, 100, 100)} fill="url(#marketDetailArea)" />
                  <path d={buildPath(yesSeries, 100, 100)} className="market-detail-native-line" />
                </svg>

                <div className="market-detail-native-axis">
                  <span>open</span>
                  <span>mid</span>
                  <span>now</span>
                </div>
              </div>

              <div className="market-detail-native-board-row">
                <div>
                  <strong>Yes</strong>
                  <span>{formatCompact(marketData.totalYesUsdc)} volume</span>
                </div>
                <div className="market-detail-native-board-prob">
                  <strong>{Math.round(marketData.probabilityYes * 100)}%</strong>
                  <span>{formatPrice(marketData.probabilityYes)}</span>
                </div>
                <button type="button" className="market-blackout-buy market-blackout-buy-yes" onClick={() => { setSide('yes'); if (!isConnected) connect() }}>
                  Place Yes Bet
                </button>
              </div>

              <div className="market-detail-native-board-row">
                <div>
                  <strong>No</strong>
                  <span>{formatCompact(marketData.totalNoUsdc)} volume</span>
                </div>
                <div className="market-detail-native-board-prob">
                  <strong>{Math.round(marketData.probabilityNo * 100)}%</strong>
                  <span>{formatPrice(marketData.probabilityNo)}</span>
                </div>
                <button type="button" className="market-blackout-buy market-blackout-buy-no" onClick={() => { setSide('no'); if (!isConnected) connect() }}>
                  Place No Bet
                </button>
              </div>
            </section>

            <section className="market-blackout-card market-detail-native-tabs-card">
              <div className="market-detail-native-tabs">
                <button
                  type="button"
                  className={`market-detail-native-tab${activeTab === 'rules' ? ' market-detail-native-tab-active' : ''}`}
                  onClick={() => setActiveTab('rules')}
                >
                  Rules
                </button>
                <button
                  type="button"
                  className={`market-detail-native-tab${activeTab === 'context' ? ' market-detail-native-tab-active' : ''}`}
                  onClick={() => setActiveTab('context')}
                >
                  Market Context
                </button>
              </div>

              {activeTab === 'rules' ? (
                <div className="market-detail-native-copy">
                  <p>{marketData.resolutionCriteria}</p>
                  <a href={marketData.sourceOfTruth} target="_blank" rel="noreferrer" className="detail-source-link">
                    Open source of truth
                  </a>
                </div>
              ) : (
                <div className="market-detail-native-copy">
                  <p>{rationale?.rationale ?? 'AI rationale has not been generated for this market yet.'}</p>
                  <div className="market-detail-native-list-grid">
                    <div>
                      <strong>Key factors</strong>
                      <ul>
                        {(rationale?.keyFactors ?? ['Macro data trend', 'Policy signal', 'Current flow positioning']).map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Risk factors</strong>
                      <ul>
                        {(rationale?.riskFactors ?? ['Headline shock', 'Thin late liquidity', 'Unexpected official revision']).map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Sources</strong>
                      <ul>
                        {(rationale?.sources ?? []).slice(0, 3).map(source => (
                          <li key={source.title}>{source.title}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </section>

          </div>

          <aside className="market-detail-native-side">
            <section className="market-blackout-card market-detail-native-ticket">
              <div className="market-detail-native-ticket-head">
                <div>
                  <span>Trade ticket</span>
                  <strong>{side === 'yes' ? 'Yes' : 'No'} side</strong>
                </div>
                <div className={`market-tile-badge market-tile-badge-${label.tone}`}>{label.label}</div>
              </div>

              <div className="detail-trade-toggle">
                <button
                  type="button"
                  className={`detail-trade-side${side === 'yes' ? ' detail-trade-side-active detail-trade-side-yes' : ''}`}
                  onClick={() => setSide('yes')}
                >
                  Yes {formatPrice(marketData.probabilityYes)}
                </button>
                <button
                  type="button"
                  className={`detail-trade-side${side === 'no' ? ' detail-trade-side-active detail-trade-side-no' : ''}`}
                  onClick={() => setSide('no')}
                >
                  No {formatPrice(marketData.probabilityNo)}
                </button>
              </div>

              <div className="detail-amount-box">
                <label htmlFor="trade-amount">Amount</label>
                <input
                  id="trade-amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={event => setAmount(Number(event.target.value) || 0)}
                  className="detail-amount-input"
                />

                <div className="detail-amount-presets">
                  {amountPresets.map(preset => (
                    <button key={preset} type="button" onClick={() => setAmount(preset)}>
                      +${preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="market-detail-native-ticket-summary">
                <div>
                  <span>Current price</span>
                  <strong>{formatPrice(sharePrice)}</strong>
                </div>
                <div>
                  <span>Shares</span>
                  <strong>{shares.toFixed(1)}</strong>
                </div>
                <div>
                  <span>Est. payout</span>
                  <strong>{formatUsd(payout)}</strong>
                </div>
                <div>
                  <span>Kelly cap</span>
                  <strong>{(kelly * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {betError && (
                <div className="bet-error-message" role="alert">
                  {betError}
                </div>
              )}

              <button
                type="button"
                className="button button-primary detail-trade-submit"
                disabled={isPlacingBet}
                onClick={() => handlePlaceBet(side)}
              >
                {isPlacingBet ? 'Placing Bet...' : isConnected ? 'PLACE BET' : 'Connect Wallet to Bet'}
              </button>
            </section>

            <section className="market-blackout-card market-detail-native-intel-card">
              <div className="detail-section-header">
                <div>
                  <p className="section-kicker">AI rationale</p>
                  <h2>{rationale?.confidence ?? 'pending'} confidence</h2>
                </div>
              </div>

              <p className="detail-rationale-copy">
                {rationale?.rationale ?? 'The AI reasoning layer is still warming up for this market.'}
              </p>

              <div className="market-detail-native-list-grid market-detail-native-intel-grid">
                <div>
                  <strong>Key factors</strong>
                  <ul>
                    {(rationale?.keyFactors ?? ['Macro data trend', 'Policy signal', 'Current flow positioning']).map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Risk factors</strong>
                  <ul>
                    {(rationale?.riskFactors ?? ['Headline shock', 'Thin late liquidity', 'Unexpected official revision']).map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {rationale?.sources?.length ? (
                <div className="detail-rationale-sources">
                  {rationale.sources.slice(0, 3).map(source => (
                    <a key={source.title} href={source.url} target="_blank" rel="noreferrer">
                      <span>{source.title}</span>
                      <em>{source.type}</em>
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </div>

      {confirmationData && (
        <div className="bet-confirmation-overlay" onClick={() => setConfirmationData(null)}>
          <div className="bet-confirmation-modal" onClick={e => e.stopPropagation()}>
            <div className="bet-confirmation-header">
              <h2>Bet Placed!</h2>
              <p>Your position has been opened</p>
            </div>

            <div className="bet-confirmation-details">
              <div>
                <span>Market</span>
                <strong>{marketData.title}</strong>
              </div>
              <div>
                <span>Side</span>
                <strong className={confirmationData.outcome === 'yes' ? 'bet-confirmation-yes' : 'bet-confirmation-no'}>
                  {confirmationData.outcome === 'yes' ? 'Yes' : 'No'}
                </strong>
              </div>
              <div>
                <span>Amount</span>
                <strong>{formatUsd(Number(confirmationData.amount_usdc))}</strong>
              </div>
              {confirmationData.estimated_payout != null && (
                <div>
                  <span>Est. payout</span>
                  <strong>{formatUsd(confirmationData.estimated_payout)}</strong>
                </div>
              )}
              {confirmationData.shares_received != null && (
                <div>
                  <span>Shares received</span>
                  <strong>{confirmationData.shares_received.toFixed(2)}</strong>
                </div>
              )}
            </div>

            <div className="bet-confirmation-actions">
              <Link href="/portfolio" className="button button-primary">
                View Portfolio
              </Link>
              <Link href="/markets" className="button button-secondary" onClick={() => setConfirmationData(null)}>
                Back to Markets
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
