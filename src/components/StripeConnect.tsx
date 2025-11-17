'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  getStripeAccountStatus,
  createStripeConnectAccount,
  createStripeAccountLink,
} from '@/lib/stripeApi'
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export default function StripeConnect() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const accountStatus = await getStripeAccountStatus()
      setStatus(accountStatus)
    } catch (err: any) {
      // Si el error es 404, significa que no tiene cuenta, lo cual es un estado válido.
      if (err.message.includes('404') || err.message.includes('No se encontró')) {
        setStatus(null)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Si volvemos de Stripe, refrescamos el estado.
    if (searchParams.get('stripe_return') || searchParams.get('stripe_refresh')) {
      fetchStatus()
      // Limpiar la URL
      router.replace('/tecnico/perfil')
    } else {
      fetchStatus()
    }
  }, [searchParams, router])

  const handleConnect = async () => {
    setActionLoading(true)
    setError(null)
    try {
      // Primero, crea o recupera la cuenta de Stripe Connect
      const { stripeAccountId } = await createStripeConnectAccount()
      if (!stripeAccountId) {
        throw new Error('No se pudo obtener el ID de la cuenta de Stripe.')
      }
      // Luego, crea el link de onboarding
      const { url } = await createStripeAccountLink(stripeAccountId)
      // Redirige al usuario a Stripe
      window.location.href = url
    } catch (err: any) {
      setError(err.message)
      setActionLoading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-5 h-5 animate-spin" /> Cargando estado de la cuenta...</div>
    }

    if (error) {
      return <div className="text-red-600 font-medium">⚠️ Error: {error}</div>
    }

    if (status?.onboardingComplete) {
      return (
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-bold text-green-700">¡Tu cuenta de pagos está activa!</p>
            <p className="text-sm text-gray-600">Ya puedes recibir pagos por tus trabajos completados.</p>
          </div>
        </div>
      )
    }

    if (status?.detailsSubmitted) {
      return (
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <div>
            <p className="font-bold text-yellow-700">Verificación de cuenta pendiente</p>
            <p className="text-sm text-gray-600">Stripe está revisando tu información. Esto puede tardar unos minutos.</p>
          </div>
        </div>
      )
    }

    // Si tiene cuenta pero no ha completado el onboarding
    if (status?.stripeAccountId) {
      return (
        <div>
          <p className="font-medium text-gray-800 mb-2">Casi listo. Debes completar tu registro en Stripe para poder recibir pagos.</p>
          <button
            onClick={handleConnect}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
            {actionLoading ? 'Generando link...' : 'Continuar registro en Stripe'}
          </button>
        </div>
      )
    }

    // Estado inicial, sin cuenta
    return (
      <div>
        <p className="font-medium text-gray-800 mb-2">Conecta tu cuenta de Stripe para recibir pagos de forma segura por tus trabajos.</p>
        <button
          onClick={handleConnect}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
          {actionLoading ? 'Generando link...' : 'Conectar con Stripe'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
      <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-4">Cuenta de Pagos</h3>
      {renderContent()}
    </div>
  )
}
