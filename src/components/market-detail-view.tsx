'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type TradeSide = 'yes' | 'no'
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
  hoursRemaining: number
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

function formatOrderPrice(price: number) {
  return `${Math.round(price * 100)}c`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatRemaining(hours: number) {
  const safeHours = Math.max(hours, 0)
  const days = Math.floor(safeHours / 24)
  const remainderHours = safeHours % 24
  return `${days}d ${remainderHours}h`
}

function marketLabel(vertical: string) {
  if (vertical === 'nigerian_macro') return { label: 'NG', tone: 'gold' }
  if (vertical === 'african_macro') return { label: 'AFRICA', tone: 'teal' }
  return { label: 'GLOBAL', tone: 'coral' }
}

function generateSeries(target: number, timeframe: Timeframe) {
  const points = timeframe === 'All' ? 18 : timeframe === '1M' ? 14 : timeframe === '1W' ? 10 : timeframe === '1D' ? 8 : 6
  const start = Math.max(0.08, Math.min(0.88, target - (timeframe === 'All' ? 0.18 : 0.1)))

  return Array.from({ length: points }, (_, index) => {
    const progress = index / (points - 1)
    const drift = Math.sin(progress * Math.PI * 1.4) * 0.018
    const current = start + (target - start) * progress + drift
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
  const line = buildPath(series, width, height)
  return `${line} L ${width} ${height} L 0 ${height} Z`
}

function kellySuggestion(price: number, side: TradeSide, confidence: string | undefined) {
  const confidenceBoost = confidence === 'high' ? 0.05 : confidence === 'medium' ? 0.03 : 0.015
  const belief = side === 'yes' ? Math.min(price + confidenceBoost, 0.95) : Math.min(1 - price + confidenceBoost, 0.95)
  const sharePrice = side === 'yes' ? price : 1 - price
  const b = (1 - sharePrice) / sharePrice
  const q = 1 - belief
  const kelly = Math.max(0, (b * belief - q) / b)
  return Math.min(kelly, 0.12)
}

export function MarketDetailView({ market, rationale }: Props) {
  const [side, setSide] = useState<TradeSide>('yes')
  const [timeframe, setTimeframe] = useState<Timeframe>('All')
  const [amount, setAmount] = useState(50)

  const yesSeries = useMemo(() => generateSeries(market.probabilityYes, timeframe), [market.probabilityYes, timeframe])
  const label = marketLabel(market.vertical)
  const sharePrice = side === 'yes' ? market.probabilityYes : market.probabilityNo
  const shares = amount / Math.max(sharePrice, 0.01)
  const kelly = kellySuggestion(market.probabilityYes, side, rationale?.confidence)
  const yAxisLabels = [80, 60, 40, 20]
  const xAxisLabels =
    timeframe === 'All'
      ? ['May', 'Jun', 'Jul', 'Now']
      : timeframe === '1M'
        ? ['Week 1', 'Week 2', 'Week 3', 'Now']
        : timeframe === '1W'
          ? ['Mon', 'Wed', 'Fri', 'Now']
          : timeframe === '1D'
            ? ['00:00', '08:00', '16:00', 'Now']
            : ['-1h', '-30m', '-10m', 'Now']

  return (
    <section className="market-detail-page">
      <div className="market-detail-utility-row">
        <Link href="/markets" className="market-detail-back">
          Back to markets
        </Link>
        <div className="market-detail-actions">
          <button type="button" className="market-detail-action-button">
            Share
          </button>
          <button type="button" className="market-detail-action-button">
            Save
          </button>
        </div>
      </div>

      <div className="market-detail-hero">
        <div className="market-detail-copy">
          <div className="market-detail-header-row">
            <div className={`market-tile-badge market-tile-badge-${label.tone}`}>{label.label}</div>
          </div>
          <h1>{market.title}</h1>
          <p>{market.description}</p>
          <div className="market-detail-meta">
            <span>Closes {formatDate(market.closesAt)}</span>
            <span>{formatRemaining(market.hoursRemaining)} remaining</span>
          </div>
        </div>
      </div>

      <div className="market-detail-layout">
        <div className="market-detail-main">
          <section className="detail-panel detail-chart-panel">
            <div className="detail-chart-header">
              <div>
                <p className="section-kicker">Probability trend</p>
                <h2>{Math.round(market.probabilityYes * 100)}% Yes</h2>
              </div>

              <div className="detail-timeframes" aria-label="Chart timeframe">
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

            <div className="detail-chart-shell">
              <div className="detail-chart-grid">
                <div className="detail-chart-yaxis" aria-hidden="true">
                  {yAxisLabels.map(labelValue => (
                    <span key={labelValue}>{labelValue}%</span>
                  ))}
                </div>
                <div className="detail-chart-canvas">
                  <svg viewBox="0 0 100 100" className="detail-chart" aria-hidden="true">
                    <defs>
                      <linearGradient id="yesArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(90, 165, 122, 0.32)" />
                        <stop offset="100%" stopColor="rgba(90, 165, 122, 0)" />
                      </linearGradient>
                    </defs>
                    {[20, 40, 60, 80].map(line => (
                      <line key={line} x1="0" y1={100 - line} x2="100" y2={100 - line} className="detail-chart-gridline" />
                    ))}
                    <path d={buildAreaPath(yesSeries, 100, 100)} fill="url(#yesArea)" />
                    <path d={buildPath(yesSeries, 100, 100)} className="detail-chart-line-yes" />
                    {yesSeries.map((point, index) => {
                      const x = (index / (yesSeries.length - 1)) * 100
                      const y = 100 - point * 100
                      return <circle key={`yes-${index}`} cx={x} cy={y} r="1.4" className="detail-chart-point-yes" />
                    })}
                  </svg>
                  <div className="detail-chart-xaxis" aria-hidden="true">
                    {xAxisLabels.map(labelValue => (
                      <span key={labelValue}>{labelValue}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-volume-row">
              <div className="detail-volume-header">
                <strong>{formatUsd(market.totalVolumeUsdc)}</strong>
                <span>Volume in USDC</span>
              </div>
              <div className="detail-volume-bar">
                <span className="detail-volume-bar-yes" style={{ width: `${market.probabilityYes * 100}%` }} />
                <span className="detail-volume-bar-no" style={{ width: `${market.probabilityNo * 100}%` }} />
              </div>
            </div>
          </section>

          <section className="detail-panel">
            <div className="detail-section-header">
              <div>
                <p className="section-kicker">Order book</p>
                <h2>Live bids by side.</h2>
              </div>
            </div>

            <div className="detail-orderbook">
              <div className="detail-orderbook-column">
                <div className="detail-orderbook-head">
                  <strong>Yes orders</strong>
                  <span>Price / Amount</span>
                </div>
                {market.orderBook.yesOrders.length > 0 ? (
                  market.orderBook.yesOrders.map((order, index) => (
                    <div key={`yes-${index}`} className="detail-orderbook-row">
                      <span>{formatOrderPrice(order.price)}</span>
                      <strong>{formatUsd(order.amount)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="detail-orderbook-empty">No live yes orders returned by the API yet.</p>
                )}
              </div>

              <div className="detail-orderbook-column">
                <div className="detail-orderbook-head">
                  <strong>No orders</strong>
                  <span>Price / Amount</span>
                </div>
                {market.orderBook.noOrders.length > 0 ? (
                  market.orderBook.noOrders.map((order, index) => (
                    <div key={`no-${index}`} className="detail-orderbook-row">
                      <span>{formatOrderPrice(order.price)}</span>
                      <strong>{formatUsd(order.amount)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="detail-orderbook-empty">No live no orders returned by the API yet.</p>
                )}
              </div>
            </div>
          </section>

          <section className="detail-panel">
            <div className="detail-section-header">
              <div>
                <p className="section-kicker">Outcomes</p>
                <h2>Trade either side directly.</h2>
              </div>
            </div>

            <div className="detail-outcomes">
              <div className="detail-outcome-row">
                <div>
                  <strong>Yes</strong>
                  <span>Resolves if the event happens.</span>
                </div>
                <div className="detail-outcome-prob">{Math.round(market.probabilityYes * 100)}%</div>
                <button type="button" className="detail-outcome-action" onClick={() => setSide('yes')}>
                  Yes {formatPrice(market.probabilityYes)}
                </button>
              </div>

              <div className="detail-outcome-row">
                <div>
                  <strong>No</strong>
                  <span>Resolves if the event does not happen.</span>
                </div>
                <div className="detail-outcome-prob">{Math.round(market.probabilityNo * 100)}%</div>
                <button type="button" className="detail-outcome-action detail-outcome-action-no" onClick={() => setSide('no')}>
                  No {formatPrice(market.probabilityNo)}
                </button>
              </div>
            </div>
          </section>

          <section className="detail-panel detail-resolution-panel">
            <div className="detail-section-header">
              <div>
                <p className="section-kicker">Resolution</p>
                <h2>What determines the final outcome.</h2>
              </div>
            </div>

            <p className="detail-resolution-copy">{market.resolutionCriteria}</p>
            <a href={market.sourceOfTruth} target="_blank" rel="noreferrer" className="detail-source-link">
              Source of truth
            </a>
          </section>
        </div>

        <aside className="market-detail-side">
          <section className="detail-panel detail-trade-panel">
            <div className="detail-trade-toggle">
              <button
                type="button"
                className={`detail-trade-side${side === 'yes' ? ' detail-trade-side-active detail-trade-side-yes' : ''}`}
                onClick={() => setSide('yes')}
              >
                Yes {formatPrice(market.probabilityYes)}
              </button>
              <button
                type="button"
                className={`detail-trade-side${side === 'no' ? ' detail-trade-side-active detail-trade-side-no' : ''}`}
                onClick={() => setSide('no')}
              >
                No {formatPrice(market.probabilityNo)}
              </button>
            </div>

            <div className="detail-trade-price">
              <span>Current price</span>
              <strong>{formatPrice(sharePrice)}</strong>
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

            <div className="detail-trade-summary">
              <div>
                <span>Shares</span>
                <strong>{shares.toFixed(1)}</strong>
              </div>
              <div>
                <span>Estimated payout</span>
                <strong>{formatUsd(shares)}</strong>
              </div>
            </div>

            <button type="button" className="button button-primary detail-trade-submit">
              Buy {side === 'yes' ? 'Yes' : 'No'}
            </button>
          </section>

          <section className="detail-panel detail-kelly-panel">
            <p className="section-kicker">Kelly criterion</p>
            <h2>{(kelly * 100).toFixed(1)}% bankroll</h2>
            <p>
              Suggested size based on the current market price, selected side, and the AI confidence
              adjustment. Use it as a cap, not a target.
            </p>
          </section>

          <section className="detail-panel detail-rationale-panel">
            <div className="detail-section-header">
              <div>
                <p className="section-kicker">AI rationale</p>
                <h2>Why the model leans this way.</h2>
              </div>
            </div>

            {rationale ? (
              <>
                <div className="detail-rationale-meta">
                  <span>Confidence: {rationale.confidence}</span>
                  <span>Updated {formatDate(rationale.generatedAt)}</span>
                </div>
                <p className="detail-rationale-copy">{rationale.rationale}</p>

                <div className="detail-rationale-lists">
                  <div>
                    <strong>Key factors</strong>
                    <ul>
                      {rationale.keyFactors.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Risk factors</strong>
                    <ul>
                      {rationale.riskFactors.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="detail-rationale-sources">
                  <strong>Sources</strong>
                  {rationale.sources.map(source => (
                    <a key={source.title} href={source.url} target="_blank" rel="noreferrer">
                      <span>{source.title}</span>
                      <em>{source.type}</em>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <p className="detail-rationale-copy">AI rationale is not available for this market yet.</p>
            )}
          </section>
        </aside>
      </div>
    </section>
  )
}
