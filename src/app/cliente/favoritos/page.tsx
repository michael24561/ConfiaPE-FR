'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import TecnicoCard from '@/components/TecnicoCard'
import { Heart } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Favorito {
  id: string
  tecnico: {
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
    user: {
      avatarUrl: string | null
    }
  }
}

export default function ClienteFavoritosPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

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
  }, [router])

  useEffect(() => {
    const fetchFavoritos = async () => {
      setLoading(true)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/favoritos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setFavoritos(Array.isArray(data.data) ? data.data : [])
        } else {
          setFavoritos([])
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error)
        setFavoritos([])
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchFavoritos()
  }, [user])

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
        <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Mis Favoritos
              </h1>
              <p className="text-slate-500 text-lg">
                Accede rápidamente a los técnicos que has guardado.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : favoritos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-200/60 text-center mt-8">
                <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No tienes favoritos aún</h3>
                <p className="text-slate-500 mb-6">Guarda técnicos desde la página de búsqueda para verlos aquí.</p>
                <button
                  onClick={() => router.push('/cliente/buscar')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  Buscar Técnicos
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-slate-600">
                  Tienes <span className="font-semibold text-slate-800">{favoritos.length}</span> técnico{favoritos.length !== 1 && 's'} en tu lista.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoritos.map(({ tecnico }) => (
                    <TecnicoCard
                      key={tecnico.id}
                      tecnico={{
                        id: tecnico.id,
                        nombre: `${tecnico.nombres} ${tecnico.apellidos}`,
                        oficio: tecnico.oficio,
                        descripcion: tecnico.descripcion,
                        calificacionPromedio: Number(tecnico.calificacionPromedio),
                        trabajosCompletados: tecnico.trabajosCompletados,
                        precioMin: Number(tecnico.precioMin),
                        precioMax: Number(tecnico.precioMax),
                        imagen: tecnico.user.avatarUrl,
                        verificado: tecnico.verificado,
                        disponible: tecnico.disponible,
                        ubicacion: tecnico.ubicacion,
                        esFavorito: true, // All technicians on this page are favorites
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
