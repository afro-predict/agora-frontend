'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))

    return () => window.cancelAnimationFrame(frame)
  }, [])

  const isLight = theme === 'light'

  if (!mounted) {
    return (
      <button
        type="button"
        className="theme-toggle"
        aria-label="Toggle theme"
        aria-pressed="false"
        title="Toggle theme"
        disabled
      />
    )
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'dark'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3.25V5.5M12 18.5v2.25M5.81 5.81l1.59 1.59M16.6 16.6l1.59 1.59M3.25 12H5.5M18.5 12h2.25M5.81 18.19l1.59-1.59M16.6 7.4l1.59-1.59M15.75 12A3.75 3.75 0 1 1 8.25 12A3.75 3.75 0 0 1 15.75 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20.2 14.2A7.7 7.7 0 0 1 9.8 3.8a.45.45 0 0 0-.59-.59A9 9 0 1 0 20.8 14.79a.45.45 0 0 0-.6-.59Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
