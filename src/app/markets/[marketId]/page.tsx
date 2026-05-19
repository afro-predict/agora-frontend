import { notFound } from 'next/navigation'
import { AppFooter } from '@/components/app-footer'
import { AppHeader } from '@/components/app-header'
import { MarketDetailView, type MarketAiRationale, type MarketDetailData } from '@/components/market-detail-view'

type DetailResponse = {
  success: boolean
  data?: {
    market: {
      id: string
      title: string
      description: string
      vertical: string
      probability_yes: number
      probability_no: number
      status: string
      closes_at: string
      total_yes_usdc: number
      total_no_usdc: number
      resolution_criteria: string
      source_of_truth: string
    }
    order_book: {
      yes_orders: Array<{
        price: number
        amount: number
      }>
      no_orders: Array<{
        price: number
        amount: number
      }>
    }
  }
}

type RationaleResponse = {
  success: boolean
  data?: {
    market_title: string
    probability_yes: number
    confidence: string
    generated_at: string
    rationale: string
    key_factors: string[]
    risk_factors: string[]
    sources: Array<{
      title: string
      url: string
      type: string
    }>
  }
}

async function getMarketDetail(marketId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!baseUrl) notFound()

  const [detailResponse, rationaleResponse] = await Promise.all([
    fetch(`${baseUrl}/markets/${marketId}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/markets/${marketId}/ai-rationale`, { cache: 'no-store' }),
  ])

  if (!detailResponse.ok) notFound()

  const detailPayload = (await detailResponse.json()) as DetailResponse
  const rationalePayload = rationaleResponse.ok ? ((await rationaleResponse.json()) as RationaleResponse) : null

  if (!detailPayload.success || !detailPayload.data) notFound()

  const market = detailPayload.data.market
  const now = Date.now()
  const closesAtTime = new Date(market.closes_at).getTime()
  const computedHoursRemaining = Math.max(0, Math.round((closesAtTime - now) / 36e5))

  const normalizedMarket: MarketDetailData = {
    id: market.id,
    title: market.title,
    description: market.description,
    vertical: market.vertical,
    probabilityYes: market.probability_yes,
    probabilityNo: market.probability_no,
    totalYesUsdc: market.total_yes_usdc,
    totalNoUsdc: market.total_no_usdc,
    totalVolumeUsdc: market.total_yes_usdc + market.total_no_usdc,
    closesAt: market.closes_at,
    hoursRemaining: computedHoursRemaining,
    resolutionCriteria: market.resolution_criteria,
    sourceOfTruth: market.source_of_truth,
    orderBook: {
      yesOrders: detailPayload.data.order_book?.yes_orders ?? [],
      noOrders: detailPayload.data.order_book?.no_orders ?? [],
    },
  }

  const normalizedRationale: MarketAiRationale | null =
    rationalePayload && rationalePayload.success && rationalePayload.data
      ? {
          marketTitle: rationalePayload.data.market_title,
          probabilityYes: rationalePayload.data.probability_yes,
          confidence: rationalePayload.data.confidence,
          generatedAt: rationalePayload.data.generated_at,
          rationale: rationalePayload.data.rationale,
          keyFactors: rationalePayload.data.key_factors,
          riskFactors: rationalePayload.data.risk_factors,
          sources: rationalePayload.data.sources,
        }
      : null

  return { market: normalizedMarket, rationale: normalizedRationale }
}

export default async function MarketDetailPage(props: PageProps<'/markets/[marketId]'>) {
  const { marketId } = await props.params
  const { market, rationale } = await getMarketDetail(marketId)

  return (
    <main className="landing-shell landing-shell-page">
      <AppHeader />
      <MarketDetailView market={market} rationale={rationale} />
      <AppFooter />
    </main>
  )
}
