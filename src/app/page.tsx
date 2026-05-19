import Link from 'next/link'
import { AppFooter } from '@/components/app-footer'
import { AppHeader } from '@/components/app-header'

export default function HomePage() {
  return (
    <main className="landing-shell">
      <AppHeader />

      <section className="hero">
        <div className="hero-copy reveal reveal-rise">
          <p className="eyebrow">Africa&apos;s Prediction &amp; Hedging Market</p>
          <h1>
            Predict Africa.
            <br />
            Hedge Tomorrow.
          </h1>
          <p className="hero-lede">
            AfroMarkets is a prediction market for African macro events. Trade with USDC.
            Built for insight. Backed by the crowd.
          </p>

          <div className="hero-actions">
            <Link href="/markets" className="button button-primary">
              Explore Markets
            </Link>
          </div>
        </div>

        <div id="hero" className="hero-visual reveal reveal-float" aria-hidden="true">
          <div className="hero-scene">
            <div className="hero-glow" />
            <img className="hero-art" src="/hero-landscape.svg" alt="" />
            <div className="hero-scene-mask" />
          </div>

          <article className="hero-card reveal reveal-delay-2">
            <div className="hero-card-pill">Most active market</div>
            <h2>USD/NGN to cross NGN 2,000 before July 31, 2025?</h2>
            <div className="hero-card-stats">
              <div>
                <span>Yes</span>
                <strong>62%</strong>
              </div>
              <div>
                <span>No</span>
                <strong>38%</strong>
              </div>
            </div>
            <div className="hero-chart">
              <span className="chart-line chart-line-gold" />
              <span className="chart-line chart-line-fade" />
            </div>
            <div className="hero-card-meta">
              <span>$124,560 Vol.</span>
              <span>Closes in 21d 14h</span>
            </div>
          </article>
        </div>
      </section>

      <AppFooter />
    </main>
  )
}
