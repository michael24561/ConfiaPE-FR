'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import TecnicoCard from '@/components/TecnicoCard'
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Tecnico {
  id: string
  nombres: string
  apellidos: string
  oficio: string
  descripcion: string
  ubicacion: string
  calificacionPromedio: number
  trabajosCompletados: number
  verificado: boolean
  disponible: boolean
  esFavorito?: boolean
  user: {
    avatarUrl: string | null
  }
}

export default function ClienteBuscarPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: 'todos',
    sortBy: 'rating_desc',
    showAvailable: true,
    showVerified: false,
  })
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  const categories = useMemo(() => [
    { value: 'todos', label: 'Todas las categorías' },
    { value: 'Electricista', label: 'Electricistas' },
    { value: 'Plomero', label: 'Plomeros' },
    { value: 'Carpintero', label: 'Carpinteros' },
    { value: 'Pintor', label: 'Pintores' },
    { value: 'Gasfitero', label: 'Gasfiteros' },
    { value: 'HVAC', label: 'Aire Acondicionado (HVAC)' },
    { value: 'Cerrajero', label: 'Cerrajeros' },
  ], [])

  const sortOptions = useMemo(() => [
    { value: 'rating_desc', label: 'Mejor calificados' },
    { value: 'name_asc', label: 'Nombre (A-Z)' },
  ], [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login')
      return
    }
    setUser(storedUser)
    setLoading(false) // Set loading to false after user is loaded
  }, [router])

  useEffect(() => {
    const fetchTecnicos = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.category !== 'todos') params.append('oficio', filters.category)
        if (searchQuery) params.append('q', searchQuery)
        if (filters.showAvailable) params.append('disponible', 'true')
        if (filters.showVerified) params.append('verificado', 'true')
        
        // Note: Sorting is applied client-side for now as backend doesn't support it yet.
        // params.append('sortBy', filters.sortBy)

        const requestUrl = `${API_URL}/api/tecnicos?${params.toString()}`
        const token = getAccessToken()
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const response = await fetch(requestUrl, { headers })
        if (!response.ok) throw new Error('Error fetching technicians')
        
        const data = await response.json()
        if (data.success) {
          let tecnicosData = data.data.data || data.data || []
          setTecnicos(tecnicosData)
        } else {
          setTecnicos([])
        }
      } catch (error) {
        console.error('Error loading technicians:', error)
        setTecnicos([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchTecnicos, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filters, user]) // Add user to dependencies

  const sortedTecnicos = useMemo(() => {
    return [...tecnicos].sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating_desc':
          return b.calificacionPromedio - a.calificacionPromedio
        case 'name_asc':
          return `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`)
        default:
          return 0
      }
    })
  }, [tecnicos, filters.sortBy])

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (!user) {
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

        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Buscar Técnicos
              </h1>
              <p className="text-slate-500 text-lg">
                Encuentra profesionales verificados para tu próximo proyecto.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-2">
                  <label htmlFor="search" className="block text-sm font-semibold text-slate-700 mb-2">
                    Buscar por nombre o palabra clave
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ej: Carlos, electricista, pintura..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                    Categoría
                  </label>
                  <select
                    id="category"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sortBy" className="block text-sm font-semibold text-slate-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    id="sortBy"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200/80">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={filters.showAvailable}
                      onChange={(e) => handleFilterChange('showAvailable', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Mostrar solo disponibles
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={filters.showVerified}
                      onChange={(e) => handleFilterChange('showVerified', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Solo verificados
                  </label>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedTecnicos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-200/60 text-center">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No se encontraron técnicos</h3>
                <p className="text-slate-500">Intenta ajustar los filtros o ampliar tu búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-slate-600">
                  Mostrando <span className="font-semibold text-slate-800">{sortedTecnicos.length}</span> de {tecnicos.length} técnicos.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedTecnicos.map((tecnico) => (
                    <TecnicoCard
                      key={tecnico.id}
                      tecnico={{
                        id: tecnico.id,
                        nombre: `${tecnico.nombres} ${tecnico.apellidos}`,
                        oficio: tecnico.oficio,
                        estrellas: Number(tecnico.calificacionPromedio),
                        imagen: tecnico.user.avatarUrl || '',
                        descripcion: tecnico.descripcion,
                        trabajosCompletados: tecnico.trabajosCompletados,
                       
                        calificacionPromedio: Number(tecnico.calificacionPromedio),
                        esFavorito: tecnico.esFavorito || false
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}