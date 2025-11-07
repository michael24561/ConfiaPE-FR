'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Datos de ejemplo de calificaciones
const calificacionesData = [
  {
    id: 1,
    cliente: "María López",
    trabajo: "Reparación de cortocircuito",
    fecha: "2024-01-15",
    calificacion: 5,
    comentario: "Excelente trabajo, muy profesional y puntual. Resolvió el problema eléctrico rápidamente y dejó todo muy limpio.",
    respuesta: null,
    servicio: "Electricista",
    precio: 120
  },
  {
    id: 2,
    cliente: "Ana Torres",
    trabajo: "Mantenimiento preventivo",
    fecha: "2024-01-13",
    calificacion: 4,
    comentario: "Buen servicio, llegó a tiempo y trabajó de manera eficiente. Solo faltó explicar un poco más el proceso.",
    respuesta: "Gracias por tu comentario Ana. Para el próximo trabajo me aseguraré de explicar cada paso detalladamente.",
    servicio: "Electricista",
    precio: 95
  },
  {
    id: 3,
    cliente: "Jorge Pérez",
    trabajo: "Instalación de luminarias",
    fecha: "2024-01-10",
    calificacion: 5,
    comentario: "Muy recomendado. Explicó todo el proceso y dejó todo impecable. Las luces quedaron perfectas.",
    respuesta: "¡Muchas gracias Jorge! Me alegra saber que quedaste satisfecho con el trabajo.",
    servicio: "Electricista",
    precio: 180
  },
  {
    id: 4,
    cliente: "Luis Fernández",
    trabajo: "Instalación de tablero",
    fecha: "2024-01-08",
    calificacion: 5,
    comentario: "Carlos es un excelente profesional. Trabajo de calidad y muy responsable. Lo recomiendo 100%.",
    respuesta: "Aprecio mucho tus palabras Luis. Fue un placer trabajar contigo.",
    servicio: "Electricista",
    precio: 250
  },
  {
    id: 5,
    cliente: "Gloria Ramos",
    trabajo: "Reparación de tomas",
    fecha: "2024-01-05",
    calificacion: 3,
    comentario: "El trabajo estuvo bien, pero llegó un poco tarde. El resultado final fue satisfactorio.",
    respuesta: "Gracias por tu feedback Gloria. Me disculpo por la demora y trabajaré en mejorar mi puntualidad.",
    servicio: "Electricista",
    precio: 80
  },
  {
    id: 6,
    cliente: "Patricia Medina",
    trabajo: "Instalación eléctrica completa",
    fecha: "2024-01-03",
    calificacion: 5,
    comentario: "Increíble profesionalismo. El trabajo fue perfecto y superó mis expectativas. Definitivamente lo volveré a contratar.",
    respuesta: null,
    servicio: "Electricista",
    precio: 350
  }
]

const estadisticasCalificaciones = {
  promedio: 4.5,
  totalCalificaciones: 6,
  distribucion: {
    5: 4,
    4: 1,
    3: 1,
    2: 0,
    1: 0
  },
  calificacionPromedio: 4.5
}

const notifications = [
  {
    id: 1,
    tipo: "calificacion",
    titulo: "Nueva calificación",
    mensaje: "María López te calificó con 5 estrellas",
    timestamp: "Hace 5 min",
    leida: false
  }
]

