import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { RouteTransition } from '@/components/route-transition'

const floatingCards = [
  { title: 'Nigeria CPI above 30%', value: 'Yes 61c', position: 'card-a' },
  { title: 'BTC above 80k by June', value: 'No 47c', position: 'card-b' },
  { title: 'AFCON 2027 Winner', value: 'Morocco 40%', position: 'card-c' },
  { title: 'Naira below 1,700/$', value: 'Yes 36c', position: 'card-d' },
  { title: 'Fed cuts before CBN', value: 'Yes 48c', position: 'card-e' },
  { title: 'Brent above $95', value: 'Yes 54c', position: 'card-f' },
]

export default function HomePage() {
  return (
    <RouteTransition>
      <main className="landing-shell landing-shell-minimal">
        <section className="minimal-hero">
          <div className="minimal-stage">
            <div className="minimal-fog minimal-fog-top" />
            <div className="minimal-fog minimal-fog-bottom" />
            <div className="minimal-grid-lines" aria-hidden="true" />

            <header className="minimal-topbar">
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

              <nav className="minimal-nav" aria-label="Landing navigation">
                <Link href="/markets">Markets</Link>
                <Link href="/portfolio">Portfolio</Link>
                <Link href="/my-bets">My Bets</Link>
              </nav>

              <div className="minimal-topbar-actions">
                <Link href="/markets" className="minimal-account-link">
                  Create Account
                </Link>
                <ThemeToggle />
              </div>
            </header>

            <div className="minimal-card-field" aria-hidden="true">
              {floatingCards.map(card => (
                <article key={card.title} className={`minimal-market-card ${card.position}`}>
                  <strong>{card.title}</strong>
                  <span>{card.value}</span>
                </article>
              ))}
            </div>

            <div className="minimal-hero-copy">
              <span className="minimal-pill">Unlock African market signal</span>
              <h1>One-click for African market defense</h1>
              <p>
                Dive into politics, FX, and macro narratives where market intelligence meets financial
                conviction.
              </p>

              <div className="minimal-actions">
                <Link href="/markets" className="button button-secondary">
                  Open App
                </Link>
                <Link href="/markets" className="button button-primary">
                  Discover More
                </Link>
              </div>
            </div>

            <div className="minimal-horizon">AfroMarkets horizon</div>
          </div>
        </section>
      </main>
    </RouteTransition>
  )
}
