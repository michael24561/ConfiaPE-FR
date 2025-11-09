'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import HeaderTecnico from '@/components/tecnicocomponents/HeaderTecnico'
import TecnicoSidebar from '@/components/tecnicocomponents/TecnicoSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import { Briefcase, Calendar, MessageSquare, User, DollarSign, CheckCircle, XCircle, Clock, Tool } from 'lucide-react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type TrabajoEstado = 'PENDIENTE' | 'ACEPTADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO'

interface Trabajo {
  id: string
  servicioNombre: string
  descripcion: string
  estado: TrabajoEstado
  precio: number | null
  fechaSolicitud: string
  cliente: {
    id: string;
    userId: string;
    user: {
      nombre: string;
      avatarUrl: string | null;
    }
  }
}

export default function TecnicoTrabajosPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'TECNICO') {
      router.push('/Login'); return
    }
    setUser(storedUser)
  }, [router])

  useEffect(() => {
    const fetchTrabajos = async () => {
      if (!user) return
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
          setTrabajos(Array.isArray(data.data?.data) ? data.data.data : [])
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
    fetchTrabajos()
  }, [user, filter])

  const filterOptions: { value: string, label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'ACEPTADO', label: 'Aceptados' },
    { value: 'EN_PROGRESO', label: 'En Progreso' },
    { value: 'COMPLETADO', label: 'Completados' },
    { value: 'CANCELADO', label: 'Cancelados' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderTecnico onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} notifications={[]} user={user} />
      <div className="flex relative">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Mis Trabajos</h1>
              <p className="text-slate-500 text-lg">Gestiona las solicitudes de tus clientes.</p>
            </div>

            <div className="mb-6 border-b border-slate-200">
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-px">
                {filterOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`flex-shrink-0 px-3 py-3 text-sm sm:text-base font-semibold transition-all duration-200 border-b-2 ${
                      filter === value
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {label}
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
                <p className="text-slate-500">Cuando recibas una solicitud, aparecerá aquí.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {trabajos.map((trabajo) => (
                  <TrabajoCard key={trabajo.id} trabajo={trabajo} router={router} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

const TrabajoCard = ({ trabajo, router }: { trabajo: Trabajo, router: any }) => {
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
      ACEPTADO: CheckCircle,
      EN_PROGRESO: Tool,
      COMPLETADO: CheckCircle,
      CANCELADO: XCircle,
    }
    return {
      color: colors[trabajo.estado],
      icon: icons[trabajo.estado],
      text: trabajo.estado.replace('_', ' '),
    }
  }, [trabajo.estado])

  const handleChat = () => {
    // Redirect to chat page, which will handle conversation creation
    router.push(`/tecnico/chat?clienteId=${trabajo.cliente.userId}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
              {trabajo.cliente.user.avatarUrl ? (
                <Image src={trabajo.cliente.user.avatarUrl} alt={trabajo.cliente.user.nombre} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500">
                  {(trabajo.cliente.user.nombre?.[0] || 'C').toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{trabajo.servicioNombre}</h3>
              <p className="text-sm text-slate-500">
                Solicitado por {trabajo.cliente.user.nombre}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${estadoInfo.color}`}>
            <estadoInfo.icon className="w-4 h-4" />
            <span>{estadoInfo.text}</span>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-5">{trabajo.descripcion}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div><strong>Solicitado:</strong> {new Date(trabajo.fechaSolicitud).toLocaleDateString('es-PE')}</div>
          </div>
          {trabajo.precio && (
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <div><strong>Precio Acordado:</strong> S/ {Number(trabajo.precio).toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-slate-50/80 px-5 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <button onClick={handleChat} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
          <MessageSquare className="w-4 h-4" /> Chatear con Cliente
        </button>
        {/* Add other technician-specific actions here, e.g., update status */}
      </div>
    </div>
  )
}
