'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { resolveInitialTheme, type Theme, THEME_STORAGE_KEY } from '@/lib/theme'

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)

    document.documentElement.classList.add('theme-switching')
    const timer = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-switching')
    }, 340)

    return () => window.clearTimeout(timer)
  }, [theme])

  const toggle = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
