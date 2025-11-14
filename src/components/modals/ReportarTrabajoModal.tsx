'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { reportarTrabajo } from '@/lib/trabajoApi'

interface ReportarTrabajoModalProps {
  isOpen: boolean
  onClose: () => void
  trabajoId: string
  onSuccess: () => void
}

const motivosComunes = [
  'El técnico no se presentó',
  'El trabajo no se completó satisfactoriamente',
  'Disputa por el costo o la cotización',
  'Comportamiento poco profesional',
  'El cliente no responde o no da acceso',
  'Otro (especificar en la descripción)',
]

export default function ReportarTrabajoModal({
  isOpen,
  onClose,
  trabajoId,
  onSuccess,
}: ReportarTrabajoModalProps) {
  const [motivo, setMotivo] = useState(motivosComunes[0])
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!descripcion) {
      setError('Por favor, provee una descripción detallada del problema.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await reportarTrabajo(trabajoId, { motivo, descripcion })
      alert('Reporte enviado exitosamente. Un administrador revisará tu caso.')
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al enviar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Reportar un Problema</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label htmlFor="motivo" className="block text-sm font-semibold text-slate-700 mb-2">
              Motivo del Reporte
            </label>
            <select
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              disabled={loading}
            >
              {motivosComunes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción Detallada
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explica detalladamente qué ocurrió, incluyendo fechas, acuerdos, etc. Esta información ayudará al administrador a resolver el caso."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900"
              rows={6}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>

        <div className="p-5 border-t border-slate-200 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !descripcion}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Enviar Reporte
          </button>
        </div>
      </div>
    </div>
  )
}
