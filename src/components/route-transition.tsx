'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, ViewTransition } from 'react'

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <ViewTransition
      key={pathname}
      name="route-shell"
      default="route-flow"
      enter="route-flow"
      exit="route-flow"
      share="route-flow"
    >
      <div className="route-transition-shell">{children}</div>
    </ViewTransition>
  )
}
