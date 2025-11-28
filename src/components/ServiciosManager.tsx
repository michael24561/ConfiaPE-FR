'use client'

import { useState } from 'react'
import { addServicio, deleteServicio } from '@/lib/tecnicoApi'
import { Loader2, Plus, Trash2, X, Briefcase, DollarSign, FileText } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Mis Servicios</h3>
          <p className="text-slate-500 text-sm">Define los servicios que ofreces a tus clientes</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Servicio</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
          <p>{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 text-lg">Agregar Nuevo Servicio</h4>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddServicio} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del Servicio *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                  placeholder="Ej: Instalación de Tomacorrientes"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white resize-none"
                  placeholder="Detalla qué incluye este servicio..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="precio" className="block text-sm font-semibold text-slate-700 mb-1.5">Precio Base (Opcional)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="precio"
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                  placeholder="0.00"
                  step="0.10"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Guardar Servicio
              </button>
            </div>
          </form>
        </div>
      )}

      {servicios.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-200 flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-lg">{servicio.nombre}</h4>
                  {servicio.precio && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      S/ {Number(servicio.precio).toFixed(2)}
                    </span>
                  )}
                </div>
                {servicio.descripcion && <p className="text-slate-600 text-sm leading-relaxed">{servicio.descripcion}</p>}
              </div>
              <button
                onClick={() => handleDeleteServicio(servicio.id)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Eliminar servicio"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No tienes servicios registrados</p>
            <button onClick={() => setShowForm(true)} className="text-blue-600 text-sm font-semibold mt-2 hover:underline">
              Agregar el primero
            </button>
          </div>
        )
      )}
    </div>
  )
}
