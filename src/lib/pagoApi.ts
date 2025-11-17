import { getAccessToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const createCheckoutSession = async (trabajoId: string): Promise<{ url: string }> => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('No estás autenticado.')
  }

  const response = await fetch(`${API_URL}/api/pagos/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ trabajoId }),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'No se pudo iniciar el proceso de pago.')
  }

  if (!result.data.url) {
    throw new Error('La respuesta del servidor no incluyó una URL de pago.')
  }

  return result.data
}
