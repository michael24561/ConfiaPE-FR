'use client'
import PublicHeader from "@/components/PublicHeader"
import { useState } from "react"
import Link from "next/link"
import { request } from "../../lib/api"
import { saveSession } from "../../lib/auth"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Phone, User, IdCard, Briefcase, UploadCloud, CheckSquare, Loader2, DollarSign, X } from 'lucide-react'

export default function RegistroPage() {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false)
  const [tipoUsuario, setTipoUsuario] = useState<'cliente' | 'tecnico'>('cliente')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  
  const [dni, setDni] = useState('')
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [carreraTecnica, setCarreraTecnica] = useState('')
  const [certificados, setCertificados] = useState<File[]>([])
  
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCertificadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files)
      const totalArchivos = [...certificados, ...nuevosArchivos].slice(0, 3)
      setCertificados(totalArchivos)
    }
  }

  const eliminarCertificado = (index: number) => {
    setCertificados(certificados.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones')
      return
    }
    setLoading(true)
    try {
      if (tipoUsuario === 'cliente') {
        if (!nombreCompleto || nombreCompleto.trim().length < 3) {
          setError('El nombre completo es requerido (mínimo 3 caracteres)')
          return
        }

        const res = await request<{ success: boolean; data: { user: any; tokens: { accessToken: string; refreshToken: string } } }> ({
          method: 'POST',
          path: '/api/auth/register/cliente',
          body: { nombreCompleto, email, telefono, password },
        })

        saveSession(res.data.user, res.data.tokens.accessToken, res.data.tokens.refreshToken)
        router.push('/cliente')
      } else {
        if (!dni || dni.trim().length < 8) {
          setError('El DNI es requerido y debe tener al menos 8 dígitos')
          return
        }
        if (!nombres || !apellidos) {
          setError('Nombres y apellidos son requeridos')
          return
        }

        const form = new FormData()
        form.append('email', email)
        form.append('password', password)
        form.append('nombre', `${nombres} ${apellidos}`.trim())
        form.append('nombres', nombres)
        form.append('apellidos', apellidos)
        form.append('dni', dni)
        if (telefono) form.append('telefono', telefono)
        if (carreraTecnica) form.append('oficio', carreraTecnica)

        certificados.slice(0, 3).forEach((file) => {
          form.append('certificados', file)
        })

        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register/tecnico`

        const res = await fetch(url, {
          method: 'POST',
          body: form,
          credentials: 'include'
        })

        const payload = await res.json()

        if (!res.ok) {
          const errorMsg = payload?.error || payload?.message || 'Error registrando técnico'
          throw new Error(errorMsg)
        }

        if (payload.success && payload.data) {
          saveSession(payload.data.user, payload.data.tokens.accessToken, payload.data.tokens.refreshToken)
          router.push('/tecnico')
        } else {
          throw new Error('Respuesta del servidor inválida')
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Error en el registro. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />
      <div className="flex flex-1 pt-20">
        <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Crear cuenta
              </h1>
              <p className="text-slate-500">
                Únete a nuestra comunidad
              </p>
            </div>

            <div className="flex gap-3 mb-6 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTipoUsuario('cliente')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  tipoUsuario === 'cliente'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => setTipoUsuario('tecnico')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  tipoUsuario === 'tecnico'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Técnico
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
                  {error}
                </div>
              )}
              {tipoUsuario === 'cliente' ? (
                <div>
                  <label htmlFor="nombreCompleto" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="nombreCompleto"
                      type="text"
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="dni" className="block text-sm font-semibold text-slate-700 mb-2">
                      DNI
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="dni"
                        type="text"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        placeholder="12345678"
                        maxLength={8}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="nombres" className="block text-sm font-semibold text-slate-700 mb-2">
                        Nombres
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="nombres"
                          type="text"
                          value={nombres}
                          onChange={(e) => setNombres(e.target.value)}
                          placeholder="Juan Carlos"
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="apellidos" className="block text-sm font-semibold text-slate-700 mb-2">
                        Apellidos
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="apellidos"
                          type="text"
                          value={apellidos}
                          onChange={(e) => setApellidos(e.target.value)}
                          placeholder="Pérez García"
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="carreraTecnica" className="block text-sm font-semibold text-slate-700 mb-2">
                      Carrera Técnica u Oficio
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="carreraTecnica"
                        type="text"
                        value={carreraTecnica}
                        onChange={(e) => setCarreraTecnica(e.target.value)}
                        placeholder="Ej: Electricista, Gasfitero, Carpintero..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Certificados (Máx. 3)
                    </label>
                    {certificados.length < 3 && (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                        <p className="text-sm text-slate-500">
                          <span className="font-semibold">Click para subir</span> o arrastra
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleCertificadoChange}
                        />
                      </label>
                    )}

                    {certificados.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {certificados.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                              <img src={URL.createObjectURL(file)} alt="Certificado" className="w-8 h-8 object-cover rounded" />
                              <span className="text-sm text-slate-700 truncate max-w-[150px]">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarCertificado(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

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

              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+51 999 999 999"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    required
                  />
                </div>
              </div>

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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={mostrarConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={mostrarConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {mostrarConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label htmlFor="aceptaTerminos" className="text-sm text-slate-700">
                  Acepto los{' '}
                  <Link href="/terminos" className="text-blue-600 hover:text-blue-700 font-semibold">
                    términos y condiciones
                  </Link>
                  {' '}y la{' '}
                  <Link href="/privacidad" className="text-blue-600 hover:text-blue-700 font-semibold">
                    política de privacidad
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            <p className="text-center text-slate-600 mt-6">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/Login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-white max-w-lg">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              {tipoUsuario === 'cliente' 
                ? 'Encuentra el técnico perfecto para ti'
                : '¡Únete como técnico profesional!'}
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              {tipoUsuario === 'cliente'
                ? 'Regístrate y accede a una red de profesionales verificados listos para ayudarte.'
                : 'Ofrece tus servicios a miles de clientes que necesitan tu experiencia.'}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Registro Rápido</h3>
                  <p className="text-sm text-blue-100">Crea tu cuenta en menos de 2 minutos</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">100% Seguro</h3>
                  <p className="text-sm text-blue-100">Tus datos están protegidos</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Sin Comisiones Ocultas</h3>
                  <p className="text-sm text-blue-100">Transparencia total en cada servicio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}