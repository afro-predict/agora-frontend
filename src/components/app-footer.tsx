import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'

export function AppFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <BrandLogo className="site-footer-logo" />
        <p>
          Prediction infrastructure for African macro risk, price discovery, and collective market
          intelligence.
        </p>
      </div>

      <div className="site-footer-links">
        <div>
          <span className="site-footer-heading">Platform</span>
          <Link href="/markets">Explore Markets</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/#intelligence">Research</Link>
        </div>
        <div>
          <span className="site-footer-heading">Company</span>
          <Link href="/#community">Community</Link>
          <Link href="/#faq">FAQ</Link>
          <a href="mailto:hello@afromarkets.com">Contact</a>
        </div>
      </div>
    </footer>
  )
}
