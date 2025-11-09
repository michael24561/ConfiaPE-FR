'use client'

import { useState, useEffect } from "react"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { DollarSign, Star, Briefcase, Users } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Stats {
  totalIngresos: number;
  promedioCalificacion: number;
  trabajosCompletados: number;
  nuevosClientes: number;
}

interface TrabajoReciente {
  id: string;
  servicioNombre: string;
  estado: string;
  cliente: {
    user: {
      nombre: string;
    }
  }
}

export default function TecnicoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentJobs, setRecentJobs] = useState<TrabajoReciente[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const storedUser = getStoredUser()
      if (!storedUser || storedUser.rol !== 'TECNICO') {
        router.push('/Login'); return
      }
      setUser(storedUser)

      try {
        const token = getAccessToken()
        const [statsRes, jobsRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/trabajos?limit=5&page=1`, { headers: { 'Authorization': `Bearer ${token}` } })
        ])

        const statsData = await statsRes.json()
        const jobsData = await jobsRes.json()

        if (statsData.success) setStats(statsData.data)
        if (jobsData.success) setRecentJobs(jobsData.data.data || [])

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderTecnico
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => {}}
        notifications={[]}
        user={user}
      />
      <div className="flex relative">
        <TecnicoSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                ¡Hola, {user.nombre}! 👋
              </h1>
              <p className="text-slate-500 text-lg">
                Bienvenido a tu panel de control de técnico.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard icon={DollarSign} label="Ingresos del Mes" value={`S/ ${(stats?.totalIngresos || 0).toFixed(2)}`} color="green" />
              <StatCard icon={Star} label="Calificación Promedio" value={(stats?.promedioCalificacion || 0).toFixed(1)} color="yellow" />
              <StatCard icon={Briefcase} label="Trabajos Completados" value={stats?.trabajosCompletados || 0} color="blue" />
              <StatCard icon={Users} label="Nuevos Clientes" value={stats?.nuevosClientes || 0} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Resumen de Rendimiento</h3>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <p className="text-slate-500">-- Gráfico de rendimiento próximamente --</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Trabajos Recientes</h3>
                <div className="space-y-4">
                  {recentJobs.length > 0 ? recentJobs.map(job => (
                    <div key={job.id} className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">{job.servicioNombre}</p>
                        <p className="text-xs text-slate-500">con {job.cliente.user.nombre}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{job.estado}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500 text-center py-10">No hay trabajos recientes.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: number | string, color: 'green' | 'yellow' | 'blue' | 'purple' }) => {
    const colors = {
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
    }
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200/60">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    )
}