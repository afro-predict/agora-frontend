'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { getVisiblePrimaryNavLinks, isPrimaryNavLinkActive } from '@/lib/navigation'

export function AppHeader() {
  const pathname = usePathname()
  const visibleLinks = getVisiblePrimaryNavLinks(pathname)

  return (
    <header className="topbar">
      <div className="topbar-branding">
        <BrandLogo />
      </div>

      <nav className="site-nav" aria-label="Primary">
        {visibleLinks.map(link => {
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`site-nav-link${isPrimaryNavLinkActive(pathname, link.href) ? ' site-nav-link-active' : ''}`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="topbar-actions">
        <Link href="/markets" className="button button-primary">
          Start Trading
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
