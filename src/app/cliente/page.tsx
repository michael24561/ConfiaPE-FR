'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser } from '@/lib/auth'
 import {
  Briefcase,
  CheckCircle,
  Heart,
  MessageSquare,
  Search,
  User,
  ClipboardList,
  ChevronRight,
  Bell,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ClienteDashboard() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [stats, setStats] = useState({
    trabajosActivos: 0,
    trabajosCompletados: 0,
    tecnicosFavoritos: 0
  })
  const router = useRouter()

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Verificar autenticación
  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login')
      return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  // Cargar estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      
      try {
        const token = localStorage.getItem('accessToken')
        
        // Cargar trabajos, favoritos en paralelo
        const [trabajosRes, favoritosRes] = await Promise.all([
          fetch(`${API_URL}/api/trabajos`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/favoritos`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        const trabajosData = await trabajosRes.json()
        const favoritosData = await favoritosRes.json()

        if (trabajosData.success) {
          const trabajos = Array.isArray(trabajosData.data) ? trabajosData.data : []
          const activos = trabajos.filter((t: any) => 
            ['PENDIENTE', 'ACEPTADO', 'EN_PROGRESO'].includes(t.estado)
          ).length
          const completados = trabajos.filter((t: any) => 
            t.estado === 'COMPLETADO'
          ).length
          
          setStats(prev => ({
            ...prev,
            trabajosActivos: activos,
            trabajosCompletados: completados
          }))
        }

        if (favoritosData.success) {
          const favoritos = Array.isArray(favoritosData.data) ? favoritosData.data : []
          setStats(prev => ({
            ...prev,
            tecnicosFavoritos: favoritos.length
          }))
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      }
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

 


// ... (keep existing code until the return statement)

  if (loading) {
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
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                ¡Hola, {user?.nombre}! 👋
              </h1>
              <p className="text-slate-500 text-lg">
                Bienvenido a tu panel de control.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <StatCard
                icon={Briefcase}
                label="Trabajos Activos"
                value={stats.trabajosActivos}
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                label="Trabajos Completados"
                value={stats.trabajosCompletados}
                color="green"
              />
              <StatCard
                icon={Heart}
                label="Técnicos Favoritos"
                value={stats.tecnicosFavoritos}
                color="red"
              />
            </div>

            {/* Quick Actions & Recent Activity */}
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

// Helper components for the new design

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: number | string, color: 'blue' | 'green' | 'red' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60 flex items-center gap-6">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-7 h-7" />
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

