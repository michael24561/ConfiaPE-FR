'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import {
  Search,
  Trash2,
  Star,
  MessageSquare
} from 'lucide-react'
import DataTable, { Column } from '@/components/admincomponents/DataTable'
import ConfirmActionModal from '@/components/admincomponents/ConfirmActionModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Calificacion {
  id: string
  puntuacion: number
  comentario: string
  createdAt: string
  cliente: {
    nombre: string
    email: string
  }
  tecnico: {
    nombre: string
    email: string
  }
  trabajo?: {
    titulo: string
  }
}

export default function CalificacionesPage() {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCalificacion, setSelectedCalificacion] = useState<Calificacion | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
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
      fetchCalificaciones()
    }
  }, [router, page])

  const fetchCalificaciones = async () => {
    try {
      setLoading(true)
      const token = getAccessToken()
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })

      const response = await fetch(`${API_URL}/api/admin/calificaciones?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setCalificaciones(data.data)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching calificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCalificaciones = calificaciones.filter(cal =>
    cal.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cal.tecnico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cal.comentario.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (calificacion: Calificacion) => {
    setSelectedCalificacion(calificacion)
    setShowConfirmModal(true)
  }

  const handleModalSuccess = () => {
    fetchCalificaciones()
  }

  const columns: Column<Calificacion>[] = [
    {
      header: 'Cliente',
      cell: (cal) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{cal.cliente.nombre}</div>
          <div className="text-xs text-slate-500">{cal.cliente.email}</div>
        </div>
      )
    },
    {
      header: 'Técnico Calificado',
      cell: (cal) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{cal.tecnico.nombre}</div>
          <div className="text-xs text-slate-500">{cal.tecnico.email}</div>
        </div>
      )
    },
    {
      header: 'Puntuación',
      cell: (cal) => (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < cal.puntuacion ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
            />
          ))}
          <span className="ml-2 text-sm font-medium text-slate-700">{cal.puntuacion}</span>
        </div>
      )
    },
    {
      header: 'Comentario',
      cell: (cal) => (
        <div className="flex items-start max-w-xs">
          <MessageSquare className="w-4 h-4 text-slate-400 mr-2 mt-1 shrink-0" />
          <span className="text-sm text-slate-600 italic line-clamp-2">"{cal.comentario}"</span>
        </div>
      )
    },
    {
      header: 'Fecha',
      cell: (cal) => (
        <span className="text-sm text-slate-500">
          {new Date(cal.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ]

  const renderActions = (cal: Calificacion) => (
    <button
      onClick={() => handleDelete(cal)}
      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
      title="Eliminar calificación"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <h1 className="text-2xl font-bold text-slate-800">Moderación de Calificaciones</h1>
        <p className="text-slate-600 mt-1">Gestiona y modera las reseñas de la plataforma</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente, técnico o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredCalificaciones}
        loading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage
        }}
        actions={renderActions}
        emptyMessage="No se encontraron calificaciones"
      />

      {/* Confirm Modal */}
      {selectedCalificacion && (
        <ConfirmActionModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false)
            setSelectedCalificacion(null)
          }}
          onSuccess={handleModalSuccess}
          title="Eliminar Calificación"
          message="¿Estás seguro de que deseas eliminar esta calificación? Esta acción no se puede deshacer."
          actionType="delete"
          userId={selectedCalificacion.id} // Note: ConfirmActionModal expects userId, but we might need to adapt it for generic IDs or use a specific endpoint
          resource="rating"
          requiresReason={true}
        // We need to override the endpoint logic in ConfirmActionModal or make it generic.
        // For now, assuming ConfirmActionModal is strictly for users, I might need to create a GenericConfirmModal or update ConfirmActionModal.
        // Let's check ConfirmActionModal implementation.
        />
      )}
    </div>
  )
}

