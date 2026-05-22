import { MarketsExplorer } from '@/components/markets-explorer'
import { RouteTransition } from '@/components/route-transition'
import { fetchMarkets } from '@/lib/markets'

export default async function MarketsPage() {
  const { markets, error } = await fetchMarkets()

  return (
    <RouteTransition>
      <main className="markets-shell">
        <MarketsExplorer initialMarkets={markets} initialLoadError={error} />
      </main>
    </RouteTransition>
  )
}
