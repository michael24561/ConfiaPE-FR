'use client'
import PublicHeader from "@/components/PublicHeader"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login as loginApi, getRedirectPathByRole, saveSession } from "../../lib/auth"
import { Mail, Lock, Eye, Loader2, EyeOff, LogIn, ShieldCheck, Clock, DollarSign } from 'lucide-react'

export default function LoginPage() {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recordarme, setRecordarme] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido')
      return
    }
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const { user, tokens } = await loginApi(email, password)

      if (tipoUsuario === 'admin' && user.rol !== 'ADMIN') {
        throw new Error('No tienes permisos de administrador')
      }

      saveSession(user, tokens.accessToken, recordarme ? tokens.refreshToken : undefined)

      const to = getRedirectPathByRole(user.rol)
      router.push(to)
    } catch (err: any) {
      setError(err?.message || 'Credenciales inválidas. Por favor, verifica tu email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />
      <div className="flex flex-1 pt-20"> {/* Adjusted pt to account for header height */}
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                ¡Bienvenido de nuevo!
              </h1>
              <p className="text-slate-500">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Recordarme y Olvidé contraseña */}
              <div className="flex items-center justify-between">
                <label htmlFor="recordarme" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="recordarme"
                    type="checkbox"
                    checked={recordarme}
                    onChange={(e) => setRecordarme(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Recordarme</span>
                </label>
                <Link href="/recuperar-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Registro */}
            <p className="text-center text-slate-600 mt-6">
              ¿No tienes una cuenta?{' '}
              <Link href="/Registro" className="text-blue-600 hover:text-blue-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Right side - Image/Info */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-white max-w-lg">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Conecta con los mejores técnicos
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Accede a cientos de profesionales verificados listos para ayudarte con servicios del hogar de manera rápida, segura y confiable.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Técnicos Verificados</h3>
                  <p className="text-sm text-blue-100">Todos nuestros profesionales están certificados</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Atención Rápida</h3>
                  <p className="text-sm text-blue-100">Encuentra técnicos disponibles en minutos</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Precios Transparentes</h3>
                  <p className="text-sm text-blue-100">Sin sorpresas, precios claros desde el inicio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}