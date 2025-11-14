'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import HeaderTecnico from '@/components/tecnicocomponents/HeaderTecnico'
import TecnicoSidebar from '@/components/tecnicocomponents/TecnicoSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import * as trabajoApi from '@/lib/trabajoApi'
import ReportarTrabajoModal from '@/components/modals/ReportarTrabajoModal'
import {
  Briefcase, Calendar, MessageSquare, DollarSign, CheckCircle, XCircle, Clock, Wrench, Eye, Loader2, Send, AlertTriangle,
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
  cliente: {
    id: string
    userId: string
    user: {
      nombre: string
      avatarUrl: string | null
    }
  }
}

export default function TecnicoTrabajosPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const [cotizarModal, setCotizarModal] = useState<Trabajo | null>(null)
  const [reporteModal, setReporteModal] = useState<Trabajo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'TECNICO') {
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

  const updateTrabajoState = (trabajoId: string, newState: TrabajoEstado, newPrice?: number) => {
    setTrabajos(prev =>
      prev.map(t =>
        t.id === trabajoId
          ? { ...t, estado: newState, ...(newPrice !== undefined && { precio: newPrice }) }
          : t
      )
    )
  }

  const handleAction = async (
    action: (trabajoId: string, ...args: any[]) => Promise<any>,
    trabajoId: string,
    successState: TrabajoEstado,
    confirmMessage?: string,
    ...args: any[]
  ) => {
    if (confirmMessage && !confirm(confirmMessage)) return
    try {
      await action(trabajoId, ...args)
      updateTrabajoState(trabajoId, successState)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleProponerCotizacion = async (trabajoId: string, precio: number) => {
    try {
      await trabajoApi.proponerCotizacion(trabajoId, precio)
      updateTrabajoState(trabajoId, 'COTIZADO', precio)
      setCotizarModal(null)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleChat = (clienteUserId: string) => {
    // This is a placeholder. The technician chat page needs to be implemented
    // to handle conversation creation with a clienteUserId.
    alert(`Initiating chat with client user ID: ${clienteUserId}`)
    // router.push(`/tecnico/chat?clienteId=${clienteUserId}`)
  }

  const filterOptions: { value: string; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'NECESITA_VISITA', label: 'Necesita Visita' },
    { value: 'COTIZADO', label: 'Cotizados' },
    { value: 'ACEPTADO', label: 'Aceptados' },
    { value: 'EN_PROGRESO', label: 'En Progreso' },
    { value: 'COMPLETADO', label: 'Completados' },
    { value: 'EN_DISPUTA', label: 'En Disputa' },
    { value: 'RECHAZADO', label: 'Rechazados' },
    { value: 'CANCELADO', label: 'Cancelados' },
  ]

  if (!user) return <div className="flex h-screen w-full items-center justify-center bg-slate-50"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>

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

            <div className="mb-6 border-b border-slate-200 overflow-x-auto">
              <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
                {filterOptions.map(({ value, label }) => (
                  <button key={value} onClick={() => setFilter(value)} className={`flex-shrink-0 px-3 py-3 text-sm sm:text-base font-semibold transition-all duration-200 border-b-2 ${filter === value ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                    {label}
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
                <p className="text-slate-500">Cuando recibas una solicitud, aparecerá aquí.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {trabajos.map(trabajo => (
                  <TrabajoCardTecnico
                    key={trabajo.id}
                    trabajo={trabajo}
                    onChat={() => handleChat(trabajo.cliente.userId)}
                    onRechazar={() => handleAction(trabajoApi.rechazarSolicitud, trabajo.id, 'RECHAZADO', '¿Estás seguro de rechazar esta solicitud?')}
                    onSolicitarVisita={() => handleAction(trabajoApi.solicitarVisita, trabajo.id, 'NECESITA_VISITA')}
                    onCotizar={() => setCotizarModal(trabajo)}
                    onIniciar={() => handleAction(trabajoApi.iniciarTrabajo, trabajo.id, 'EN_PROGRESO')}
                    onCompletar={() => handleAction(trabajoApi.completarTrabajo, trabajo.id, 'COMPLETADO', '¿Confirmas que has completado este trabajo?')}
                    onReport={() => setReporteModal(trabajo)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {cotizarModal && (
        <CotizarModal
          trabajo={cotizarModal}
          onClose={() => setCotizarModal(null)}
          onSubmit={handleProponerCotizacion}
        />
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

// --- Helper Components ---

const TrabajoCardTecnico = ({ trabajo, onChat, onRechazar, onSolicitarVisita, onCotizar, onIniciar, onCompletar, onReport }: any) => {
  const estadoInfo = useMemo(() => {
    const base = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold'
    const styles: Record<TrabajoEstado, { style: string; icon: React.ElementType; text: string }> = {
      PENDIENTE: { style: `${base} bg-yellow-50 text-yellow-700`, icon: Clock, text: 'Pendiente' },
      NECESITA_VISITA: { style: `${base} bg-cyan-50 text-cyan-700`, icon: Eye, text: 'Necesita Visita' },
      COTIZADO: { style: `${base} bg-orange-50 text-orange-700`, icon: DollarSign, text: 'Cotizado' },
      ACEPTADO: { style: `${base} bg-blue-50 text-blue-700`, icon: CheckCircle, text: 'Aceptado' },
      EN_PROGRESO: { style: `${base} bg-purple-50 text-purple-700`, icon: Wrench, text: 'En Progreso' },
      COMPLETADO: { style: `${base} bg-green-50 text-green-700`, icon: CheckCircle, text: 'Completado' },
      RECHAZADO: { style: `${base} bg-red-50 text-red-700`, icon: XCircle, text: 'Rechazado' },
      CANCELADO: { style: `${base} bg-gray-50 text-gray-700`, icon: XCircle, text: 'Cancelado' },
      EN_DISPUTA: { style: `${base} bg-red-100 text-red-800`, icon: AlertTriangle, text: 'En Disputa' },
    }
    return styles[trabajo.estado]
  }, [trabajo.estado])

  const renderActions = () => {
    const btnBase = "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors"
    const btnBlue = `${btnBase} bg-blue-600 hover:bg-blue-700 text-white`
    const btnCyan = `${btnBase} bg-cyan-600 hover:bg-cyan-700 text-white`
    const btnGreen = `${btnBase} bg-green-600 hover:bg-green-700 text-white`
    const btnPurple = `${btnBase} bg-purple-600 hover:bg-purple-700 text-white`
    const btnRed = `${btnBase} bg-red-100 hover:bg-red-200 text-red-700`
    const btnGray = `${btnBase} bg-slate-100 hover:bg-slate-200 text-slate-800`
    const btnAlert = `${btnBase} bg-amber-100 hover:bg-amber-200 text-amber-800`

    const reportButton = <button onClick={onReport} className={btnAlert}><AlertTriangle className="w-4 h-4" /> Reportar</button>

    switch (trabajo.estado) {
      case 'PENDIENTE':
        return (
          <>
            <button onClick={onCotizar} className={btnBlue}><DollarSign className="w-4 h-4" /> Cotizar Directo</button>
            <button onClick={onSolicitarVisita} className={btnCyan}><Eye className="w-4 h-4" /> Agendar Visita</button>
            <button onClick={onRechazar} className={btnRed}><XCircle className="w-4 h-4" /> Rechazar</button>
          </>
        )
      case 'NECESITA_VISITA':
        return (
          <>
            <button onClick={onCotizar} className={btnGreen}><Send className="w-4 h-4" /> Generar Cotización</button>
            <button onClick={onChat} className={btnGray}><MessageSquare className="w-4 h-4" /> Chatear con Cliente</button>
            {reportButton}
          </>
        )
      case 'COTIZADO':
        return (
          <>
            <p className="text-sm text-slate-500 font-medium">Esperando aprobación del cliente...</p>
            {reportButton}
          </>
        )
      case 'ACEPTADO':
        return (
          <>
            <button onClick={onIniciar} className={btnPurple}><Wrench className="w-4 h-4" /> Iniciar Trabajo</button>
            {reportButton}
          </>
        )
      case 'EN_PROGRESO':
        return (
          <>
            <button onClick={onCompletar} className={btnGreen}><CheckCircle className="w-4 h-4" /> Completar Trabajo</button>
            {reportButton}
          </>
        )
      case 'COMPLETADO':
        return (
          <>
            <p className="text-sm text-slate-500 font-medium">Trabajo finalizado.</p>
            {reportButton}
          </>
        )
      case 'EN_DISPUTA':
        return <p className="text-sm font-semibold text-red-800">Reporte en revisión por un administrador.</p>
      default:
        return <button onClick={onChat} className={btnGray}><MessageSquare className="w-4 h-4" /> Chatear con Cliente</button>
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
              {trabajo.cliente.user.avatarUrl && <Image src={trabajo.cliente.user.avatarUrl} alt={trabajo.cliente.user.nombre} fill className="object-cover" unoptimized />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{trabajo.servicioNombre}</h3>
              <p className="text-sm text-slate-500">Solicitado por {trabajo.cliente.user.nombre}</p>
              <div className="flex items-center gap-2 text-slate-600 mt-1 text-xs">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{new Date(trabajo.fechaSolicitud).toLocaleDateString('es-PE')}</span>
              </div>
            </div>
          </div>
          <div className={estadoInfo.style}><estadoInfo.icon className="w-4 h-4" /><span>{estadoInfo.text}</span></div>
        </div>
        <p className="text-sm text-slate-600 mb-5">{trabajo.descripcion}</p>
        {trabajo.precio && <p className="text-sm font-bold text-slate-700">Precio Cotizado: S/ {Number(trabajo.precio).toFixed(2)}</p>}
      </div>
      <div className="bg-slate-50/80 px-5 sm:px-6 py-3 flex flex-wrap items-center gap-3">{renderActions()}</div>
    </div>
  )
}

const CotizarModal = ({ trabajo, onClose, onSubmit }: any) => {
  const [precio, setPrecio] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const priceValue = parseFloat(precio)
    if (!priceValue || priceValue <= 0) {
      alert('Por favor, ingresa un precio válido.')
      return
    }
    setLoading(true)
    await onSubmit(trabajo.id, priceValue)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Proponer Cotización</h2>
            <p className="text-sm text-slate-500 mt-1">Servicio: {trabajo.servicioNombre}</p>
          </div>
          <div className="p-6">
            <label htmlFor="precio" className="block text-sm font-medium text-slate-700 mb-2">Precio (S/)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                id="precio"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 150.00"
                step="0.01"
                min="0"
                required
                autoFocus
              />
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-b-2xl flex justify-end items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-200">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar Cotización
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}