'use client'

import { Suspense, useEffect, useState } from "react"
import { use } from "react"
import { notFound } from "next/navigation"
import { useRouter } from "next/navigation"
import Image from "next/image"
import SolicitarServicioModal from "@/components/modals/SolicitarServicioModal"
import { getAccessToken } from "@/lib/auth"
import HeaderCliente from "@/components/clientecomponents/HeaderCliente"
import ClienteSidebar from "@/components/clientecomponents/ClienteSidebar"
import Footer from "@/components/Footer"

// Tipos basados en tu API
type TabType = 'servicios' | 'resenas' | 'certificaciones'

interface Review {
  id: string
  calificacion: number
  comentario: string
  fechaCreacion: string
  cliente: {
    nombres: string
    apellidos: string
  }
}

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
}

interface Certificacion {
  id: string;
  nombre: string;
  institucion: string | null;
  fechaObtencion: string | null;
  imagenUrl: string;
}

interface Tecnico {
  id: string
  nombres: string
  apellidos: string
  oficio: string
  descripcion: string
  ubicacion: string
  calificacionPromedio: number | string | null
  trabajosCompletados: number
  precioMin: number
  precioMax: number
  experienciaAnios: number
  verificado: boolean
  disponible: boolean
  telefono: string
  email: string
  horarios: string
  servicios: Servicio[]
  certificaciones: Certificacion[]
  user: {
    nombre: string
    avatarUrl: string | null
  }
  reviews: Review[]
  _count: {
    reviews: number
  }
}

interface TecnicoResponse {
  success: boolean
  data: Tecnico
}

const mockReviews = [
  {
    id: 'mock-1',
    calificacion: 5,
    comentario: 'Un trabajo impecable y muy profesional. Resolvió el problema en menos tiempo de lo esperado. ¡Totalmente recomendado!',
    fechaCreacion: '2025-10-20T10:00:00Z',
    cliente: {
      nombres: 'Ana',
      apellidos: 'García',
    },
  },
  {
    id: 'mock-2',
    calificacion: 4,
    comentario: 'Buen servicio y muy amable. Llegó a la hora acordada y fue muy claro con el diagnóstico. El precio fue justo.',
    fechaCreacion: '2025-10-18T15:30:00Z',
    cliente: {
      nombres: 'Carlos',
      apellidos: 'Martínez',
    },
  },
];

const mockServices = [
  { id: '1', nombre: 'Instalaciones eléctricas completas', descripcion: null, precio: null },
  { id: '2', nombre: 'Mantenimiento de tableros eléctricos', descripcion: null, precio: null },
  { id: '3', nombre: 'Reparación de cortocircuitos', descripcion: null, precio: null },
  { id: '4', nombre: 'Instalación de luminarias y tomacorrientes', descripcion: null, precio: null },
];



// Componente principal
export default function TecnicoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <HeaderCliente onMenuClick={() => {}} onNotificationClick={() => {}} />
        <div className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-lg text-gray-600">Cargando técnico...</span>
        </div>
        <Footer />
      </div>
    }>
      <TecnicoDetalleContent id={id} />
    </Suspense>
  )
}

