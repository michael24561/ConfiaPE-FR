'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/auth'
import { emitEvent } from '@/lib/socket'
import { X, Send, Loader2, AlertCircle, Clock } from 'lucide-react'
import SmartCalendar from '../clientecomponents/SmartCalendar'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Props {
  isOpen: boolean
  onClose: () => void
  tecnico: { id: string; nombre: string; oficio: string }
  onSuccess: () => void
}

// --- Form State and Validation ---
const initialFormData = {
  servicioNombre: '',
  descripcion: '',
  direccion: '',
  telefono: '',
  fechaProgramada: '',
}

export default function SolicitarServicioModal({ isOpen, onClose, tecnico, onSuccess }: Props) {
  const [formData, setFormData] = useState({ ...initialFormData, servicioNombre: tecnico.oficio })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  // Reset form when modal opens/closes or technician changes
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...initialFormData, servicioNombre: tecnico.oficio })
      setErrors({})
      setTouched({})
      setGeneralError(null)
    }
  }, [isOpen, tecnico])

  const validateField = (name: string, value: string) => {
    let error = ''
    switch (name) {
      case 'servicioNombre':
        if (!value.trim()) error = 'El tipo de servicio es obligatorio.'
        break
      case 'descripcion':
        if (value.trim().length < 10) error = 'La descripción debe tener al menos 10 caracteres.'
        break
      case 'direccion':
        if (value.trim().length < 5) error = 'La dirección debe tener al menos 5 caracteres.'
        break
      case 'telefono':
        // Mask format: 999 999 999. Remove spaces/underscores to check length.
        const digits = value.replace(/[\s_]/g, '')
        if (digits.length !== 9) error = 'El teléfono debe tener 9 dígitos.'
        break
      case 'fechaProgramada':
        if (value) {
          const selectedDate = new Date(value)
          const now = new Date()
          if (selectedDate <= now) error = 'La fecha y hora deben ser en el futuro.'
        }
        break
    }
    return error
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Real-time validation if touched
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    // Validate all fields
    const newErrors: Record<string, string> = {}
    let valid = true
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData]
      const error = validateField(key, value)
      if (error) {
        newErrors[key] = error
        valid = false
      }
    })
    setErrors(newErrors)
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

    if (!valid) return

    setLoading(true)
    try {
      const token = getAccessToken()
      const phoneDigits = formData.telefono.replace(/\s/g, '')

      const payload = {
        ...formData,
        tecnicoId: tecnico.id,
        telefono: `+51${phoneDigits}`,
        fechaProgramada: formData.fechaProgramada
          ? new Date(formData.fechaProgramada).toISOString()
          : undefined,
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

      const newTrabajo = result.data
      if (newTrabajo && newTrabajo.tecnico.userId) {
        emitEvent('cliente:solicitud_creada', {
          tecnicoUserId: newTrabajo.tecnico.userId,
          trabajo: newTrabajo,
        })
      }

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      setGeneralError(error instanceof Error ? error.message : 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Solicitar Servicio</h2>
            <p className="text-sm text-slate-500">Completa los detalles para {tecnico.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/80 text-slate-500 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {generalError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{generalError}</p>
            </div>
          )}

          <InputField
            label="Tipo de Servicio"
            value={formData.servicioNombre}
            onChange={val => handleInputChange('servicioNombre', val)}
            onBlur={() => handleBlur('servicioNombre')}
            error={errors.servicioNombre}
            touched={touched.servicioNombre}
            required
          />

          <InputField
            label="Descripción del Problema"
            type="textarea"
            value={formData.descripcion}
            onChange={val => handleInputChange('descripcion', val)}
            onBlur={() => handleBlur('descripcion')}
            error={errors.descripcion}
            touched={touched.descripcion}
            required
            placeholder="Describe el problema detalladamente..."
          />

          <InputField
            label="Dirección del Servicio"
            value={formData.direccion}
            onChange={val => handleInputChange('direccion', val)}
            onBlur={() => handleBlur('direccion')}
            error={errors.direccion}
            touched={touched.direccion}
            required
            placeholder="Ej: Av. Principal 123, Miraflores"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Teléfono de Contacto"
              type="tel"
              value={formData.telefono}
              onChange={val => handleInputChange('telefono', val)}
              onBlur={() => handleBlur('telefono')}
              error={errors.telefono}
              touched={touched.telefono}
              required
              placeholder="999 999 999"
            />

          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 ml-1">
              Fecha y Hora Preferida
            </label>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <SmartCalendar
                tecnicoId={tecnico.id}
                onSelect={(date, time) => {
                  const [hours, minutes] = time.split(':').map(Number)
                  const newDate = new Date(date)
                  newDate.setHours(hours, minutes)
                  handleInputChange('fechaProgramada', newDate.toISOString())
                  setErrors(prev => ({ ...prev, fechaProgramada: '' }))
                }}
              />
              {formData.fechaProgramada && (
                <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in">
                  <Clock className="w-4 h-4" />
                  Seleccionado: {new Date(formData.fechaProgramada).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
              )}
              {errors.fechaProgramada && (
                <p className="text-xs font-medium text-red-600 mt-2 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fechaProgramada}
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- InputField Component ---
interface InputFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  onBlur: () => void
  error?: string
  touched?: boolean
  type?: 'text' | 'textarea' | 'tel' | 'datetime-local'
  required?: boolean
  placeholder?: string
}

const InputField = ({ label, value, onChange, onBlur, error, touched, type = 'text', required = false, placeholder = '' }: InputFieldProps) => {
  const hasError = touched && error

  const baseInputClass = `w-full px-4 py-2.5 border rounded-xl transition-all duration-200 outline-none
    ${hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30'
      : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white hover:border-slate-300'
    } text-slate-900 placeholder:text-slate-400`

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={baseInputClass}
          rows={3}
          placeholder={placeholder}
        />
      ) : type === 'tel' ? (
        <input
          type="tel"
          value={value}
          onChange={(e) => {
            // Format phone number as "999 999 999"
            const input = e.target.value.replace(/\D/g, '') // Remove non-digits
            let formatted = ''
            if (input.length > 0) {
              formatted = input.substring(0, 3)
              if (input.length > 3) {
                formatted += ' ' + input.substring(3, 6)
              }
              if (input.length > 6) {
                formatted += ' ' + input.substring(6, 9)
              }
            }
            onChange(formatted)
          }}
          onBlur={onBlur}
          className={baseInputClass}
          placeholder={placeholder}
          maxLength={11} // "999 999 999" = 11 characters with spaces
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={baseInputClass}
          type={type}
          min={type === 'datetime-local' ? new Date().toISOString().slice(0, 16) : undefined}
          placeholder={placeholder}
        />
      )}

      {hasError && (
        <p className="text-xs font-medium text-red-600 mt-1.5 ml-1 flex items-center gap-1 animate-in slide-in-from-top-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}