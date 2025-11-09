'use client'

import { Suspense, useEffect, useState } from "react"
import { use } from "react"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import SolicitarServicioModal from "@/components/modals/SolicitarServicioModal"
import { getAccessToken } from "@/lib/auth"
import Header from "@/components/Header" // Generic Header
import { Star, MapPin, Briefcase, ShieldCheck, Award, MessageSquare, Phone, DollarSign, Check } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// --- Type Definitions ---
interface Review {
  id: string; calificacion: number; comentario: string; fechaCreacion: string;
  cliente: { nombres: string; apellidos: string; user: { avatarUrl: string | null } }
}
interface Servicio { id: string; nombre: string; }
interface Certificacion { id: string; nombre: string; imagenUrl: string; }
interface Tecnico {
  id: string; nombres: string; apellidos: string; oficio: string; descripcion: string;
  ubicacion: string; calificacionPromedio: number | string | null; trabajosCompletados: number;
  precioMin: number; precioMax: number; experienciaAnios: number; verificado: boolean;
  disponible: boolean; telefono: string; email: string;
  servicios: Servicio[]; certificaciones: Certificacion[];
  user: { nombre: string; avatarUrl: string | null };
  reviews: Review[];
  _count: { reviews: number };
}
interface TecnicoResponse { success: boolean; data: Tecnico; }
type TabType = 'servicios' | 'resenas' | 'certificaciones'

// --- Main Component ---
export default function TecnicoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TecnicoDetalleContent id={id} />
    </Suspense>
  )
}

