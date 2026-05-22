import Link from 'next/link'

type Props = {
  href?: string
  className?: string
  labelClassName?: string
}

export function BrandLogo({ href = '/', className = '', labelClassName = '' }: Props) {
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="presentation">
          <defs>
            <linearGradient id="brand-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-gold-bright)" />
              <stop offset="100%" stopColor="var(--brand-gold-deep)" />
            </linearGradient>
            <linearGradient id="brand-green" x1="12%" y1="0%" x2="88%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-green-bright)" />
              <stop offset="100%" stopColor="var(--brand-green-deep)" />
            </linearGradient>
          </defs>

          <path
            d="M13 19.5C13 13.7 17.7 9 23.5 9c2.8 0 5.4 1.1 7.4 3l1.1 1.1 1.1-1.1A10.43 10.43 0 0 1 40.5 9C46.3 9 51 13.7 51 19.5c0 3.1-1.3 5.9-3.6 7.9L32 41.7 16.6 27.4A10.45 10.45 0 0 1 13 19.5Z"
            fill="none"
            stroke="url(#brand-gold)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M18 45.5V32.2h7.1v13.3H18Zm10.2 0V24.1h7.1v21.4h-7.1Zm10.2 0v-9.8h7.1v9.8h-7.1Z"
            fill="url(#brand-green)"
          />
          <path
            d="m17 39.5 11.2-10.7 8.1 6.4L50 21"
            fill="none"
            stroke="url(#brand-gold)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M45.6 20.7 50 21l-.8 4.3" fill="none" stroke="url(#brand-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={`brand-copy ${labelClassName}`.trim()}>AfroMarkets</span>
    </>
  )

  return (
    <Link href={href} className={`brand ${className}`.trim()} aria-label="AfroMarkets home">
      {content}
    </Link>
  )
}
