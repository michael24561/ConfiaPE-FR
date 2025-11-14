'use client'

import { Suspense, useEffect, useState } from "react"
import { use } from "react"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import SolicitarServicioModal from "@/components/modals/SolicitarServicioModal"
import { getStoredUser } from "@/lib/auth"
import HeaderCliente from "@/components/clientecomponents/HeaderCliente"
import ClienteSidebar from "@/components/clientecomponents/ClienteSidebar"
import { Star, MapPin, Briefcase, ShieldCheck, Award, MessageSquare, Phone, Check } from "lucide-react"

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
  experienciaAnios: number; verificado: boolean;
  disponible: boolean; telefono: string; email: string;
  servicios: Servicio[]; certificaciones: Certificacion[];
  user: { nombre: string; avatarUrl: string | null };
  reviews: Review[];
  _count: { reviews: number };
}
interface TecnicoResponse { success: boolean; data: Tecnico; }
type TabType = 'servicios' | 'resenas' | 'certificaciones'

// --- Main Component ---
export default function TecnicoDetalleClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TecnicoDetalleContent id={id} />
    </Suspense>
  )
}

// --- Content Component ---
function TecnicoDetalleContent({ id }: { id: string }) {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tecnico, setTecnico] = useState<Tecnico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'CLIENTE') {
      router.push('/Login'); return
    }
    setUser(storedUser)

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
  }, [id, router])

  if (loading || !user) return <LoadingSkeleton />
  if (error || !tecnico) return <ErrorDisplay error={error} onRetry={() => router.refresh()} />

  const nombreCompleto = `${tecnico.nombres || ''} ${tecnico.apellidos || ''}`.trim()

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderCliente onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} notifications={[]} user={user} />
      <div className="flex relative">
        <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <ProfileHeader tecnico={tecnico} nombreCompleto={nombreCompleto} />
                        <ProfileTabs tecnico={tecnico} />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Solicitar Servicio</h3>
                                <p className="text-sm text-slate-500 mb-5">Envía una solicitud de servicio a este técnico.</p>
                                <button onClick={() => setModalOpen(true)} className="w-full px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5" /> Solicitar Servicio
                                </button>
                            </div>
                            <ContactCard tecnico={tecnico} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
      <SolicitarServicioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tecnico={{ id: tecnico.id, nombre: nombreCompleto, oficio: tecnico.oficio }}
        onSuccess={() => router.push('/cliente/trabajos')}
      />
    </div>
  )
}

// --- UI Components (Copied from the original file, with ContactCard modified) ---

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
  
  const ContactCard = ({ tecnico }: { tecnico: Tecnico }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Contactar Directamente</h3>
            <div className="space-y-3">
                {tecnico.telefono ? (
                <>
                    <a href={`tel:${tecnico.telefono}`} className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" /> Llamar
                    </a>
                    <a href={`httpshttps://wa.me/${tecnico.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${tecnico.nombres}, te contacto desde ConfiaPE.`)}`} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                        WhatsApp
                    </a>
                </>
                ) : (
                  <p className="text-sm text-slate-500 text-center">El técnico no ha proporcionado un número de contacto directo.</p>
                )}
            </div>
        </div>
    )
  }
  
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-slate-50">
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