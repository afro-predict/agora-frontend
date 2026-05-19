import { AppFooter } from '@/components/app-footer'
import { AppHeader } from '@/components/app-header'
import { PortfolioDashboard } from '@/components/portfolio-dashboard'

export default function PortfolioPage() {
  return (
    <main className="landing-shell landing-shell-page">
      <AppHeader />
      <PortfolioDashboard />
      <AppFooter />
    </main>
  )
}
