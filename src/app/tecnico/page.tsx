'use client'

import { useState, useEffect } from "react"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import StatsCard from "@/components/tecnicocomponents/StatsCard"
import RecentJobs from "@/components/tecnicocomponents/RecentJobs"
import NotificationsPanel from "@/components/tecnicocomponents/NotificationsPanel"
import { getStoredUser, me } from "../../lib/auth"
import { useRouter } from "next/navigation"

// Datos de ejemplo para el dashboard
const statsData = {
  trabajosHoy: 3,
  trabajosCompletados: 127,
  ingresosMes: 4850,
  calificacionPromedio: 4.8,
  clientesAtendidos: 89,
  trabajosPendientes: 2
}

const recentJobs = [
  {
    id: 1,
    cliente: "María López",
    servicio: "Reparación de cortocircuito",
    fecha: "2024-01-15",
    estado: "Completado",
    precio: 120,
    calificacion: 5
  },
  {
    id: 2,
    cliente: "Jorge Pérez",
    servicio: "Instalación de luminarias",
    fecha: "2024-01-14",
    estado: "En progreso",
    precio: 180,
    calificacion: null
  },
  {
    id: 3,
    cliente: "Ana Torres",
    servicio: "Mantenimiento preventivo",
    fecha: "2024-01-13",
    estado: "Completado",
    precio: 95,
    calificacion: 4
  }
]

const notifications = [
  {
    id: 1,
    tipo: "nuevo_trabajo",
    titulo: "Nueva solicitud de trabajo",
    mensaje: "María López solicita reparación eléctrica",
    timestamp: "Hace 5 min",
    leida: false
  },
  {
    id: 2,
    tipo: "mensaje",
    titulo: "Nuevo mensaje",
    mensaje: "Jorge Pérez te escribió",
    timestamp: "Hace 15 min",
    leida: false
  },
  {
    id: 3,
    tipo: "calificacion",
    titulo: "Nueva calificación",
    mensaje: "Ana Torres te calificó con 5 estrellas",
    timestamp: "Hace 1 hora",
    leida: true
  }
]

export default function TecnicoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Primero intentar obtener datos del storage
        const storedUser = getStoredUser()
        if (storedUser) {
          // Verificar que sea técnico
          if (storedUser.rol !== 'TECNICO') {
            router.push('/Login')
            return
          }
          setUser(storedUser)
        }

        // Luego actualizar con datos frescos del servidor
        const userData = await me()
        if (userData.rol !== 'TECNICO') {
          router.push('/Login')
          return
        }
        setUser(userData)
      } catch (err: any) {
        setError(err?.message || 'Error cargando usuario')
        // Si hay error, redirigir al login
        router.push('/Login')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Usuario no encontrado'}</p>
          <button 
            onClick={() => router.push('/Login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ir al Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <HeaderTecnico
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notifications={notifications}
        user={user}
      />

      <div className="flex relative">
        {/* Sidebar */}
        <TecnicoSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Overlay para móvil */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal - CON MARGIN LEFT EN DESKTOP */}
        <main className="flex-1 pt-20 px-4 sm:px-8 pb-8 lg:ml-72 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Header del dashboard */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                ¡Hola, {user.nombre}! 👋
              </h1>
              <p className="text-gray-600">
                Aquí está tu resumen de hoy
              </p>
            </div>

            {/* Cards de estadísticas en grid mejorado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Card 1 - Trabajos Hoy */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{statsData.trabajosHoy}</h3>
                <p className="text-sm text-gray-600 mb-2">Trabajos Hoy</p>
                <span className="inline-flex items-center text-xs text-green-600 font-medium">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  +2 vs ayer
                </span>
              </div>

              {/* Card 2 - Ingresos */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">S/ {statsData.ingresosMes.toLocaleString()}</h3>
                <p className="text-sm text-gray-600 mb-2">Ingresos del Mes</p>
                <span className="inline-flex items-center text-xs text-green-600 font-medium">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  +15% este mes
                </span>
              </div>

              {/* Card 3 - Calificación */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{statsData.calificacionPromedio}</h3>
                <p className="text-sm text-gray-600 mb-2">Calificación Promedio</p>
                <span className="inline-flex items-center text-xs text-yellow-600 font-medium">
                  ⭐ Excelente
                </span>
              </div>

              {/* Card 4 - Trabajos Pendientes */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{statsData.trabajosPendientes}</h3>
                <p className="text-sm text-gray-600 mb-2">Trabajos Pendientes</p>
                <span className="inline-flex items-center text-xs text-orange-600 font-medium">
                  ⚡ Requieren atención
                </span>
              </div>
            </div>

            {/* Estadísticas adicionales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-2">Trabajos Completados</p>
                    <h3 className="text-4xl font-bold">{statsData.trabajosCompletados}</h3>
                    <p className="text-purple-100 text-sm mt-2">+8 este mes</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm mb-2">Clientes Atendidos</p>
                    <h3 className="text-4xl font-bold">{statsData.clientesAtendidos}</h3>
                    <p className="text-indigo-100 text-sm mt-2">+12 este mes</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de trabajos recientes y actividad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trabajos Recientes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Trabajos Recientes</h3>
                  <a href="/tecnico/trabajos" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver todos →
                  </a>
                </div>

                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{job.servicio}</h4>
                        <p className="text-xs text-gray-600 mt-1">{job.cliente}</p>
                        <p className="text-xs text-gray-500 mt-1">{job.fecha}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">S/ {job.precio}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          job.estado === 'Completado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {job.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actividad Reciente */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver todas →
                  </button>
                </div>

                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 rounded-lg border ${
                      notif.leida ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notif.leida ? 'bg-gray-400' : 'bg-blue-600'
                        }`}></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{notif.titulo}</h4>
                          <p className="text-gray-600 text-xs mt-1">{notif.mensaje}</p>
                          <span className="text-xs text-gray-500 mt-2 block">{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Panel de notificaciones flotante */}
      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}