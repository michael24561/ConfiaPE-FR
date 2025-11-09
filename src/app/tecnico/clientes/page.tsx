'use client'

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"
import { Users, MessageSquare } from "lucide-react"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Cliente {
  cliente: {
    id: string;
    userId: string;
    nombre: string;
    email: string;
    telefono: string | null;
    avatarUrl: string | null;
  };
  trabajosTotal: number;
  totalGastado: number;
  ultimaInteraccion: string | null;
}

export default function ClientesPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'TECNICO') {
      router.push('/Login'); return
    }
    setUser(storedUser)
  }, [router])

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      setLoading(true)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/dashboard/clientes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success && data.data) {
          setClientes(Array.isArray(data.data.clientes) ? data.data.clientes : [])
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const filteredClientes = useMemo(() => {
    if (filter === 'frecuentes') return clientes.filter(c => c.trabajosTotal >= 2)
    if (filter === 'nuevos') return clientes.filter(c => c.trabajosTotal <= 1)
    return clientes
  }, [clientes, filter])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderTecnico onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} notifications={[]} user={user} />
      <div className="flex relative">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Mis Clientes</h1>
              <p className="text-slate-500 text-lg">Gestiona tu base de clientes y su historial.</p>
            </div>

            <div className="mb-6 border-b border-slate-200">
              <div className="flex items-center gap-4 sm:gap-6">
                <button onClick={() => setFilter('todos')} className={`px-3 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${filter === 'todos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Todos ({clientes.length})</button>
                <button onClick={() => setFilter('frecuentes')} className={`px-3 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${filter === 'frecuentes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Frecuentes</button>
                <button onClick={() => setFilter('nuevos')} className={`px-3 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${filter === 'nuevos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Nuevos</button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
            ) : filteredClientes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200/60"><Users className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-semibold text-slate-800">No hay clientes en esta vista</h3><p className="text-slate-500">Tus clientes aparecerán aquí a medida que completes trabajos.</p></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Cliente</th>
                      <th scope="col" className="px-6 py-3">Contacto</th>
                      <th scope="col" className="px-6 py-3 text-center">Trabajos</th>
                      <th scope="col" className="px-6 py-3 text-right">Total Gastado</th>
                      <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientes.map(({ cliente, trabajosTotal, totalGastado }) => (
                      <tr key={cliente.id} className="bg-white border-b hover:bg-slate-50">
                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full bg-slate-200">
                              {cliente.avatarUrl && <Image src={cliente.avatarUrl} alt={cliente.nombre} fill className="object-cover rounded-full" unoptimized />}
                            </div>
                            <span>{cliente.nombre}</span>
                          </div>
                        </th>
                        <td className="px-6 py-4">{cliente.email}</td>
                        <td className="px-6 py-4 text-center">{trabajosTotal}</td>
                        <td className="px-6 py-4 text-right font-medium">S/ {totalGastado.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => router.push(`/tecnico/chat?clienteId=${cliente.userId}`)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-md transition-colors">
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
