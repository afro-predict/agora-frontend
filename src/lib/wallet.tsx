'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type WalletState = {
  address: string | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
}

type WalletContextType = WalletState & {
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
})

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function getEthereumProvider() {
  if (typeof window === 'undefined') return null
  if (window.ethereum) return window.ethereum
  return null
}

async function connectBrowserWallet(): Promise<string> {
  const provider = getEthereumProvider()
  if (!provider) {
    throw new Error('No wallet found. Please install MetaMask or another browser wallet.')
  }

  const result = await provider.request({ method: 'eth_requestAccounts' })
  const accounts: string[] = Array.isArray(result) ? result.filter(a => typeof a === 'string') : []
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned from wallet.')
  }

  const address = accounts[0].toLowerCase()
  return address
}

async function getCurrentAccount(): Promise<string | null> {
  try {
    const provider = getEthereumProvider()
    if (!provider) return null
    const result = await provider.request({ method: 'eth_accounts' })
    const accounts: string[] = Array.isArray(result) ? result.filter(a => typeof a === 'string') : []
    if (accounts && accounts.length > 0) {
      return accounts[0].toLowerCase()
    }
  } catch {
    // Provider unavailable — silently return null
  }
  return null
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  })

  useEffect(() => {
    getCurrentAccount().then(address => {
      if (address) {
        setState({ address, isConnecting: false, isConnected: true, error: null })
      }
    })
  }, [])

  useEffect(() => {
    const provider = getEthereumProvider()
    if (!provider) return

    const handleAccountsChanged = (...args: unknown[]) => {
      const raw = args[0]
      const accs: string[] = Array.isArray(raw) ? raw.filter(a => typeof a === 'string') : []
      if (!accs || accs.length === 0) {
        setState({ address: null, isConnecting: false, isConnected: false, error: null })
      } else {
        setState({ address: accs[0].toLowerCase(), isConnecting: false, isConnected: true, error: null })
      }
    }

    const handleDisconnect = () => {
      setState({ address: null, isConnecting: false, isConnected: false, error: null })
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('disconnect', handleDisconnect)

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('disconnect', handleDisconnect)
    }
  }, [])

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }))
    try {
      const address = await connectBrowserWallet()
      setState({ address, isConnecting: false, isConnected: true, error: null })
    } catch (err) {
      setState({
        address: null,
        isConnecting: false,
        isConnected: false,
        error: err instanceof Error ? err.message : 'Failed to connect wallet',
      })
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({ address: null, isConnecting: false, isConnected: false, error: null })
  }, [])

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)

export { truncateAddress }
