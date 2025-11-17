"use client"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'
import { Loader2, Star, User, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, Eye, HardHat, Home, Phone, Mail, Wrench, Wallet } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-toastify'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type TrabajoEstado =
  | 'PENDIENTE' | 'RECHAZADO' | 'NECESITA_VISITA' | 'COTIZADO' | 'ACEPTADO'
  | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO' | 'EN_DISPUTA'

interface PagoDetalle {
  id: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'FALLIDO';
  monto: number;
  payoutRealizado: boolean;
}

interface TrabajoDetalle {
  id: string
  servicioNombre: string
  descripcion: string
  estado: TrabajoEstado
  precio: number | null
  fechaSolicitud: string
  fechaCompletado: string | null
  direccion: string
  cliente: {
    id: string
    user: { nombre: string; avatarUrl: string | null; email: string; telefono: string | null }
  }
  tecnico: {
    id: string
    user: { nombre: string; avatarUrl: string | null; email: string; telefono: string | null }
  }
  calificacion: { puntuacion: number; comentario: string } | null
  reportes: any[]
  pago: PagoDetalle | null;
}

const getEstadoDisplay = (estado: TrabajoEstado) => {
    const estadoMap: Record<TrabajoEstado, { text: string; color: string; icon: React.ElementType }> = {
      PENDIENTE: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      RECHAZADO: { text: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
      NECESITA_VISITA: { text: 'Necesita Visita', color: 'bg-cyan-100 text-cyan-800', icon: Eye },
      COTIZADO: { text: 'Cotizado', color: 'bg-orange-100 text-orange-800', icon: DollarSign },
      ACEPTADO: { text: 'Aceptado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      EN_PROGRESO: { text: 'En Progreso', color: 'bg-purple-100 text-purple-800', icon: Wrench },
      COMPLETADO: { text: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELADO: { text: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: XCircle },
      EN_DISPUTA: { text: 'En Disputa', color: 'bg-red-200 text-red-900 font-bold', icon: AlertTriangle },
    }
    const info = estadoMap[estado]
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${info.color}`}>
            <info.icon className="w-5 h-5" />
            <span>{info.text}</span>
        </div>
    )
}

export default function AdminTrabajoDetallePage() {
  const [trabajo, setTrabajo] = useState<TrabajoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TrabajoEstado | ''>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const fetchTrabajo = async () => {
      if (!id) return
      setLoading(true)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/trabajos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success) {
          setTrabajo(data.data)
        } else {
          throw new Error(data.error || 'No se pudo cargar el trabajo')
        }
      } catch (error) {
        console.error('Error fetching trabajo:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrabajo()
  }, [id])

  const handleConfirmStatusChange = async () => {
    if (!newStatus || newStatus === trabajo?.estado) {
      setIsModalOpen(false);
      return;
    }
    setUpdatingStatus(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_URL}/api/admin/trabajos/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nuevoEstado: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setTrabajo(prev => prev ? { ...prev, estado: data.data.estado } : null);
        toast.success('Estado del trabajo actualizado con éxito.');
        setIsModalOpen(false);
      } else {
        throw new Error(data.error || 'No se pudo actualizar el estado.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePayout = async () => {
    if (!trabajo?.id) return;
    setPayoutLoading(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_URL}/api/admin/pagos/${trabajo.id}/payout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setTrabajo(prev => prev ? { ...prev, pago: { ...prev.pago!, payoutRealizado: true } } : null);
        toast.success(`Payout de S/ ${data.monto} realizado con éxito al técnico.`);
      } else {
        throw new Error(data.error || 'No se pudo realizar el payout.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>
  }

  if (!trabajo) {
    return <div className="text-center">No se encontró el trabajo.</div>
  }

  const canPayout = trabajo.estado === 'COMPLETADO' &&
                    trabajo.pago &&
                    trabajo.pago.estado === 'PAGADO' &&
                    !trabajo.pago.payoutRealizado;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 truncate">{trabajo.servicioNombre}</h1>
        <p className="text-slate-500">ID del Trabajo: {trabajo.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles del Trabajo */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3">Detalles del Trabajo</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Descripción</p>
                <p className="text-slate-700">{trabajo.descripcion}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Dirección</p>
                <p className="text-slate-700">{trabajo.direccion}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">Estado Actual</p>
                  {getEstadoDisplay(trabajo.estado)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Precio Cotizado</p>
                  <p className="text-lg font-bold text-slate-800">{trabajo.precio ? `S/ ${Number(trabajo.precio).toFixed(2)}` : 'No cotizado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Fecha de Solicitud</p>
                  <p className="text-slate-700">{new Date(trabajo.fechaSolicitud).toLocaleString('es-PE')}</p>
                </div>
                {trabajo.fechaCompletado && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Fecha de Finalización</p>
                    <p className="text-slate-700">{new Date(trabajo.fechaCompletado).toLocaleString('es-PE')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calificación */}
          {trabajo.calificacion && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3">Calificación</h3>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-6 h-6 ${i < trabajo.calificacion!.puntuacion ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                ))}
                <span className="font-bold text-lg">{trabajo.calificacion.puntuacion.toFixed(1)}</span>
              </div>
              <p className="text-slate-600 mt-2 italic">"{trabajo.calificacion.comentario}"</p>
            </div>
          )}
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Acciones de Moderación</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-3"
            >
              Cambiar Estado
            </button>
            {canPayout && (
              <button
                onClick={handlePayout}
                disabled={payoutLoading}
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                {payoutLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <Wallet className="w-5 h-5" /> Pagar a Técnico
              </button>
            )}
            {!canPayout && trabajo.pago?.payoutRealizado && (
              <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Payout ya realizado.
              </p>
            )}
            {!canPayout && trabajo.estado === 'COMPLETADO' && trabajo.pago?.estado === 'PAGADO' && !trabajo.pago?.payoutRealizado && (
              <p className="text-sm text-slate-500">El payout está pendiente.</p>
            )}
          </div>
          {/* Cliente */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Home className="w-6 h-6" /> Cliente</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full bg-slate-200">
                {trabajo.cliente.user.avatarUrl && <Image src={trabajo.cliente.user.avatarUrl} alt="Cliente" fill className="object-cover rounded-full" />}
              </div>
              <div>
                <p className="font-bold text-slate-900">{trabajo.cliente.user.nombre}</p>
                <p className="text-sm text-slate-500">ID: {trabajo.cliente.id}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {trabajo.cliente.user.email}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {trabajo.cliente.user.telefono || 'No proveído'}</p>
            </div>
          </div>

          {/* Técnico */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><HardHat className="w-6 h-6" /> Técnico</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full bg-slate-200">
                {trabajo.tecnico.user.avatarUrl && <Image src={trabajo.tecnico.user.avatarUrl} alt="Técnico" fill className="object-cover rounded-full" />}
              </div>
              <div>
                <p className="font-bold text-slate-900">{trabajo.tecnico.user.nombre}</p>
                <p className="text-sm text-slate-500">ID: {trabajo.tecnico.id}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {trabajo.tecnico.user.email}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {trabajo.tecnico.user.telefono || 'No proveído'}</p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ChangeStatusModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentStatus={trabajo.estado}
          selectedStatus={newStatus}
          onStatusChange={setNewStatus}
          onConfirm={handleConfirmStatusChange}
          loading={updatingStatus}
        />
      )}
    </div>
  )
}

const ChangeStatusModal = ({ isOpen, onClose, currentStatus, selectedStatus, onStatusChange, onConfirm, loading }: any) => {
  if (!isOpen) return null;

  const allStatuses: TrabajoEstado[] = [
    'PENDIENTE', 'RECHAZADO', 'NECESITA_VISITA', 'COTIZADO', 'ACEPTADO',
    'EN_PROGRESO', 'COMPLETADO', 'CANCELADO', 'EN_DISPUTA'
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Cambiar Estado del Trabajo</h3>
        <p className="text-slate-600 mb-4">Estado actual: <span className="font-semibold">{currentStatus}</span></p>
        
        <div className="mb-4">
          <label htmlFor="newStatus" className="block text-sm font-medium text-slate-700 mb-1">Nuevo Estado</label>
          <select
            id="newStatus"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as TrabajoEstado)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Seleccionar un estado</option>
            {allStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedStatus || selectedStatus === currentStatus || loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar Cambio
          </button>
        </div>
      </div>
    </div>
  );
};
