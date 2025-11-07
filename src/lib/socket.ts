import { io, Socket } from 'socket.io-client'
import { getAccessToken } from './auth'

let socket: Socket | null = null

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface Message {
  id: string
  chatId: string
  remitenteId: string
  texto: string
  timestamp: string
  leido: boolean
  remitente: {
    id: string
    nombre: string
    avatarUrl: string | null
  }
}

export interface Conversation {
  id: string
  clienteId: string
  tecnicoId: string
  ultimoMensaje: string | null
  ultimoMensajeAt: string | null
  cliente: {
    id: string
    nombre: string
    avatarUrl: string | null
  }
  tecnico: {
    id: string
    nombres: string
    apellidos: string
    oficio: string
    user: {
      avatarUrl: string | null
    }
  }
}

export const connectSocket = () => {
  const token = getAccessToken()

  if (!token) {
    console.error('No hay token de autenticación')
    return null
  }

  if (socket?.connected) {
    return socket
  }

  socket = io(API_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })

  socket.on('connect', () => {
    console.log('✅ Socket conectado:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket desconectado:', reason)
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })

  socket.on('connect_error', (error) => {
    console.error('Error de conexión:', error.message)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    console.log('Socket desconectado manualmente')
  }
}

export const getSocket = () => socket

export const joinChat = (chatId: string) => {
  if (socket?.connected) {
    socket.emit('join_chat', { chatId })
    console.log('Uniéndose al chat:', chatId)
  }
}

export const leaveChat = (chatId: string) => {
  if (socket?.connected) {
    socket.emit('leave_chat', { chatId })
    console.log('Saliendo del chat:', chatId)
  }
}

export const sendMessage = (chatId: string, texto: string) => {
  if (socket?.connected) {
    socket.emit('send_message', { chatId, texto })
  } else {
    console.error('Socket no está conectado')
  }
}

export const sendTypingIndicator = (chatId: string) => {
  if (socket?.connected) {
    socket.emit('typing', { chatId })
  }
}

export const markMessagesAsRead = (chatId: string, messageIds: string[]) => {
  if (socket?.connected) {
    socket.emit('read_messages', { chatId, messageIds })
  }
}

// Event listeners
export const onMessageReceived = (callback: (data: { chatId: string; message: Message }) => void) => {
  if (socket) {
    socket.on('message_received', callback)
  }
}

export const offMessageReceived = () => {
  if (socket) {
    socket.off('message_received')
  }
}

export const onUserOnline = (callback: (data: { userId: string }) => void) => {
  if (socket) {
    socket.on('user_online', callback)
  }
}

export const onUserOffline = (callback: (data: { userId: string }) => void) => {
  if (socket) {
    socket.on('user_offline', callback)
  }
}

export const onTypingIndicator = (callback: (data: { chatId: string; userId: string }) => void) => {
  if (socket) {
    socket.on('typing_indicator', callback)
  }
}

export const onMessagesRead = (callback: (data: { chatId: string; messageIds: string[]; readBy: string }) => void) => {
  if (socket) {
    socket.on('messages_read', callback)
  }
}
