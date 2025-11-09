'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { getStoredUser } from '@/lib/auth'
import { getAccessToken } from '@/lib/auth'

// ✅ Tipos mejorados
interface User {
  id: string
  nombre: string
  avatarUrl?: string
}

interface Message {
  id: string
  texto: string
  timestamp: string
  remitenteId: string
  remitente?: User
}

interface Conversation {
  id: string
  tecnico?: {
    id: string
    nombres: string
    apellidos: string
    oficio: string
    user: {
      avatarUrl?: string
    }
  }
  ultimoMensaje?: string
  ultimoMensajeAt?: string
}

interface MessagesResponse {
  messages: Message[]
  total: number
}

// ✅ URL de API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // ✅ Función para obtener conversaciones
  const getConversations = async (): Promise<Conversation[]> => {
    try {
      const token = getAccessToken()
      if (!token) throw new Error('No token')

      const response = await fetch(`${API_URL}/api/chats/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📋 Conversaciones API response:', data)
      
      return data.data || data.conversations || []
    } catch (error) {
      console.error('Error cargando conversaciones:', error)
      return []
    }
  }

  // ✅ Función para obtener mensajes
  const getMessages = async (chatId: string): Promise<MessagesResponse> => {
    try {
      const token = getAccessToken()
      if (!token) throw new Error('No token')

      const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`📨 Mensajes para chat ${chatId}:`, data)
      
      return {
        messages: data.data?.messages || data.messages || data.data || [],
        total: data.data?.total || data.total || 0
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error)
      return { messages: [], total: 0 }
    }
  }

  // ✅ Función para enviar mensaje
  const sendMessage = async (chatId: string, texto: string): Promise<boolean> => {
    try {
      const token = getAccessToken()
      if (!token) throw new Error('No token')

      const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texto })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Mensaje enviado:', data)
      
      // Agregar el mensaje a la lista localmente
      if (data.data) {
        setMessages(prev => [...prev, data.data])
      }
      
      return true
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      return false
    }
  }

  // ✅ Cargar usuario y conversaciones
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = getStoredUser()
        if (!storedUser) {
          router.push('/Login')
          return
        }
        setUser(storedUser)

        // Cargar conversaciones
        const convs = await getConversations()
        console.log('📋 Conversaciones cargadas:', convs)
        setConversations(convs)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // ✅ Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (!selectedChat) return

    const loadMessages = async () => {
      try {
        const msgs = await getMessages(selectedChat.id)
        setMessages(msgs.messages || [])
      } catch (error) {
        console.error('Error cargando mensajes:', error)
        setMessages([])
      }
    }

    loadMessages()
  }, [selectedChat?.id])

  // ✅ Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ✅ Enviar mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return

    try {
      setSending(true)
      const success = await sendMessage(selectedChat.id, newMessage.trim())
      
      if (success) {
        setNewMessage('')
        
        // Actualizar última mensaje en la conversación
        setConversations(prev => prev.map(conv =>
          conv.id === selectedChat.id
            ? { 
                ...conv, 
                ultimoMensaje: newMessage.trim(),
                ultimoMensajeAt: new Date().toISOString()
              }
            : conv
        ))
      } else {
        alert('No se pudo enviar el mensaje. Verifica tu conexión.')
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      alert('Error al enviar el mensaje')
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

  // ✅ Helper functions mejoradas
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
      <div className="pt-20 h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Lista de conversaciones */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">Mensajes</h2>
            </div>
            
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="mb-2">No tienes conversaciones</p>
                <p className="text-sm">Cuando contactes a un técnico, aparecerán aquí tus conversaciones.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conv) => {
                  const avatarUrl = getAvatarUrl(conv)
                  const initials = getInitials(conv)
                  const name = getTecnicoName(conv)
                  const oficio = getTecnicoOficio(conv)

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedChat(conv)}
                      className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                        selectedChat?.id === conv.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
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
                          {/* Indicador de actividad */}
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {name}
                            </p>
                            {conv.ultimoMensajeAt && (
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatLastMessageTime(conv.ultimoMensajeAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-1">{oficio}</p>
                          {conv.ultimoMensaje && (
                            <p className="text-xs text-gray-500 truncate">
                              {conv.ultimoMensaje.length > 40 
                                ? `${conv.ultimoMensaje.substring(0, 40)}...` 
                                : conv.ultimoMensaje
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 flex flex-col">
            {!selectedChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                <div className="text-8xl mb-4">💭</div>
                <h3 className="text-xl font-semibold mb-2">Selecciona una conversación</h3>
                <p className="text-center max-w-md">
                  Elige una conversación de la lista para comenzar a chatear con el técnico.
                </p>
              </div>
            ) : (
              <>
                {/* Header del chat */}
                <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
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
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {getTecnicoName(selectedChat)}
                      </p>
                      <p className="text-sm text-gray-600">{getTecnicoOficio(selectedChat)}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      En línea
                    </div>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                      <div className="text-6xl mb-4">👋</div>
                      <h3 className="text-lg font-semibold mb-2">Inicia la conversación</h3>
                      <p className="text-center max-w-md">
                        Envía un mensaje para comenzar a chatear con {getTecnicoName(selectedChat)}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isMine = msg.remitenteId === user?.id
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isMine
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                            } shadow-sm`}>
                              {!isMine && (
                                <p className="text-xs font-semibold mb-1 opacity-75">
                                  {msg.remitente?.nombre || 'Técnico'}
                                </p>
                              )}
                              <p className="break-words text-sm">{msg.texto}</p>
                              <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatMessageTime(msg.timestamp)}
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
                <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Escribe un mensaje para ${getTecnicoName(selectedChat)}...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 pr-12"
                        rows={1}
                        disabled={sending}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ⏎
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Enviar
                        </>
                      )}
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