/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { getThemeBootstrapScript } from '@/lib/theme'

const fonseca = localFont({
  src: './fonts/Fonseca Bold - Free ver.otf',
  variable: '--font-fonseca',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "AfroMarkets - Africa's Prediction & Hedging Market",
  description: 'Trade USDC on African macro outcomes. CBN rates, inflation, FX, and more. Markets for the world the rest of the world ignores.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oi&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet" />
        <Script id="theme-init" strategy="beforeInteractive">
          {getThemeBootstrapScript()}
        </Script>
      </head>
      <body className={fonseca.variable}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
