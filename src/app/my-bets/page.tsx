import { MyBetsDashboard } from '@/components/my-bets-dashboard'
import { RouteTransition } from '@/components/route-transition'

export default function MyBetsPage() {
  return (
    <RouteTransition>
      <main className="markets-shell">
        <MyBetsDashboard />
      </main>
    </RouteTransition>
  )
}
