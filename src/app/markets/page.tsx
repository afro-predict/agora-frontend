import { AppFooter } from '@/components/app-footer'
import { AppHeader } from '@/components/app-header'
import { MarketsExplorer } from '@/components/markets-explorer'

export default function MarketsPage() {
  return (
    <main className="landing-shell landing-shell-page">
      <AppHeader />
      <MarketsExplorer />
      <AppFooter />
    </main>
  )
}