// Componente de contenido
function TecnicoDetalleContent({ id }: { id: string }) {
  const router = useRouter()
  const [tecnico, setTecnico] = useState<Tecnico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('servicios')
  const [isFavorite, setIsFavorite] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Cargar datos del técnico desde la API
  useEffect(() => {
    const cargarTecnico = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`http://localhost:5000/api/tecnicos/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const result: TecnicoResponse = await response.json()
        
        console.log('Datos del técnico:', result)
        
        if (result.success && result.data) {
          setTecnico(result.data)
        } else {
          throw new Error('Formato de respuesta inválido')
        }
      } catch (err) {
        console.error('Error al cargar técnico:', err)
        setError('No se pudo cargar la información del técnico.')
      } finally {
        setLoading(false)
      }
    }

    cargarTecnico()
  }, [id])

  // Verificar si es favorito al cargar
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const token = getAccessToken()
        if (!token) return

        const response = await fetch(`http://localhost:5000/api/favoritos/check/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setIsFavorite(data.data.isFavorite)
        }
      } catch (error) {
        console.error('Error al verificar favorito:', error)
      }
    }
    if (tecnico) checkFavorite()
  }, [tecnico, id])

  const handleChatear = () => {
    router.push('/Chat')
  }

  const handleLlamar = () => {
    if (tecnico?.telefono) {
      window.location.href = `tel:${tecnico.telefono}`
    }
  }

  const handleWhatsApp = () => {
    if (tecnico?.telefono) {
      const mensaje = encodeURIComponent(`Hola ${tecnico.nombres}, me comunico desde ConfiaPE para consultar sobre tus servicios de ${tecnico.oficio}.`)
      window.open(`https://wa.me/${tecnico.telefono}?text=${mensaje}`, '_blank')
    }
  }

  // Manejar favoritos
  const handleToggleFavorite = async () => {
    try {
      const token = getAccessToken()
      if (!token) {
        alert('Debes iniciar sesión para agregar favoritos')
        return
      }

      if (isFavorite) {
        // Eliminar
        await fetch(`http://localhost:5000/api/favoritos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        setIsFavorite(false)
      } else {
        // Agregar
        await fetch('http://localhost:5000/api/favoritos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ tecnicoId: id })
        })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error al gestionar favorito:', error)
      alert('Error al actualizar favoritos')
    }
  }

  // Función segura para obtener la calificación como número
  const getCalificacion = (): number => {
    if (!tecnico?.calificacionPromedio) return 0
    if (typeof tecnico.calificacionPromedio === 'number') return tecnico.calificacionPromedio
    if (typeof tecnico.calificacionPromedio === 'string') return parseFloat(tecnico.calificacionPromedio) || 0
    return 0
  }

  // Función segura para formatear la calificación
  const getCalificacionFormateada = (): string => {
    const calificacion = getCalificacion()
    return calificacion.toFixed(1)
  }

  const renderEstrellas = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-yellow-400' : 'fill-gray-300'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <HeaderCliente onMenuClick={() => {}} onNotificationClick={() => {}} />
        <div className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-lg text-gray-600">Cargando técnico...</span>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !tecnico) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <HeaderCliente onMenuClick={() => {}} onNotificationClick={() => {}} />
        <div className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-gray-600 text-lg mb-4">{error || 'Técnico no encontrado'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Volver atrás
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Formatear datos para la UI
  const nombreCompleto = `${tecnico.nombres || ''} ${tecnico.apellidos || ''}`.trim() || tecnico.user.nombre
  const precioFormateado = `S/ ${tecnico.precioMin} - ${tecnico.precioMax}`
  const imagenPerfil = tecnico.user.avatarUrl || "/images/olivis.jpg"
  const calificacion = getCalificacion()
  const calificacionFormateada = getCalificacionFormateada()
  const satisfaccion = Math.round((calificacion / 5) * 100)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderCliente onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} />
      <div className="flex flex-1 pt-16">
        <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-grow pb-16 px-4 sm:px-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Hero Card Ultra Moderno */}
            <div className="relative mb-8 overflow-hidden rounded-[2.5rem] shadow-2xl">
              {/* Background con gradiente animado */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
                <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTRjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6TTI0IDQ2YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
              </div>

            <div className="relative bg-white/95 backdrop-blur-xl">
              <div className="px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Imagen de perfil mejorada */}
                  <div className="flex-shrink-0 relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative">
                      <Image
                        src={imagenPerfil}
                        alt={nombreCompleto}
                        width={240}
                        height={240}
                        className="rounded-3xl object-cover shadow-2xl border-4 border-white"
                      />
                      
                      {/* Badges sobre la imagen */}
                      <div className="absolute -bottom-4 -right-4 flex flex-col gap-2">
                        {tecnico.verificado && (
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verificado
                          </div>
                        )}
                        <div className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl ${
                          tecnico.disponible 
                            ? 'bg-white text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            tecnico.disponible ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`}></div>
                          {tecnico.disponible ? 'Disponible' : 'No disponible'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información principal */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h1 className="text-5xl font-black text-gray-900 mb-2">
                          {nombreCompleto}
                        </h1>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {tecnico.oficio}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleFavorite}
                        className="bg-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-all"
                      >
                        <svg 
                          className={`w-7 h-7 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none text-gray-700'}`}
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        {renderEstrellas(calificacion)}
                        <span className="text-2xl font-black text-gray-900">{calificacionFormateada}</span>
                        <span className="text-gray-500 font-medium">({tecnico._count?.reviews || 0} reseñas)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {tecnico.ubicacion}
                      </div>
                    </div>

                    <p className="text-gray-700 text-lg mb-8 leading-relaxed max-w-3xl">
                      {tecnico.descripcion}
                    </p>

                    {/* Botones de acción mejorados */}
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={handleChatear}
                        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Chatear Ahora
                        </span>
                      </button>

                      {tecnico.telefono && (
                        <button 
                          onClick={handleLlamar}
                          className="group bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg flex items-center gap-3"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Llamar
                        </button>
                      )}

                      {tecnico.telefono && (
                        <button 
                          onClick={handleWhatsApp}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl flex items-center gap-3"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas destacadas */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white mb-2">{tecnico.trabajosCompletados}</div>
                    <div className="text-blue-100 font-semibold">Trabajos Completados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-white mb-2">{satisfaccion}%</div>
                    <div className="text-blue-100 font-semibold">Satisfacción</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-white mb-2">{tecnico.experienciaAnios} años</div>
                    <div className="text-blue-100 font-semibold">Experiencia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido principal con tabs */}
            <div className="lg:col-span-2">
              {/* Tabs modernos */}
              <div className="bg-white rounded-3xl shadow-xl p-2 mb-6 border border-gray-100">
                <div className="flex gap-2">
                  {[
                    { id: 'servicios' as TabType, label: 'Servicios', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                    { id: 'resenas' as TabType, label: 'Reseñas', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
                    { id: 'certificaciones' as TabType, label: 'Certificaciones', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido de tabs */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                {activeTab === 'servicios' && (
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-gray-900 mb-6">Servicios Ofrecidos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(tecnico.servicios && tecnico.servicios.length > 0 ? tecnico.servicios : mockServices).map((servicio) => (
                        <div key={servicio.id} className="group flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 border border-blue-100">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-grow">
                            <span className="text-gray-900 font-semibold leading-relaxed">{servicio.nombre}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'resenas' && (
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-6">Reseñas de Clientes</h2>
                    {(tecnico.reviews && tecnico.reviews.length > 0 ? tecnico.reviews : mockReviews).map((review) => (
                      <div key={review.id} className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-all mb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {review.cliente.nombres?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {review.cliente.nombres} {review.cliente.apellidos}
                              </h4>
                              <div className="flex items-center gap-1 mt-1">
                                {renderEstrellas(review.calificacion)}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {new Date(review.fechaCreacion).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comentario}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'certificaciones' && (
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-6">Certificaciones y Formación</h2>
                    <div className="space-y-4">
                      {tecnico.certificaciones?.map((cert) => (
                        <p key={cert.id}>{cert.nombre} - {cert.institucion}</p>
                      ))}
                      {(!tecnico.certificaciones || tecnico.certificaciones.length === 0) && (
                        <p>No se han especificado certificaciones</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar de contacto */}
            <div className="space-y-6">
              {/* Card de contacto mejorado */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 sticky top-24">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Información de Contacto</h3>
                
                <div className="space-y-4">
                  {tecnico.telefono && (
                    <div className="group p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg transition-all border border-blue-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <div className="text-xs text-gray-500 font-semibold mb-1">Teléfono</div>
                          <div className="font-bold text-gray-900">{tecnico.telefono}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tecnico.email && (
                    <div className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-lg transition-all border border-purple-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <div className="text-xs text-gray-500 font-semibold mb-1">Email</div>
                          <div className="font-bold text-gray-900 text-sm break-all">{tecnico.email}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tecnico.horarios && (
                    <div className="group p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all border border-green-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <div className="text-xs text-gray-500 font-semibold mb-1">Horario</div>
                          <div className="font-bold text-gray-900 text-sm">{tecnico.horarios}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-gray-600 font-semibold mb-1">Precio estimado</div>
                        <div className="text-3xl font-black text-gray-900">{precioFormateado}</div>
                      </div>
                      <svg className="w-14 h-14 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Por servicio · IVA incluido</div>
                  </div>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl"
                >
                  Solicitar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
     
      </main>
      </div>
      <Footer />

      {/* Modal de solicitar servicio */}
      <SolicitarServicioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tecnico={{
          id: tecnico.id,
          nombre: nombreCompleto,
          oficio: tecnico.oficio
        }}
        onSuccess={() => router.push('/cliente/trabajos')}
      />
    </div>
  )
}