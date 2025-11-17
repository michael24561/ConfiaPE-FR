'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAccessToken } from '@/lib/auth'
import { Loader2, Star, Trash2, User, Briefcase } from 'lucide-react'
import { toast } from 'react-toastify'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Calificacion {
  id: string
  puntuacion: number
  comentario: string
  fechaCreacion: string
  user: {
    id: string
    nombre: string
    email: string
  }
  trabajo: {
    id: string
    tecnico: {
      id: string
      nombres: string
      apellidos: string
    }
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminCalificacionesPage() {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [filters, setFilters] = useState({
    tecnicoId: '',
    clienteId: '',
  })
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)
  const [selectedCalificacionId, setSelectedCalificacionId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCalificaciones = useCallback(async () => {
    setLoading(true)
    try {
      const token = getAccessToken()
      const params = new URLSearchParams()
      if (filters.tecnicoId) params.append('tecnicoId', filters.tecnicoId)
      if (filters.clienteId) params.append('clienteId', filters.clienteId)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await fetch(`${API_URL}/api/calificaciones/admin?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setCalificaciones(Array.isArray(data.data) ? data.data : [])
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
      } else {
        toast.error(data.error || 'Error al cargar las calificaciones.')
      }
    } catch (error) {
      console.error('Error fetching calificaciones:', error)
      toast.error('Error de red al cargar las calificaciones.')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchCalificaciones()
  }, [fetchCalificaciones])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const openDeleteModal = (id: string) => {
    setSelectedCalificacionId(id)
    setConfirmDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setSelectedCalificacionId(null)
    setConfirmDeleteModalOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedCalificacionId) return
    setDeleting(true)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/calificaciones/admin/${selectedCalificacionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Calificación eliminada exitosamente.')
        fetchCalificaciones()
        closeDeleteModal()
      } else {
        toast.error(data.error || 'Error al eliminar la calificación.')
      }
    } catch (error) {
      console.error('Error deleting calificacion:', error)
      toast.error('Error de red al eliminar la calificación.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Calificaciones</h1>
        <p className="text-slate-500 mt-1">Administra y modera las calificaciones de los usuarios.</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Tabla de Calificaciones */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Puntuación</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Comentario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Técnico</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : calificaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No se encontraron calificaciones con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                calificaciones.map(cal => (
                  <tr key={cal.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-yellow-500 font-bold">{cal.puntuacion.toFixed(1)}</span>
                        <Star className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{cal.comentario}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="font-medium">{cal.user.nombre}</div>
                      <div className="text-xs text-slate-500">{cal.user.id.substring(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="font-medium">{`${cal.trabajo.tecnico.nombres} ${cal.trabajo.tecnico.apellidos}`}</div>
                      <div className="text-xs text-slate-500">{cal.trabajo.tecnico.id.substring(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{new Date(cal.fechaCreacion).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium">
                      <button
                        onClick={() => openDeleteModal(cal.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar calificación"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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

      {/* Delete Confirmation Modal */}
      {confirmDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que quieres eliminar esta calificación? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
