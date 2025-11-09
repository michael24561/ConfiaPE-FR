import { io, Socket } from 'socket.io-client'
import { getAccessToken } from './auth'

let socket: Socket | null = null
let isConnecting = false

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
    console.error('❌ No hay token de autenticación')
    return null
  }

  // Si ya existe una conexión activa, reutilizarla
  if (socket?.connected) {
    console.log('♻️ Reutilizando conexión existente:', socket.id)
    return socket
  }

  // Si está en proceso de conexión, esperar
  if (isConnecting) {
    console.log('⏳ Conexión en proceso...')
    return socket
  }

  try {
    isConnecting = true

    // Limpiar socket anterior si existe pero no está conectado
    if (socket && !socket.connected) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }

    console.log('🔌 Creando nueva conexión socket...')
    
    socket = io(API_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      timeout: 10000
    })

    socket.on('connect', () => {
      console.log('✅ Socket conectado:', socket?.id)
      isConnecting = false
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason)
      isConnecting = false
      
      // Si fue desconexión forzada por el servidor, limpiar
      if (reason === 'io server disconnect') {
        socket = null
      }
    })

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
      isConnecting = false
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message)
      isConnecting = false
    })

    return socket

  } catch (error) {
    console.error('❌ Error al crear socket:', error)
    isConnecting = false
    return null
  }
}

export const disconnectSocket = () => {
  if (socket) {
    console.log('🔌 Desconectando socket...')
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
    isConnecting = false
  }
}

export const getSocket = () => socket

export const isSocketConnected = () => socket?.connected || false

export const joinChat = (chatId: string) => {
  if (socket?.connected) {
    socket.emit('join_chat', { chatId })
    console.log('📥 Uniéndose al chat:', chatId)
  } else {
    console.warn('⚠️ No se puede unir al chat, socket no conectado')
  }
}

export const leaveChat = (chatId: string) => {
  if (socket?.connected) {
    socket.emit('leave_chat', { chatId })
    console.log('📤 Saliendo del chat:', chatId)
  }
}

export const sendMessage = (chatId: string, texto: string) => {
  if (socket?.connected) {
    socket.emit('send_message', { chatId, texto })
    console.log('📨 Mensaje enviado')
  } else {
    console.error('❌ Socket no está conectado, no se puede enviar mensaje')
    throw new Error('Socket desconectado')
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
    socket.off('message_received') // Eliminar listeners previos
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
    socket.off('user_online')
    socket.on('user_online', callback)
  }
}

export const offUserOnline = () => {
  if (socket) {
    socket.off('user_online')
  }
}

export const onUserOffline = (callback: (data: { userId: string }) => void) => {
  if (socket) {
    socket.off('user_offline')
    socket.on('user_offline', callback)
  }
}

export const offUserOffline = () => {
  if (socket) {
    socket.off('user_offline')
  }
}

export const onTypingIndicator = (callback: (data: { chatId: string; userId: string }) => void) => {
  if (socket) {
    socket.off('typing_indicator')
    socket.on('typing_indicator', callback)
  }
}

export const offTypingIndicator = () => {
  if (socket) {
    socket.off('typing_indicator')
  }
}

export const onMessagesRead = (callback: (data: { chatId: string; messageIds: string[]; readBy: string }) => void) => {
  if (socket) {
    socket.off('messages_read')
    socket.on('messages_read', callback)
  }
}

export const offMessagesRead = () => {
  if (socket) {
    socket.off('messages_read')
  }
}