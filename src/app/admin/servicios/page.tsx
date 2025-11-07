'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AdminServiciosPage() {
  const [servicios, setServicios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/admin/servicios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.success) {
          setServicios(data.data)
        } else {
          setServicios([])
        }
      } catch (error) {
        console.error('Error fetching services:', error)
        setServicios([])
      } finally {
        setLoading(false)
      }
    }
    fetchServicios()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Servicios</h1>
      {loading ? (
        <p>Cargando servicios...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {servicios.map(servicio => (
                <tr key={servicio.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{servicio.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{servicio.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
