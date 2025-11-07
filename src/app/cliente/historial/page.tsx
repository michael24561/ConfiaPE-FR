'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Trabajo {
  id: string
  servicioNombre: string
  descripcion: string
  direccion: string
  estado: 'COMPLETADO' | 'CANCELADO'
  precio: number | null
  fechaSolicitud: string
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

export default function ClienteHistorialPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [filter, setFilter] = useState<'todos' | 'COMPLETADO' | 'CANCELADO'>('todos')
  const router = useRouter()

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

  // Cargar historial
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true)
        const token = getAccessToken()
        
        // Obtener trabajos completados y cancelados
        const response = await fetch(`${API_URL}/api/trabajos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        
        if (data.success) {
          const allTrabajos = Array.isArray(data.data) ? data.data : []
          // Filtrar solo completados y cancelados
          const historial = allTrabajos.filter((t: Trabajo) => 
            t.estado === 'COMPLETADO' || t.estado === 'CANCELADO'
          )
          setTrabajos(historial)
        } else {
          setTrabajos([])
        }
      } catch (error) {
        console.error('Error al cargar historial:', error)
        setTrabajos([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchHistorial()
    }
  }, [user])

  const filteredTrabajos = filter === 'todos' 
    ? trabajos 
    : trabajos.filter(t => t.estado === filter)

  const stats = {
    total: trabajos.length,
    completados: trabajos.filter(t => t.estado === 'COMPLETADO').length,
    cancelados: trabajos.filter(t => t.estado === 'CANCELADO').length,
    gastado: trabajos
      .filter(t => t.estado === 'COMPLETADO' && t.precio)
      .reduce((sum, t) => sum + Number(t.precio), 0)
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
                Historial de Trabajos
              </h1>
              <p className="text-gray-600 text-lg">
                Revisa tus trabajos completados y cancelados
              </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total</p>
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-black text-gray-900">{stats.total}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Completados</p>
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-black text-gray-900">{stats.completados}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Cancelados</p>
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-black text-gray-900">{stats.cancelados}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Gastado</p>
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-black text-gray-900">S/ {stats.gastado.toFixed(2)}</p>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-6">
              {(['todos', 'COMPLETADO', 'CANCELADO'] as const).map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFilter(estado)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filter === estado
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {estado === 'todos' ? 'Todos' : estado}
                </button>
              ))}
            </div>

            {/* Lista de trabajos */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredTrabajos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-medium mb-2">No hay historial aún</p>
                <p className="text-sm text-gray-500">Los trabajos completados y cancelados aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrabajos.map((trabajo) => (
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
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        trabajo.estado === 'COMPLETADO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trabajo.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Fecha</p>
                        <p className="text-gray-900">
                          {new Date(trabajo.fechaCompletado || trabajo.fechaSolicitud).toLocaleDateString('es-PE')}
                        </p>
                      </div>
                      {trabajo.precio && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Precio</p>
                          <p className="text-gray-900 font-bold">S/ {Number(trabajo.precio).toFixed(2)}</p>
                        </div>
                      )}
                    </div>

                    {trabajo.review && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Tu calificación:</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${
                                  i < trabajo.review!.calificacion ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">"{trabajo.review.comentario}"</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
