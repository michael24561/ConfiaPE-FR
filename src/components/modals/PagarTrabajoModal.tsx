'use client'

import { useState } from 'react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Props {
  isOpen: boolean
  onClose: () => void
  trabajo: {
    id: string
    servicioNombre: string
    precio: number | null
    tecnico: {
      id: string
      nombres: string
      apellidos: string
    }
  }
  onSuccess: () => void
}

export default function PagarTrabajoModal({ isOpen, onClose, trabajo }: Props) {
  const [loading, setLoading] = useState(false)
  const [monto, setMonto] = useState(trabajo.precio || 0)
  const [metodoPago, setMetodoPago] = useState<'STRIPE' | 'YAPE'>('STRIPE')

  const handlePagar = async () => {
    if (monto <= 0) {
      alert('Por favor ingresa un monto válido')
      return
    }

    setLoading(true)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/pagos/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          monto,
          tecnicoId: trabajo.tecnico.id,
          servicioId: trabajo.id,
          metodoPago,
          successUrl: `${window.location.origin}/cliente/trabajos?pago=exitoso`,
          cancelUrl: `${window.location.origin}/cliente/trabajos?pago=cancelado`
        })
      })

      const data = await response.json()

      if (data.success && data.data.paymentLink) {
        // Redirigir al link de pago de Stripe
        window.location.href = data.data.paymentLink
      } else {
        alert('❌ Error: ' + (data.error || 'No se pudo generar el link de pago'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Pagar Servicio</h2>
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
          <p className="text-sm text-gray-600">Servicio:</p>
          <p className="font-bold text-gray-900">{trabajo.servicioNombre}</p>
          <p className="text-sm text-gray-600 mt-2">Técnico:</p>
          <p className="font-bold text-gray-900">
            {trabajo.tecnico.nombres} {trabajo.tecnico.apellidos}
          </p>
        </div>

        <div className="space-y-6">
          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Monto a Pagar (S/)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                S/
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold text-lg"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Puedes ajustar el monto según lo acordado con el técnico
            </p>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMetodoPago('STRIPE')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  metodoPago === 'STRIPE'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12" viewBox="0 0 60 25">
                    <path fill="#635BFF" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z"/>
                  </svg>
                  <span className={`text-sm font-semibold ${metodoPago === 'STRIPE' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Stripe
                  </span>
                  <span className="text-xs text-gray-500">Tarjeta</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('YAPE')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  metodoPago === 'YAPE'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    Y
                  </div>
                  <span className={`text-sm font-semibold ${metodoPago === 'YAPE' ? 'text-purple-600' : 'text-gray-600'}`}>
                    Yape
                  </span>
                  <span className="text-xs text-gray-500">QR/Número</span>
                </div>
              </button>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-900">S/ {monto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Comisión plataforma:</span>
              <span className="font-semibold text-gray-900">S/ 0.00</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-xl text-blue-600">S/ {monto.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Pago seguro</p>
                <p>El técnico recibirá el pago una vez que confirmes que el trabajo fue completado satisfactoriamente.</p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handlePagar}
              disabled={loading || monto <= 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pagar S/ {monto.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
