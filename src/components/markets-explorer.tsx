'use client'

import { useEffect, useMemo, useState } from 'react'

type MarketCategory = 'All' | 'Nigerian Macro' | 'African & EM Macro' | 'Global Macro'
type SortMode = 'Most Active' | 'Closing Soon' | 'Newest'

type Market = {
  id: string
  title: string
  category: Exclude<MarketCategory, 'All'>
  badge: string
  badgeTone: 'gold' | 'teal' | 'coral' | 'slate'
  yes: number
  no: number
  volume: number
  closesInHours: number
  createdRank: number
}

type ApiMarket = {
  id: string
  title: string
  vertical: 'nigerian_macro' | 'african_macro' | 'global_macro'
  probability_yes: number
  probability_no: number
  total_volume_usdc: number
  hours_remaining: number
}

type MarketsResponse = {
  success: boolean
  data: {
    markets: ApiMarket[]
    total: number
  }
}

const filters: MarketCategory[] = ['All', 'Nigerian Macro', 'African & EM Macro', 'Global Macro']
const sortOptions: SortMode[] = ['Most Active', 'Closing Soon', 'Newest']

const fallbackMarkets: Market[] = []

function mapVertical(vertical: ApiMarket['vertical']): Market['category'] {
  if (vertical === 'nigerian_macro') return 'Nigerian Macro'
  if (vertical === 'african_macro') return 'African & EM Macro'
  return 'Global Macro'
}

function badgeFromMarket(market: ApiMarket) {
  if (market.vertical === 'nigerian_macro') {
    return { badge: 'NG', badgeTone: 'gold' as const }
  }

  if (market.vertical === 'african_macro') {
    return { badge: 'AFRICA', badgeTone: 'teal' as const }
  }

  return { badge: 'GLOBAL', badgeTone: 'coral' as const }
}

function formatVolume(volume: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(volume)
}

function formatRemaining(hours: number) {
  const days = Math.floor(hours / 24)
  const remainderHours = hours % 24
  return `${days}d ${remainderHours}h`
}

export function MarketsExplorer() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<MarketCategory>('All')
  const [sortMode, setSortMode] = useState<SortMode>('Most Active')
  const [loading, setLoading] = useState(true)
  const [markets, setMarkets] = useState<Market[]>(fallbackMarkets)

  useEffect(() => {
    const controller = new AbortController()

    async function loadMarkets() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        if (!baseUrl) throw new Error('Missing API base URL')

        const response = await fetch(`${baseUrl}/markets`, {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) throw new Error(`Failed to fetch markets: ${response.status}`)

        const payload = (await response.json()) as MarketsResponse
        const nextMarkets = payload.data.markets.map((market, index) => {
          const badge = badgeFromMarket(market)

          return {
            id: market.id,
            title: market.title,
            category: mapVertical(market.vertical),
            badge: badge.badge,
            badgeTone: badge.badgeTone,
            yes: Math.round(market.probability_yes * 100),
            no: Math.round(market.probability_no * 100),
            volume: market.total_volume_usdc,
            closesInHours: market.hours_remaining,
            createdRank: index,
          }
        })

        setMarkets(nextMarkets)
      } catch {
        setMarkets(fallbackMarkets)
      } finally {
        setLoading(false)
      }
    }

    loadMarkets()

    return () => controller.abort()
  }, [])

  const filteredMarkets = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    const nextMarkets = markets.filter(market => {
      const matchesFilter = activeFilter === 'All' || market.category === activeFilter
      const matchesSearch =
        normalized.length === 0 ||
        market.title.toLowerCase().includes(normalized) ||
        market.badge.toLowerCase().includes(normalized)

      return matchesFilter && matchesSearch
    })

    return nextMarkets.sort((a, b) => {
      if (sortMode === 'Closing Soon') return a.closesInHours - b.closesInHours
      if (sortMode === 'Newest') return a.createdRank - b.createdRank
      return b.volume - a.volume
    })
  }, [activeFilter, search, sortMode])

  return (
    <section className="markets-page">
      <div className="markets-page-header">
        <p className="section-kicker">Live board</p>
        <h1>Markets</h1>
        <p className="markets-page-subtitle">
          Live prediction markets on African macro events.
        </p>
      </div>

      <div className="markets-toolbar">
        <div className="markets-search">
          <label htmlFor="markets-search" className="sr-only">
            Search markets
          </label>
          <input
            id="markets-search"
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search markets"
            className="markets-search-input"
          />
        </div>

        <div className="markets-sort">
          <select
            id="markets-sort"
            className="markets-sort-select"
            value={sortMode}
            onChange={event => setSortMode(event.target.value as SortMode)}
          >
            {sortOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="markets-filters-panel" aria-label="Market filters">
        {filters.map(filter => (
          <button
            key={filter}
            type="button"
            className={`markets-filter-tab${activeFilter === filter ? ' markets-filter-tab-active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="markets-results">
        {loading ? (
          <div className="markets-grid" aria-label="Loading markets">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="market-tile market-tile-skeleton" aria-hidden="true">
                <div className="skeleton-line skeleton-line-badge" />
                <div className="skeleton-line skeleton-line-title" />
                <div className="skeleton-line skeleton-line-title-short" />
                <div className="skeleton-bar" />
                <div className="skeleton-stats">
                  <div className="skeleton-line skeleton-line-stat" />
                  <div className="skeleton-line skeleton-line-stat" />
                </div>
                <div className="skeleton-footer">
                  <div className="skeleton-line skeleton-line-meta" />
                  <div className="skeleton-line skeleton-line-button" />
                </div>
              </article>
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="markets-empty">
            <h2>No markets found</h2>
            <p>Try a different search term or switch to another macro filter.</p>
          </div>
        ) : (
          <div className="markets-grid">
            {filteredMarkets.map(market => (
              <article key={market.id} className="market-tile">
                <div className={`market-tile-badge market-tile-badge-${market.badgeTone}`}>
                  {market.badge}
                </div>

                <h2>{market.title}</h2>

                <div className="market-probability">
                  <div className="market-probability-bar">
                    <span className="market-probability-yes" style={{ width: `${market.yes}%` }} />
                    <span className="market-probability-no" style={{ width: `${market.no}%` }} />
                  </div>

                  <div className="market-probability-stats">
                    <div>
                      <span>Yes</span>
                      <strong>{market.yes}%</strong>
                    </div>
                    <div>
                      <span>No</span>
                      <strong>{market.no}%</strong>
                    </div>
                  </div>
                </div>

                <div className="market-tile-meta">
                  <div>
                    <span>Volume</span>
                    <strong>{formatVolume(market.volume)} USDC</strong>
                  </div>
                  <div>
                    <span>Closes</span>
                    <strong>{formatRemaining(market.closesInHours)}</strong>
                  </div>
                </div>

                <button type="button" className="button button-primary market-trade-button">
                  Trade
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
