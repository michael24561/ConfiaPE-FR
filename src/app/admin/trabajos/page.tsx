'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/auth'
import { Loader2, Briefcase, User, DollarSign, Calendar, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
    user: {
      nombre: string
      avatarUrl: string | null
    }
  }
  tecnico: {
    id: string
    user: {
      nombre: string
      avatarUrl: string | null
    }
  }
  calificacion: {
    id: string
    puntuacion: number
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminTrabajosPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [filters, setFilters] = useState({
    estado: 'todos',
    tecnicoId: '',
    clienteId: '',
  })

  const fetchTrabajos = async () => {
    setLoading(true)
    try {
      const token = getAccessToken()
      const params = new URLSearchParams()
      if (filters.estado !== 'todos') params.append('estado', filters.estado)
      if (filters.tecnicoId) params.append('tecnicoId', filters.tecnicoId)
      if (filters.clienteId) params.append('clienteId', filters.clienteId)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await fetch(`${API_URL}/api/trabajos/admin?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTrabajos(data.data?.data || [])
        setPagination(data.data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 })
      }
    } catch (error) {
      console.error('Error fetching trabajos:', error)
      setTrabajos([]) // Ensure trabajos is an array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrabajos()
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
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Trabajos</h1>
        <p className="text-slate-500 mt-1">Administra y supervisa todos los trabajos del sistema.</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select
              id="estado"
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="w-full p-2 border border-slate-300 rounded-lg"
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
              className="w-full p-2 border border-slate-300 rounded-lg"
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
              className="w-full p-2 border border-slate-300 rounded-lg"
              placeholder="Filtrar por ID de cliente"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Trabajos */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">ID Trabajo</th>
                <th scope="col" className="px-6 py-3">Servicio</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Técnico</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3 text-right">Precio</th>
                <th scope="col" className="px-6 py-3 text-center">Calificación</th>
                <th scope="col" className="px-6 py-3">Fecha Solicitud</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : trabajos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500">
                    No se encontraron trabajos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                trabajos.map(trabajo => (
                  <tr key={trabajo.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{trabajo.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4">{trabajo.servicioNombre}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full bg-slate-200">
                          {trabajo.cliente.user.avatarUrl && <Image src={trabajo.cliente.user.avatarUrl} alt={trabajo.cliente.user.nombre} fill className="object-cover rounded-full" unoptimized />}
                        </div>
                        <span>{trabajo.cliente.user.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full bg-slate-200">
                          {trabajo.tecnico.user.avatarUrl && <Image src={trabajo.tecnico.user.avatarUrl} alt={trabajo.tecnico.user.nombre} fill className="object-cover rounded-full" unoptimized />}
                        </div>
                        <span>{trabajo.tecnico.user.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getEstadoDisplay(trabajo.estado)}</td>
                    <td className="px-6 py-4 text-right">{trabajo.precio ? `S/ ${Number(trabajo.precio).toFixed(2)}` : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      {trabajo.calificacion ? (
                        <span className="flex items-center justify-center gap-1 text-yellow-500">
                          {trabajo.calificacion.puntuacion} <Briefcase className="w-4 h-4" />
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">{new Date(trabajo.fechaSolicitud).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/admin/trabajos/${trabajo.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Ver Detalle
                      </Link>
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
        <div className="flex justify-end items-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-slate-700">Página {pagination.page} de {pagination.pages}</span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </>
  )
}