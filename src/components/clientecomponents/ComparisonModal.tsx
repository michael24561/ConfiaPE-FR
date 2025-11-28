'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Star, MapPin, CheckCircle2, ShieldCheck, Briefcase, Clock, MessageSquare } from 'lucide-react'
import { getAccessToken } from '@/lib/auth'
import SolicitarServicioModal from '@/components/modals/SolicitarServicioModal'

interface ComparisonModalProps {
    isOpen: boolean
    onClose: () => void
    selectedIds: string[]
    onRemove: (id: string) => void
}

interface TecnicoDetail {
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
    telefono: string
    user: {
        avatarUrl: string | null
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ComparisonModal({ isOpen, onClose, selectedIds, onRemove }: ComparisonModalProps) {
    const [tecnicos, setTecnicos] = useState<TecnicoDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [solicitarModalOpen, setSolicitarModalOpen] = useState(false)
    const [selectedTecnicoForService, setSelectedTecnicoForService] = useState<TecnicoDetail | null>(null)

    useEffect(() => {
        if (isOpen && selectedIds.length > 0) {
            fetchDetails()
        } else {
            setTecnicos([])
        }
    }, [isOpen, selectedIds])

    const fetchDetails = async () => {
        setLoading(true)
        try {
            const token = getAccessToken()
            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const promises = selectedIds.map(id =>
                fetch(`${API_URL}/api/tecnicos/${id}`, { headers }).then(res => res.json())
            )

            const results = await Promise.all(promises)
            const validTecnicos = results
                .filter(r => r.success && r.data)
                .map(r => r.data)

            setTecnicos(validTecnicos)
        } catch (error) {
            console.error('Error fetching details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSolicitar = (tecnico: TecnicoDetail) => {
        setSelectedTecnicoForService(tecnico)
        setSolicitarModalOpen(true)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Comparar Técnicos</h2>
                        <p className="text-slate-500 text-sm">Analiza y elige la mejor opción para tu trabajo</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[800px] lg:min-w-0">
                            {tecnicos.map(tecnico => (
                                <div key={tecnico.id} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-blue-300 transition-all">

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => onRemove(tecnico.id)}
                                        className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-all z-10"
                                        title="Quitar de la comparación"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    {/* Profile Header */}
                                    <div className="p-6 text-center border-b border-slate-50 bg-gradient-to-b from-slate-50 to-white">
                                        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-md">
                                            {tecnico.user.avatarUrl ? (
                                                <Image src={tecnico.user.avatarUrl} alt={tecnico.nombres} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                                                    {tecnico.nombres[0]}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{tecnico.nombres} {tecnico.apellidos}</h3>
                                        <p className="text-blue-600 font-medium mb-2">{tecnico.oficio}</p>

                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            {tecnico.verificado && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                                    <ShieldCheck className="w-3 h-3" /> Verificado
                                                </span>
                                            )}
                                            {tecnico.disponible ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                                                    <CheckCircle2 className="w-3 h-3" /> Disponible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                                                    <Clock className="w-3 h-3" /> Ocupado
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleSolicitar(tecnico)}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex-1"
                                            >
                                                Solicitar
                                            </button>
                                            <Link
                                                href={`/cliente/tecnicos/${tecnico.id}`}
                                                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                Ver Perfil
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 border-b border-slate-100 divide-x divide-slate-100">
                                        <div className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-lg">
                                                <Star className="w-5 h-5 fill-current" />
                                                {Number(tecnico.calificacionPromedio).toFixed(1)}
                                            </div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Calificación</p>
                                        </div>
                                        <div className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-700 font-bold text-lg">
                                                <Briefcase className="w-5 h-5 text-slate-400" />
                                                {tecnico.trabajosCompletados}
                                            </div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Trabajos</p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-6 space-y-4 text-sm">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-slate-400" /> Sobre mí
                                            </h4>
                                            <p className="text-slate-600 line-clamp-4 leading-relaxed">
                                                {tecnico.descripcion || "Sin descripción disponible."}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400" /> Ubicación
                                            </h4>
                                            <p className="text-slate-600">
                                                {tecnico.ubicacion || "No especificada"}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reused Service Request Modal */}
            {selectedTecnicoForService && (
                <SolicitarServicioModal
                    isOpen={solicitarModalOpen}
                    onClose={() => setSolicitarModalOpen(false)}
                    tecnicoId={selectedTecnicoForService.id}
                    tecnicoNombre={`${selectedTecnicoForService.nombres} ${selectedTecnicoForService.apellidos}`}
                />
            )}
        </div>
    )
}
