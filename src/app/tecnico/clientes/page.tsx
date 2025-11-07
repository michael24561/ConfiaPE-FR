'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Datos de ejemplo de clientes (se reemplazarán con datos reales)
const clientesData = [
  {
    id: 1,
    nombre: "María López",
    email: "maria.lopez@email.com",
    telefono: "+51 987 654 321",
    ubicacion: "Miraflores, Lima",
    trabajosRealizados: 3,
    ultimoTrabajo: "2024-01-15",
    calificacionPromedio: 5,
    totalGastado: 360,
    esFrecuente: true
  },
  {
    id: 2,
    nombre: "Jorge Pérez",
    email: "jorge.perez@email.com",
    telefono: "+51 988 233 555",
    ubicacion: "Lima, Perú",
    trabajosRealizados: 2,
    ultimoTrabajo: "2024-01-14",
    calificacionPromedio: 4.5,
    totalGastado: 280,
    esFrecuente: true
  },
  {
    id: 3,
    nombre: "Ana Torres",
    email: "ana.torres@email.com",
    telefono: "+51 912 223 112",
    ubicacion: "San Isidro, Lima",
    trabajosRealizados: 1,
    ultimoTrabajo: "2024-01-13",
    calificacionPromedio: 4,
    totalGastado: 95,
    esFrecuente: false
  },
  {
    id: 4,
    nombre: "Luis Fernández",
    email: "luis.fernandez@email.com",
    telefono: "+51 944 331 871",
    ubicacion: "La Molina, Lima",
    trabajosRealizados: 0,
    ultimoTrabajo: null,
    calificacionPromedio: 0,
    totalGastado: 0,
    esFrecuente: false
  },
  {
    id: 5,
    nombre: "Gloria Ramos",
    email: "gloria.ramos@email.com",
    telefono: "+51 956 872 209",
    ubicacion: "Surco, Lima",
    trabajosRealizados: 1,
    ultimoTrabajo: "2024-01-11",
    calificacionPromedio: 0,
    totalGastado: 80,
    esFrecuente: false
  }
]

const notifications = [
  {
    id: 1,
    tipo: "nuevo_trabajo",
    titulo: "Nueva solicitud",
    mensaje: "María López solicita reparación eléctrica",
    timestamp: "Hace 5 min",
    leida: false
  }
]

export default function ClientesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [user, setUser] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar clientes y conversaciones del técnico
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const storedUser = getStoredUser()
        if (!storedUser || storedUser.rol !== 'TECNICO') {
          router.push('/Login')
          return
        }
        setUser(storedUser)

        const token = getAccessToken()
        const [clientesRes, conversationsRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/clientes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/chat/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        const clientesData = await clientesRes.json()
        if (clientesData.success && clientesData.data) {
          const clientesArray = Array.isArray(clientesData.data.clientes) ? clientesData.data.clientes : []
          setClientes(clientesArray)
        }

        const conversationsData = await conversationsRes.json()
        if (conversationsData.success) {
          setConversations(conversationsData.data)
        }

      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  const handleChat = (clienteId: string) => {
    console.log('Conversations:', conversations);
    console.log('Cliente ID:', clienteId);
    const conversation = conversations.find(c => c.cliente.id === clienteId);
    if (conversation) {
      router.push(`/tecnico/chat?conversationId=${conversation.id}`);
    } else {
      alert('Aún no has iniciado una conversación con este cliente.');
    }
  };

  const clientesFiltrados = !Array.isArray(clientes) ? [] : (
    filtro === 'todos'
      ? clientes
      : filtro === 'frecuentes'
      ? clientes.filter(c => c.trabajosTotal >= 2)
      : clientes.filter(c => c.trabajosTotal === 0)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderTecnico onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={`flex-1 pt-20 px-4 sm:px-8 pb-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Mis Clientes
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona tu base de clientes y su historial
              </p>
            </div>

            {/* Estadísticas rápidas */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Clientes</p>
                      <p className="text-3xl font-black text-gray-900">{Array.isArray(clientes) ? clientes.length : 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Clientes Frecuentes</p>
                      <p className="text-3xl font-black text-gray-900">{Array.isArray(clientes) ? clientes.filter(c => c.trabajosTotal >= 2).length : 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Trabajos</p>
                      <p className="text-3xl font-black text-gray-900">
                        {Array.isArray(clientes) ? clientes.reduce((sum, c) => sum + (c.trabajosTotal || 0), 0) : 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Último mes</p>
                      <p className="text-3xl font-black text-gray-900">
                        {Array.isArray(clientes) ? clientes.filter(c => {
                          const lastDate = new Date(c.ultimaInteraccion || 0)
                          const monthAgo = new Date()
                          monthAgo.setMonth(monthAgo.getMonth() - 1)
                          return lastDate >= monthAgo
                        }).length : 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando clientes...</p>
              </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'frecuentes', label: 'Frecuentes' },
                  { id: 'nuevos', label: 'Nuevos' }
                ].map((filtroItem) => (
                  <button
                    key={filtroItem.id}
                    onClick={() => setFiltro(filtroItem.id)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                      filtro === filtroItem.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filtroItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de clientes */}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {clientesFiltrados.map((cliente) => (
                  <div key={cliente.cliente.id} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
                    {/* Header del cliente */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {cliente.cliente?.nombre?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">{cliente.cliente?.nombre || 'Cliente'}</h3>
                          <p className="text-gray-600">{cliente.cliente?.email || ''}</p>
                          {cliente.trabajosTotal >= 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Cliente Frecuente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="space-y-3 mb-6">
                      {cliente.cliente?.email && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">{cliente.cliente.email}</span>
                        </div>
                      )}

                      {cliente.cliente?.telefono && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm">{cliente.cliente.telefono}</span>
                        </div>
                      )}
                    </div>

                    {/* Estadísticas del cliente */}
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-black text-gray-900">{cliente.trabajosTotal || 0}</p>
                        <p className="text-xs text-gray-600">Trabajos</p>
                      </div>
                    </div>

                    {/* Último trabajo */}
                    {cliente.ultimaInteraccion && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                        <p className="text-sm text-gray-600 mb-1">Última interacción:</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(cliente.ultimaInteraccion).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-bold hover:scale-105 transition-all">
                      Ver Historial
                    </button>
                    <button onClick={() => handleChat(cliente.cliente.id)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-2xl hover:scale-105 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

                {clientesFiltrados.length === 0 && (
                  <div className="text-center py-16">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay clientes</h3>
                    <p className="text-gray-500">No se encontraron clientes con el filtro seleccionado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
