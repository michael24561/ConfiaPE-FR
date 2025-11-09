'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"
import { DollarSign, TrendingUp, BarChart2, Calendar } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Periodo = 'semana' | 'mes' | 'año'

interface IngresosStats {
  total: number;
  promedioPorTrabajo: number;
  trabajos: number;
  detalle?: { fecha: string; total: number }[];
}

export default function IngresosPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState<IngresosStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'TECNICO') {
      router.push('/Login')
      return
    }
    setUser(storedUser)
  }, [router])

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      setLoading(true)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/dashboard/ingresos?periodo=${periodo}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setStats({
            total: data.data?.total || 0,
            promedioPorTrabajo: data.data?.promedioPorTrabajo || 0,
            trabajos: data.data?.trabajos || 0,
            detalle: Array.isArray(data.data?.detalle) ? data.data.detalle : []
          })
        } else {
          setStats(null)
        }
      } catch (error) {
        console.error('Error cargando datos de ingresos:', error)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, periodo])

  const periodoLabels = {
    semana: 'Esta Semana',
    mes: 'Este Mes',
    año: 'Este Año'
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
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <DollarSign className="w-10 h-10 text-green-600" />
                Ingresos
              </h1>
              <p className="text-slate-500 text-lg">Analiza tus ganancias y el rendimiento de tu trabajo.</p>
            </div>

            {/* Tabs de período */}
            <div className="mb-6 border-b border-slate-200 bg-white rounded-t-xl">
              <div className="flex items-center gap-2 sm:gap-4 px-2">
                {(['semana', 'mes', 'año'] as Periodo[]).map((p) => (
                  <button 
                    key={p}
                    onClick={() => setPeriodo(p)} 
                    className={`px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 hover:bg-slate-50 rounded-t-lg ${
                      periodo === p 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : !stats || stats.trabajos === 0 ? (
              /* Empty State */
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200/60">
                <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                  <DollarSign className="w-16 h-16 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay datos de ingresos</h3>
                <p className="text-slate-500">Completa trabajos para ver tus estadísticas aquí.</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  <StatCard 
                    icon={DollarSign} 
                    label={`Total (${periodoLabels[periodo]})`} 
                    value={`S/ ${stats.total.toFixed(2)}`} 
                    color="green"
                    trend="+12%"
                  />
                  <StatCard 
                    icon={Briefcase} 
                    label={`Trabajos (${periodoLabels[periodo]})`} 
                    value={stats.trabajos} 
                    color="blue"
                  />
                  <StatCard 
                    icon={TrendingUp} 
                    label="Promedio / Trabajo" 
                    value={`S/ ${stats.promedioPorTrabajo.toFixed(2)}`} 
                    color="purple"
                  />
                </div>

                {/* Charts and Details */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Chart Section */}
                  <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-blue-600" />
                        Gráfico de Ingresos
                      </h3>
                      <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {periodoLabels[periodo]}
                      </span>
                    </div>
                    <div className="h-80 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                      <div className="text-center">
                        <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Gráfico próximamente</p>
                        <p className="text-sm text-slate-400 mt-1">Visualización de datos en desarrollo</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-purple-600" />
                      Desglose por Fecha
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {stats.detalle && stats.detalle.length > 0 ? (
                        stats.detalle.map((item, index) => (
                          <div 
                            key={`${item.fecha}-${index}`} 
                            className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-100 hover:shadow-md transition-all duration-200 group"
                          >
                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                              {new Date(item.fecha).toLocaleDateString('es-PE', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              S/ {item.total.toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500 font-medium">No hay detalle disponible</p>
                          <p className="text-xs text-slate-400 mt-1">Los datos aparecerán aquí cuando completes trabajos</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, color, trend }: any) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
  }

  const colorClass = colorClasses[color as keyof typeof colorClasses]

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60 hover:shadow-lg transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass.bg} ${colorClass.text} border ${colorClass.border} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
        {trend && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}