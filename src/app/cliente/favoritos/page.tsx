'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HeaderCliente from '@/components/clientecomponents/HeaderCliente'
import ClienteSidebar from '@/components/clientecomponents/ClienteSidebar'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import TecnicoCard from '@/components/TecnicoCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Favorito {
  id: string
  createdAt: string
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
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
  }, [router])

  // Cargar favoritos
  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        setLoading(true)
        const token = getAccessToken()
        
        const response = await fetch(`${API_URL}/api/favoritos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        
        if (data.success) {
          const favoritosData = Array.isArray(data.data) ? data.data : []
          setFavoritos(favoritosData)
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

    if (user) {
      fetchFavoritos()
    }
  }, [user])

  const handleRemoveFavorito = async (tecnicoId: string) => {
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/favoritos/${tecnicoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setFavoritos(prev => prev.filter(f => f.tecnico.id !== tecnicoId))
      }
    } catch (error) {
      console.error('Error al eliminar favorito:', error)
    }
  }

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
                Mis Favoritos ❤️
              </h1>
              <p className="text-gray-600 text-lg">
                Técnicos que has guardado
              </p>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900">{favoritos.length}</p>
                  <p className="text-gray-600">Técnicos favoritos</p>
                </div>
              </div>
            </div>

            {/* Lista de favoritos */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : favoritos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-600 font-medium mb-2">No tienes favoritos aún</p>
                <p className="text-sm text-gray-500 mb-4">Guarda técnicos para acceder rápidamente</p>
                <button
                  onClick={() => router.push('/cliente/buscar')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Buscar Técnicos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritos.map((favorito) => (
                  <div key={favorito.id} className="relative">
                    <TecnicoCard
                      tecnico={{
                        id: favorito.tecnico.id,
                        nombre: `${favorito.tecnico.nombres} ${favorito.tecnico.apellidos}`,
                        oficio: favorito.tecnico.oficio,
                        estrellas: Number(favorito.tecnico.calificacionPromedio),
                        imagen: favorito.tecnico.user.avatarUrl || '',
                        descripcion: favorito.tecnico.descripcion,
                        trabajosCompletados: favorito.tecnico.trabajosCompletados,
                        precioMin: Number(favorito.tecnico.precioMin),
                        precioMax: Number(favorito.tecnico.precioMax),
                        calificacionPromedio: Number(favorito.tecnico.calificacionPromedio)
                      }}
                    />
                    <button
                      onClick={() => handleRemoveFavorito(favorito.tecnico.id)}
                      className="absolute top-2 right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                      title="Eliminar de favoritos"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
