'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { getStoredUser } from '@/lib/auth'
import { getConversations, getMessages } from '@/lib/chat'
import {
  connectSocket,
  disconnectSocket,
  joinChat,
  leaveChat,
  sendMessage as sendSocketMessage,
  onMessageReceived,
  offMessageReceived,
  Conversation,
  Message
} from '@/lib/socket'

// ✅ Tipos basados en tu API
interface User {
  id: string
  nombre: string
  avatarUrl?: string
}

interface Tecnico {
  id: string
  nombres: string
  apellidos: string
  oficio: string
  user: {
    avatarUrl?: string
  }
}

interface Conversation {
  id: string
  tecnico?: Tecnico
  ultimoMensaje?: string
  ultimoMensajeAt?: string
  _count?: {
    mensajesNoLeidos: number
  }
}

function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedChatRef = useRef<Conversation | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversationId')

  // Mantener referencia actualizada del chat seleccionado
  useEffect(() => {
    selectedChatRef.current = selectedChat
  }, [selectedChat])

  // ✅ Cargar usuario y conversaciones
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = getStoredUser()
        if (!storedUser || storedUser.rol !== 'CLIENTE') {
          router.push('/Login')
          return
        }
        setUser(storedUser)

        // Cargar conversaciones usando tu función existente
        const convs = await getConversations()
        console.log('📋 Conversaciones cargadas (Cliente):', convs)
        const convsArray = Array.isArray(convs) ? convs : []
        setConversations(convsArray)

        // Si hay un conversationId en la URL, seleccionar esa conversación
        if (conversationId) {
          const chatFromUrl = convsArray.find(c => c.id === conversationId)
          if (chatFromUrl) {
            setSelectedChat(chatFromUrl)
          }
        } else if (convsArray.length > 0) {
          // Si no hay conversationId, seleccionar la primera conversación
          setSelectedChat(convsArray[0])
        }

      } catch (error) {
        console.error('Error cargando datos:', error)
        setError('Error al cargar las conversaciones')
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, conversationId])

  // ✅ Conectar WebSocket una sola vez
  useEffect(() => {
    if (!user) return

    const socket = connectSocket()
    console.log('🔌 WebSocket conectado (Cliente)')

    if (socket) {
      // Listener para mensajes recibidos
      onMessageReceived((data) => {
        console.log('📨 Mensaje recibido (Cliente):', data)
        
        // Agregar mensaje a la lista solo si es del chat actual
        if (selectedChatRef.current?.id === data.chatId) {
          setMessages(prev => {
            // Evitar duplicados
            if (prev.some(m => m.id === data.message.id)) {
              console.log('⚠️ Mensaje duplicado ignorado')
              return prev
            }
            console.log('✅ Mensaje agregado a la lista del cliente')
            return [...prev, data.message]
          })
        } else {
          console.log('ℹ️ Mensaje de otro chat, no se muestra aquí')
        }
        
        // Actualizar última vez del mensaje en conversaciones
        setConversations(prev => prev.map(conv =>
          conv.id === data.chatId
            ? { ...conv, ultimoMensaje: data.message.texto, ultimoMensajeAt: data.message.timestamp }
            : conv
        ))
      })
    }

    return () => {
      console.log('🔌 Limpiando listeners del cliente')
      offMessageReceived()
      disconnectSocket()
    }
  }, [user])

  // ✅ Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (!selectedChat) return

    const loadMessages = async () => {
      try {
        console.log('📂 Cargando mensajes del chat (Cliente):', selectedChat.id)
        
        // Unirse al chat via WebSocket
        joinChat(selectedChat.id)
        
        // Cargar historial de mensajes via REST
        const msgs = await getMessages(selectedChat.id)
        const messagesArray = Array.isArray(msgs.messages) ? msgs.messages : 
                             Array.isArray(msgs.data) ? msgs.data : 
                             Array.isArray(msgs) ? msgs : []
        
        console.log('📂 Mensajes cargados (Cliente):', messagesArray.length)
        setMessages(messagesArray)
      } catch (error) {
        console.error('Error cargando mensajes:', error)
        setError('Error al cargar los mensajes')
        setMessages([])
      }
    }

    loadMessages()

    return () => {
      if (selectedChat) {
        console.log('👋 Saliendo del chat (Cliente):', selectedChat.id)
        leaveChat(selectedChat.id)
      }
    }
  }, [selectedChat])

  // ✅ Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ✅ Enviar mensaje via WebSocket
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return

    try {
      setSending(true)
      setError(null)

      // Crear mensaje optimista
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        texto: newMessage.trim(),
        timestamp: new Date().toISOString(),
        remitenteId: user.id,
        remitente: {
          id: user.id,
          nombre: user.nombre || user.nombres || 'Cliente'
        },
        leido: false
      }

      // Agregar mensaje optimista inmediatamente
      setMessages(prev => [...prev, optimisticMessage])
      const messageText = newMessage.trim()
      setNewMessage('')

      console.log('📤 Enviando mensaje (Cliente):', messageText)
      
      // ✅ ENVIAR VIA WEBSOCKET (igual que el técnico)
      sendSocketMessage(selectedChat.id, messageText)
      
      // Actualizar última mensaje en la conversación
      setConversations(prev => prev.map(conv =>
        conv.id === selectedChat.id
          ? { 
              ...conv, 
              ultimoMensaje: messageText,
              ultimoMensajeAt: new Date().toISOString()
            }
          : conv
      ))
      
    } catch (error: any) {
      console.error('Error enviando mensaje:', error)
      setError(error.message || 'Error al enviar el mensaje')
      
      // Revertir mensaje optimista en caso de error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // ✅ Helper functions
  const getAvatarUrl = (conv: Conversation): string | null => {
    return conv.tecnico?.user?.avatarUrl || null
  }

  const getInitials = (conv: Conversation): string => {
    const firstName = conv.tecnico?.nombres?.[0] || 'T'
    const lastName = conv.tecnico?.apellidos?.[0] || 'C'
    return `${firstName}${lastName}`.toUpperCase()
  }

  const getTecnicoName = (conv: Conversation): string => {
    const nombres = conv.tecnico?.nombres || 'Técnico'
    const apellidos = conv.tecnico?.apellidos || ''
    return `${nombres} ${apellidos}`.trim()
  }

  const getTecnicoOficio = (conv: Conversation): string => {
    return conv.tecnico?.oficio || 'Servicios'
  }

  const formatMessageTime = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '--:--'
    }
  }

  const formatLastMessageTime = (timestamp?: string): string => {
    if (!timestamp) return ''
    
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays === 1) {
        return 'Ayer'
      } else if (diffDays < 7) {
        return date.toLocaleDateString('es-PE', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
      }
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 h-[calc(100vh-5rem)] flex flex-col">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 my-4 rounded">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-4 sm:px-8 py-4 bg-white shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Mensajes
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Chatea con tus técnicos
          </p>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Lista de conversaciones */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="mb-2">No tienes conversaciones</p>
                <p className="text-sm">Cuando contactes a un técnico, aparecerán aquí tus conversaciones.</p>
              </div>
            ) : (
              <div>
                {conversations.map((conv) => {
                  const avatarUrl = getAvatarUrl(conv)
                  const initials = getInitials(conv)
                  const name = getTecnicoName(conv)
                  const oficio = getTecnicoOficio(conv)

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedChat(conv)}
                      className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                        selectedChat?.id === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={name}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : null}
                          <span className={`text-white font-bold ${avatarUrl ? 'hidden' : 'block'}`}>
                            {initials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{oficio}</p>
                          {conv.ultimoMensaje && (
                            <p className="text-xs text-gray-500 truncate mt-1">{conv.ultimoMensaje}</p>
                          )}
                        </div>
                        {conv.ultimoMensajeAt && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatLastMessageTime(conv.ultimoMensajeAt)}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 flex flex-col bg-white">
            {!selectedChat ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Selecciona una conversación para comenzar</p>
              </div>
            ) : (
              <>
                {/* Header del chat */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                      {getAvatarUrl(selectedChat) ? (
                        <img
                          src={getAvatarUrl(selectedChat)!}
                          alt={getTecnicoName(selectedChat)}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : null}
                      <span className={`text-white font-bold text-sm ${getAvatarUrl(selectedChat) ? 'hidden' : 'block'}`}>
                        {getInitials(selectedChat)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getTecnicoName(selectedChat)}
                      </p>
                      <p className="text-sm text-gray-600">{getTecnicoOficio(selectedChat)}</p>
                    </div>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No hay mensajes aún. ¡Envía el primero!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isMine = msg.remitenteId === user?.id
                        const isTemp = msg.id.startsWith('temp-')
                        
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                              isMine
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            } ${isTemp ? 'opacity-70' : ''}`}>
                              {!isMine && msg.remitente?.nombre && (
                                <p className="text-xs font-semibold mb-1 opacity-75">
                                  {msg.remitente.nombre}
                                </p>
                              )}
                              <p className="break-words">{msg.texto || ''}</p>
                              <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatMessageTime(msg.timestamp)}
                                {isTemp && ' · Enviando...'}
                                {!msg.leido && isMine && !isTemp && ' · ✓'}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input de mensaje */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
                      rows={1}
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? '...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClienteChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    }>
      <ChatPage />
    </Suspense>
  )
}