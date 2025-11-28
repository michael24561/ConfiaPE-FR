'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Stats {
  totales: {
    tecnicos: number
    clientes: number
    trabajos: number
    ingresosPlataforma: number
    tecnicosVerificados: number
    trabajosPendientes: number
    disputasAbiertas: number
  }
  series: {
    trabajosPorDia: Array<{ fecha: string; valor: number }>
    usuariosPorDia: Array<{ fecha: string; valor: number }>
    ingresosPorDia: Array<{ fecha: string; valor: number }>
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUserAndFetchStats = async () => {
      const storedUser = getStoredUser()
      if (!storedUser || storedUser.rol !== 'ADMIN') {
        router.push('/Login')
        return
      }

      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        } else {
          setError('Error al cargar las estadísticas')
          setStats(null)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Error de conexión al cargar las estadísticas')
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    checkUserAndFetchStats()
  }, [router])

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    link,
    subtitle
  }: {
    title: string
    value: number | string
    icon: any
    color: string
    link: string
    subtitle?: string
  }) => (
    <Link href={link}>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-200 h-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-blue-600 font-medium hover:underline">Ver detalles →</span>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-2xl shadow-lg text-white">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-blue-100 mt-2">Bienvenido al centro de comando de ConfiaPE</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Técnicos"
              value={stats.totales.tecnicos}
              icon={Users}
              color="bg-blue-500"
              link="/admin/tecnicos"
              subtitle={`${stats.totales.tecnicosVerificados} verificados`}
            />
            <StatCard
              title="Clientes"
              value={stats.totales.clientes}
              icon={Users}
              color="bg-green-500"
              link="/admin/clientes"
            />
            <StatCard
              title="Trabajos"
              value={stats.totales.trabajos}
              icon={Briefcase}
              color="bg-yellow-500"
              link="/admin/trabajos"
              subtitle={`${stats.totales.trabajosPendientes} pendientes`}
            />
            <StatCard
              title="Ingresos Plataforma"
              value={`S/ ${stats.totales.ingresosPlataforma.toFixed(2)}`}
              icon={DollarSign}
              color="bg-emerald-500"
              link="#"
            />
          </div>

          {/* Action Required Panel */}
          {(stats.totales.disputasAbiertas > 0 || stats.totales.trabajosPendientes > 0) && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-amber-900">Acción Requerida</h3>
                  <div className="mt-2 space-y-2">
                    {stats.totales.disputasAbiertas > 0 && (
                      <Link href="/admin/reportes" className="block text-amber-800 hover:text-amber-900">
                        • <span className="font-medium">{stats.totales.disputasAbiertas}</span> disputa(s) abierta(s) requieren atención
                      </Link>
                    )}
                    {stats.totales.trabajosPendientes > 0 && (
                      <Link href="/admin/trabajos" className="block text-amber-800 hover:text-amber-900">
                        • <span className="font-medium">{stats.totales.trabajosPendientes}</span> trabajo(s) pendiente(s) de revisión
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users Growth Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Nuevos Usuarios (30 días)</h3>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.series.usuariosPorDia}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Usuarios"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Jobs Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Trabajos Solicitados (30 días)</h3>
                <Activity className="w-5 h-5 text-yellow-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.series.trabajosPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Bar dataKey="valor" fill="#eab308" radius={[8, 8, 0, 0]} name="Trabajos" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Ingresos de la Plataforma (30 días)</h3>
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.series.ingresosPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any) => [`S/ ${value.toFixed(2)}`, 'Ingresos']}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Ingresos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Técnicos Verificados</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totales.tecnicosVerificados}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Trabajos Pendientes</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totales.trabajosPendientes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Disputas Abiertas</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totales.disputasAbiertas}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
