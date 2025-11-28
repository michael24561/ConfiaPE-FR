'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import DataTable, { Column } from '@/components/admincomponents/DataTable'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Reporte {
  id: string
  motivo: string
  descripcion: string
  estado: string
  createdAt: string
  reportante: {
    nombre: string
    email: string
  }
  reportado: {
    nombre: string
    email: string
  }
}

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([])
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
      fetchReportes()
    }
  }, [router, page, statusFilter])

  const fetchReportes = async () => {
    try {
      setLoading(true)
      const token = getAccessToken()
      // Note: Assuming endpoint exists or using mock
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'ALL' && { estado: statusFilter })
      })

      const response = await fetch(`${API_URL}/api/admin/reportes?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReportes(data.data)
          setTotalPages(data.pagination.pages)
        }
      } else {
        console.warn('Endpoint /api/admin/reportes not found, using mock data')
        setReportes([])
      }
    } catch (error) {
      console.error('Error fetching reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReportes = reportes.filter(rep =>
    rep.reportante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.reportado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (estado: string) => {
    const colors = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      EN_REVISION: 'bg-blue-100 text-blue-800',
      RESUELTO: 'bg-green-100 text-green-800',
      DESESTIMADO: 'bg-gray-100 text-gray-800'
    }
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const columns: Column<Reporte>[] = [
    {
      header: 'Reportante',
      cell: (rep) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{rep.reportante.nombre}</div>
          <div className="text-xs text-slate-500">{rep.reportante.email}</div>
        </div>
      )
    },
    {
      header: 'Reportado',
      cell: (rep) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{rep.reportado.nombre}</div>
          <div className="text-xs text-slate-500">{rep.reportado.email}</div>
        </div>
      )
    },
    {
      header: 'Motivo',
      cell: (rep) => (
        <div className="flex items-center">
          <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
          <span className="text-sm text-slate-700">{rep.motivo}</span>
        </div>
      )
    },
    {
      header: 'Estado',
      cell: (rep) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(rep.estado)}`}>
          {rep.estado}
        </span>
      )
    },
    {
      header: 'Fecha',
      cell: (rep) => (
        <span className="text-sm text-slate-500">
          {new Date(rep.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ]

  const renderActions = (rep: Reporte) => (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowActionsMenu(showActionsMenu === rep.id ? null : rep.id)}
        className="text-slate-400 hover:text-slate-600"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {showActionsMenu === rep.id && (
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
              {rep.estado === 'PENDIENTE' && (
                <>
                  <button
                    onClick={() => {/* TODO: Implement resolve */ }}
                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolver
                  </button>
                  <button
                    onClick={() => {/* TODO: Implement dismiss */ }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Desestimar
                  </button>
                </>
              )}
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
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Reportes</h1>
        <p className="text-slate-600 mt-1">Revisa y resuelve los reportes de usuarios</p>
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
                placeholder="Buscar por usuario o motivo..."
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
              <option value="EN_REVISION">En Revisión</option>
              <option value="RESUELTO">Resueltos</option>
              <option value="DESESTIMADO">Desestimados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredReportes}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage
        }}
        actions={renderActions}
        emptyMessage="No se encontraron reportes"
      />
    </div>
  )
}
