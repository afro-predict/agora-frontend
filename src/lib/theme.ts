export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'afromarkets-theme'

export function resolveInitialTheme() {
  if (typeof window === 'undefined') return 'light'

  const domTheme = document.documentElement.dataset.theme
  if (domTheme === 'dark' || domTheme === 'light') return domTheme

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getThemeBootstrapScript() {
  return `(() => {
  try {
    const stored = localStorage.getItem('${THEME_STORAGE_KEY}')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
  } catch (error) {}
})()`
}
