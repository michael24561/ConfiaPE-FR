import { getAccessToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const fetchStripe = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('No estás autenticado.')
  }

  const response = await fetch(`${API_URL}/api/stripe${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Ocurrió un error con la operación de Stripe.')
  }

  return result.data
}

export const getStripeAccountStatus = () => {
  return fetchStripe('/connect/account-status', { method: 'GET' })
}

export const createStripeConnectAccount = () => {
  return fetchStripe('/connect/create-account', { method: 'POST' })
}

export const createStripeAccountLink = (stripeAccountId: string) => {
  return fetchStripe('/connect/create-account-link', {
    method: 'POST',
    body: JSON.stringify({ stripeAccountId }),
  })
}
