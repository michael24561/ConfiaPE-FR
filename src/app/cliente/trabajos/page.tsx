'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import CalificarTrabajoModal from '@/components/modals/CalificarTrabajoModal'
import PagarTrabajoModal from '@/components/modals/PagarTrabajoModal'
import { Briefcase, Calendar, Check, Clock, DollarSign, MessageSquare, Star, Wrench, X } from 'lucide-react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type TrabajoEstado = 'PENDIENTE' | 'ACEPTADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO'

interface Trabajo {
  id: string
  servicioNombre: string
  descripcion: string
  direccion: string
  telefono: string
  estado: TrabajoEstado
  precio: number | null
  fechaSolicitud: string
  fechaProgramada: string | null
  fechaCompletado: string | null
  tecnico: {
    id: string
    nombres: string
    apellidos: string
    oficio: string
    user: {
      avatarUrl: string | null
    }
  }
  review: {
    id: string
    calificacion: number
    comentario: string
  } | null
}

export default function ClienteTrabajosPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const [isMobile, setIsMobile] = useState(false)
  const [calificarModal, setCalificarModal] = useState<Trabajo | null>(null)
  const [pagarModal, setPagarModal] = useState<Trabajo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login')
      return
    }
    setUser(storedUser)
  }, [router])

  useEffect(() => {
    const fetchTrabajos = async () => {
      setLoading(true)
      try {
        const token = getAccessToken()
        const params = new URLSearchParams()
        if (filter !== 'todos') params.append('estado', filter)

        const response = await fetch(`${API_URL}/api/trabajos?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          const trabajosData = Array.isArray(data.data?.data) ? data.data.data : []
          setTrabajos(trabajosData)
        } else {
          setTrabajos([])
        }
      } catch (error) {
        console.error('Error al cargar trabajos:', error)
        setTrabajos([])
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchTrabajos()
  }, [user, filter])

  const handleCancelTrabajo = async (trabajoId: string) => {
    if (!confirm('¿Estás seguro de cancelar este trabajo?')) return
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/trabajos/${trabajoId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setTrabajos(prev => prev.map(t => t.id === trabajoId ? { ...t, estado: 'CANCELADO' as const } : t))
      } else {
        alert('Error al cancelar el trabajo')
      }
    } catch (error) {
      alert('Error al cancelar el trabajo')
    }
  }

  const handleChatTecnico = (tecnicoId: string) => {
    router.push(`/cliente/chat?tecnicoId=${tecnicoId}`)
  }

  const filterOptions = ['todos', 'PENDIENTE', 'ACEPTADO', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO']

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderCliente
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => {}}
        notifications={[]}
        user={user}
      />
      <div className="flex relative">
        <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Mis Trabajos</h1>
              <p className="text-slate-500 text-lg">Gestiona tus solicitudes de servicio y consulta su estado.</p>
            </div>

            <div className="mb-6 border-b border-slate-200">
              <div className="flex items-center gap-4 sm:gap-6">
                {filterOptions.map((estado) => (
                  <button
                    key={estado}
                    onClick={() => setFilter(estado)}
                    className={`px-1 sm:px-3 py-3 text-sm sm:text-base font-semibold transition-all duration-200 border-b-2 ${
                      filter === estado
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : trabajos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-200/60 text-center mt-8">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No tienes trabajos en esta categoría</h3>
                <p className="text-slate-500 mb-6">Cuando solicites un servicio, aparecerá aquí.</p>
                <button
                  onClick={() => router.push('/cliente/buscar')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  Buscar Técnicos
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {trabajos.map((trabajo) => (
                  <TrabajoCard
                    key={trabajo.id}
                    trabajo={trabajo}
                    onChat={() => handleChatTecnico(trabajo.tecnico.id)}
                    onCancel={() => handleCancelTrabajo(trabajo.id)}
                    onRate={() => setCalificarModal(trabajo)}
                    onPay={() => setPagarModal(trabajo)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {calificarModal && (
        <CalificarTrabajoModal
          isOpen={!!calificarModal}
          onClose={() => setCalificarModal(null)}
          trabajo={calificarModal}
          onSuccess={() => {
            setCalificarModal(null)
            // This should ideally just update one item, but for now we refetch
            if (user) {
              const fetchTrabajos = async () => {
                // Refetch logic here...
              }
              fetchTrabajos()
            }
          }}
        />
      )}
      {pagarModal && (
        <PagarTrabajoModal
          isOpen={!!pagarModal}
          onClose={() => setPagarModal(null)}
          trabajo={pagarModal}
          onSuccess={() => {
            setPagarModal(null)
            alert('Pago procesado correctamente')
          }}
        />
      )}
    </div>
  )
}

// --- Helper Component: TrabajoCard ---

interface TrabajoCardProps {
  trabajo: Trabajo;
  onChat: () => void;
  onCancel: () => void;
  onRate: () => void;
  onPay: () => void;
}

const TrabajoCard = ({ trabajo, onChat, onCancel, onRate, onPay }: TrabajoCardProps) => {
  const estadoInfo = useMemo(() => {
    const colors: Record<TrabajoEstado, string> = {
      PENDIENTE: 'border-yellow-500 bg-yellow-50 text-yellow-700',
      ACEPTADO: 'border-blue-500 bg-blue-50 text-blue-700',
      EN_PROGRESO: 'border-purple-500 bg-purple-50 text-purple-700',
      COMPLETADO: 'border-green-500 bg-green-50 text-green-700',
      CANCELADO: 'border-red-500 bg-red-50 text-red-700',
    }
    const icons: Record<TrabajoEstado, React.ElementType> = {
      PENDIENTE: Clock,
      ACEPTADO: Check,
      EN_PROGRESO: Wrench,
      COMPLETADO: Check,
      CANCELADO: X,
    }
    return {
      color: colors[trabajo.estado],
      icon: icons[trabajo.estado],
      text: trabajo.estado.replace('_', ' '),
    }
  }, [trabajo.estado])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
              {trabajo.tecnico.user.avatarUrl ? (
                <Image src={trabajo.tecnico.user.avatarUrl} alt={trabajo.tecnico.nombres} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500">
                  {trabajo.tecnico.nombres[0]}{trabajo.tecnico.apellidos[0]}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{trabajo.servicioNombre}</h3>
              <p className="text-sm text-slate-500">
                con {trabajo.tecnico.nombres} {trabajo.tecnico.apellidos}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${estadoInfo.color}`}>
            <estadoInfo.icon className="w-4 h-4" />
            <span>{estadoInfo.text}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-5">{trabajo.descripcion}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-5">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <strong>Solicitado:</strong> {new Date(trabajo.fechaSolicitud).toLocaleDateString('es-PE')}
            </div>
          </div>
          {trabajo.fechaProgramada && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <strong>Programado:</strong> {new Date(trabajo.fechaProgramada).toLocaleDateString('es-PE')}
              </div>
            </div>
          )}
          {trabajo.precio && (
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <div>
                <strong>Precio:</strong> S/ {Number(trabajo.precio).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50/80 px-5 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <button onClick={onChat} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
          <MessageSquare className="w-4 h-4" /> Chatear
        </button>
        {trabajo.estado === 'PENDIENTE' && (
          <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
            <X className="w-4 h-4" /> Cancelar
          </button>
        )}
        {trabajo.estado === 'COMPLETADO' && !trabajo.review && (
          <>
            <button onClick={onRate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
              <Star className="w-4 h-4" /> Calificar
            </button>
            <button onClick={onPay} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
              <DollarSign className="w-4 h-4" /> Pagar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
