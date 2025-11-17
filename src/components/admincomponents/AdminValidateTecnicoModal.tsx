'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface TecnicoData {
  id: string
  nombres: string
  apellidos: string
  dni: string
  email: string
  verificado: boolean
}

interface ReniecData {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  dni: string
}

interface ValidationData {
  tecnicoData: TecnicoData
  reniecData: ReniecData | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  tecnicoId: string
  onValidationComplete: (tecnicoId: string, newStatus: boolean) => void
}

export default function AdminValidateTecnicoModal({ isOpen, onClose, tecnicoId, onValidationComplete }: Props) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationData, setValidationData] = useState<ValidationData | null>(null)

  useEffect(() => {
    if (!isOpen || !tecnicoId) return

    const fetchValidationData = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/tecnicos/${tecnicoId}/validation-data`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success) {
          setValidationData(data.data)
        } else {
          throw new Error(data.error || 'Error al cargar datos de validación.')
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchValidationData()
  }, [isOpen, tecnicoId])

  const handleAction = async (actionType: 'approve' | 'reject') => {
    setSubmitting(true)
    setError(null)
    try {
      const token = getAccessToken()
      const endpoint = actionType === 'approve' ? 'approve-validation' : 'reject-validation'
      const response = await fetch(`${API_URL}/api/tecnicos/${tecnicoId}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        onValidationComplete(tecnicoId, actionType === 'approve')
        onClose()
      } else {
        throw new Error(data.error || `Error al ${actionType === 'approve' ? 'aprobar' : 'rechazar'} la validación.`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const nombresCoinciden = validationData?.reniecData && validationData.tecnicoData.nombres.toLowerCase() === validationData.reniecData.nombres.toLowerCase()
  const apellidosCoinciden = validationData?.reniecData && `${validationData.tecnicoData.apellidos || ''}`.toLowerCase() === `${validationData.reniecData.apellidoPaterno || ''} ${validationData.reniecData.apellidoMaterno || ''}`.toLowerCase().trim()
  const dniCoincide = validationData?.reniecData && validationData.tecnicoData.dni === validationData.reniecData.dni

  const datosCoinciden = nombresCoinciden && apellidosCoinciden && dniCoincide

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Validación de Técnico</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><XCircle className="w-6 h-6 text-slate-600" /></button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600">Cargando datos de validación...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 bg-red-50 border-l-4 border-red-400">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm">Asegúrate de que el DNI del técnico esté registrado correctamente y que el servicio de RENIEC esté disponible.</p>
          </div>
        ) : validationData ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 text-lg font-semibold">
              {validationData.reniecData ? (
                datosCoinciden ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                )
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
              <p>
                {validationData.reniecData ? (
                  datosCoinciden ? 'Los datos coinciden con RENIEC.' : '¡Atención! Los datos no coinciden completamente con RENIEC.'
                ) : 'No se pudieron obtener datos de RENIEC para este DNI.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-lg overflow-hidden">
              {/* Columna de Datos Registrados */}
              <div className="bg-slate-50 p-4 border-r border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3">Datos Registrados</h3>
                <p className="text-sm text-slate-600">Nombre: <span className="font-medium text-slate-800">{validationData.tecnicoData.nombres}</span></p>
                <p className="text-sm text-slate-600">Apellido: <span className="font-medium text-slate-800">{validationData.tecnicoData.apellidos}</span></p>
                <p className="text-sm text-slate-600">DNI: <span className="font-medium text-slate-800">{validationData.tecnicoData.dni}</span></p>
                <p className="text-sm text-slate-600">Email: <span className="font-medium text-slate-800">{validationData.tecnicoData.email}</span></p>
                <p className="text-sm text-slate-600">Estado: <span className={`font-medium ${validationData.tecnicoData.verificado ? 'text-green-600' : 'text-amber-600'}`}>{validationData.tecnicoData.verificado ? 'Verificado' : 'Pendiente'}</span></p>
              </div>

              {/* Columna de Datos RENIEC */}
              <div className="p-4">
                <h3 className="font-bold text-slate-800 mb-3">Datos RENIEC</h3>
                {validationData.reniecData ? (
                  <>
                    <p className="text-sm text-slate-600">Nombre: <span className={`font-medium ${nombresCoinciden ? 'text-green-600' : 'text-red-600'}`}>{validationData.reniecData.nombres}</span></p>
                    <p className="text-sm text-slate-600">Apellido Paterno: <span className={`font-medium ${apellidosCoinciden ? 'text-green-600' : 'text-red-600'}`}>{validationData.reniecData.apellidoPaterno}</span></p>
                    <p className="text-sm text-slate-600">Apellido Materno: <span className={`font-medium ${apellidosCoinciden ? 'text-green-600' : 'text-red-600'}`}>{validationData.reniecData.apellidoMaterno}</span></p>
                    <p className="text-sm text-slate-600">DNI: <span className={`font-medium ${dniCoincide ? 'text-green-600' : 'text-red-600'}`}>{validationData.reniecData.dni}</span></p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">No hay datos de RENIEC disponibles.</p>
                )}
              </div>
            </div>

            {/* Mensaje de advertencia si no coincide */}
            {!datosCoinciden && validationData.reniecData && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 text-orange-700">
                <p className="font-medium">Consideración:</p>
                <p className="text-sm">Los datos registrados por el técnico no coinciden exactamente con los de RENIEC. Por favor, revisa cuidadosamente antes de aprobar.</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => handleAction('reject')}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Rechazar
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={submitting}
                className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Aprobar
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
