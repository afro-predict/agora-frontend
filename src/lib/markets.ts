export type MarketCategory = 'All' | 'Nigerian Macro' | 'African & EM Macro' | 'Global Macro'
export type SortMode = 'Most Active' | 'Closing Soon' | 'Newest'

export type Market = {
  id: string
  title: string
  category: Exclude<MarketCategory, 'All'>
  badge: string
  badgeTone: 'gold' | 'teal' | 'coral' | 'slate'
  yes: number
  no: number
  volume: number
  closesInHours: number
  closesAt: string
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
  closes_at?: string
}

type MarketsResponse = {
  success: boolean
  data: {
    markets: ApiMarket[]
    total: number
  }
}

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

export function formatVolume(volume: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(volume)
}

export function formatRemaining(hours: number) {
  const days = Math.floor(hours / 24)
  const remainderHours = hours % 24
  return `${days}d ${remainderHours}h`
}

export function formatClosingDate(closesAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(closesAt))
}

export function marketsApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL
}

export async function fetchMarkets(): Promise<{ markets: Market[]; error: string | null }> {
  const baseUrl = marketsApiBaseUrl()
  if (!baseUrl) return { markets: [], error: 'Missing API base URL' }

  try {
    const response = await fetch(`${baseUrl}/markets`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return { markets: [], error: `Failed to fetch markets: ${response.status}` }
    }

    const payload = (await response.json()) as MarketsResponse
    if (!payload.success || !payload.data) {
      return { markets: [], error: 'Markets API returned an invalid payload' }
    }

    const markets = payload.data.markets.map((market, index) => {
      const badge = badgeFromMarket(market)
      const closesAt = market.closes_at ?? new Date(Date.now() + market.hours_remaining * 60 * 60 * 1000).toISOString()

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
        closesAt,
        createdRank: index,
      }
    })

    return { markets, error: null }
  } catch (error) {
    return { markets: [], error: error instanceof Error ? error.message : 'Failed to load markets' }
  }
}
