'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/auth'
import { Loader2, Briefcase, User, AlertTriangle, CheckCircle, XCircle, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-toastify'; // Assuming react-toastify is installed for notifications

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

type ReporteEstado =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'RESUELTO'
  | 'RECHAZADO'

interface Reporte {
  id: string
  motivo: string
  descripcion: string
  fecha: string
  estado: ReporteEstado // Add report's own status
  trabajo: {
    id: string
    servicioNombre: string
    estado: TrabajoEstado
    cliente: {
      user: {
        nombre: string
        avatarUrl: string | null
      }
    }
    tecnico: {
      user: {
        nombre: string
        avatarUrl: string | null
      }
    }
  }
  reportadoPor: {
    nombre: string
    rol: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [filters, setFilters] = useState({
    estado: 'todos',
    tecnicoId: '',
    clienteId: '',
  })
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [newJobStatus, setNewJobStatus] = useState<TrabajoEstado | ''>('');
  const [resolving, setResolving] = useState(false);

  const fetchReportes = async () => {
    setLoading(true)
    try {
      const token = getAccessToken()
      const params = new URLSearchParams()
      if (filters.estado !== 'todos') params.append('estado', filters.estado)
      if (filters.tecnicoId) params.append('tecnicoId', filters.tecnicoId)
      if (filters.clienteId) params.append('clienteId', filters.clienteId)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await fetch(`${API_URL}/api/admin/reportes?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setReportes(Array.isArray(data.data) ? data.data : []) // Safeguard against non-array data
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
      }
    } catch (error) {
      console.error('Error fetching reportes:', error)
      toast.error('Error al cargar los reportes.');
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Asegurarse de que pagination esté definido antes de usar sus propiedades
    if (pagination && pagination.page !== undefined && pagination.limit !== undefined) {
      fetchReportes()
    }
  }, [pagination.page, pagination.limit, filters])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset page on filter change
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const handleOpenResolutionModal = (reporte: Reporte) => {
    setSelectedReporte(reporte);
    setNewJobStatus(''); // Reset status selection
    setResolutionModalOpen(true);
  };

  const handleCloseResolutionModal = () => {
    setResolutionModalOpen(false);
    setSelectedReporte(null);
    setNewJobStatus('');
  };

  const handleResolveReporte = async () => {
    if (!selectedReporte || !newJobStatus) {
      toast.error('Debe seleccionar un estado para resolver el trabajo.');
      return;
    }

    setResolving(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_URL}/api/admin/reportes/${selectedReporte.trabajo.id}/resolver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nuevoEstado: newJobStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Reporte resuelto exitosamente.');
        fetchReportes(); // Refresh the list
        handleCloseResolutionModal();
      } else {
        toast.error(data.error || 'Error al resolver el reporte.');
      }
    } catch (error) {
      console.error('Error resolving reporte:', error);
      toast.error('Error de red al resolver el reporte.');
    } finally {
      setResolving(false);
    }
  };

  const getEstadoDisplay = (estado: TrabajoEstado) => {
    const estadoMap: Record<TrabajoEstado, { text: string; color: string }> = {
      PENDIENTE: { text: 'Pendiente', color: 'text-yellow-600' },
      RECHAZADO: { text: 'Rechazado', color: 'text-red-600' },
      NECESITA_VISITA: { text: 'Necesita Visita', color: 'text-cyan-600' },
      COTIZADO: { text: 'Cotizado', color: 'text-orange-600' },
      ACEPTADO: { text: 'Aceptado', color: 'text-blue-600' },
      EN_PROGRESO: { text: 'En Progreso', color: 'text-purple-600' },
      COMPLETADO: { text: 'Completado', color: 'text-green-600' },
      CANCELADO: { text: 'Cancelado', color: 'text-gray-600' },
      EN_DISPUTA: { text: 'En Disputa', color: 'text-red-800' },
    }
    const info = estadoMap[estado]
    return <span className={`font-medium ${info.color}`}>{info.text}</span>
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Reportes</h1>
        <p className="text-slate-500 mt-1">Administra y resuelve los reportes de trabajos.</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1">Estado del Trabajo</label>
            <select
              id="estado"
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="NECESITA_VISITA">Necesita Visita</option>
              <option value="COTIZADO">Cotizado</option>
              <option value="ACEPTADO">Aceptado</option>
              <option value="EN_PROGRESO">En Progreso</option>
              <option value="COMPLETADO">Completado</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="EN_DISPUTA">En Disputa</option>
            </select>
          </div>
          <div>
            <label htmlFor="tecnicoId" className="block text-sm font-medium text-slate-700 mb-1">ID Técnico</label>
            <input
              type="text"
              id="tecnicoId"
              name="tecnicoId"
              value={filters.tecnicoId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filtrar por ID de técnico"
            />
          </div>
          <div>
            <label htmlFor="clienteId" className="block text-sm font-medium text-slate-700 mb-1">ID Cliente</label>
            <input
              type="text"
              id="clienteId"
              name="clienteId"
              value={filters.clienteId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filtrar por ID de cliente"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Reportes */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Reporte</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trabajo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reportado Por</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Motivo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado Trabajo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : reportes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No se encontraron reportes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                reportes.map(reporte => (
                  <tr key={reporte.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{reporte.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span>{reporte.trabajo.servicioNombre}</span>
                      </div>
                      <span className="block text-xs text-slate-500">ID: {reporte.trabajo.id.substring(0, 8)}...</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full bg-slate-200 flex-shrink-0">
                          {reporte.reportadoPor.rol === 'CLIENTE' && reporte.trabajo.cliente.user.avatarUrl && <Image src={reporte.trabajo.cliente.user.avatarUrl} alt={reporte.trabajo.cliente.user.nombre} fill className="object-cover rounded-full" unoptimized />}
                          {reporte.reportadoPor.rol === 'TECNICO' && reporte.trabajo.tecnico.user.avatarUrl && <Image src={reporte.trabajo.tecnico.user.avatarUrl} alt={reporte.trabajo.tecnico.user.nombre} fill className="object-cover rounded-full" unoptimized />}
                        </div>
                        <span>{reporte.reportadoPor.nombre}</span>
                      </div>
                      <span className="block text-xs text-slate-500">({reporte.reportadoPor.rol})</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{reporte.motivo}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{reporte.descripcion}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{getEstadoDisplay(reporte.trabajo.estado)}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{new Date(reporte.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium">
                      {reporte.trabajo.estado === 'EN_DISPUTA' && (
                        <button
                          onClick={() => handleOpenResolutionModal(reporte)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Resolver
                        </button>
                      )}
                      {reporte.trabajo.estado !== 'EN_DISPUTA' && (
                        <span className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-md">Resuelto</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6 px-4 py-3 bg-white rounded-2xl shadow-lg border border-slate-200">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-700">Página {pagination.page} de {pagination.pages}</span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Resolution Modal */}
      {resolutionModalOpen && selectedReporte && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Resolver Reporte de Trabajo</h3>
            <p className="text-slate-600 mb-4">
              Estás a punto de resolver el reporte para el trabajo: <span className="font-semibold">{selectedReporte.trabajo.servicioNombre}</span> (ID: {selectedReporte.trabajo.id.substring(0, 8)}...).
              Selecciona el nuevo estado para este trabajo.
            </p>

            <div className="mb-4">
              <label htmlFor="newJobStatus" className="block text-sm font-medium text-slate-700 mb-1">Nuevo Estado del Trabajo</label>
              <select
                id="newJobStatus"
                value={newJobStatus}
                onChange={(e) => setNewJobStatus(e.target.value as TrabajoEstado)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={resolving}
              >
                <option value="">Seleccionar Estado</option>
                <option value="COMPLETADO">Completado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseResolutionModal}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                disabled={resolving}
              >
                Cancelar
              </button>
              <button
                onClick={handleResolveReporte}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={resolving || !newJobStatus}
              >
                {resolving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar Resolución
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )}
