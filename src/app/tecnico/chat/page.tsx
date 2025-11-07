'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HeaderTecnico from '@/components/tecnicocomponents/HeaderTecnico'
import TecnicoSidebar from '@/components/tecnicocomponents/TecnicoSidebar'
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

function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedChatRef = useRef<Conversation | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversationId')

  // Mantener referencia actualizada del chat seleccionado
  useEffect(() => {
    selectedChatRef.current = selectedChat
  }, [selectedChat])

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cargar usuario y conversaciones
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = getStoredUser()
        if (!storedUser || storedUser.rol !== 'TECNICO') {
          router.push('/Login')
          return
        }
        setUser(storedUser)

        // Cargar conversaciones
        const convs = await getConversations()
        const convsArray = Array.isArray(convs) ? convs : []
        setConversations(convsArray)

        if (conversationId) {
          const chatFromUrl = convsArray.find(c => c.id === conversationId)
          if (chatFromUrl) {
            setSelectedChat(chatFromUrl)
          }
        }

      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, conversationId])

  // Conectar WebSocket una sola vez
  useEffect(() => {
    if (!user) return

    const socket = connectSocket()
    console.log('🔌 WebSocket conectado (Técnico)')

    if (socket) {
      // Listener para mensajes recibidos
      onMessageReceived((data) => {
        console.log('📨 Mensaje recibido:', data)
        
        // Agregar mensaje a la lista solo si es del chat actual
        if (selectedChatRef.current?.id === data.chatId) {
          setMessages(prev => {
            // Evitar duplicados
            if (prev.some(m => m.id === data.message.id)) {
              console.log('⚠️ Mensaje duplicado ignorado')
              return prev
            }
            console.log('✅ Mensaje agregado a la lista')
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
      console.log('🔌 Limpiando listeners')
      offMessageReceived()
      disconnectSocket()
    }
  }, [user])

  // Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (!selectedChat) return

    const loadMessages = async () => {
      try {
        console.log('📂 Cargando mensajes del chat:', selectedChat.id)
        joinChat(selectedChat.id)
        const msgs = await getMessages(selectedChat.id)
        const messagesArray = Array.isArray(msgs.messages) ? msgs.messages : []
        console.log('📂 Mensajes cargados:', messagesArray.length)
        setMessages(messagesArray)
      } catch (error) {
        console.error('Error cargando mensajes:', error)
        setMessages([])
      }
    }

    loadMessages()

    return () => {
      if (selectedChat) {
        console.log('👋 Saliendo del chat:', selectedChat.id)
        leaveChat(selectedChat.id)
      }
    }
  }, [selectedChat])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return

    try {
      setSending(true)
      const messageText = newMessage.trim()
      console.log('📤 Enviando mensaje:', messageText)
      sendSocketMessage(selectedChat.id, messageText)
      setNewMessage('')
    } catch (error) {
      console.error('Error enviando mensaje:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderTecnico
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => {}}
        notifications={[]}
        user={user}
      />

      <div className="flex relative">
        <TecnicoSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="h-[calc(100vh-5rem)] flex flex-col">
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 bg-white shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Mensajes
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Chatea con tus clientes
              </p>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Lista de conversaciones */}
              <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No tienes conversaciones aún</p>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedChat(conv)}
                        className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                          selectedChat?.id === conv.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            {conv.cliente?.avatarUrl ? (
                              <img
                                src={conv.cliente.avatarUrl}
                                alt={conv.cliente.nombre}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold">
                                {conv.cliente?.nombre?.[0] || 'C'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {conv.cliente?.nombre || 'Cliente'}
                            </p>
                            {conv.ultimoMensaje && (
                              <p className="text-xs text-gray-500 truncate mt-1">{conv.ultimoMensaje}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
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
                          {selectedChat.cliente?.avatarUrl ? (
                            <img
                              src={selectedChat.cliente.avatarUrl}
                              alt={selectedChat.cliente.nombre}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {selectedChat.cliente?.nombre?.[0] || 'C'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedChat.cliente?.nombre || 'Cliente'}
                          </p>
                          <p className="text-sm text-gray-600">Cliente</p>
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
                                  <p className="break-words">{msg.texto || ''}</p>
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

                    {/* Input */}
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
        </main>
      </div>
    </div>
  )
}

export default function TecnicoChatPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ChatPage />
    </Suspense>
  )
}
