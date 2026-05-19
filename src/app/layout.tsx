import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Lexend } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const fonseca = localFont({
  src: './fonts/Fonseca Bold - Free ver.otf',
  variable: '--font-fonseca',
  display: 'swap',
})

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
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
      <body className={`${fonseca.variable} ${lexend.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
