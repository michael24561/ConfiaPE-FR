'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import TecnicoCard from "@/components/TecnicoCard"

// ✅ AGREGADO: Variable de entorno para la API
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
  precioMin: number | string
  precioMax: number | string
  experienciaAnios: number
  verificado: boolean
  disponible: boolean
  user: {
    nombre: string
    avatarUrl: string | null
  }
  _count: {
    reviews: number
  }
}

interface TecnicosResponse {
  success: boolean
  data: {
    data: Tecnico[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

function TecnicosContent() {
  const searchParams = useSearchParams()
  const searchFromURL = searchParams.get('search') || ""

  const [busqueda, setBusqueda] = useState(searchFromURL)
  const [resultados, setResultados] = useState<Tecnico[]>([])
  const [vistaGrid, setVistaGrid] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState("Todos")
  const [modoCompacto, setModoCompacto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  // Cargar técnicos desde la API con filtros
  useEffect(() => {
    const cargarTecnicos = async () => {
      try {
        setLoading(true)
        setError(null)

        // Construir query params
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          disponible: 'true'
        })

        // Agregar búsqueda si existe
        if (busqueda.trim()) {
          params.append('q', busqueda.trim())
        }

        // Agregar categoría si no es "Todos"
        if (categoriaActiva !== "Todos") {
          params.append('categoria', categoriaActiva)
        }

        // ✅ CORREGIDO: Usar variable de entorno
        const response = await fetch(`${API_URL}/api/tecnicos?${params}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result: TecnicosResponse = await response.json()

        console.log('Respuesta completa de la API:', result)

        if (result.success && result.data) {
          setResultados(result.data.data || [])
          setTotalPages(result.data.pagination.pages)
          setTotal(result.data.pagination.total)
        } else {
          console.error('Formato de respuesta inesperado:', result)
          throw new Error('Formato de respuesta inválido')
        }
      } catch (err) {
        console.error('Error al cargar técnicos:', err)
        setError('No se pudieron cargar los técnicos. Por favor, intenta de nuevo.')
        setResultados([])
      } finally {
        setLoading(false)
      }
    }

    cargarTecnicos()
  }, [busqueda, categoriaActiva, page])

  // Categorías predefinidas comunes en Perú
  const categorias = [
    { nombre: "Todos", icono: "⚙️" },
    { nombre: "electricista", icono: "⚡" },
    { nombre: "fontanero", icono: "🔧" },
    { nombre: "carpintero", icono: "🪚" },
    { nombre: "pintor", icono: "🎨" },
    { nombre: "cerrajero", icono: "🔑" },
    { nombre: "aire acondicionado", icono: "❄️" },
  ]

  // Función para obtener icono según el oficio
  function getIconoOficio(oficio: string): string {
    const iconos: { [key: string]: string } = {
      'electricista': '⚡',
      'fontanero': '🔧',
      'fontanera': '🔧',
      'gasfitero': '🔧',
      'aire acondicionado': '❄️',
      'climatización': '❄️',
      'carpintero': '🪚',
      'carpintería': '🪚',
      'pintor': '🎨',
      'pintora': '🎨',
      'cerrajero': '🔑',
      'cerrajera': '🔑',
    }
    
    return iconos[oficio.toLowerCase()] || '🔧'
  }

  const parsePrecio = (precio: number | string | undefined): number | null => {
    if (precio === undefined || precio === null) return null
    if (typeof precio === 'number') return precio
    if (typeof precio === 'string') {
      const parsed = parseFloat(precio)
      return isNaN(parsed) ? null : parsed
    }
    return null
  }

  // Efecto para modo compacto basado en búsqueda
  useEffect(() => {
    setModoCompacto(busqueda.trim().length > 0)
  }, [busqueda])

  // Efecto para search param de URL
  useEffect(() => {
    if (searchFromURL && !busqueda) {
      setBusqueda(searchFromURL)
    }
  }, [searchFromURL, busqueda])

  const limpiarBusqueda = () => {
    setBusqueda("")
    setCategoriaActiva("Todos")
    setPage(1)
  }

  const handleCategoriaClick = (categoria: string) => {
    setCategoriaActiva(categoria)
    setPage(1)
  }

  return (
    <main className="flex-grow pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-20 px-4 mb-10 text-center overflow-hidden">
        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Encuentra tu Técnico Ideal
          </span>
        </h1>

        <p className="text-xl text-gray-700 mb-12 font-medium max-w-3xl mx-auto">
          Profesionales verificados, disponibles y listos para ayudarte.
        </p>

        {/* Buscador */}
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o especialidad..."
            className="w-full pl-14 pr-12 py-4 rounded-2xl text-lg text-gray-800 bg-white border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
          />
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {busqueda && (
            <button
              onClick={limpiarBusqueda}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* Categorías */}
      {!loading && categorias.length > 1 && (
        <section
          className={`transition-all duration-500 ${
            modoCompacto
              ? 'sticky top-20 z-20 bg-white/80 backdrop-blur-xl border-y border-gray-200 shadow-sm py-2'
              : 'max-w-6xl mx-auto px-4 mb-12 py-8'
          }`}
        >
          <div
            className={`flex flex-wrap justify-center gap-3 ${
              modoCompacto ? 'overflow-x-auto scrollbar-hide px-2' : ''
            }`}
          >
            {categorias.map((cat) => (
              <button
                key={cat.nombre}
                onClick={() => handleCategoriaClick(cat.nombre)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all ${
                  categoriaActiva === cat.nombre
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50'
                } ${modoCompacto ? 'text-sm px-3 py-2' : ''}`}
              >
                <span>{cat.icono}</span>
                {!modoCompacto && cat.nombre}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Resultados */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-gray-900">Técnicos Disponibles</h2>
          {!loading && (
            <p className="text-gray-600 font-medium">
              Mostrando {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'}
            </p>
          )}
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600">Cargando técnicos...</span>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center">
              <div className="text-yellow-600 text-lg">
                ⚠️ {error}
              </div>
            </div>
          </div>
        )}

        {/* Grid de técnicos */}
        {!loading && !error && resultados.length > 0 && (
          <div className={`grid ${vistaGrid ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8 auto-rows-fr`}>
            {resultados.map((t, idx) => {
              const precioMinNum = parsePrecio(t.precioMin)
              const tienePrecioMin = precioMinNum !== null
              
              return (
                <div 
                  key={t.id} 
                  className="animate-fade-in-up h-full" 
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="h-full">
                    <TecnicoCard tecnico={{
                      id: t.id,
                      nombre: `${t.nombres || ''} ${t.apellidos || ''}`.trim() || t.user.nombre,
                      oficio: t.oficio || 'Técnico',
                      estrellas: parseFloat(t.calificacionPromedio.toString()) || 0,
                      imagen: t.user.avatarUrl || "/images/olivis.jpg",
                      descripcion: t.descripcion || 'Profesional con experiencia en el rubro',
                      precioMin: t.precioMin,
                      precioMax: t.precioMax,
                      experienciaAnios: t.experienciaAnios,
                      trabajosCompletados: t.trabajosCompletados,
                      calificacionPromedio: t.calificacionPromedio
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && resultados.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <p className="text-gray-500 text-xl mb-4">
              {busqueda || categoriaActiva !== "Todos" 
                ? "No se encontraron técnicos que coincidan con tu búsqueda"
                : "No hay técnicos disponibles en este momento"
              }
            </p>
            {(busqueda || categoriaActiva !== "Todos") && (
              <button
                onClick={limpiarBusqueda}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default function TecnicosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Cargando técnicos...</div>}>
        <TecnicosContent />
      </Suspense>
      <Footer />

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
      `}</style>
    </div>
  )
}