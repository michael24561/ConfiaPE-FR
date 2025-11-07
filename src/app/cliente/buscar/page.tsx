'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import TecnicoCard from '@/components/TecnicoCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL_ || 'http://localhost:5000'

interface Tecnico {
  id: string
  nombres: string
  apellidos: string
  oficio: string
  descripcion: string
  ubicacion: string
  precioMin: number
  precioMax: number
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  const categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'Electricista', label: 'Electricista' },
    { value: 'Fontanero', label: 'Fontanero' },
    { value: 'Carpintero', label: 'Carpintero' },
    { value: 'Cerrajero', label: 'Cerrajero' },
    { value: 'Pintor', label: 'Pintor' },
    { value: 'HVAC', label: 'HVAC' }
  ]

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
  }, [router])

  // Buscar técnicos
  useEffect(() => {
    const fetchTecnicos = async () => {
      // 🚨 LOG 1: Mostrar los parámetros de búsqueda actuales antes de la llamada
      console.log(`[Busqueda Tec] State: Q='${searchQuery}', Categoria='${selectedCategory}'`);

      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedCategory !== 'todos') {
          params.append('categoria', selectedCategory)
        }
        if (searchQuery) {
          params.append('q', searchQuery)
        }
        params.append('disponible', 'true')
     

        const requestUrl = `${API_URL}/api/tecnicos?${params.toString()}`;

        // 🚨 LOG 2: Mostrar la URL de la API completa que se va a llamar
        console.log(`[Busqueda Tec] Llamando a URL: ${requestUrl}`);

        // Obtener token para incluir información de favoritos
        const token = getAccessToken()
        const headers: HeadersInit = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(requestUrl, { headers })
        
        // 🚨 LOG 3: Mostrar el código de estado de la respuesta
        console.log(`[Busqueda Tec] Código de estado de respuesta: ${response.status}`);
        
        if (!response.ok) {
           // Manejar errores de red/servidor (4xx, 5xx)
          console.error(`[Busqueda Tec] Error en la respuesta HTTP: ${response.statusText}`);
          setTecnicos([]);
          return;
        }

        const data = await response.json()
        
        // 🚨 LOG 4: Mostrar la respuesta completa del backend
        console.log('[Busqueda Tec] Respuesta del backend:', data);
        
        if (data.success) {
          // El backend puede devolver data.data.data (con paginación) o data.data (directo)
          let tecnicosData = data.data
          if (tecnicosData && tecnicosData.data && Array.isArray(tecnicosData.data)) {
            tecnicosData = tecnicosData.data
          } else if (!Array.isArray(tecnicosData)) {
            tecnicosData = []
          }
          
          // 🚨 LOG 5: Mostrar la cantidad de técnicos encontrados
          console.log(`[Busqueda Tec] Éxito. Técnicos encontrados: ${tecnicosData.length}`);

          setTecnicos(tecnicosData)
        } else {
          // 🚨 LOG 6: Mostrar el error si success es false
          console.error('[Busqueda Tec] La respuesta indica fallo (success: false)', data.error);
          setTecnicos([])
        }
      } catch (error) {
        // 🚨 LOG 7: Mostrar errores de conexión o parsing
        console.error('[Busqueda Tec] Error al cargar técnicos (NetworkError/ParsingError):', error)
        setTecnicos([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchTecnicos()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
        />

        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 pt-20 lg:ml-72 transition-all duration-300">
          <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Buscar Técnicos
              </h1>
              <p className="text-gray-600 text-lg">
                Encuentra profesionales verificados cerca de ti
              </p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar por nombre
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ej: Carlos, José..."
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Resultados */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : tecnicos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-600 font-medium mb-2">No se encontraron técnicos</p>
                <p className="text-sm text-gray-500">Intenta cambiar los filtros de búsqueda</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-600">
                    <span className="font-bold text-gray-900">{tecnicos.length}</span> técnicos encontrados
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tecnicos.map((tecnico) => (
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
                        precioMin: Number(tecnico.precioMin),
                        precioMax: Number(tecnico.precioMax),
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
