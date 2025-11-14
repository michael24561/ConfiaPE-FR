import { getAccessToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const getConversations = async () => {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}/api/chat/conversations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al cargar conversaciones')
  }

  const result = await response.json()
  return result.success ? result.data : result
}

export const getConversation = async (chatId: string) => {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}/api/chat/conversations/${chatId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al cargar conversación')
  }

  const result = await response.json()
  return result.success ? result.data : result
}

export const getMessages = async (chatId: string, page = 1, limit = 50) => {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}/api/chat/conversations/${chatId}/messages?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al cargar mensajes')
  }

  const result = await response.json()
  return result.success ? result.data : result
}

export const createConversation = async (data: { tecnicoId?: string, adminId?: string }) => {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}/api/chat/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear conversación')
  }

  const result = await response.json()
  return result.success ? result.data : result
}

export const sendMessageAPI = async (chatId: string, texto: string) => {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}/api/chat/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ chatId, texto })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al enviar mensaje')
  }

  const result = await response.json()
  return result.success ? result.data : result
}

export const markMessageAsRead = async (messageId: string) => {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}/api/chat/messages/${messageId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al marcar mensaje como leído')
  }

  const result = await response.json()
  return result.success ? result.data : result
}

export const getAdmin = async () => {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}/api/users/admin`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener datos del administrador')
  }

  const result = await response.json()
  return result.success ? result.data : result
}