export default function CalificacionesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [respuestaEditando, setRespuestaEditando] = useState<number | null>(null)
  const [nuevaRespuesta, setNuevaRespuesta] = useState('')
  const [user, setUser] = useState<any>(null)
  const [calificaciones, setCalificaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const router = useRouter()

  // Cargar calificaciones del técnico
  useEffect(() => {
    const loadCalificaciones = async () => {
      try {
        setLoading(true)
        const storedUser = getStoredUser()
        if (!storedUser || storedUser.rol !== 'TECNICO') {
          router.push('/Login')
          return
        }
        setUser(storedUser)
        setCalificaciones(calificacionesData)
        setStats(estadisticasCalificaciones)

      } catch (error) {
        console.error('Error cargando calificaciones:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCalificaciones()
  }, [router])

  const calificacionesFiltradas = filtro === 'todos'
    ? calificaciones
    : filtro === '5'
    ? calificaciones.filter(c => c.calificacion === 5)
    : filtro === '4'
    ? calificaciones.filter(c => c.calificacion === 4)
    : filtro === '3'
    ? calificaciones.filter(c => c.calificacion === 3)
    : calificaciones.filter(c => c.calificacion <= 2)

  const renderEstrellas = (calificacion: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < calificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  const handleResponder = (id: number) => {
    if (nuevaRespuesta.trim()) {
      console.log('Respondiendo a calificación:', id, nuevaRespuesta)
      setNuevaRespuesta('')
      setRespuestaEditando(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderTecnico 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notifications={notifications}
      />

      <div className="flex">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={`flex-1 pt-20 px-4 sm:px-8 pb-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Calificaciones y Reseñas
              </h1>
              <p className="text-gray-600 text-lg">
                Revisa las opiniones de tus clientes
              </p>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando calificaciones...</p>
              </div>
            )}

            {/* Estadísticas principales */}
            {!loading && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Calificación Promedio</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-gray-900">{stats.promedio}</span>
                        <div className="flex">
                          {renderEstrellas(Math.floor(parseFloat(stats.promedio)))}
                        </div>
                      </div>
                    </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Calificaciones</p>
                      <p className="text-3xl font-black text-gray-900">{stats.totalCalificaciones}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Calificaciones 5★</p>
                      <p className="text-3xl font-black text-gray-900">{stats.distribucion[5]}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Calificaciones 4★</p>
                      <p className="text-3xl font-black text-gray-900">{stats.distribucion[4]}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filtros */}
            {!loading && (
              <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'todos', label: 'Todas' },
                  { id: '5', label: '5 Estrellas' },
                  { id: '4', label: '4 Estrellas' },
                  { id: '3', label: '3 Estrellas' },
                  { id: 'bajas', label: '2 Estrellas o menos' }
                ].map((filtroItem) => (
                  <button
                    key={filtroItem.id}
                    onClick={() => setFiltro(filtroItem.id)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                      filtro === filtroItem.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filtroItem.label}
                  </button>
                ))}
              </div>
              </div>
            )}

            {/* Lista de calificaciones */}
            {!loading && (
              <div className="space-y-6">
              {calificacionesFiltradas.map((calificacion) => (
                <div key={calificacion.id} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  {/* Header de la calificación */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {calificacion.trabajo?.cliente?.user?.nombre?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{calificacion.trabajo?.cliente?.user?.nombre || 'Cliente'}</h3>
                        <p className="text-gray-600">{calificacion.trabajo?.titulo || 'Trabajo'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {renderEstrellas(calificacion.calificacion)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(calificacion.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">S/ {calificacion.trabajo?.precioEstimado || 0}</p>
                    </div>
                  </div>

                  {/* Comentario del cliente */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
                    <p className="text-gray-700 leading-relaxed">{calificacion.comentario}</p>
                  </div>

                  {/* Respuesta del técnico */}
                  {calificacion.respuesta && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">CM</span>
                        </div>
                        <span className="text-sm font-medium text-blue-800">Tu respuesta:</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{calificacion.respuesta}</p>
                    </div>
                  )}

                  {/* Formulario para responder */}
                  {!calificacion.respuesta && (
                    <div className="mb-4">
                      {respuestaEditando === calificacion.id ? (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                          <textarea
                            value={nuevaRespuesta}
                            onChange={(e) => setNuevaRespuesta(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                          <div className="flex gap-3 mt-3">
                            <button
                              onClick={() => handleResponder(calificacion.id)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all"
                            >
                              Responder
                            </button>
                            <button
                              onClick={() => {
                                setRespuestaEditando(null)
                                setNuevaRespuesta('')
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-400 transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespuestaEditando(calificacion.id)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all"
                        >
                          Responder al Cliente
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

                {calificacionesFiltradas.length === 0 && (
                  <div className="text-center py-16">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay calificaciones</h3>
                    <p className="text-gray-500">No se encontraron calificaciones con el filtro seleccionado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
