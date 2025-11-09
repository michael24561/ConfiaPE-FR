'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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

  // Cargar usuario y conversaciones
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

  // Conectar WebSocket (una sola vez)
  useEffect(() => {
    const socket = connectSocket()

    if (socket) {
      onMessageReceived((data) => {
        if (data.chatId === selectedChat?.id) {
          setMessages(prev => [...prev, data.message])
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
      offMessageReceived()
    }
  }, [selectedChat?.id])

  // Desconectar socket solo al desmontar el componente completo
  useEffect(() => {
    return () => {
      disconnectSocket()
    }
  }, [])

  // Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (!selectedChat) return

    const loadMessages = async () => {
      try {
        joinChat(selectedChat.id)
        const msgs = await getMessages(selectedChat.id)
        setMessages(msgs.messages || [])
      } catch (error) {
        console.error('Error cargando mensajes:', error)
      }
    }

    loadMessages()

    return () => {
      if (selectedChat) {
        leaveChat(selectedChat.id)
      }
    }
  }, [selectedChat?.id])

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return

    try {
      setSending(true)
      sendSocketMessage(selectedChat.id, newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      alert('No se pudo enviar el mensaje. Verifica tu conexión.')
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

  // Helper functions para manejar datos que pueden ser undefined
  const getAvatarUrl = (conv: Conversation) => {
    return conv.tecnico?.user?.avatarUrl || null
  }

  const getInitials = (conv: Conversation) => {
    const firstName = conv.tecnico?.nombres?.[0] || '?'
    const lastName = conv.tecnico?.apellidos?.[0] || '?'
    return `${firstName}${lastName}`
  }

  const getTecnicoName = (conv: Conversation) => {
    const nombres = conv.tecnico?.nombres || 'Usuario'
    const apellidos = conv.tecnico?.apellidos || ''
    return `${nombres} ${apellidos}`.trim()
  }

  const getTecnicoOficio = (conv: Conversation) => {
    return conv.tecnico?.oficio || 'Técnico'
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
      <div className="pt-20 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Lista de conversaciones */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Mensajes</h2>
            </div>
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No tienes conversaciones aún</p>
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
                                // Si la imagen falla, mostrar iniciales
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <span className={`text-white font-bold ${avatarUrl ? 'hidden' : ''}`}>
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
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <span className={`text-white font-bold text-sm ${getAvatarUrl(selectedChat) ? 'hidden' : ''}`}>
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
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                              isMine
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}>
                              {!isMine && msg.remitente?.nombre && (
                                <p className="text-xs font-semibold mb-1 opacity-75">
                                  {msg.remitente.nombre}
                                </p>
                              )}
                              <p className="break-words">{msg.texto}</p>
                              <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
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