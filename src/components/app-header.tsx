'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Markets' },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="topbar">
      <div className="topbar-branding">
        <Link href="/" className="brand" aria-label="AfroMarkets home">
          <span className="brand-mark" />
          <span className="brand-copy">
            <span>Afro</span>
            <span>Markets</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {navLinks.map(link => {
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-link${isActive ? ' site-nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="topbar-actions">
        <ThemeToggle />
        <Link href="/" className="button button-primary">
          Connect Wallet
        </Link>
      </div>
    </header>
  )
}
