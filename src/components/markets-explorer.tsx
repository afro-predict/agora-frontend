'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { WalletButton } from '@/components/wallet-button'
import { getVisiblePrimaryNavLinks } from '@/lib/navigation'
import {
  type Market,
  type MarketCategory,
  type SortMode,
  fetchMarkets,
  formatClosingDate,
  formatRemaining,
  formatVolume,
} from '@/lib/markets'

const filters: MarketCategory[] = ['All', 'Nigerian Macro', 'African & EM Macro', 'Global Macro']
const sortOptions: SortMode[] = ['Most Active', 'Closing Soon', 'Newest']

const fallbackMarkets: Market[] = []

type MarketsExplorerProps = {
  initialMarkets?: Market[]
  initialLoadError?: string | null
}

export function MarketsExplorer({ initialMarkets = fallbackMarkets, initialLoadError = null }: MarketsExplorerProps) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<MarketCategory>('All')
  const [sortMode, setSortMode] = useState<SortMode>('Most Active')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(initialLoadError)
  const [markets, setMarkets] = useState<Market[]>(initialMarkets)

  async function loadMarkets() {
    setLoading(true)
    setLoadError(null)

    const result = await fetchMarkets()
    setMarkets(result.markets)
    setLoadError(result.error)
    setLoading(false)
  }

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
  }, [activeFilter, markets, search, sortMode])
  const visibleNavLinks = getVisiblePrimaryNavLinks(pathname)

  return (
    <section className="markets-blackout">
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

          <nav className="minimal-nav" aria-label="Markets navigation">
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
          <div className="markets-blackout-hero-header">
            <h1>All markets</h1>

            <div className="markets-blackout-hero-controls">
              <div className="markets-blackout-control-stack">
                <input
                  id="markets-search"
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search markets..."
                  className="markets-blackout-search-input"
                />

                <select
                  id="markets-sort"
                  className="markets-blackout-sort-select"
                  value={sortMode}
                  onChange={event => {
                    const value = event.target.value
                    if (sortOptions.includes(value as SortMode)) {
                      setSortMode(value as SortMode)
                    }
                  }}
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="markets-blackout-filter-rail" aria-label="Market filters">
        <div className="markets-blackout-filters">
          {filters.map(filter => (
            <button
              key={filter}
              type="button"
              className={`markets-blackout-filter${activeFilter === filter ? ' markets-blackout-filter-active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="markets-blackout-results">
        {loading ? (
          <div className="markets-blackout-grid" aria-label="Loading markets">
            {Array.from({ length: 9 }).map((_, index) => (
              <article key={index} className="market-blackout-card market-tile-skeleton" aria-hidden="true">
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
        ) : loadError ? (
          <div className="markets-blackout-empty" role="alert">
            <h2>Could not load markets</h2>
            <p>{loadError}</p>
            <button type="button" className="button button-primary" onClick={loadMarkets} disabled={loading}>
              Retry
            </button>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="markets-blackout-empty">
            <h2>No markets found</h2>
            <p>Try another search term or switch macro categories.</p>
          </div>
        ) : (
          <div className="markets-blackout-grid">
            {filteredMarkets.map(market => (
              <Link key={market.id} href={`/markets/${market.id}`} className="market-blackout-card-link">
                <article className="market-blackout-card">
                  <div className="market-blackout-card-top">
                    <div className={`market-tile-badge market-tile-badge-${market.badgeTone}`}>
                      {market.badge}
                    </div>
                    <span className="market-blackout-card-close">{formatRemaining(market.closesInHours)}</span>
                  </div>

                  <h2>{market.title}</h2>

                  <div className="market-blackout-probability">
                    <div>
                      <strong>{market.yes}%</strong>
                      <span>Yes</span>
                    </div>
                    <div>
                      <strong>{market.no}%</strong>
                      <span>No</span>
                    </div>
                  </div>

                  <div className="market-blackout-probability-bar">
                    <span className="market-blackout-probability-yes" style={{ width: `${market.yes}%` }} />
                    <span className="market-blackout-probability-no" style={{ width: `${market.no}%` }} />
                  </div>

                  <div className="market-blackout-meta">
                    <span>{formatVolume(market.volume)} vol.</span>
                    <span>Closes {formatClosingDate(market.closesAt)}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
