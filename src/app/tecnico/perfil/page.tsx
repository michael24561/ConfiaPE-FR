'use client'

import { useState, useEffect, useRef } from "react"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { me, getAccessToken } from "../../../lib/auth"
import { useRouter } from "next/navigation"
import ServiciosManager from "@/components/ServiciosManager"
import GestionCertificados from "@/components/tecnicocomponents/GestionCertificados"
import { User, Shield, Key, Camera, Edit2, Check, X } from 'lucide-react'

interface TecnicoProfile {
  nombres: string
  apellidos: string
  oficio: string
  descripcion: string
  ubicacion: string
  disponible: boolean
  experienciaAnios?: number
}

interface Certificado {
  id: string
  nombre: string
  institucion: string | null
  imagenUrl: string
  fechaObtencion: string | null
  createdAt: string
}

const notifications = [
  {
    id: 1,
    tipo: "perfil",
    titulo: "Actualización de perfil",
    mensaje: "Tu perfil ha sido actualizado exitosamente",
    timestamp: "Hace 5 min",
    leida: false
  }
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function PerfilPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState<'perfil' | 'credenciales' | 'cuenta'>('perfil')

  // Edit states
  const [editingInfo, setEditingInfo] = useState(false)
  const [editingAbout, setEditingAbout] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [tecnicoData, setTecnicoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const router = useRouter()

  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Form data
  const [formData, setFormData] = useState<TecnicoProfile>({
    nombres: '',
    apellidos: '',
    oficio: '',
    descripcion: '',
    ubicacion: '',
    disponible: true,
    experienciaAnios: 0,
  })

  // Cargar datos del usuario y técnico
  const loadUserData = async () => {
    try {
      // Don't set loading to true if we are just refreshing data (e.g. after update)
      if (!tecnicoData) setLoading(true)
      setError(null)

      // Obtener datos del usuario autenticado
      const userData = await me()
      setUser(userData)

      // Obtener token de autenticación
      const token = getAccessToken()

      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Cargar datos del técnico desde la API
      const response = await fetch(`${API_URL}/api/tecnicos/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const tecnico = result.success ? result.data : result

      setTecnicoData(tecnico)

      // Cargar certificados si existen
      if (tecnico.certificados) {
        setCertificados(tecnico.certificados)
      }
      if (tecnico.servicios) {
        setServicios(tecnico.servicios)
      }

      // Inicializar formulario con datos actuales
      setFormData({
        nombres: tecnico.nombres || '',
        apellidos: tecnico.apellidos || '',
        oficio: tecnico.oficio || '',
        descripcion: tecnico.descripcion || '',
        ubicacion: tecnico.ubicacion || '',
        disponible: tecnico.disponible !== undefined ? tecnico.disponible : true,
        experienciaAnios: tecnico.experienciaAnios || 0,
      })

    } catch (err: any) {
      console.error('Error cargando datos:', err)
      setError(err?.message || 'Error cargando perfil')
      // Si hay error de autenticación, redirigir al login
      if (err?.message?.includes('autenticación') || err?.message?.includes('sesión')) {
        router.push('/Login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [router])

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB')
      return
    }

    // Mostrar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Subir avatar
    await handleAvatarUpload(file)
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true)
      setError(null)

      const token = getAccessToken()
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/api/auth/me/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al subir el avatar')
      }

      const result = await response.json()
      const updatedUser = result.success ? result.data.user : result.user

      // Actualizar usuario en estado
      setUser((prev: any) => ({ ...prev, avatarUrl: updatedUser.avatarUrl }))
      setSuccessMessage('✅ Avatar actualizado exitosamente')

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err: any) {
      console.error('Error subiendo avatar:', err)
      setError(err?.message || 'Error al subir el avatar')
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleGuardar = async (section: 'info' | 'about' | 'availability') => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      // Validaciones básicas
      if (section === 'info' && (!formData.nombres?.trim() || !formData.apellidos?.trim())) {
        setError('Los nombres y apellidos son obligatorios')
        setSaving(false)
        return
      }

      // Obtener token
      const token = getAccessToken()

      if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión nuevamente.')
        router.push('/Login')
        setSaving(false)
        return
      }

      // Preparar datos para enviar
      const dataToSend: any = {}

      if (section === 'info') {
        dataToSend.nombres = formData.nombres.trim()
        dataToSend.apellidos = formData.apellidos.trim()
        if (formData.oficio?.trim()) dataToSend.oficio = formData.oficio.trim()
        if (formData.ubicacion?.trim()) dataToSend.ubicacion = formData.ubicacion.trim()
        if (formData.experienciaAnios && formData.experienciaAnios > 0) dataToSend.experienciaAnios = formData.experienciaAnios
      }

      if (section === 'about') {
        if (formData.descripcion?.trim()) dataToSend.descripcion = formData.descripcion.trim()
      }

      if (section === 'availability') {
        dataToSend.disponible = formData.disponible
      }

      const response = await fetch(`${API_URL}/api/tecnicos/me`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.error || result.message || 'Error al actualizar perfil'
        throw new Error(errorMsg)
      }

      // Actualizar datos locales
      const updatedTecnico = result.success ? result.data : result
      setTecnicoData(updatedTecnico)

      setSuccessMessage('✅ Perfil actualizado exitosamente')

      if (section === 'info') setEditingInfo(false)
      if (section === 'about') setEditingAbout(false)

      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err: any) {
      console.error('Error guardando perfil:', err)
      setError(err?.message || 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelar = (section: 'info' | 'about') => {
    if (section === 'info') setEditingInfo(false)
    if (section === 'about') setEditingAbout(false)

    setError(null)
    setSuccessMessage(null)

    // Restaurar datos originales
    if (tecnicoData) {
      setFormData(prev => ({
        ...prev,
        nombres: tecnicoData.nombres || '',
        apellidos: tecnicoData.apellidos || '',
        oficio: tecnicoData.oficio || '',
        ubicacion: tecnicoData.ubicacion || '',
        experienciaAnios: tecnicoData.experienciaAnios || 0,
        descripcion: tecnicoData.descripcion || '',
      }))
    }
  }

  const handleInputChange = (field: keyof TecnicoProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle availability toggle immediately
  const handleAvailabilityToggle = async (checked: boolean) => {
    handleInputChange('disponible', checked)
    // We need to wait for state update or pass the value directly
    // Since setState is async, let's call API directly with new value
    try {
      const token = getAccessToken()
      if (!token) return

      const response = await fetch(`${API_URL}/api/tecnicos/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ disponible: checked })
      })

      if (response.ok) {
        setSuccessMessage(`✅ Ahora estás ${checked ? 'disponible' : 'no disponible'}`)
        setTimeout(() => setSuccessMessage(null), 3000)
        // Update local data to match
        setTecnicoData((prev: any) => ({ ...prev, disponible: checked }))
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      // Revert state on error
      handleInputChange('disponible', !checked)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !tecnicoData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No se pudo cargar el perfil</p>
          <button
            onClick={() => router.push('/Login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ir al Login
          </button>
        </div>
      </div>
    )
  }

  const nombreCompleto = `${formData.nombres} ${formData.apellidos}`.trim()
  const iniciales = nombreCompleto ? nombreCompleto.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <HeaderTecnico
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notifications={notifications}
        user={user}
      />
      <div className="flex relative">
        <TecnicoSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">

            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
              <p className="text-slate-500 mt-1">Gestiona tu información personal y profesional</p>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-green-700 font-medium flex items-center gap-2">
                  <Check className="w-5 h-5" /> {successMessage}
                </p>
              </div>
            )}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-red-700 font-medium flex items-center gap-2">
                  <X className="w-5 h-5" /> {error}
                </p>
              </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {avatarPreview || user.avatarUrl ? (
                      <img src={avatarPreview || user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                        {iniciales}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">{nombreCompleto}</h2>
                  <p className="text-blue-600 font-medium text-lg">{formData.oficio || 'Técnico'}</p>
                  <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                    {formData.ubicacion || 'Sin ubicación'}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 text-sm">Estado:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.disponible}
                          onChange={(e) => handleAvailabilityToggle(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        <span className="ml-2 text-sm font-medium text-slate-700">
                          {formData.disponible ? 'Disponible' : 'No disponible'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-center">
                  <div className="px-4 py-2 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-700">{tecnicoData.trabajosCompletados || 0}</p>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Trabajos</p>
                  </div>
                  <div className="px-4 py-2 bg-yellow-50 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-700">{Number(tecnicoData.calificacionPromedio || 0).toFixed(1)}</p>
                    <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('perfil')}
                className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'perfil'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Perfil Público
                </div>
              </button>
              <button
                onClick={() => setActiveTab('credenciales')}
                className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'credenciales'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Credenciales y Servicios
                </div>
              </button>
              {/* <button
                    onClick={() => setActiveTab('cuenta')}
                    className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === 'cuenta' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Cuenta
                    </div>
                </button> */}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">

              {/* PERFIL PUBLICO TAB */}
              {activeTab === 'perfil' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                  {/* Personal Info Section */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900">Información Personal</h3>
                      {!editingInfo ? (
                        <button
                          onClick={() => setEditingInfo(true)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" /> Editar
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelar('info')}
                            className="text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-medium"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleGuardar('info')}
                            disabled={saving}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombres</label>
                        {editingInfo ? (
                          <input
                            type="text"
                            value={formData.nombres}
                            onChange={(e) => handleInputChange('nombres', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-900">{formData.nombres}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Apellidos</label>
                        {editingInfo ? (
                          <input
                            type="text"
                            value={formData.apellidos}
                            onChange={(e) => handleInputChange('apellidos', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-900">{formData.apellidos}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Oficio / Especialidad</label>
                        {editingInfo ? (
                          <input
                            type="text"
                            value={formData.oficio}
                            onChange={(e) => handleInputChange('oficio', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-900">{formData.oficio || '-'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Ubicación</label>
                        {editingInfo ? (
                          <input
                            type="text"
                            value={formData.ubicacion}
                            onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-900">{formData.ubicacion || '-'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Años de Experiencia</label>
                        {editingInfo ? (
                          <input
                            type="number"
                            value={formData.experienciaAnios}
                            onChange={(e) => handleInputChange('experienciaAnios', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-900">{formData.experienciaAnios} años</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <p className="text-slate-900">{user.email}</p>
                        <p className="text-xs text-slate-400 mt-1">No editable</p>
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900">Sobre Mí</h3>
                      {!editingAbout ? (
                        <button
                          onClick={() => setEditingAbout(true)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" /> Editar
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelar('about')}
                            className="text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-medium"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleGuardar('about')}
                            disabled={saving}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      )}
                    </div>

                    {editingAbout ? (
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        placeholder="Describe tu experiencia, habilidades y lo que ofreces a tus clientes..."
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {formData.descripcion || 'Sin descripción. Agrega una descripción para que los clientes te conozcan mejor.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* CREDENCIALES TAB */}
              {activeTab === 'credenciales' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

                  {/* Services Manager */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <ServiciosManager initialServicios={servicios} />
                  </div>

                  {/* Certificates Manager */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <GestionCertificados
                      certificados={certificados}
                      onUpdate={loadUserData}
                    />
                  </div>
                </div>
              )}

              {/* CUENTA TAB (Placeholder for now) */}
              {activeTab === 'cuenta' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Configuración de Cuenta</h3>
                  <p className="text-slate-500">Próximamente: Cambio de contraseña y configuración de notificaciones.</p>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
