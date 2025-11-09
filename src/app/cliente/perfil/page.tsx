'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken, logout, saveUser } from '@/lib/auth'
import { User, Mail, Phone, Camera, LogOut, Shield, KeyRound, Save, Loader2 } from 'lucide-react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ClientePerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login'); return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser)
    saveUser(updatedUser)
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderCliente onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} notifications={[]} user={user} />
      <div className="flex relative">
        <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Mi Perfil</h1>
              <p className="text-slate-500 text-lg">Gestiona tu información personal y de seguridad.</p>
            </div>

            <div className="space-y-8">
              <ProfileHeader user={user} onProfileUpdate={handleProfileUpdate} />
              <ProfileForm user={user} onProfileUpdate={handleProfileUpdate} />
              <PasswordForm />
              <DangerZone />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// --- Helper Components ---

const ProfileHeader = ({ user, onProfileUpdate }: { user: any, onProfileUpdate: (user: any) => void }) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const token = getAccessToken()
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${API_URL}/api/auth/me/avatar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        onProfileUpdate({ ...user, avatarUrl: data.data.avatarUrl })
      } else { throw new Error(data.error || 'Error al subir avatar') }
    } catch (error) { console.error(error); alert(error instanceof Error ? error.message : 'Error al subir avatar') }
    finally { setUploading(false) }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60 flex flex-col sm:flex-row items-center gap-6">
      <div className="relative group">
        <div className="relative w-24 h-24 rounded-full bg-slate-200">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.nombre} fill className="object-cover rounded-full" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500">
              {user?.nombre?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
      </div>
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-800">{user?.nombre}</h2>
        <p className="text-slate-500">{user?.email}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Cliente</span>
      </div>
    </div>
  )
}

const ProfileForm = ({ user, onProfileUpdate }: { user: any, onProfileUpdate: (user: any) => void }) => {
  const [formData, setFormData] = useState({ nombre: user?.nombre || '', telefono: user?.telefono || '' })
  const [isSaving, setIsSaving] = useState(false)
  const hasChanged = formData.nombre !== user?.nombre || formData.telefono !== user?.telefono

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: formData.nombre, telefono: formData.telefono })
      })
      const data = await response.json()
      if (data.success) {
        onProfileUpdate({ ...user, ...data.data })
        alert('Perfil actualizado.')
      } else { throw new Error(data.error || 'Error al actualizar perfil') }
    } catch (error) { console.error(error); alert(error instanceof Error ? error.message : 'Error al actualizar perfil') }
    finally { setIsSaving(false) }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Información Personal</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField icon={User} label="Nombre Completo" value={formData.nombre} onChange={(val) => setFormData(p => ({ ...p, nombre: val }))} />
        <InputField icon={Mail} label="Email" value={user?.email} disabled />
        <InputField icon={Phone} label="Teléfono" value={formData.telefono} onChange={(val) => setFormData(p => ({ ...p, telefono: val }))} />
      </div>
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={!hasChanged || isSaving} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}

const PasswordForm = () => {
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isSaving, setIsSaving] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) { alert('Las contraseñas nuevas no coinciden.'); return }
    setIsSaving(true)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        alert('Contraseña cambiada exitosamente.')
      } else { throw new Error(data.error || 'Error al cambiar contraseña') }
    } catch (error) { console.error(error); alert(error instanceof Error ? error.message : 'Error al cambiar contraseña') }
    finally { setIsSaving(false) }
  }

  return (
    <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Cambiar Contraseña</h3>
      <div className="space-y-4">
        <InputField icon={KeyRound} type="password" label="Contraseña Actual" value={passwordData.currentPassword} onChange={(val) => setPasswordData(p => ({ ...p, currentPassword: val }))} />
        <InputField icon={KeyRound} type="password" label="Nueva Contraseña" value={passwordData.newPassword} onChange={(val) => setPasswordData(p => ({ ...p, newPassword: val }))} />
        <InputField icon={KeyRound} type="password" label="Confirmar Nueva Contraseña" value={passwordData.confirmPassword} onChange={(val) => setPasswordData(p => ({ ...p, confirmPassword: val }))} />
      </div>
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
          {isSaving ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </div>
    </form>
  )
}

const DangerZone = () => {
  const router = useRouter()
  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      logout()
      router.push('/Login')
    }
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-200/60">
      <h3 className="text-xl font-bold text-red-600 mb-2">Zona de Peligro</h3>
      <p className="text-slate-600 mb-4">Esta acción es irreversible y cerrará tu sesión en este dispositivo.</p>
      <button onClick={handleLogout} className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
        <LogOut className="w-5 h-5" />
        Cerrar Sesión
      </button>
    </div>
  )
}

const InputField = ({ icon: Icon, label, value, onChange, type = 'text', disabled = false }: any) => (
  <div>
    <label className="block text-sm font-semibold text-slate-600 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
      />
    </div>
  </div>
)
