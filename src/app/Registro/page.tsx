'use client'
import Header from "@/components/Header"
import { useState } from "react"
import Link from "next/link"
import { request } from "../../lib/api"
import { saveSession } from "../../lib/auth"
import { useRouter } from "next/navigation"

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

  const carrerasTecnicas = [
    'Electricidad',
    'Plomería',
    'Carpintería',
    'Pintura',
    'Gasfitería',
    'Instalación de Aires Acondicionados',
    'Reparación de Electrodomésticos',
    'Cerrajería',
    'Albañilería',
    'Jardinería',
    'Limpieza Profesional',
    'Instalación de Pisos',
    'Sistemas de Seguridad',
    'Reparación de Computadoras'
  ]

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
        // Validar campos requeridos para cliente
        if (!nombreCompleto || nombreCompleto.trim().length < 3) {
          setError('El nombre completo es requerido (mínimo 3 caracteres)')
          return
        }

        console.log('Registrando cliente:', { nombreCompleto, email, telefono })

        const res = await request<{ success: boolean; data: { user: any; tokens: { accessToken: string; refreshToken: string } } }>({
          method: 'POST',
          path: '/api/auth/register/cliente',
          body: { nombreCompleto, email, telefono, password },
        })

        console.log('Cliente registrado exitosamente:', res)
        saveSession(res.data.user, res.data.tokens.accessToken, res.data.tokens.refreshToken)
        router.push('/cliente')
      } else {
        // Validar campos requeridos para técnico
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
        form.append('nombre', `${nombres} ${apellidos}`.trim()) // Backend lo separará automáticamente
        form.append('nombres', nombres) // También enviamos por separado
        form.append('apellidos', apellidos)
        form.append('dni', dni)
        if (telefono) form.append('telefono', telefono)
        if (carreraTecnica) form.append('oficio', carreraTecnica)

        // Enviar certificados uno por uno
        certificados.slice(0, 3).forEach((file) => {
          form.append('certificados', file)
        })

        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register/tecnico`
        console.log('Registrando técnico en:', url)

        const res = await fetch(url, {
          method: 'POST',
          body: form,
          credentials: 'include'
        })

        const payload = await res.json()
        console.log('Respuesta del servidor:', payload)

        if (!res.ok) {
          const errorMsg = payload?.error || payload?.message || 'Error registrando técnico'
          throw new Error(errorMsg)
        }

        // Verificar estructura de respuesta
        if (payload.success && payload.data) {
          saveSession(payload.data.user, payload.data.tokens.accessToken, payload.data.tokens.refreshToken)
          router.push('/tecnico')
        } else {
          throw new Error('Respuesta del servidor inválida')
        }
      }
    } catch (err: any) {
      console.error('Error en el registro:', err)
      setError(err?.message || 'Error en el registro. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
        <Header />
                <div className="flex flex-1 pt-24">

      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Crear cuenta
            </h1>
            <p className="text-gray-600">
              Únete a nuestra comunidad
            </p>
          </div>

          <div className="flex gap-3 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTipoUsuario('cliente')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                tipoUsuario === 'cliente'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
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
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Técnico
            </button>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {tipoUsuario === 'cliente' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Juan Pérez"
  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    DNI
                  </label>
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="12345678"
                    maxLength={8}
  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombres
                    </label>
                    <input
                      type="text"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      placeholder="Juan Carlos"
  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      placeholder="Pérez García"
  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
                    />
                  </div>
                </div>

                {/* Carrera Técnica (texto libre) */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Carrera Técnica u Oficio
      </label>
      <input
        type="text"
        value={carreraTecnica}
        onChange={(e) => setCarreraTecnica(e.target.value)}
        placeholder="Ejemplo: Electricista, Gasfitero, Carpintero..."
        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
      />
    </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ¿Tienes algún certificado?
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Máximo 3 fotos (opcional)</p>
                  
                  {certificados.length < 3 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Click para subir</span> o arrastra
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG (MAX. 5MB)</p>
                      </div>
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
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarCertificado(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+51 999 999 999"
  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-600">
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
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </div>

          <p className="text-center text-gray-600 mt-6">
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Registro Rápido</h3>
                <p className="text-sm text-blue-100">Crea tu cuenta en menos de 2 minutos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">100% Seguro</h3>
                <p className="text-sm text-blue-100">Tus datos están protegidos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sin Comisiones Ocultas</h3>
                <p className="text-sm text-blue-100">Transparencia total en cada servicio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div></div>
  )
}