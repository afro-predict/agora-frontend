import { DiscoverMore } from '@/components/discover-more'
import { RouteTransition } from '@/components/route-transition'

export default function DiscoverPage() {
  return (
    <RouteTransition>
      <main className="markets-shell">
        <DiscoverMore />
      </main>
    </RouteTransition>
  )
}
