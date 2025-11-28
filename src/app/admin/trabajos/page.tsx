'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import {
  Search,
  MoreVertical,
  Eye,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react'
import DataTable, { Column } from '@/components/admincomponents/DataTable'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Trabajo {
  id: string
  titulo: string
  descripcion: string
  estado: string
  fechaCreacion: string
  presupuesto?: number
  ubicacion?: string
  cliente: {
    nombre: string
    email: string
  }
  tecnico?: {
    nombre: string
    email: string
  }
}

export default function TrabajosPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = () => {
      const storedUser = getStoredUser()
      if (!storedUser || storedUser.rol !== 'ADMIN') {
        router.push('/Login')
        return false
      }
      return true
    }

    if (checkUser()) {
      fetchTrabajos()
    }
  }, [router, page, statusFilter])

  const fetchTrabajos = async () => {
    try {
      setLoading(true)
      const token = getAccessToken()
      // Note: Assuming endpoint exists or using a mock for now if not ready
      // In a real scenario, we'd call /api/admin/trabajos
      // For now, let's simulate or try to fetch if endpoint exists
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'ALL' && { estado: statusFilter })
      })

      const response = await fetch(`${API_URL}/api/admin/trabajos?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTrabajos(data.data)
          setTotalPages(data.pagination.pages)
        }
      } else {
        // Fallback mock data if endpoint doesn't exist yet
        console.warn('Endpoint /api/admin/trabajos not found, using mock data')
        setTrabajos([])
      }
    } catch (error) {
      console.error('Error fetching trabajos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrabajos = trabajos.filter(trabajo =>
    trabajo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trabajo.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (estado: string) => {
    const colors = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      EN_PROCESO: 'bg-blue-100 text-blue-800',
      COMPLETADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800'
    }
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const columns: Column<Trabajo>[] = [
    {
      header: 'Trabajo',
      cell: (trabajo) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{trabajo.titulo}</div>
          <div className="text-xs text-slate-500 line-clamp-1">{trabajo.descripcion}</div>
        </div>
      )
    },
    {
      header: 'Cliente',
      cell: (trabajo) => (
        <div className="text-sm text-slate-700">{trabajo.cliente.nombre}</div>
      )
    },
    {
      header: 'Técnico',
      cell: (trabajo) => (
        <div className="text-sm text-slate-700">
          {trabajo.tecnico ? trabajo.tecnico.nombre : <span className="text-slate-400 italic">Sin asignar</span>}
        </div>
      )
    },
    {
      header: 'Estado',
      cell: (trabajo) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(trabajo.estado)}`}>
          {trabajo.estado}
        </span>
      )
    },
    {
      header: 'Fecha',
      cell: (trabajo) => (
        <div className="flex items-center text-sm text-slate-500">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(trabajo.fechaCreacion).toLocaleDateString()}
        </div>
      )
    }
  ]

  const renderActions = (trabajo: Trabajo) => (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowActionsMenu(showActionsMenu === trabajo.id ? null : trabajo.id)}
        className="text-slate-400 hover:text-slate-600"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {showActionsMenu === trabajo.id && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowActionsMenu(null)}
          />
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                onClick={() => {/* TODO: Implement view details */ }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Ver detalles
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Trabajos</h1>
        <p className="text-slate-600 mt-1">Supervisa y administra los trabajos de la plataforma</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="COMPLETADO">Completados</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTrabajos}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage
        }}
        actions={renderActions}
        emptyMessage="No se encontraron trabajos"
      />
    </div>
  )
}