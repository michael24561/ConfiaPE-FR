'use client'

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HeaderTecnico from '@/components/tecnicocomponents/HeaderTecnico'
import TecnicoSidebar from '@/components/tecnicocomponents/TecnicoSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
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
import { Send, X, Plus, MessageSquare, Loader2 } from 'lucide-react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Simplified interface for the modal
interface Cliente {
  cliente: {
    id: string;
    userId: string;
    nombre: string;
    avatarUrl: string | null;
  }
}

// This component contains the actual logic and JSX for the page.
function TecnicoChatPageContent() {
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
        if (!storedUser || storedUser.rol !== 'TECNICO') {
          router.push('/Login'); return
        }
        setUser(storedUser)
        const convs = await getConversations()
        const convsArray = Array.isArray(convs) ? convs : []
        setConversations(convsArray)

        const clienteIdFromQuery = searchParams.get('clienteId')
        if (clienteIdFromQuery) {
          let chat = convsArray.find(c => c.cliente.userId === clienteIdFromQuery)
          if (!chat) {
            // This part is tricky for a technician starting a chat.
            // The `createConversation` expects a `tecnicoId`.
            // A technician can't create a conversation with a client, the client must initiate.
            // For now, we'll just select it if it exists.
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
    connectSocket()
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

  const handleStartChat = async (cliente: Cliente) => {
    let chat = conversations.find(c => c.cliente.id === cliente.cliente.id)
    if (chat) {
        setSelectedChat(chat)
    } else {
        // Technicians can't initiate chats, we just select existing ones.
        // This logic might need a backend adjustment if technicians should be able to start chats.
        alert("No se puede iniciar un nuevo chat. El cliente debe enviar el primer mensaje.");
    }
    setShowNewChatModal(false)
  }

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderTecnico onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} notifications={[]} user={user} />
      <div className="flex relative">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="h-full flex border-t border-slate-200">
            <div className={` ${isMobile && selectedChat ? 'hidden' : 'flex'} w-full md:flex flex-col md:w-1/3 lg:w-1/4`}>
              <ConversationList conversations={conversations} selectedChat={selectedChat} onSelectChat={setSelectedChat} onNewChat={() => setShowNewChatModal(true)} />
            </div>
            <div className={` ${isMobile && !selectedChat ? 'hidden' : 'flex'} w-full md:flex flex-col flex-1`}>
              <MessageView chat={selectedChat} messages={messages} currentUser={user} newMessage={newMessage} onNewMessageChange={setNewMessage} onSendMessage={handleSendMessage} messagesEndRef={messagesEndRef} isSending={sending} onBack={() => setSelectedChat(null)} isMobile={isMobile} />
            </div>
          </div>
        </main>
      </div>
      {showNewChatModal && <NewChatModal onClose={() => setShowNewChatModal(false)} onStartChat={handleStartChat} />}
    </div>
  )
}

// The page component now provides the Suspense boundary
export default function TecnicoChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <TecnicoChatPageContent />
    </Suspense>
  )
}

// --- Helper Components (Adapted for Technician's view) ---

const ConversationList = ({ conversations, selectedChat, onSelectChat, onNewChat }: any) => (
  <div className="w-full bg-white border-r border-slate-200 flex flex-col">
    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
      <h2 className="text-xl font-bold text-slate-800">Chats</h2>
      <button onClick={onNewChat} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><Plus className="w-6 h-6 text-slate-600" /></button>
    </div>
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-6 text-center text-slate-500"><MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="font-medium mb-1">Sin conversaciones</p><p className="text-sm">Los chats con tus clientes aparecerán aquí.</p></div>
      ) : (
        <div>
          {conversations.map((conv: Conversation) => (
            <button key={conv.id} onClick={() => onSelectChat(conv)} className={`w-full p-4 border-b border-slate-100 transition-colors text-left flex items-center gap-3 ${selectedChat?.id === conv.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
              <div className="relative w-12 h-12 rounded-full bg-slate-200 flex-shrink-0">
                {conv.cliente?.user?.avatarUrl && <Image src={conv.cliente.user.avatarUrl} alt={conv.cliente.user.nombre} fill className="object-cover rounded-full" unoptimized />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{conv.cliente?.user?.nombre || 'Cliente'}</p>
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
    return <div className="flex-1 hidden md:flex items-center justify-center text-slate-500 bg-white"><div className="text-center"><MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p>Selecciona una conversación para empezar a chatear.</p></div></div>
  }
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
        {isMobile && <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full hover:bg-slate-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>}
        <div className="relative w-10 h-10 rounded-full bg-slate-200 flex-shrink-0">
          {chat.cliente?.user?.avatarUrl && <Image src={chat.cliente.user.avatarUrl} alt={chat.cliente.user.nombre} fill className="object-cover rounded-full" unoptimized />}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{chat.cliente?.user?.nombre || 'Cliente'}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="space-y-4">
          {messages.map((msg: Message) => {
            const isMine = msg.remitenteId === currentUser?.id
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-2.5 rounded-2xl ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}><p className="break-words">{msg.texto || ''}</p></div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <textarea value={newMessage} onChange={(e) => onNewMessageChange(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSendMessage())} placeholder="Escribe un mensaje..." className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={1} disabled={isSending} />
          <button onClick={onSendMessage} disabled={!newMessage.trim() || isSending} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"><Send className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  )
}

const NewChatModal = ({ onClose, onStartChat }: any) => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/dashboard/clientes`, { headers: { 'Authorization': `Bearer ${token}` } })
        const data = await response.json()
        if (data.success) setClientes(data.data.clientes || [])
      } catch (error) { console.error("Error fetching clientes", error) }
      finally { setIsLoading(false) }
    }
    fetchClientes()
  }, [])

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[70vh] flex flex-col">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Iniciar Conversación</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? <Loader2 className="mx-auto my-10 w-8 h-8 text-blue-600 animate-spin" />
            : clientes.length === 0 ? <div className="text-center py-10 text-slate-500">No tienes clientes con quienes chatear.</div>
            : <div className="space-y-1">
                {clientes.map((cliente) => (
                  <button key={cliente.cliente.id} onClick={() => onStartChat(cliente)} className="w-full p-3 hover:bg-slate-100 rounded-lg text-left flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full bg-slate-200 flex-shrink-0">
                      {cliente.cliente.avatarUrl && <Image src={cliente.cliente.avatarUrl} alt={cliente.cliente.nombre} fill className="object-cover rounded-full" unoptimized />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{cliente.cliente.nombre}</p>
                    </div>
                  </button>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}