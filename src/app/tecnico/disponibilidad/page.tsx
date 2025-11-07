'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const horarios = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

interface ConfigDia {
  inicio: string
  fin: string
  disponible: boolean
}

interface DisponibilidadState {
  lunes: ConfigDia
  martes: ConfigDia
  miercoles: ConfigDia
  jueves: ConfigDia
  viernes: ConfigDia
  sabado: ConfigDia
  domingo: ConfigDia
}

const disponibilidadActual: DisponibilidadState = {
  lunes: { inicio: '8:00', fin: '18:00', disponible: true },
  martes: { inicio: '8:00', fin: '18:00', disponible: true },
  miercoles: { inicio: '8:00', fin: '18:00', disponible: true },
  jueves: { inicio: '8:00', fin: '18:00', disponible: true },
  viernes: { inicio: '8:00', fin: '18:00', disponible: true },
  sabado: { inicio: '9:00', fin: '15:00', disponible: true },
  domingo: { inicio: '', fin: '', disponible: false }
}

const notifications = [
  {
    id: 1,
    tipo: "disponibilidad",
    titulo: "Cambio de horario",
    mensaje: "Se actualizó tu disponibilidad para el sábado",
    timestamp: "Hace 5 min",
    leida: false
  }
]

export default function DisponibilidadPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadState>(disponibilidadActual)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar disponibilidad del técnico
  useEffect(() => {
    const loadDisponibilidad = async () => {
      try {
        setLoading(true)
        const storedUser = getStoredUser()
        if (!storedUser || storedUser.rol !== 'TECNICO') {
          router.push('/Login')
          return
        }
        setUser(storedUser)

        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/tecnicos/me/horarios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        if (data.success && data.data) {
          // Convertir el array de horarios del backend al formato del estado
          const horariosBackend = data.data
          const newDisponibilidad: any = { ...disponibilidadActual }

          horariosBackend.forEach((horario: any) => {
            const diaKey = horario.dia.toLowerCase() as keyof DisponibilidadState
            newDisponibilidad[diaKey] = {
              inicio: horario.horaInicio,
              fin: horario.horaFin,
              disponible: horario.disponible
            }
          })

          setDisponibilidad(newDisponibilidad)
        }
      } catch (error) {
        console.error('Error cargando disponibilidad:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDisponibilidad()
  }, [router])

  const handleCambioDisponibilidad = (dia: keyof DisponibilidadState, campo: keyof ConfigDia, valor: string | boolean) => {
    setDisponibilidad(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }))
  }

  const guardarCambios = async () => {
    try {
      const token = getAccessToken()

      // Convertir el estado al formato que espera el backend
      const horariosArray = Object.entries(disponibilidad).map(([dia, config]) => ({
        dia: dia.toUpperCase(),
        horaInicio: config.inicio,
        horaFin: config.fin,
        disponible: config.disponible
      }))

      const response = await fetch(`${API_URL}/api/tecnicos/me/horarios`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ horarios: horariosArray })
      })

      const data = await response.json()
      if (data.success) {
        alert('Cambios guardados exitosamente')
      } else {
        alert('Error al guardar cambios')
      }
    } catch (error) {
      console.error('Error guardando disponibilidad:', error)
      alert('Error al guardar cambios')
    }
  }

  const restablecerCambios = () => {
    setDisponibilidad(disponibilidadActual)
    alert('Configuración restablecida')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderTecnico 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notifications={notifications}
      />

      <div className="flex">
        <TecnicoSidebar />

        <main className="flex-1 pt-20 px-4 sm:px-8 pb-8 lg:ml-72 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Disponibilidad
              </h1>
              <p className="text-gray-600 text-lg">
                Configura tus horarios de trabajo
              </p>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando disponibilidad...</p>
              </div>
            )}

            {/* Estado actual */}
            {!loading && (
              <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900">Estado Actual</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-bold">Disponible</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-1">Próxima Disponibilidad</p>
                  <p className="text-xl font-black text-green-900">Hoy 8:00 AM</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-1">Horario Actual</p>
                  <p className="text-xl font-black text-blue-900">8:00 AM - 6:00 PM</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-1">Días Activos</p>
                  <p className="text-xl font-black text-purple-900">6 días/semana</p>
                </div>
              </div>
              </div>
            )}

            {/* Configuración de horarios */}
            {!loading && (
              <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6">Configurar Horarios</h3>
              
              <div className="space-y-6">
                {diasSemana.map((dia) => {
                  const diaKey = dia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") as keyof DisponibilidadState
                  const configDia = disponibilidad[diaKey]
                  
                  return (
                    <div key={dia} className="p-4 border border-gray-200 rounded-2xl hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900">{dia}</h4>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={configDia.disponible}
                            onChange={(e) => handleCambioDisponibilidad(diaKey, 'disponible', e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700">Disponible</span>
                        </label>
                      </div>

                      {configDia.disponible && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de inicio</label>
                            <select
                              value={configDia.inicio}
                              onChange={(e) => handleCambioDisponibilidad(diaKey, 'inicio', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {horarios.map(horario => (
                                <option key={horario} value={horario}>{horario}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de fin</label>
                            <select
                              value={configDia.fin}
                              onChange={(e) => handleCambioDisponibilidad(diaKey, 'fin', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {horarios.map(horario => (
                                <option key={horario} value={horario}>{horario}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={guardarCambios}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"
                >
                  Guardar Cambios
                </button>
                <button 
                  onClick={restablecerCambios}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-2xl font-bold hover:bg-gray-400 transition-all"
                >
                  Restablecer
                </button>
              </div>
              </div>
            )}

            {/* Configuraciones adicionales */}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6">Configuraciones Especiales</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-gray-900">Emergencias 24/7</p>
                      <p className="text-sm text-gray-600">Disponible para emergencias</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-gray-900">Notificaciones Push</p>
                      <p className="text-sm text-gray-600">Recibir notificaciones de nuevos trabajos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-gray-900">Auto-Aceptar Trabajos</p>
                      <p className="text-sm text-gray-600">Aceptar automáticamente trabajos compatibles</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6">Estadísticas de Disponibilidad</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Tiempo Activo esta Semana</span>
                      <span className="font-bold text-blue-900">54 horas</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Trabajos Aceptados</span>
                      <span className="font-bold text-green-900">12/15</span>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Tiempo de Respuesta Promedio</span>
                      <span className="font-bold text-purple-900">5 minutos</span>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Disponibilidad Promedio</span>
                      <span className="font-bold text-yellow-900">85%</span>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}