export type PrimaryNavLink = {
  href: '/markets' | '/portfolio' | '/my-bets'
  label: 'Markets' | 'Portfolio' | 'My Bets'
}

export const primaryNavLinks: PrimaryNavLink[] = [
  { href: '/markets', label: 'Markets' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/my-bets', label: 'My Bets' },
]

export function shouldHidePrimaryNavLink(pathname: string, href: PrimaryNavLink['href']) {
  return pathname === href
}

export function getVisiblePrimaryNavLinks(pathname: string) {
  return primaryNavLinks.filter(link => !shouldHidePrimaryNavLink(pathname, link.href))
}
