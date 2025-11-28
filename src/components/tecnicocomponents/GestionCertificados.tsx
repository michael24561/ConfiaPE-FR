'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Award, FileText, Eye } from 'lucide-react'
import CertificadoModal from '@/components/modals/CertificadoModal'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Certificado {
    id: string
    nombre: string
    institucion: string | null
    imagenUrl: string
    fechaObtencion: string | null
    createdAt: string
}

interface GestionCertificadosProps {
    certificados: Certificado[]
    onUpdate: () => void
}

export default function GestionCertificados({ certificados, onUpdate }: GestionCertificadosProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCertificado, setSelectedCertificado] = useState<Certificado | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleSave = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            const token = getAccessToken()
            if (!token) throw new Error('No hay sesión activa')

            const url = selectedCertificado
                ? `${API_URL}/api/tecnicos/me/certificados/${selectedCertificado.id}`
                : `${API_URL}/api/tecnicos/me/certificados`

            const method = selectedCertificado ? 'PUT' : 'POST'

            // If updating, we need to send JSON if no file is present, or FormData if file is present?
            // The backend route for PUT expects JSON body for text fields.
            // The backend route for POST expects FormData.
            // Wait, my backend implementation for PUT only accepts JSON body (updateCertificadoSchema).
            // It does NOT support file upload for update yet.
            // So if it's an update, I should convert FormData to JSON and ignore the file if it was not handled by backend.
            // Actually, for simplicity in the plan I said "maybe image too? -> For now, let's stick to updating text details".
            // So for PUT, I will send JSON.

            let response;
            if (selectedCertificado) {
                // Update (PUT) - JSON only
                const data: any = {}
                const nombre = formData.get('nombre') as string
                const institucion = formData.get('institucion') as string
                const fechaObtencion = formData.get('fechaObtencion') as string

                if (nombre) data.nombre = nombre
                if (institucion !== null) data.institucion = institucion
                if (fechaObtencion) data.fechaObtencion = fechaObtencion

                response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                })
            } else {
                // Create (POST) - FormData
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                })
            }

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || errorData.message || 'Error al guardar')
            }

            await onUpdate()
            setIsModalOpen(false)
            setSelectedCertificado(null)
        } catch (error) {
            console.error('Error saving certificate:', error)
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este certificado?')) return

        setDeletingId(id)
        try {
            const token = getAccessToken()
            if (!token) throw new Error('No hay sesión activa')

            const response = await fetch(`${API_URL}/api/tecnicos/me/certificados/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Error al eliminar')
            }

            await onUpdate()
        } catch (error) {
            console.error('Error deleting certificate:', error)
            alert('Error al eliminar el certificado')
        } finally {
            setDeletingId(null)
        }
    }

    const openAddModal = () => {
        setSelectedCertificado(null)
        setIsModalOpen(true)
    }

    const openEditModal = (cert: Certificado) => {
        setSelectedCertificado(cert)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Mis Certificados</h3>
                    <p className="text-slate-500 text-sm">Gestiona tus certificaciones y diplomas</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Agregar</span>
                </button>
            </div>

            {certificados.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No tienes certificados registrados</p>
                    <button onClick={openAddModal} className="text-blue-600 text-sm font-semibold mt-2 hover:underline">
                        Agregar el primero
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certificados.map((cert) => (
                        <div key={cert.id} className="group bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                            <div className="aspect-video bg-slate-100 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
                                {cert.imagenUrl.endsWith('.pdf') ? (
                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                        <FileText className="w-12 h-12 text-red-500 mb-2" />
                                        <span className="text-xs font-medium">Documento PDF</span>
                                    </div>
                                ) : (
                                    <img
                                        src={cert.imagenUrl}
                                        alt={cert.nombre}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a
                                        href={cert.imagenUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40 transition-colors"
                                        title="Ver"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </a>
                                    <button
                                        onClick={() => openEditModal(cert)}
                                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40 transition-colors"
                                        title="Editar"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cert.id)}
                                        disabled={deletingId === cert.id}
                                        className="p-2 bg-red-500/80 backdrop-blur-md text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                        title="Eliminar"
                                    >
                                        {deletingId === cert.id ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <h4 className="font-bold text-slate-900 mb-1 truncate" title={cert.nombre}>{cert.nombre}</h4>
                            {cert.institucion && (
                                <p className="text-sm text-slate-600 mb-2 truncate">{cert.institucion}</p>
                            )}
                            {cert.fechaObtencion && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>{new Date(cert.fechaObtencion).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <CertificadoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={selectedCertificado}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}

function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    )
}
