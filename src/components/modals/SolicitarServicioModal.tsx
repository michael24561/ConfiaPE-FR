'use client'

import { useState } from 'react'
import { getAccessToken } from '@/lib/auth'
import { emitEvent } from '@/lib/socket' // Import socket emitter
import { X, Send, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Props {
  isOpen: boolean
  onClose: () => void
  tecnico: { id: string; nombre: string; oficio: string }
  onSuccess: () => void
}

export default function SolicitarServicioModal({ isOpen, onClose, tecnico, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    servicioNombre: tecnico.oficio,
    descripcion: '',
    direccion: '',
    telefono: '',
    fechaProgramada: ''
  })

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (formData.descripcion.length < 10) newErrors.descripcion = 'La descripción es muy corta (mín. 10 caracteres).'
    if (formData.direccion.length < 5) newErrors.direccion = 'La dirección es muy corta (mín. 5 caracteres).'
    if (!/^\+51\d{9}$/.test(formData.telefono)) newErrors.telefono = 'El formato debe ser +51999888777.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    try {
      const token = getAccessToken()
      const payload = { ...formData, tecnicoId: tecnico.id }
      if (payload.fechaProgramada) {
        payload.fechaProgramada = new Date(payload.fechaProgramada).toISOString()
      }

      const response = await fetch(`${API_URL}/api/trabajos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear la solicitud.')
      }

      // --- Real-time Notification ---
      // The backend returns the full 'trabajo' object.
      const newTrabajo = result.data 
      if (newTrabajo && newTrabajo.tecnico.userId) {
        emitEvent('cliente:solicitud_creada', {
          tecnicoUserId: newTrabajo.tecnico.userId,
          trabajo: newTrabajo,
        })
      }
      // --- End Real-time ---

      alert('Solicitud enviada exitosamente!')
      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Ocurrió un error inesperado.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Solicitar Servicio</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-600">Estás solicitando un servicio a:</p>
            <p className="font-bold text-blue-600">{tecnico.nombre} ({tecnico.oficio})</p>
          </div>

          {errors.general && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.general}</p>}

          <InputField label="Tipo de Servicio" value={formData.servicioNombre} onChange={val => setFormData(p => ({ ...p, servicioNombre: val }))} error={errors.servicioNombre} required />
          <InputField label="Descripción del Problema" type="textarea" value={formData.descripcion} onChange={val => setFormData(p => ({ ...p, descripcion: val }))} error={errors.descripcion} required placeholder="Describe el problema detalladamente..." />
          <InputField label="Dirección del Servicio" value={formData.direccion} onChange={val => setFormData(p => ({ ...p, direccion: val }))} error={errors.direccion} required placeholder="Ej: Av. Principal 123, Miraflores" />
          <InputField label="Teléfono de Contacto" value={formData.telefono} onChange={val => setFormData(p => ({ ...p, telefono: val }))} error={errors.telefono} required placeholder="+51999888777" />
          <InputField label="Fecha y Hora Preferida (Opcional)" type="datetime-local" value={formData.fechaProgramada} onChange={val => setFormData(p => ({ ...p, fechaProgramada: val }))} error={errors.fechaProgramada} />

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const InputField = ({ label, value, onChange, error, type = 'text', required = false, placeholder = '' }: any) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
        {type === 'textarea' ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} text-slate-900`}
                rows={3}
                required={required}
                placeholder={placeholder}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} text-slate-900`}
                required={required}
                placeholder={placeholder}
                min={type === 'datetime-local' ? new Date().toISOString().slice(0, 16) : undefined}
            />
        )}
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
)