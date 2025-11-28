'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import { connectSocket } from '@/lib/socket'
import { crearPreferenciaPago } from '@/lib/mercadopagoApi'
import * as trabajoApi from '@/lib/trabajoApi'
import {
  ChevronLeft, Calendar, MapPin, Clock, DollarSign,
  MessageSquare, AlertTriangle, CheckCircle2, XCircle,
  Loader2, CreditCard, Shield, Star, FileText, User
} from 'lucide-react'
import CalificarTrabajoModal from '@/components/modals/CalificarTrabajoModal'
import ReportarTrabajoModal from '@/components/modals/ReportarTrabajoModal'

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
  direccion: string
  estado: TrabajoEstado
  precio: number | null
  fechaSolicitud: string
  fechaProgramada: string | null
  tecnico: {
    id: string
    nombres: string
    apellidos: string
    oficio: string
    telefono: string
    user: {
      userId: string
      avatarUrl: string | null
    }
  }
  calificacion: {
    id: string
    puntuacion: number
    comentario: string
  } | null
}

export default function TrabajoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Modals
  const [calificarModalOpen, setCalificarModalOpen] = useState(false)
  const [reportarModalOpen, setReportarModalOpen] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // --- Auth & Initial Fetch ---
  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login')
      return
    }
    setUser(storedUser)
    fetchTrabajo()
  }, [id, router])

  // --- Socket Connection ---
  useEffect(() => {
    const socket = connectSocket()
    if (socket) {
      socket.on('trabajo:estado_actualizado', (data: any) => {
        if (data.id === id || (data.trabajo && data.trabajo.id === id)) {
          const updatedTrabajo = data.trabajo || data
          setTrabajo(prev => prev ? { ...prev, ...updatedTrabajo } : updatedTrabajo)
        }
      })
    }
    return () => {
      socket?.off('trabajo:estado_actualizado')
    }
  }, [id])

  // --- Payment Status Check ---
  useEffect(() => {
    const pagoStatus = searchParams.get('pago')
    if (pagoStatus === 'exitoso') {
      // Clear param to avoid re-alerting
      router.replace(`/cliente/trabajos/${id}`)
      alert('¡Pago realizado con éxito! El trabajo ha sido aceptado.')
      fetchTrabajo()
    } else if (pagoStatus === 'cancelado') {
      router.replace(`/cliente/trabajos/${id}`)
      alert('El proceso de pago fue cancelado.')
    }
  }, [searchParams, id, router])

  const fetchTrabajo = async () => {
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/trabajos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setTrabajo(result.data)
      } else {
        console.error('Error fetching job:', result.error)
      }
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- Actions ---
  const handlePayment = async () => {
    if (!trabajo) return
    setActionLoading(true)
    try {
      const checkoutUrl = await crearPreferenciaPago(trabajo.id)
      if (checkoutUrl) window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error initiating payment:', error)
      alert('Error al iniciar el pago. Intente nuevamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAction = async (actionFn: (id: string) => Promise<any>, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return
    setActionLoading(true)
    try {
      await actionFn(id)
      fetchTrabajo() // Refresh state
    } catch (error) {
      console.error('Action failed:', error)
      alert('No se pudo realizar la acción.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleChat = () => {
    if (trabajo?.tecnico?.id) {
      router.push(`/cliente/chat?tecnicoId=${trabajo.tecnico.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!trabajo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Trabajo no encontrado</h2>
          <Link href="/cliente/trabajos" className="text-blue-600 hover:underline mt-4 block">
            Volver a mis trabajos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderCliente onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => { }} notifications={[]} user={user} />

      <div className="flex relative">
        <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">

            {/* Breadcrumb */}
            <div className="mb-6">
              <Link href="/cliente/trabajos" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
                <ChevronLeft className="w-4 h-4" /> Volver a Mis Trabajos
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-6">

                {/* Status Timeline */}
                <JobTimeline estado={trabajo.estado} />

                {/* Main Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{trabajo.servicioNombre}</h1>
                      <p className="text-slate-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Solicitado el {new Date(trabajo.fechaSolicitud).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    <StatusBadge estado={trabajo.estado} />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" /> Descripción
                      </h3>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {trabajo.descripcion}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" /> Dirección
                        </h3>
                        <p className="text-slate-600 font-medium">{trabajo.direccion}</p>
                      </div>
                      {trabajo.fechaProgramada && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" /> Fecha Programada
                          </h3>
                          <p className="text-slate-600 font-medium">
                            {new Date(trabajo.fechaProgramada).toLocaleString('es-PE')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technician Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex items-center gap-5">
                  <div className="relative w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    {trabajo.tecnico.user.avatarUrl ? (
                      <Image src={trabajo.tecnico.user.avatarUrl} alt={trabajo.tecnico.nombres} fill className="object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{trabajo.tecnico.nombres} {trabajo.tecnico.apellidos}</h3>
                    <p className="text-blue-600 font-medium">{trabajo.tecnico.oficio}</p>
                    <p className="text-sm text-slate-500 mt-1">{trabajo.tecnico.telefono}</p>
                  </div>
                  <Link href={`/cliente/tecnicos/${trabajo.tecnico.id}`} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    Ver Perfil
                  </Link>
                </div>

              </div>

              {/* Right Column: Actions */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">

                  {/* Action Panel */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Gestionar Trabajo</h3>

                    {/* Dynamic Actions based on Status */}
                    <div className="space-y-3">

                      {/* Chat is almost always available */}
                      <button onClick={handleChat} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                        <MessageSquare className="w-5 h-5" /> Chat con Técnico
                      </button>

                      {trabajo.estado === 'COTIZADO' && (
                        <div className="space-y-3 pt-2">
                          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center mb-2">
                            <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Cotización Recibida</p>
                            <p className="text-3xl font-bold text-orange-900 mt-1">S/ {Number(trabajo.precio).toFixed(2)}</p>
                          </div>
                          <button
                            onClick={handlePayment}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                            Aceptar y Pagar
                          </button>
                          <button
                            onClick={() => handleAction(trabajoApi.rechazarCotizacion, '¿Seguro que deseas rechazar esta cotización?')}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}

                      {trabajo.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => handleAction(trabajoApi.cancelarTrabajo, '¿Seguro que deseas cancelar esta solicitud?')}
                          disabled={actionLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Cancelar Solicitud
                        </button>
                      )}

                      {trabajo.estado === 'COMPLETADO' && !trabajo.calificacion && (
                        <button
                          onClick={() => setCalificarModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-yellow-950 font-bold rounded-xl hover:bg-yellow-500 transition-colors"
                        >
                          <Star className="w-5 h-5" /> Calificar Trabajo
                        </button>
                      )}

                      {/* Report Button (Available in active states) */}
                      {['PENDIENTE', 'COTIZADO', 'ACEPTADO', 'EN_PROGRESO'].includes(trabajo.estado) && (
                        <button
                          onClick={() => setReportarModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-red-600 transition-colors mt-4"
                        >
                          <AlertTriangle className="w-4 h-4" /> Reportar Problema
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Help Card */}
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-blue-900 text-sm">Garantía ConfiaPE</h4>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                          Tu pago está protegido hasta que el trabajo se complete. Si tienes problemas, nuestro equipo de soporte te ayudará.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {trabajo && (
        <>
          <CalificarTrabajoModal
            isOpen={calificarModalOpen}
            onClose={() => setCalificarModalOpen(false)}
            trabajo={trabajo}
            onSuccess={() => {
              fetchTrabajo()
              setCalificarModalOpen(false)
            }}
          />
          <ReportarTrabajoModal
            isOpen={reportarModalOpen}
            onClose={() => setReportarModalOpen(false)}
            trabajoId={trabajo.id}
            onSuccess={() => {
              setReportarModalOpen(false)
              fetchTrabajo()
            }}
          />
        </>
      )}
    </div>
  )
}

// --- Sub-components ---

const StatusBadge = ({ estado }: { estado: TrabajoEstado }) => {
  const styles: Record<TrabajoEstado, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    NECESITA_VISITA: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    COTIZADO: 'bg-orange-100 text-orange-800 border-orange-200',
    ACEPTADO: 'bg-blue-100 text-blue-800 border-blue-200',
    EN_PROGRESO: 'bg-purple-100 text-purple-800 border-purple-200',
    COMPLETADO: 'bg-green-100 text-green-800 border-green-200',
    RECHAZADO: 'bg-red-100 text-red-800 border-red-200',
    CANCELADO: 'bg-slate-100 text-slate-600 border-slate-200',
    EN_DISPUTA: 'bg-red-50 text-red-600 border-red-100',
  }

  const labels: Record<TrabajoEstado, string> = {
    PENDIENTE: 'Pendiente',
    NECESITA_VISITA: 'Visita Requerida',
    COTIZADO: 'Cotizado',
    ACEPTADO: 'Aceptado',
    EN_PROGRESO: 'En Progreso',
    COMPLETADO: 'Completado',
    RECHAZADO: 'Rechazado',
    CANCELADO: 'Cancelado',
    EN_DISPUTA: 'En Disputa',
  }

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${styles[estado] || styles.PENDIENTE}`}>
      {labels[estado] || estado}
    </span>
  )
}

const JobTimeline = ({ estado }: { estado: TrabajoEstado }) => {
  // Simplified timeline logic
  const steps = [
    { id: 'PENDIENTE', label: 'Solicitado' },
    { id: 'COTIZADO', label: 'Cotizado' },
    { id: 'ACEPTADO', label: 'Aceptado' },
    { id: 'EN_PROGRESO', label: 'En Progreso' },
    { id: 'COMPLETADO', label: 'Finalizado' },
  ]

  // Determine current step index
  // Note: This is a linear simplification. Real flows might branch (e.g. Needs Visit).
  let currentIndex = -1
  if (estado === 'PENDIENTE' || estado === 'NECESITA_VISITA') currentIndex = 0
  if (estado === 'COTIZADO') currentIndex = 1
  if (estado === 'ACEPTADO') currentIndex = 2
  if (estado === 'EN_PROGRESO') currentIndex = 3
  if (estado === 'COMPLETADO') currentIndex = 4

  // Handle failure states
  const isFailed = ['RECHAZADO', 'CANCELADO', 'EN_DISPUTA'].includes(estado)

  if (isFailed) return null // Or show a specific failure banner

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[300px]">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex
          const isCurrent = idx === currentIndex

          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              {/* Line connector */}
              {idx !== 0 && (
                <div className={`absolute top-4 right-1/2 w-full h-1 -translate-y-1/2 -z-10 ${idx <= currentIndex ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
              )}

              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-300 text-slate-300'
                }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
              </div>
              <span className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}