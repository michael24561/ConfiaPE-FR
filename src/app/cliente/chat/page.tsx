'use client'

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Send, Search, X, Plus, MessageSquare, Loader2 } from 'lucide-react'
import Image from 'next/image'

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

// This component contains the actual logic and JSX for the page.
// It uses useSearchParams, so it must be rendered within a <Suspense> boundary.
function ClienteChatPageContent() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedChatRef = useRef<Conversation | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  useEffect(() => { selectedChatRef.current = selectedChat }, [selectedChat])

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = getStoredUser()
        if (!storedUser || storedUser.rol !== 'CLIENTE') {
          router.push('/Login'); return
        }
        setUser(storedUser)
        const convs = await getConversations()
        const convsArray = Array.isArray(convs) ? convs : []
        setConversations(convsArray)

        const tecnicoIdFromQuery = searchParams.get('tecnicoId')
        if (tecnicoIdFromQuery) {
          let chat = convsArray.find(c => c.tecnicoId === tecnicoIdFromQuery)
          if (!chat) {
            chat = await createConversation(tecnicoIdFromQuery)
            if (chat) {
              setConversations(prev => [chat, ...prev.filter(p => p.id !== chat.id)])
            }
          }
          if (chat) {
            setSelectedChat(chat)
          }
        } else if (convsArray.length > 0 && !isMobile) {
          setSelectedChat(convsArray[0])
        }
      } catch (error) { console.error('Error loading data:', error) }
      finally { setLoading(false) }
    }
    loadData()
  }, [router, searchParams, isMobile])

  useEffect(() => {
    if (!user) return
    const socket = connectSocket()
    onMessageReceived((data) => {
      if (selectedChatRef.current?.id === data.chatId) {
        setMessages(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message])
      }
      setConversations(prev => prev.map(conv =>
        conv.id === data.chatId
          ? { ...conv, ultimoMensaje: data.message.texto, ultimoMensajeAt: data.message.timestamp }
          : conv
      ).sort((a, b) => new Date(b.ultimoMensajeAt || 0).getTime() - new Date(a.ultimoMensajeAt || 0).getTime()))
    })
    return () => {
      offMessageReceived()
      disconnectSocket()
    }
  }, [user])

  useEffect(() => {
    if (!selectedChat) return
    const loadMessages = async () => {
      joinChat(selectedChat.id)
      const msgs = await getMessages(selectedChat.id)
      setMessages(Array.isArray(msgs.messages) ? msgs.messages : [])
    }
    loadMessages()
    return () => { if (selectedChat) leaveChat(selectedChat.id) }
  }, [selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return
    setSending(true)
    sendSocketMessage(selectedChat.id, newMessage.trim())
    setNewMessage('')
    setSending(false)
  }

  const handleStartChat = async (tecnico: Tecnico) => {
    let chat: Conversation | undefined | null = conversations.find(c => c.tecnicoId === tecnico.id)
    if (!chat) {
      chat = await createConversation(tecnico.id)
      if (chat) {
        setConversations(prev => [chat, ...prev.filter(p => p.id !== chat!.id)])
      }
    }
    if (chat) {
      setSelectedChat(chat)
    }
    setShowNewChatModal(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderCliente onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} notifications={[]} user={user} />
      <div className="flex relative">
        <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="h-full flex border-t border-slate-200">
            <div className={`
              ${isMobile && selectedChat ? 'hidden' : 'flex'} 
              w-full md:flex flex-col md:w-1/3 lg:w-1/4`
            }>
              <ConversationList
                conversations={conversations}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                onNewChat={() => setShowNewChatModal(true)}
              />
            </div>
            <div className={`
              ${isMobile && !selectedChat ? 'hidden' : 'flex'}
              w-full md:flex flex-col flex-1`
            }>
              <MessageView
                chat={selectedChat}
                messages={messages}
                currentUser={user}
                newMessage={newMessage}
                onNewMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
                messagesEndRef={messagesEndRef}
                isSending={sending}
                onBack={() => setSelectedChat(null)}
                isMobile={isMobile}
              />
            </div>
          </div>
        </main>
      </div>
      {showNewChatModal && <NewChatModal onClose={() => setShowNewChatModal(false)} onStartChat={handleStartChat} />}
    </div>
  )
}

// This is the default export for the page. It provides the <Suspense> boundary.
export default function ClienteChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <ClienteChatPageContent />
    </Suspense>
  )
}


// --- Helper Components ---

