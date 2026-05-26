'use client'

import { useWallet, truncateAddress } from '@/lib/wallet'

export function WalletButton() {
  const { address, isConnected, isConnecting, connect, disconnect, error } = useWallet()

  if (isConnecting) {
    return (
      <span className="minimal-account-link markets-blackout-connect" aria-disabled="true">
        Connecting...
      </span>
    )
  }

  if (isConnected && address) {
    return (
      <span className="minimal-account-link" style={{ cursor: 'default' }}>
        <span
          className="wallet-address-display"
          onClick={disconnect}
          title="Click to disconnect"
          style={{ cursor: 'pointer' }}
        >
          {truncateAddress(address)}
        </span>
      </span>
    )
  }

  return (
    <button
      type="button"
      className="minimal-account-link markets-blackout-connect"
      onClick={connect}
    >
      {error ? 'Retry Connect' : 'Connect Wallet'}
    </button>
  )
}
