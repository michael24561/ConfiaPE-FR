'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import {
  Briefcase,
  CheckCircle,
  Loader2,
  ClipboardList,
  ChevronRight,
  Bell,
  Search,
  MessageSquare,
  User,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ClienteDashboard() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSolicitudes: 0,
    trabajosEnProgreso: 0,
    trabajosCompletados: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login')
      return
    }
    setUser(storedUser)
  }, [router])

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      setLoading(true)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/dashboard/cliente-stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const result = await response.json()

        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (!user || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderCliente
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => {}}
        notifications={[]}
        user={user}
      />

      <div className="flex relative">
        <ClienteSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main
          className={`flex-1 pt-20 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
          }`}
        >
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                ¡Hola, {user?.nombre}! 👋
              </h1>
              <p className="text-slate-500 text-lg">
                Bienvenido a tu panel de control.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <StatCard
                icon={Briefcase}
                label="Solicitudes Totales"
                value={stats.totalSolicitudes}
                color="blue"
              />
              <StatCard
                icon={Loader2}
                label="Trabajos en Progreso"
                value={stats.trabajosEnProgreso}
                color="purple"
              />
              <StatCard
                icon={CheckCircle}
                label="Trabajos Completados"
                value={stats.trabajosCompletados}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Accesos Rápidos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <QuickActionButton
                    icon={Search}
                    title="Buscar Técnicos"
                    description="Encuentra al profesional ideal."
                    onClick={() => router.push('/cliente/buscar')}
                  />
                  <QuickActionButton
                    icon={ClipboardList}
                    title="Mis Trabajos"
                    description="Revisa tus solicitudes."
                    onClick={() => router.push('/cliente/trabajos')}
                  />
                  <QuickActionButton
                    icon={MessageSquare}
                    title="Mensajes"
                    description="Comunícate con técnicos."
                    onClick={() => router.push('/cliente/chat')}
                  />
                  <QuickActionButton
                    icon={User}
                    title="Mi Perfil"
                    description="Actualiza tu información."
                    onClick={() => router.push('/cliente/perfil')}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Actividad Reciente
                </h2>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium mb-1">
                      Sin notificaciones nuevas
                    </p>
                    <p className="text-sm text-slate-500">
                      Tu actividad reciente aparecerá aquí.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: number | string, color: 'blue' | 'green' | 'purple' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60 flex items-center gap-6">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className={`w-7 h-7 ${value > 0 && color === 'purple' ? 'animate-spin' : ''}`} />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}

const QuickActionButton = ({ icon: Icon, title, description, onClick }: { icon: React.ElementType, title: string, description: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="group bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 text-left flex items-center gap-6"
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors duration-200">
      <Icon className="w-6 h-6 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
  </button>
)