const ConversationList = ({ conversations, selectedChat, onSelectChat, onNewChat }: any) => (
  <div className="w-full bg-white border-r border-slate-200 flex flex-col">
    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
      <h2 className="text-xl font-bold text-slate-800">Chats</h2>
      <button onClick={onNewChat} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
        <Plus className="w-6 h-6 text-slate-600" />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-6 text-center text-slate-500">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium mb-1">Sin conversaciones</p>
          <p className="text-sm">Inicia un chat con un técnico.</p>
        </div>
      ) : (
        <div>
          {conversations.map((conv: Conversation) => (
            <button
              key={conv.id}
              onClick={() => onSelectChat(conv)}
              className={`w-full p-4 border-b border-slate-100 transition-colors text-left flex items-center gap-3 ${selectedChat?.id === conv.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            >
              <div className="relative w-12 h-12 rounded-full bg-slate-200 flex-shrink-0">
                {conv.tecnico?.user?.avatarUrl && <Image src={conv.tecnico.user.avatarUrl} alt={conv.tecnico.nombres} fill className="object-cover rounded-full" unoptimized />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{conv.tecnico?.nombres || 'Técnico'} {conv.tecnico?.apellidos || ''}</p>
                <p className="text-sm text-slate-500 truncate">{conv.ultimoMensaje || 'Sin mensajes...'}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
)

const MessageView = ({ chat, messages, currentUser, newMessage, onNewMessageChange, onSendMessage, messagesEndRef, isSending, onBack, isMobile }: any) => {
  if (!chat) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center text-slate-500 bg-white">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p>Selecciona una conversación para empezar a chatear.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
        {isMobile && (
          <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        )}
        <div className="relative w-10 h-10 rounded-full bg-slate-200 flex-shrink-0">
          {chat.tecnico?.user?.avatarUrl && <Image src={chat.tecnico.user.avatarUrl} alt={chat.tecnico.nombres} fill className="object-cover rounded-full" unoptimized />}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{chat.tecnico?.nombres || 'Técnico'} {chat.tecnico?.apellidos || ''}</p>
          <p className="text-sm text-slate-500">{chat.tecnico?.oficio || 'Sin oficio'}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((msg: Message) => {
            const isMine = msg.remitenteId === currentUser?.id
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-2.5 rounded-2xl ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                  <p className="break-words">{msg.texto || ''}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSendMessage())}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900"
            rows={1}
            disabled={isSending}
          />
          <button onClick={onSendMessage} disabled={!newMessage.trim() || isSending} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

const NewChatModal = ({ onClose, onStartChat }: any) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchedTecnicos, setSearchedTecnicos] = useState<Tecnico[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const isSearching = searchQuery.trim().length > 0

  const lastUserElementRef = useCallback((node: any) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isSearching) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoading, hasMore, isSearching])

  // Effect for paginated fetching of all users
  useEffect(() => {
    if (isSearching) return;
    
    const fetchUsers = async () => {
      if (!hasMore) return;
      setIsLoading(true)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/users?page=${page}&limit=15`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setAllUsers(prev => {
            const existingUserIds = new Set(prev.map(u => u.id));
            const newUsers = data.data.users.filter((u: any) => !existingUserIds.has(u.id));
            return [...prev, ...newUsers];
          });
          setHasMore(data.data.currentPage < data.data.totalPages)
        } else {
          setHasMore(false)
        }
      } catch (error) {
        console.error("Error fetching users", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [page, isSearching, hasMore])

  // Effect for searching technicians
  useEffect(() => {
    if (!isSearching) {
      setSearchedTecnicos([])
      return
    }

    const search = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/tecnicos?q=${searchQuery}&disponible=true&limit=20`)
        const data = await response.json()
        if (data.success) {
          setSearchedTecnicos(data.data.data || data.data || [])
        } else { setSearchedTecnicos([]) }
      } catch (error) { setSearchedTecnicos([]) }
      finally { setIsLoading(false) }
    }
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, isSearching])

  const usersToShow = isSearching ? searchedTecnicos : allUsers;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[70vh] flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Iniciar una Conversación</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        <div className="p-5 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por nombre o especialidad..." className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {usersToShow.length > 0 && (
            <div className="space-y-1">
              {usersToShow.map((user, index) => {
                const isLastElement = usersToShow.length === index + 1 && !isSearching
                const tecnico = isSearching ? user : null
                const finalUser = isSearching ? { ...tecnico, nombre: `${tecnico.nombres} ${tecnico.apellidos}` } : user

                return (
                  <button
                    ref={isLastElement ? lastUserElementRef : null}
                    key={finalUser.id}
                    onClick={() => onStartChat(finalUser)}
                    className="w-full p-3 hover:bg-slate-100 rounded-lg text-left flex items-center gap-3"
                  >
                    <div className="relative w-12 h-12 rounded-full bg-slate-200 flex-shrink-0">
                      {(finalUser.avatarUrl || tecnico?.user?.avatarUrl) && <Image src={finalUser.avatarUrl || tecnico?.user?.avatarUrl} alt={finalUser.nombre} fill className="object-cover rounded-full" unoptimized />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{finalUser.nombre}</p>
                      <p className="text-sm text-slate-500">{finalUser.rol === 'TECNICO' ? (finalUser.oficio || tecnico?.oficio) : 'Cliente'}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          {isLoading && <Loader2 className="mx-auto my-4 w-8 h-8 text-blue-600 animate-spin" />}
          {!isLoading && usersToShow.length === 0 && (
            <p className="text-center text-slate-500 py-10">
              {isSearching ? 'No se encontraron técnicos.' : 'No hay más usuarios.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
