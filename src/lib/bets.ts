export type BetPlacementRequest = {
  market_id: string
  outcome: 'yes' | 'no'
  amount_usdc: string
  wallet_address: string
}

export type BetPlacementResponse = {
  success: boolean
  data?: {
    bet_id: string
    market_id: string
    outcome: 'yes' | 'no'
    amount_usdc: string
    shares_received: number
    estimated_payout: number
    wallet_address: string
    created_at: string
  }
  error?: string
}

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
}

export async function placeBet(request: BetPlacementRequest): Promise<BetPlacementResponse> {
  const baseUrl = apiBaseUrl()
  if (!baseUrl) {
    return { success: false, error: 'API base URL not configured' }
  }

  const response = await fetch(`${baseUrl}/bets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    if (response.status === 400) {
      return {
        success: false,
        error: body.error ?? 'Invalid bet request. The market may be closed or the amount is invalid.',
      }
    }
    if (response.status === 404) {
      return { success: false, error: 'Bet endpoint not found on server. The backend may need to implement POST /bets.' }
    }
    if (response.status === 409) {
      return { success: false, error: 'This market is closed for betting.' }
    }
    return { success: false, error: `Server error (${response.status}): ${body.error ?? 'Please try again.'}` }
  }

  const payload = (await response.json()) as BetPlacementResponse
  return payload
}
