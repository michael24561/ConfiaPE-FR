'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import { getConversations, getMessages, createConversation } from '@/lib/chat'
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Tecnico {
  id: string
  nombres: string
  apellidos: string
  oficio: string
  user: {
    avatarUrl: string | null
  }
}

export default function ClienteChatPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [searchingTecnicos, setSearchingTecnicos] = useState(false)
  const [creatingChat, setCreatingChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedChatRef = useRef<Conversation | null>(null)
  const router = useRouter()

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
        if (!storedUser || storedUser.rol !== 'CLIENTE') {
          router.push('/Login')
          return
        }
        setUser(storedUser)

        // Cargar conversaciones
        const convs = await getConversations()
        const convsArray = Array.isArray(convs) ? convs : []
        setConversations(convsArray)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // Conectar WebSocket una sola vez
  useEffect(() => {
    if (!user) return

    const socket = connectSocket()
    console.log('🔌 WebSocket conectado')

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

  // Auto-scroll al final
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

  // Buscar técnicos
  const handleSearchTecnicos = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setTecnicos([])
      return
    }

    try {
      setSearchingTecnicos(true)
      const response = await fetch(`${API_URL}/api/tecnicos?q=${query}&disponible=true&limit=10`)
      const data = await response.json()
      
      if (data.success) {
        let tecnicosData = data.data
        if (tecnicosData && tecnicosData.data && Array.isArray(tecnicosData.data)) {
          tecnicosData = tecnicosData.data
        } else if (!Array.isArray(tecnicosData)) {
          tecnicosData = []
        }
        setTecnicos(tecnicosData)
      } else {
        setTecnicos([])
      }
    } catch (error) {
      console.error('Error buscando técnicos:', error)
      setTecnicos([])
    } finally {
      setSearchingTecnicos(false)
    }
  }

  // Iniciar nueva conversación
  const handleStartChat = async (tecnico: Tecnico) => {
    try {
      setCreatingChat(true)
      
      // Verificar si ya existe una conversación con este técnico
      const existingConv = conversations.find(c => c.tecnicoId === tecnico.id)
      if (existingConv) {
        setSelectedChat(existingConv)
        setShowNewChatModal(false)
        setSearchQuery('')
        setTecnicos([])
        return
      }

      // Crear nueva conversación
      const newConv = await createConversation(tecnico.id)
      
      // Agregar a la lista de conversaciones
      setConversations(prev => [newConv, ...prev])
      setSelectedChat(newConv)
      setShowNewChatModal(false)
      setSearchQuery('')
      setTecnicos([])
    } catch (error) {
      console.error('Error iniciando chat:', error)
      alert('Error al iniciar la conversación')
    } finally {
      setCreatingChat(false)
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
      <HeaderCliente
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => {}}
        notifications={[]}
        user={user}
      />

      <div className="flex relative">
        <ClienteSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 pt-20 lg:ml-72 transition-all duration-300">
          <div className="h-[calc(100vh-5rem)] flex flex-col">
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
              <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
                {/* Header con botón Nueva conversación */}
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Conversación
                  </button>
                </div>

                {/* Lista de chats */}
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="font-medium mb-2">Sin conversaciones</p>
                      <p className="text-sm">Inicia un chat con un técnico</p>
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
                            {conv.tecnico?.user?.avatarUrl ? (
                              <img
                                src={conv.tecnico.user.avatarUrl}
                                alt={`${conv.tecnico.nombres} ${conv.tecnico.apellidos}`}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold">
                                {conv.tecnico?.nombres?.[0] || 'T'}{conv.tecnico?.apellidos?.[0] || 'C'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {conv.tecnico?.nombres || 'Técnico'} {conv.tecnico?.apellidos || ''}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{conv.tecnico?.oficio || 'Sin oficio'}</p>
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
                          {selectedChat.tecnico?.user?.avatarUrl ? (
                            <img
                              src={selectedChat.tecnico.user.avatarUrl}
                              alt={`${selectedChat.tecnico.nombres} ${selectedChat.tecnico.apellidos}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {selectedChat.tecnico?.nombres?.[0] || 'T'}{selectedChat.tecnico?.apellidos?.[0] || 'C'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedChat.tecnico?.nombres || 'Técnico'} {selectedChat.tecnico?.apellidos || ''}
                          </p>
                          <p className="text-sm text-gray-600">{selectedChat.tecnico?.oficio || 'Sin oficio'}</p>
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
        </main>
      </div>

      {/* Modal Nueva Conversación */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900">Nueva Conversación</h2>
              <button
                onClick={() => {
                  setShowNewChatModal(false)
                  setSearchQuery('')
                  setTecnicos([])
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Buscador */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchTecnicos(e.target.value)}
                  placeholder="Busca un técnico por nombre..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  autoFocus
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Resultados */}
            <div className="flex-1 overflow-y-auto p-6">
              {searchingTecnicos ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>Escribe al menos 2 caracteres para buscar</p>
                </div>
              ) : tecnicos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>No se encontraron técnicos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tecnicos.map((tecnico) => (
                    <button
                      key={tecnico.id}
                      onClick={() => handleStartChat(tecnico)}
                      disabled={creatingChat}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left flex items-center gap-4 disabled:opacity-50"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        {tecnico.user.avatarUrl ? (
                          <img
                            src={tecnico.user.avatarUrl}
                            alt={`${tecnico.nombres} ${tecnico.apellidos}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {tecnico.nombres[0]}{tecnico.apellidos[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {tecnico.nombres} {tecnico.apellidos}
                        </p>
                        <p className="text-sm text-gray-600">{tecnico.oficio}</p>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
