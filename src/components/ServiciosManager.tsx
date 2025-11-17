'use client'

import { useState } from 'react'
import { addServicio, deleteServicio } from '@/lib/tecnicoApi'
import { Loader2, Plus, Trash2, X } from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  precio?: number
}

interface Props {
  initialServicios: Servicio[]
}

export default function ServiciosManager({ initialServicios }: Props) {
  const [servicios, setServicios] = useState<Servicio[]>(initialServicios)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado para el nuevo servicio
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')

  const handleAddServicio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre) {
      setError('El nombre del servicio es obligatorio.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const nuevoServicio = await addServicio({
        nombre,
        descripcion,
        precio: precio ? parseFloat(precio) : undefined,
      })
      setServicios([...servicios, nuevoServicio])
      // Resetear formulario
      setShowForm(false)
      setNombre('')
      setDescripcion('')
      setPrecio('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteServicio = async (servicioId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return
    }
    try {
      await deleteServicio(servicioId)
      setServicios(servicios.filter(s => s.id !== servicioId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg sm:text-xl font-black text-gray-900">Mis Servicios</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg text-sm"
          >
            <Plus className="w-5 h-5" /> Agregar Servicio
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddServicio} className="mb-6 p-4 bg-slate-50 rounded-xl border space-y-4">
          <h4 className="font-bold text-gray-800">Nuevo Servicio</h4>
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio Base (Opcional)</label>
            <input
              id="precio"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="S/"
              step="0.10"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Guardar Servicio
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </form>
      )}

      {servicios.length > 0 ? (
        <div className="space-y-3">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border hover:border-gray-300">
              <div>
                <p className="font-bold text-gray-800">{servicio.nombre}</p>
                {servicio.descripcion && <p className="text-sm text-gray-600">{servicio.descripcion}</p>}
              </div>
              <div className="flex items-center gap-4">
                {servicio.precio && <p className="font-semibold text-blue-600">S/ {Number(servicio.precio).toFixed(2)}</p>}
                <button
                  onClick={() => handleDeleteServicio(servicio.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p>No has agregado ningún servicio específico.</p>
          <p className="text-sm mt-2">Haz clic en "Agregar Servicio" para empezar.</p>
        </div>
      )}
    </div>
  )
}
