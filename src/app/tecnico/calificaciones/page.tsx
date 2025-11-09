'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"
import { Star, MessageSquare, ThumbsUp, Edit } from "lucide-react"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Review {
  id: string;
  calificacion: number;
  comentario: string;
  respuesta: string | null;
  fechaCreacion: string;
  cliente: {
    user: {
      nombre: string;
      avatarUrl: string | null;
    }
  }
}

interface Stats {
  promedio: number;
  total: number;
  distribucion: {
    '5': number; '4': number; '3': number; '2': number; '1': number;
  }
}

export default function CalificacionesPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
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
      if (!user?.perfilId) return
      setLoading(true)
      try {
        const token = getAccessToken()
        const headers = { 'Authorization': `Bearer ${token}` }
        
        const params = new URLSearchParams()
        if (filter !== 'todos') params.append('calificacion', filter)

        const [statsRes, reviewsRes] = await Promise.all([
          fetch(`${API_URL}/api/reviews/tecnico/${user.perfilId}/stats`, { headers }),
          fetch(`${API_URL}/api/reviews/tecnico/${user.perfilId}?${params.toString()}`, { headers })
        ])

        const statsData = await statsRes.json()
        const reviewsData = await reviewsRes.json()

        if (statsData.success) setStats(statsData.data)
        if (reviewsData.success) setReviews(reviewsData.data.data || [])

      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, filter])

  const handleReplySuccess = (reviewId: string, newReply: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, respuesta: newReply } : r))
  }

  const filterOptions = [
    { id: 'todos', label: 'Todas' },
    { id: '5', label: '5 Estrellas' },
    { id: '4', label: '4 Estrellas' },
    { id: '3', label: '3 Estrellas' },
    { id: '2_1', label: 'Bajas' }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderTecnico onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNotificationClick={() => {}} notifications={[]} user={user} />
      <div className="flex relative">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Calificaciones y Reseñas</h1>
              <p className="text-slate-500 text-lg">Revisa lo que tus clientes opinan de tu trabajo.</p>
            </div>

            {loading && !stats ? (
              <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <StatCard icon={Star} label="Promedio General" value={stats?.promedio.toFixed(1) || 'N/A'} color="yellow" />
                  <StatCard icon={MessageSquare} label="Total de Reseñas" value={stats?.total || 0} color="blue" />
                  <StatCard icon={ThumbsUp} label="Reseñas Positivas" value={(stats?.distribucion['5'] || 0) + (stats?.distribucion['4'] || 0)} color="green" />
                  <StatCard icon={Star} label="5 Estrellas" value={stats?.distribucion['5'] || 0} color="purple" />
                </div>

                <div className="mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-px">
                    {filterOptions.map(({ id, label }) => (
                      <button key={id} onClick={() => setFilter(id)} className={`flex-shrink-0 px-3 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${filter === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200/60"><Star className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-semibold text-slate-800">No hay reseñas en esta categoría</h3></div>
                  ) : (
                    reviews.map(review => <ReviewCard key={review.id} review={review} onReplySuccess={handleReplySuccess} />)
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors = {
      yellow: 'text-yellow-600 bg-yellow-100',
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
    }
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200/60">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}><Icon className="w-6 h-6" /></div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    )
}

const ReviewCard = ({ review, onReplySuccess }: { review: Review, onReplySuccess: (id: string, reply: string) => void }) => {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveReply = async () => {
    if (!replyText.trim()) return
    setIsSaving(true)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/reviews/${review.id}/respuesta`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta: replyText })
      })
      const data = await response.json()
      if (data.success) {
        onReplySuccess(review.id, replyText)
        setIsReplying(false)
      } else { throw new Error(data.error || 'Error al guardar respuesta') }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ocurrió un error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/60">
      <div className="flex items-start gap-4 mb-3">
        <div className="relative w-11 h-11 rounded-full bg-slate-200 flex-shrink-0">
          {review.cliente.user.avatarUrl && <Image src={review.cliente.user.avatarUrl} alt={review.cliente.user.nombre} fill className="object-cover rounded-full" unoptimized />}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{review.cliente.user.nombre}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />)}
            </div>
            <span className="text-xs text-slate-400">{new Date(review.fechaCreacion).toLocaleDateString('es-PE')}</span>
          </div>
        </div>
      </div>
      <p className="text-slate-600 text-sm mb-4 pl-15">{review.comentario}</p>
      
      {review.respuesta ? (
        <div className="pl-15 mt-4">
          <div className="bg-slate-100 p-4 rounded-lg">
            <p className="text-sm font-semibold text-slate-800 mb-1">Tu respuesta</p>
            <p className="text-sm text-slate-600">{review.respuesta}</p>
          </div>
        </div>
      ) : isReplying ? (
        <div className="pl-15 mt-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handleSaveReply} disabled={isSaving} className="px-4 py-1.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setIsReplying(false)} className="px-4 py-1.5 text-sm text-slate-600 font-medium rounded-lg hover:bg-slate-100">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="pl-15 mt-2">
          <button onClick={() => setIsReplying(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
            <Edit className="w-4 h-4" /> Responder
          </button>
        </div>
      )}
    </div>
  )
}
