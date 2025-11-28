'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload, Calendar, Building, FileText } from 'lucide-react'

interface CertificadoModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: FormData) => Promise<void>
    initialData?: {
        id?: string
        nombre: string
        institucion: string | null
        fechaObtencion: string | null
        imagenUrl?: string
    } | null
    isSubmitting: boolean
}

export default function CertificadoModal({ isOpen, onClose, onSave, initialData, isSubmitting }: CertificadoModalProps) {
    const [nombre, setNombre] = useState('')
    const [institucion, setInstitucion] = useState('')
    const [fechaObtencion, setFechaObtencion] = useState('')
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNombre(initialData.nombre)
                setInstitucion(initialData.institucion || '')
                setFechaObtencion(initialData.fechaObtencion ? new Date(initialData.fechaObtencion).toISOString().split('T')[0] : '')
                setPreviewUrl(initialData.imagenUrl || null)
            } else {
                resetForm()
            }
        }
    }, [isOpen, initialData])

    const resetForm = () => {
        setNombre('')
        setInstitucion('')
        setFechaObtencion('')
        setPreviewUrl(null)
        setFile(null)
        setError(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
            setError('Solo se permiten archivos de imagen o PDF')
            return
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('El archivo no debe superar los 5MB')
            return
        }

        setFile(selectedFile)
        setError(null)

        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        } else {
            setPreviewUrl(null) // No preview for PDF, handled in UI
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!nombre.trim()) {
            setError('El nombre del certificado es obligatorio')
            return
        }

        if (!initialData && !file) {
            setError('Debes subir un archivo del certificado')
            return
        }

        const formData = new FormData()
        formData.append('nombre', nombre.trim())
        if (institucion.trim()) formData.append('institucion', institucion.trim())
        if (fechaObtencion) formData.append('fechaObtencion', new Date(fechaObtencion).toISOString())
        if (file) formData.append('file', file)

        try {
            await onSave(formData)
            onClose()
        } catch (err: any) {
            setError(err.message || 'Error al guardar el certificado')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">
                        {initialData ? 'Editar Certificado' : 'Agregar Certificado'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del Certificado *</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                                placeholder="Ej: Curso de Electricidad Industrial"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Institución</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={institucion}
                                onChange={(e) => setInstitucion(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                                placeholder="Ej: SENATI"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha de Obtención</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="date"
                                value={fechaObtencion}
                                onChange={(e) => setFechaObtencion(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Archivo del Certificado {initialData ? '(Opcional)' : '*'}</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all min-h-[150px]"
                        >
                            {previewUrl ? (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden group">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-medium text-sm">Cambiar archivo</span>
                                    </div>
                                </div>
                            ) : file && file.type === 'application/pdf' ? (
                                <div className="flex flex-col items-center justify-center text-slate-600">
                                    <FileText className="w-12 h-12 text-red-500 mb-2" />
                                    <span className="font-medium">{file.name}</span>
                                    <span className="text-xs text-slate-400 mt-1">PDF Seleccionado</span>
                                </div>
                            ) : initialData?.imagenUrl?.endsWith('.pdf') ? (
                                <div className="flex flex-col items-center justify-center text-slate-600">
                                    <FileText className="w-12 h-12 text-red-500 mb-2" />
                                    <span className="font-medium">Certificado PDF Actual</span>
                                    <span className="text-xs text-slate-400 mt-1">Click para cambiar</span>
                                </div>
                            ) : initialData?.imagenUrl ? (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden group">
                                    <img src={initialData.imagenUrl} alt="Preview" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-medium text-sm">Cambiar archivo</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500">Haga clic para subir archivo</span>
                                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, PDF hasta 5MB</span>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
