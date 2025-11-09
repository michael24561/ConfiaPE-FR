'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import HeaderTecnico from '@/components/tecnicocomponents/HeaderTecnico'
import TecnicoSidebar from '@/components/tecnicocomponents/TecnicoSidebar'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function TrabajoDetallePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [trabajo, setTrabajo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { id } = params

  useEffect(() => {
    const loadTrabajo = async () => {
      try {
        setLoading(true)
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/trabajos/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.success) {
          setTrabajo(data.data)
        } else {
          setTrabajo(null)
        }
      } catch (error) {
        console.error('Error cargando trabajo:', error)
        setTrabajo(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      loadTrabajo()
    }
  }, [id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderTecnico 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notifications={[]}
      />

      <div className="flex">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={`flex-1 pt-20 px-4 sm:px-8 pb-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="max-w-4xl mx-auto">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando detalle del trabajo...</p>
              </div>
            )}

            {!loading && trabajo && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <h1 className="text-4xl font-black text-gray-900 mb-4">Detalle del Trabajo</h1>
                <p className="text-lg text-gray-600 mb-8">ID del Trabajo: {trabajo.id}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Información del Cliente</h2>
                    <p><strong>Nombre:</strong> {trabajo.cliente.user.nombre}</p>
                    <p><strong>Email:</strong> {trabajo.cliente.user.email}</p>
                    <p><strong>Teléfono:</strong> {trabajo.cliente.user.telefono}</p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Información del Trabajo</h2>
                    <p><strong>Servicio:</strong> {trabajo.titulo}</p>
                    <p><strong>Descripción:</strong> {trabajo.descripcion}</p>
                    <p><strong>Dirección:</strong> {trabajo.direccion}</p>
                    <p><strong>Estado:</strong> {trabajo.estado}</p>
                    <p><strong>Precio Estimado:</strong> S/ {trabajo.precioEstimado}</p>
                    <p><strong>Fecha de Solicitud:</strong> {trabajo.fechaSolicitud ? new Date(trabajo.fechaSolicitud).toLocaleDateString('es-ES') : 'Fecha no disponible'}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !trabajo && (
              <div className="text-center py-16">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trabajo no encontrado</h3>
                <p className="text-gray-500">No se pudo cargar la información del trabajo.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
