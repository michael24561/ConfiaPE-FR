'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import CalificarTrabajoModal from '@/components/modals/CalificarTrabajoModal'
import PagarTrabajoModal from '@/components/modals/PagarTrabajoModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Trabajo {
  id: string
  servicioNombre: string
  descripcion: string
  direccion: string
  telefono: string
  estado: 'PENDIENTE' | 'ACEPTADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO'
  precio: number | null
  fechaSolicitud: string
  fechaProgramada: string | null
  fechaCompletado: string | null
  tecnico: {
    id: string
    nombres: string
    apellidos: string
    oficio: string
    user: {
      avatarUrl: string | null
    }
  }
  review: {
    id: string
    calificacion: number
    comentario: string
  } | null
}

export default function ClienteTrabajosPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const [isMobile, setIsMobile] = useState(false)
  const [calificarModal, setCalificarModal] = useState<Trabajo | null>(null)
  const [pagarModal, setPagarModal] = useState<Trabajo | null>(null)
  const router = useRouter()

  const estadoBadgeColors = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    ACEPTADO: 'bg-blue-100 text-blue-800',
    EN_PROGRESO: 'bg-purple-100 text-purple-800',
    COMPLETADO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800'
  }

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Verificar autenticación
  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login')
      return
    }
    setUser(storedUser)
  }, [router])

  // Cargar trabajos
  useEffect(() => {
    const fetchTrabajos = async () => {
      try {
        setLoading(true)
        const token = getAccessToken()
        const params = new URLSearchParams()
        if (filter !== 'todos') {
          params.append('estado', filter)
        }

        const response = await fetch(`${API_URL}/api/trabajos?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (data.success) {
          // Asegurar que sea un array - la estructura es data.data.data con paginación
          const trabajosData = Array.isArray(data.data?.data) ? data.data.data : []
          setTrabajos(trabajosData)
        } else {
          setTrabajos([])
        }
      } catch (error) {
        console.error('Error al cargar trabajos:', error)
        setTrabajos([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTrabajos()
    }
  }, [user, filter])

  const handleCancelTrabajo = async (trabajoId: string) => {
    if (!confirm('¿Estás seguro de cancelar este trabajo?')) return

    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/trabajos/${trabajoId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Recargar trabajos
        setTrabajos(prev => prev.map(t => 
          t.id === trabajoId ? { ...t, estado: 'CANCELADO' as const } : t
        ))
        alert('Trabajo cancelado exitosamente')
      } else {
        alert('Error al cancelar el trabajo')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cancelar el trabajo')
    }
  }

  const handleChatTecnico = (tecnicoId: string) => {
    router.push(`/cliente/chat?tecnicoId=${tecnicoId}`)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderCliente
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => {}}
        notifications={[]}
        user={user}
      />

      <div className="flex relative">
        <ClienteSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 pt-20 lg:ml-72 transition-all duration-300">
          <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Mis Trabajos
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona tus solicitudes de servicio
              </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-6">
              {['todos', 'PENDIENTE', 'ACEPTADO', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFilter(estado)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filter === estado
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {estado === 'todos' ? 'Todos' : estado.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Lista de trabajos */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : trabajos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 font-medium mb-2">No tienes trabajos aún</p>
                <p className="text-sm text-gray-500 mb-4">Busca técnicos y solicita servicios</p>
                <button
                  onClick={() => router.push('/cliente/buscar')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Buscar Técnicos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {trabajos.map((trabajo) => (
                  <div key={trabajo.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          {trabajo.tecnico.user.avatarUrl ? (
                            <img
                              src={trabajo.tecnico.user.avatarUrl}
                              alt={`${trabajo.tecnico.nombres} ${trabajo.tecnico.apellidos}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {trabajo.tecnico.nombres[0]}{trabajo.tecnico.apellidos[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{trabajo.servicioNombre}</h3>
                          <p className="text-sm text-gray-600">
                            {trabajo.tecnico.nombres} {trabajo.tecnico.apellidos} - {trabajo.tecnico.oficio}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${estadoBadgeColors[trabajo.estado]}`}>
                        {trabajo.estado.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Descripción</p>
                        <p className="text-gray-900">{trabajo.descripcion}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Dirección</p>
                        <p className="text-gray-900">{trabajo.direccion}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Fecha de solicitud</p>
                        <p className="text-gray-900">{new Date(trabajo.fechaSolicitud).toLocaleDateString('es-PE')}</p>
                      </div>
                      {trabajo.precio && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Precio</p>
                          <p className="text-gray-900 font-bold">S/ {Number(trabajo.precio).toFixed(2)}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleChatTecnico(trabajo.tecnico.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Chatear
                      </button>
                      {trabajo.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => handleCancelTrabajo(trabajo.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      {trabajo.estado === 'COMPLETADO' && !trabajo.review && (
                        <>
                          <button
                            onClick={() => setCalificarModal(trabajo)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Calificar
                          </button>
                          <button
                            onClick={() => setPagarModal(trabajo)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Pagar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modales */}
      {calificarModal && (
        <CalificarTrabajoModal
          isOpen={!!calificarModal}
          onClose={() => setCalificarModal(null)}
          trabajo={calificarModal}
          onSuccess={() => {
            setCalificarModal(null)
            // Recargar trabajos
            if (user) {
              const fetchTrabajos = async () => {
                try {
                  const token = getAccessToken()
                  const params = new URLSearchParams()
                  if (filter !== 'todos') {
                    params.append('estado', filter)
                  }
                  const response = await fetch(`${API_URL}/api/trabajos?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  const data = await response.json()
                  if (data.success) {
                    setTrabajos(Array.isArray(data.data?.data) ? data.data.data : [])
                  }
                } catch (error) {
                  console.error('Error:', error)
                }
              }
              fetchTrabajos()
            }
          }}
        />
      )}

      {pagarModal && (
        <PagarTrabajoModal
          isOpen={!!pagarModal}
          onClose={() => setPagarModal(null)}
          trabajo={pagarModal}
          onSuccess={() => {
            setPagarModal(null)
            alert('Pago procesado correctamente')
          }}
        />
      )}
    </div>
  )
}
