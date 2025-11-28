'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import { useNotifications } from '@/context/NotificationContext'
import {
  Briefcase, Calendar, Check, Clock, DollarSign,
  Eye, Wrench, X, Loader2, AlertTriangle, ChevronRight, User
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type TrabajoEstado =
  | 'PENDIENTE'
  | 'RECHAZADO'
  | 'NECESITA_VISITA'
  | 'COTIZADO'
  | 'ACEPTADO'
  | 'EN_PROGRESO'
  | 'COMPLETADO'
  | 'CANCELADO'
  | 'EN_DISPUTA'

interface Trabajo {
  id: string
  servicioNombre: string
  descripcion: string
  estado: TrabajoEstado
  precio: number | null
  fechaSolicitud: string
  tecnico: {
    id: string
    nombres: string
    apellidos: string
    user: { avatarUrl: string | null }
  }
}

export default function TrabajosClientPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const router = useRouter()
  const { updatedJob } = useNotifications()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login'); return
    }
    setUser(storedUser)
  }, [router])

  useEffect(() => {
    if (updatedJob) {
      setTrabajos(prevTrabajos =>
        prevTrabajos.map(t => (t.id === updatedJob.id ? { ...t, ...updatedJob } : t))
      );
    }
  }, [updatedJob]);

  const fetchTrabajos = async () => {
    if (!user) return
    setLoading(true)
    try {
      const token = getAccessToken()
      const params = new URLSearchParams()
      if (filter !== 'todos') params.append('estado', filter)

      const response = await fetch(`${API_URL}/api/trabajos?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      setTrabajos(data.success && Array.isArray(data.data?.data) ? data.data.data : [])
    } catch (error) {
      console.error('Error al cargar trabajos:', error)
      setTrabajos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTrabajos()
    }
  }, [user, filter])

  const filterOptions = [
    'todos', 'PENDIENTE', 'NECESITA_VISITA', 'COTIZADO', 'ACEPTADO', 'EN_PROGRESO', 'COMPLETADO', 'EN_DISPUTA', 'RECHAZADO', 'CANCELADO',
  ]

  if (!user) return <div className="flex h-screen w-full items-center justify-center bg-slate-50"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderCliente onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => { }} notifications={[]} user={user} />
      <div className="flex relative">
        <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Mis Trabajos</h1>
              <p className="text-slate-500 text-lg">Gestiona tus solicitudes de servicio y consulta su estado.</p>
            </div>

            <div className="mb-6 border-b border-slate-200 overflow-x-auto">
              <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
                {filterOptions.map(estado => (
                  <button key={estado} onClick={() => setFilter(estado)} className={`px-1 sm:px-3 py-3 text-sm sm:text-base font-semibold transition-all duration-200 border-b-2 ${filter === estado ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>
            ) : trabajos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-200/60 text-center mt-8">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No tienes trabajos en esta categoría</h3>
                <p className="text-slate-500 mb-6">Cuando solicites un servicio, aparecerá aquí.</p>
                <button onClick={() => router.push('/cliente/buscar')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300">
                  Buscar Técnicos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {trabajos.map(trabajo => (
                  <TrabajoCard key={trabajo.id} trabajo={trabajo} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

// --- Simplified TrabajoCard ---

const TrabajoCard = ({ trabajo }: { trabajo: Trabajo }) => {
  const estadoInfo = getEstadoInfo(trabajo.estado)

  return (
    <Link href={`/cliente/trabajos/${trabajo.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 transition-all duration-200 hover:shadow-md hover:border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
              {trabajo.tecnico.user.avatarUrl ? (
                <Image src={trabajo.tecnico.user.avatarUrl} alt={trabajo.tecnico.nombres} fill className="object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{trabajo.servicioNombre}</h3>
              <p className="text-sm text-slate-500">con {trabajo.tecnico.nombres} {trabajo.tecnico.apellidos}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(trabajo.fechaSolicitud).toLocaleDateString('es-PE')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${estadoInfo.style}`}>
              <estadoInfo.icon className="w-3.5 h-3.5" />
              <span>{estadoInfo.text}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {/* Mobile Status Badge */}
        <div className="mt-4 sm:hidden">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${estadoInfo.style}`}>
            <estadoInfo.icon className="w-3.5 h-3.5" />
            <span>{estadoInfo.text}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

const getEstadoInfo = (estado: TrabajoEstado) => {
  const base = ''
  const styles: Record<TrabajoEstado, { style: string; icon: React.ElementType; text: string }> = {
    PENDIENTE: { style: `bg-yellow-50 text-yellow-700`, icon: Clock, text: 'Pendiente' },
    NECESITA_VISITA: { style: `bg-cyan-50 text-cyan-700`, icon: Eye, text: 'Visita Requerida' },
    COTIZADO: { style: `bg-orange-50 text-orange-700`, icon: DollarSign, text: 'Cotizado' },
    ACEPTADO: { style: `bg-blue-50 text-blue-700`, icon: Check, text: 'Aceptado' },
    EN_PROGRESO: { style: `bg-purple-50 text-purple-700`, icon: Wrench, text: 'En Progreso' },
    COMPLETADO: { style: `bg-green-50 text-green-700`, icon: Check, text: 'Completado' },
    RECHAZADO: { style: `bg-red-50 text-red-700`, icon: X, text: 'Rechazado' },
    CANCELADO: { style: `bg-gray-50 text-gray-700`, icon: X, text: 'Cancelado' },
    EN_DISPUTA: { style: `bg-red-100 text-red-800`, icon: AlertTriangle, text: 'En Disputa' },
  }
  return styles[estado] || styles.PENDIENTE
}