// --- Content Component ---
function TecnicoDetalleContent({ id }: { id: string }) {
  const [tecnico, setTecnico] = useState<Tecnico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const cargarTecnico = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/tecnicos/${id}`)
        if (!response.ok) {
          if (response.status === 404) notFound()
          throw new Error(`Error ${response.status}`)
        }
        const result: TecnicoResponse = await response.json()
        if (result.success && result.data) {
          setTecnico(result.data)
        } else {
          throw new Error('Formato de respuesta inválido')
        }
      } catch (err) {
        setError('No se pudo cargar la información del técnico.')
      } finally {
        setLoading(false)
      }
    }
    cargarTecnico()
  }, [id])

  if (loading) return <LoadingSkeleton />
  if (error || !tecnico) return <ErrorDisplay error={error} onRetry={() => router.refresh()} />

  const nombreCompleto = `${tecnico.nombres || ''} ${tecnico.apellidos || ''}`.trim()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content (Left) */}
            <div className="lg:col-span-2 space-y-8">
              <ProfileHeader tecnico={tecnico} nombreCompleto={nombreCompleto} />
              <ProfileTabs tecnico={tecnico} />
            </div>
            {/* Sticky Sidebar (Right) */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <RequestCard tecnico={tecnico} onSolicitar={() => setModalOpen(true)} />
                <ContactCard tecnico={tecnico} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SolicitarServicioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tecnico={{ id: tecnico.id, nombre: nombreCompleto, oficio: tecnico.oficio }}
        onSuccess={() => router.push('/cliente/trabajos')}
      />
    </div>
  )
}

// --- UI Components ---

const ProfileHeader = ({ tecnico, nombreCompleto }: { tecnico: Tecnico, nombreCompleto: string }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-200/60">
    <div className="flex flex-col sm:flex-row items-start gap-6">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-200 flex-shrink-0">
        {tecnico.user.avatarUrl && <Image src={tecnico.user.avatarUrl} alt={nombreCompleto} fill className="object-cover rounded-full" unoptimized />}
      </div>
      <div className="flex-grow">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{nombreCompleto}</h1>
        <p className="text-lg text-slate-600 mb-3">{tecnico.oficio}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {tecnico.ubicacion}</div>
          <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {tecnico.experienciaAnios} años de experiencia</div>
        </div>
        {tecnico.verificado && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            <ShieldCheck className="w-5 h-5" /> Verificado
          </div>
        )}
      </div>
    </div>
    <div className="mt-6 pt-6 border-t border-slate-200/80">
      <p className="text-slate-700 leading-relaxed">{tecnico.descripcion}</p>
    </div>
  </div>
)

const ProfileTabs = ({ tecnico }: { tecnico: Tecnico }) => {
  const [activeTab, setActiveTab] = useState<TabType>('servicios')
  const tabs: { id: TabType, label: string, icon: React.ElementType }[] = [
    { id: 'servicios', label: 'Servicios', icon: Check },
    { id: 'resenas', label: `Reseñas (${tecnico._count.reviews})`, icon: Star },
    { id: 'certificaciones', label: 'Certificaciones', icon: Award },
  ]

  return (
    <div>
      <div className="mb-6 border-b border-slate-200">
        <div className="flex items-center gap-4 sm:gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-1 sm:px-3 py-3 text-sm sm:text-base font-semibold transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-200/60 min-h-[300px]">
        {activeTab === 'servicios' && <ServiceList services={tecnico.servicios} />}
        {activeTab === 'resenas' && <ReviewList reviews={tecnico.reviews} />}
        {activeTab === 'certificaciones' && <CertificationList certifications={tecnico.certificaciones} />}
      </div>
    </div>
  )
}

const ServiceList = ({ services }: { services: Servicio[] }) => (
  <div className="space-y-3">
    {services.length > 0 ? services.map(s => (
      <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
        <Check className="w-5 h-5 text-blue-600" />
        <span className="text-slate-700">{s.nombre}</span>
      </div>
    )) : <p className="text-slate-500 text-center py-10">No hay servicios especificados.</p>}
  </div>
)

const ReviewList = ({ reviews }: { reviews: Review[] }) => (
  <div className="space-y-6">
    {reviews.length > 0 ? reviews.map(r => (
      <div key={r.id} className="border-b border-slate-200/80 pb-6 last:border-b-0 last:pb-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-10 h-10 rounded-full bg-slate-200">
            {r.cliente.user?.avatarUrl && <Image src={r.cliente.user.avatarUrl} alt={r.cliente.nombres} fill className="object-cover rounded-full" unoptimized />}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{r.cliente.nombres} {r.cliente.apellidos}</p>
            <p className="text-xs text-slate-400">{new Date(r.fechaCreacion).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < r.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />)}
        </div>
        <p className="text-slate-600">{r.comentario}</p>
      </div>
    )) : <p className="text-slate-500 text-center py-10">Este técnico aún no tiene reseñas.</p>}
  </div>
)

const CertificationList = ({ certifications }: { certifications: Certificacion[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {certifications.length > 0 ? certifications.map(c => (
      <a key={c.id} href={c.imagenUrl} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="aspect-square relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
          <Image src={c.imagenUrl} alt={c.nombre} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
            <p className="text-white text-sm text-center font-semibold">{c.nombre}</p>
          </div>
        </div>
      </a>
    )) : <p className="text-slate-500 text-center py-10 col-span-full">No hay certificaciones disponibles.</p>}
  </div>
)

const RequestCard = ({ tecnico, onSolicitar }: { tecnico: Tecnico, onSolicitar: () => void }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-slate-800">Rango de Precios</h3>
      <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
        S/ {tecnico.precioMin} - {tecnico.precioMax}
      </div>
    </div>
    <p className="text-sm text-slate-500 mb-5">Los precios pueden variar según la complejidad del trabajo.</p>
    <button onClick={onSolicitar} className="w-full px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
      <Check className="w-5 h-5" /> Solicitar Servicio
    </button>
  </div>
)

const ContactCard = ({ tecnico }: { tecnico: Tecnico }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
    <h3 className="text-lg font-semibold text-slate-800 mb-4">Contactar Directamente</h3>
    <div className="space-y-3">
      {tecnico.telefono && (
        <>
          <a href={`tel:${tecnico.telefono}`} className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" /> Llamar
          </a>
          <a href={`https://wa.me/${tecnico.telefono}?text=${encodeURIComponent(`Hola ${tecnico.nombres}, te contacto desde ConfiaPE.`)}`} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </a>
        </>
      )}
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <Header />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200/60">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-full bg-slate-200 animate-pulse"></div>
              <div className="flex-grow mt-2">
                <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse mb-4"></div>
                <div className="h-5 w-1/2 bg-slate-200 rounded animate-pulse mb-4"></div>
                <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-200/60 h-64 animate-pulse"></div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-200/60 h-40 animate-pulse"></div>
          <div className="bg-white rounded-2xl p-8 border border-slate-200/60 h-40 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
)

const ErrorDisplay = ({ error, onRetry }: { error: string | null, onRetry: () => void }) => (
  <div className="min-h-screen bg-slate-50">
    <Header />
    <div className="flex items-center justify-center pt-24 pb-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops, algo salió mal.</h2>
        <p className="text-slate-500 mb-6">{error || 'No pudimos cargar el perfil del técnico.'}</p>
        <button onClick={onRetry} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Intentar de nuevo
        </button>
      </div>
    </div>
  </div>
)