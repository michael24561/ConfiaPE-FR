'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface User {
    id: string
    email: string
    nombre: string
    telefono?: string
    avatarUrl?: string
    rol: string
    direccion?: string
}

interface UserEditModalProps {
    user: User
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function UserEditModal({ user, isOpen, onClose, onSuccess }: UserEditModalProps) {
    const [formData, setFormData] = useState({
        nombre: user.nombre,
        telefono: user.telefono || '',
        avatarUrl: user.avatarUrl || '',
        direccion: user.direccion || '',
        rol: user.rol
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setFormData({
                nombre: user.nombre,
                telefono: user.telefono || '',
                avatarUrl: user.avatarUrl || '',
                direccion: user.direccion || '',
                rol: user.rol
            })
            setError(null)
        }
    }, [isOpen, user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const token = getAccessToken()
            const response = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (data.success) {
                onSuccess()
                onClose()
            } else {
                setError(data.error || 'Error al actualizar usuario')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            setError('Error de conexión al actualizar usuario')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-slate-800">Editar Usuario</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 mt-1">El email no se puede modificar por seguridad</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Rol
                        </label>
                        <select
                            value={formData.rol}
                            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="CLIENTE">Cliente</option>
                            <option value="TECNICO">Técnico</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Opcional"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Dirección
                        </label>
                        <input
                            type="text"
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Opcional"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            URL de Avatar
                        </label>
                        <input
                            type="url"
                            value={formData.avatarUrl}
                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://ejemplo.com/avatar.jpg"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
