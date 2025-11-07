'use client'

import { useState } from 'react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Props {
  isOpen: boolean
  onClose: () => void
  tecnico: {
    id: string
    nombre: string
    oficio: string
  }
  onSuccess: () => void
}

interface FormErrors {
    descripcion?: string;
    direccion?: string;
    telefono?: string;
    fechaProgramada?: string;
    general?: string;
}

export default function SolicitarServicioModal({ isOpen, onClose, tecnico, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    servicioNombre: tecnico.oficio,
    descripcion: '',
    direccion: '',
    telefono: '',
    fechaProgramada: ''
  })

  // Nuevas validaciones del lado del cliente
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // 1. Validar Descripcion (asumiendo min 10 caracteres)
    if (formData.descripcion.length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres.';
      isValid = false;
    }

    // 2. Validar Dirección (asumiendo min 5 caracteres)
    if (formData.direccion.length < 5) {
      errors.direccion = 'La dirección debe tener al menos 5 caracteres.';
      isValid = false;
    }

    // 3. Validar Teléfono (usando el formato estricto que requiere el backend)
    // Asumiendo que el formato "+51XXXXXXXXX" (12 caracteres en total) es obligatorio
    const phoneRegex = /^\+\d{11}$/; 
    if (!phoneRegex.test(formData.telefono)) {
      errors.telefono = 'El formato requerido es +51XXXXXXXXX (ej: +51999888777).';
      isValid = false;
    }

    // 4. Validar Fecha Programada (si se ingresó, debe ser una fecha válida)
    if (formData.fechaProgramada && isNaN(new Date(formData.fechaProgramada).getTime())) {
      errors.fechaProgramada = 'La fecha y hora seleccionada no es válida.';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }

 // SolicitarServicioModal.tsx (Dentro de handleSubmit)

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({}); // Limpiar errores anteriores

    if (!validateForm()) {
        console.log('[Trabajos] Validación de frontend fallida.');
        return; // Detener si la validación del cliente falla
    }
    
    setLoading(true)

    try {
      const token = getAccessToken()
      const requestUrl = `${API_URL}/api/trabajos`;

      // 1. Crear el payload base
      const payload: any = {
        // Usamos los nombres de campo que se están enviando actualmente (servicioNombre, tecnicoId, etc.)
        servicioNombre: formData.servicioNombre, 
        descripcion: formData.descripcion,
        direccion: formData.direccion,
        telefono: formData.telefono,
        tecnicoId: tecnico.id,
      };

      // 2. CORRECCIÓN DE FECHA: Si existe la fecha, transformarla a formato ISO completo (UTC)
      if (formData.fechaProgramada) {
          // Crear un objeto Date a partir de la cadena 'YYYY-MM-DDThh:mm'
          const date = new Date(formData.fechaProgramada);
          
          // Verificar validez (si no se validó en el frontend)
          if (!isNaN(date.getTime())) {
              // Convertir a formato ISO 8601 (termina en 'Z'), que Zod acepta
              payload.fechaProgramada = date.toISOString(); 
          } else {
              // Si por alguna razón la fecha es inválida, se omite para no causar 400
              console.warn('[Trabajos] Fecha programada es inválida y será omitida.');
          }
      }
      // NOTA: El campo 'precio' sigue sin enviarse, lo cual resuelve el error anterior.
      
      console.log('[Trabajos] Payload a enviar:', JSON.stringify(payload, null, 2));

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      // ... (El resto del manejo de la respuesta sigue igual)
      // ...
      
    } catch (error) {
      console.error('[Trabajos] Error al enviar solicitud (NetworkError):', error)
      alert('❌ Error al enviar solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Solicitar Servicio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-100">
          <p className="text-gray-700">
            Solicitar servicio a: <strong className="text-blue-600">{tecnico.nombre}</strong>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            El técnico recibirá una notificación y podrá aceptar tu solicitud
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Servicio
            </label>
            <input
              type="text"
              value={formData.servicioNombre}
              onChange={(e) => setFormData({ ...formData, servicioNombre: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
              placeholder="Ej: Reparación eléctrica"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción del Problema *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              onBlur={validateForm} // Validar al salir del campo
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${validationErrors.descripcion ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} text-gray-900`}
              rows={4}
              required
              placeholder="Describe detalladamente el problema que necesitas solucionar..."
            />
            {validationErrors.descripcion && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.descripcion}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Mientras más detalles proporciones, mejor será la atención (Mínimo 10 caracteres)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dirección del Servicio *
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              onBlur={validateForm} // Validar al salir del campo
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${validationErrors.direccion ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} text-gray-900`}
              required
              placeholder="Ej: Av. Principal 123, Lima (Mínimo 5 caracteres)"
            />
            {validationErrors.direccion && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.direccion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teléfono de Contacto *
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              onBlur={validateForm} // Validar al salir del campo
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${validationErrors.telefono ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} text-gray-900`}
              required
              placeholder="Formato: +51XXXXXXXXX"
            />
            {validationErrors.telefono && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.telefono}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha y Hora Preferida (Opcional)
            </label>
            <input
              type="datetime-local"
              value={formData.fechaProgramada}
              onChange={(e) => setFormData({ ...formData, fechaProgramada: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              min={new Date().toISOString().slice(0, 16)}
            />
            {validationErrors.fechaProgramada && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.fechaProgramada}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar Solicitud'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}