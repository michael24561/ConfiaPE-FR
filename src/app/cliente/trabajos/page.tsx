'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import CalificarTrabajoModal from '@/components/modals/CalificarTrabajoModal'
import ReportarTrabajoModal from '@/components/modals/ReportarTrabajoModal'
import {
  aceptarCotizacion,
  rechazarCotizacion,
  cancelarTrabajo,
} from '@/lib/trabajoApi'
import {
  Briefcase,
  Calendar,
  Check,
  Clock,
  DollarSign,
  MessageSquare,
  Star,
  Wrench,
  X,
  Loader2,
  AlertTriangle,
  Eye,
} from 'lucide-react'
import Image from 'next/image'

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
  review: { id: string } | null
}

export default function ClienteTrabajosPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const [calificarModal, setCalificarModal] = useState<Trabajo | null>(null)
  const [reporteModal, setReporteModal] = useState<Trabajo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login'); return
    }
    setUser(storedUser)
  }, [router])

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
    fetchTrabajos()
  }, [user, filter])

  const updateTrabajoState = (trabajoId: string, newState: TrabajoEstado) => {
    setTrabajos(prev =>
      prev.map(t => (t.id === trabajoId ? { ...t, estado: newState } : t))
    )
  }

  const handleAction = async (
    action: (trabajoId: string) => Promise<any>,
    trabajoId: string,
    successState: TrabajoEstado,
    confirmMessage?: string
  ) => {
    if (confirmMessage && !confirm(confirmMessage)) return
    try {
      await action(trabajoId)
      updateTrabajoState(trabajoId, successState)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleChatTecnico = (tecnicoId: string) => {
    router.push(`/cliente/chat?tecnicoId=${tecnicoId}`)
  }

  const filterOptions = [
    'todos', 'PENDIENTE', 'NECESITA_VISITA', 'COTIZADO', 'ACEPTADO', 'EN_PROGRESO', 'COMPLETADO', 'EN_DISPUTA', 'RECHAZADO', 'CANCELADO',
  ]

  if (!user) return <div className="flex h-screen w-full items-center justify-center bg-slate-50"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderCliente onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} notifications={[]} user={user} />
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
              <div className="space-y-6">
                {trabajos.map(trabajo => (
                  <TrabajoCard
                    key={trabajo.id}
                    trabajo={trabajo}
                    onChat={() => handleChatTecnico(trabajo.tecnico.id)}
                    onAcceptQuote={() => handleAction(aceptarCotizacion, trabajo.id, 'ACEPTADO')}
                    onRejectQuote={() => handleAction(rechazarCotizacion, trabajo.id, 'RECHAZADO', '¿Estás seguro de rechazar esta cotización?')}
                    onCancel={() => handleAction(cancelarTrabajo, trabajo.id, 'CANCELADO', '¿Estás seguro de cancelar este trabajo?')}
                    onRate={() => setCalificarModal(trabajo)}
                    onReport={() => setReporteModal(trabajo)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {calificarModal && (
        <CalificarTrabajoModal isOpen={!!calificarModal} onClose={() => setCalificarModal(null)} trabajo={calificarModal} onSuccess={() => { setCalificarModal(null); fetchTrabajos(); }} />
      )}

      {reporteModal && (
        <ReportarTrabajoModal
          isOpen={!!reporteModal}
          onClose={() => setReporteModal(null)}
          trabajoId={reporteModal.id}
          onSuccess={() => {
            setReporteModal(null)
            updateTrabajoState(reporteModal.id, 'EN_DISPUTA')
          }}
        />
      )}
    </div>
  )
}

// --- Helper Component: TrabajoCard ---

interface TrabajoCardProps {
  trabajo: Trabajo
  onChat: () => void
  onAcceptQuote: () => void
  onRejectQuote: () => void
  onCancel: () => void
  onRate: () => void
  onReport: () => void
}

const TrabajoCard = ({ trabajo, onChat, onAcceptQuote, onRejectQuote, onCancel, onRate, onReport }: TrabajoCardProps) => {
  const estadoInfo = useMemo(() => {
    const base = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold'
    const styles: Record<TrabajoEstado, { style: string; icon: React.ElementType; text: string }> = {
      PENDIENTE: { style: `${base} bg-yellow-50 text-yellow-700`, icon: Clock, text: 'Pendiente' },
      NECESITA_VISITA: { style: `${base} bg-cyan-50 text-cyan-700`, icon: Eye, text: 'Necesita Visita' },
      COTIZADO: { style: `${base} bg-orange-50 text-orange-700`, icon: DollarSign, text: 'Cotizado' },
      ACEPTADO: { style: `${base} bg-blue-50 text-blue-700`, icon: Check, text: 'Aceptado' },
      EN_PROGRESO: { style: `${base} bg-purple-50 text-purple-700`, icon: Wrench, text: 'En Progreso' },
      COMPLETADO: { style: `${base} bg-green-50 text-green-700`, icon: Check, text: 'Completado' },
      RECHAZADO: { style: `${base} bg-red-50 text-red-700`, icon: X, text: 'Rechazado' },
      CANCELADO: { style: `${base} bg-gray-50 text-gray-700`, icon: X, text: 'Cancelado' },
      EN_DISPUTA: { style: `${base} bg-red-100 text-red-800`, icon: AlertTriangle, text: 'En Disputa' },
    }
    return styles[trabajo.estado]
  }, [trabajo.estado])

  const renderActions = () => {
    const btnBase = "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors"
    const btnGreen = `${btnBase} bg-green-600 hover:bg-green-700 text-white`
    const btnRed = `${btnBase} bg-red-600 hover:bg-red-700 text-white`
    const btnRedOutline = `${btnBase} bg-red-100 hover:bg-red-200 text-red-700`
    const btnBlue = `${btnBase} bg-blue-600 hover:bg-blue-700 text-white`
    const btnYellow = `${btnBase} bg-yellow-500 hover:bg-yellow-600 text-white`
    const btnGray = `${btnBase} bg-slate-100 hover:bg-slate-200 text-slate-800`
    const btnAlert = `${btnBase} bg-amber-100 hover:bg-amber-200 text-amber-800`

    const reportButton = <button onClick={onReport} className={btnAlert}><AlertTriangle className="w-4 h-4" /> Reportar</button>

    switch (trabajo.estado) {
      case 'PENDIENTE':
        return <button onClick={onCancel} className={btnRedOutline}><X className="w-4 h-4" /> Cancelar Solicitud</button>
      case 'NECESITA_VISITA':
        return (
          <>
            <button onClick={onChat} className={btnBlue}><MessageSquare className="w-4 h-4" /> Coordinar Visita</button>
            {reportButton}
          </>
        )
      case 'COTIZADO':
        return (
          <>
            <button onClick={onAcceptQuote} className={btnGreen}><Check className="w-4 h-4" /> Aceptar Cotización</button>
            <button onClick={onRejectQuote} className={btnRed}><X className="w-4 h-4" /> Rechazar</button>
            <button onClick={onChat} className={btnGray}><MessageSquare className="w-4 h-4" /> Consultar</button>
            {reportButton}
          </>
        )
      case 'ACEPTADO':
      case 'EN_PROGRESO':
        return (
          <>
            <button onClick={onChat} className={btnBlue}><MessageSquare className="w-4 h-4" /> Chatear con Técnico</button>
            <button onClick={onCancel} className={btnRedOutline}><X className="w-4 h-4" /> Cancelar Trabajo</button>
            {reportButton}
          </>
        )
      case 'COMPLETADO':
        if (!trabajo.review) {
          return (
            <>
              <button onClick={onRate} className={btnYellow}><Star className="w-4 h-4" /> Calificar Trabajo</button>
              {reportButton}
            </>
          )
        }
        return reportButton
      case 'EN_DISPUTA':
        return <p className="text-sm font-semibold text-red-800">Reporte en revisión por un administrador.</p>
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
              {trabajo.tecnico.user.avatarUrl && <Image src={trabajo.tecnico.user.avatarUrl} alt={trabajo.tecnico.nombres} fill className="object-cover" unoptimized />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{trabajo.servicioNombre}</h3>
              <p className="text-sm text-slate-500">con {trabajo.tecnico.nombres} {trabajo.tecnico.apellidos}</p>
              <div className="flex items-center gap-2 text-slate-600 mt-1 text-xs">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Solicitado: {new Date(trabajo.fechaSolicitud).toLocaleDateString('es-PE')}</span>
              </div>
            </div>
          </div>
          <div className={estadoInfo.style}><estadoInfo.icon className="w-4 h-4" /><span>{estadoInfo.text}</span></div>
        </div>

        {trabajo.estado === 'COTIZADO' && (
          <div className="my-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
            <p className="font-bold text-orange-800">Propuesta de Cotización:</p>
            <p className="text-2xl font-bold text-orange-900">S/ {Number(trabajo.precio).toFixed(2)}</p>
          </div>
        )}
        
        {trabajo.estado === 'NECESITA_VISITA' && (
          <div className="my-4 p-4 bg-cyan-50 border-l-4 border-cyan-400 rounded-r-lg">
            <p className="font-bold text-cyan-800">Acción Requerida</p>
            <p className="text-sm text-cyan-900">El técnico necesita visitar el lugar para darte una cotización precisa. Por favor, usa el chat para coordinar una fecha y hora.</p>
          </div>
        )}

        <p className="text-sm text-slate-600 mb-5">{trabajo.descripcion}</p>
      </div>
      
      <div className="bg-slate-50/80 px-5 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        {renderActions()}
      </div>
    </div>
  )
}