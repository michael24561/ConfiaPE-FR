'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Datos de ejemplo de trabajos (se reemplazarán con datos reales)
const trabajosData = [
  {
    id: 1,
    cliente: "María López",
    servicio: "Reparación de cortocircuito",
    fecha: "2024-01-15",
    estado: "Completado",
    precio: 120,
    calificacion: 5,
    direccion: "Av. Larco 123, Miraflores",
    telefono: "+51 987 654 321",
    descripcion: "Reparación de cortocircuito en el cuarto principal"
  },
  {
    id: 2,
    cliente: "Jorge Pérez",
    servicio: "Instalación de luminarias",
    fecha: "2024-01-14",
    estado: "En progreso",
    precio: 180,
    calificacion: null,
    direccion: "Jr. Ucayali 456, Lima",
    telefono: "+51 988 233 555",
    descripcion: "Instalación de 6 luminarias LED en sala y comedor"
  },
  {
    id: 3,
    cliente: "Ana Torres",
    servicio: "Mantenimiento preventivo",
    fecha: "2024-01-13",
    estado: "Completado",
    precio: 95,
    calificacion: 4,
    direccion: "Calle Las Flores 789, San Isidro",
    telefono: "+51 912 223 112",
    descripcion: "Revisión general del sistema eléctrico"
  },
  {
    id: 4,
    cliente: "Luis Fernández",
    servicio: "Instalación de tablero",
    fecha: "2024-01-12",
    estado: "Pendiente",
    precio: 250,
    calificacion: null,
    direccion: "Av. Javier Prado 321, La Molina",
    telefono: "+51 944 331 871",
    descripcion: "Instalación de nuevo tablero eléctrico principal"
  },
  {
    id: 5,
    cliente: "Gloria Ramos",
    servicio: "Reparación de tomas",
    fecha: "2024-01-11",
    estado: "Cancelado",
    precio: 80,
    calificacion: null,
    direccion: "Calle Los Olivos 654, Surco",
    telefono: "+51 956 872 209",
    descripcion: "Reparación de tomas eléctricas en cocina"
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

export default function MisTrabajosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [user, setUser] = useState<any>(null)
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar trabajos y conversaciones del técnico
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
        const [trabajosRes, conversationsRes] = await Promise.all([
          fetch(`${API_URL}/api/trabajos`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/chat/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        const trabajosData = await trabajosRes.json()
        if (trabajosData.success) {
          const trabajosArray = Array.isArray(trabajosData.data?.data) ? trabajosData.data.data : []
          setTrabajos(trabajosArray)
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
    const conversation = conversations.find(c => c.cliente.id === clienteId);
    if (conversation) {
      router.push(`/tecnico/chat?conversationId=${conversation.id}`);
    } else {
      alert('El cliente aún no ha iniciado una conversación.');
    }
  };

  const handleVerDetalles = (trabajoId: string) => {
    router.push(`/tecnico/trabajos/${trabajoId}`);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'EN_PROGRESO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ACEPTADO':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'ACEPTADO': 'Aceptado',
      'EN_PROGRESO': 'En Progreso',
      'COMPLETADO': 'Completado',
      'CANCELADO': 'Cancelado'
    }
    return labels[estado] || estado
  }

  const trabajosFiltrados = filtro === 'todos'
    ? trabajos
    : trabajos.filter(trabajo => filtro === 'TODOS' || trabajo.estado === filtro)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderTecnico 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notifications={notifications}
      />

      <div className="flex">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={`flex-1 pt-20 px-4 sm:px-8 pb-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Mis Trabajos
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona todos tus trabajos y servicios
              </p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'todos', label: 'Todos' },
                  { value: 'PENDIENTE', label: 'Pendiente' },
                  { value: 'ACEPTADO', label: 'Aceptado' },
                  { value: 'EN_PROGRESO', label: 'En Progreso' },
                  { value: 'COMPLETADO', label: 'Completado' },
                  { value: 'CANCELADO', label: 'Cancelado' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFiltro(value)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                      filtro === value
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando trabajos...</p>
              </div>
            )}

            {/* Lista de trabajos */}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {trabajosFiltrados.map((trabajo) => (
                  <div key={trabajo.id} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
                    {/* Header del trabajo */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">
                          {trabajo.cliente?.user?.nombre || 'Cliente'}
                        </h3>
                        <p className="text-gray-600 font-medium">{trabajo.titulo}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getEstadoColor(trabajo.estado)}`}>
                        {getEstadoLabel(trabajo.estado)}
                      </span>
                    </div>

                  {/* Detalles */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{trabajo.fechaSolicitud ? new Date(trabajo.fechaSolicitud).toLocaleDateString('es-ES') : 'Fecha no disponible'}</span>
                    </div>

                    {trabajo.direccion && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{trabajo.direccion}</span>
                      </div>
                    )}

                    {trabajo.cliente?.user?.telefono && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-sm">{trabajo.cliente.user.telefono}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm mb-6">{trabajo.descripcion}</p>

                  {/* Precio estimado */}
                  {trabajo.precioEstimado && (
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-2xl font-black text-gray-900">
                        S/ {trabajo.precioEstimado}
                      </div>
                      <span className="text-xs text-gray-500">Precio estimado</span>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleVerDetalles(trabajo.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-bold hover:scale-105 transition-all">
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => handleChat(trabajo.clienteId)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-2xl hover:scale-105 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )}

            {!loading && trabajosFiltrados.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hay trabajos</h3>
                <p className="text-gray-500">No se encontraron trabajos con el filtro seleccionado</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
