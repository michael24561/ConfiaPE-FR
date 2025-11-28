'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface ConfirmActionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    title: string
    message: string
    actionType: 'suspend' | 'activate' | 'delete' | 'resolve'
    userId: string // This is actually the resource ID
    resource?: 'user' | 'rating' | 'report'
    requiresReason?: boolean
}

export default function ConfirmActionModal({
    isOpen,
    onClose,
    onSuccess,
    title,
    message,
    actionType,
    userId,
    resource = 'user',
    requiresReason = false
}: ConfirmActionModalProps) {
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        if (requiresReason && !reason.trim()) {
            setError('El motivo es requerido')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const token = getAccessToken()
            let endpoint = ''
            let method = ''
            let body: any = {}

            if (resource === 'user') {
                switch (actionType) {
                    case 'suspend':
                        endpoint = `${API_URL}/api/admin/users/${userId}/status`
                        method = 'PATCH'
                        body = { isActive: false, motivo: reason }
                        break
                    case 'activate':
                        endpoint = `${API_URL}/api/admin/users/${userId}/status`
                        method = 'PATCH'
                        body = { isActive: true, motivo: reason || 'Reactivación de usuario' }
                        break
                    case 'delete':
                        endpoint = `${API_URL}/api/admin/users/${userId}`
                        method = 'DELETE'
                        body = { motivo: reason }
                        break
                }
            } else if (resource === 'rating') {
                if (actionType === 'delete') {
                    endpoint = `${API_URL}/api/admin/calificaciones/${userId}`
                    method = 'DELETE'
                    body = { motivo: reason }
                }
            } else if (resource === 'report') {
                // Placeholder for reports
                if (actionType === 'resolve') {
                    // endpoint = ...
                }
            }

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            const data = await response.json()

            if (data.success) {
                onSuccess()
                onClose()
                setReason('')
            } else {
                setError(data.error || 'Error al realizar la acción')
            }
        } catch (error) {
            console.error('Error performing action:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const getButtonColor = () => {
        switch (actionType) {
            case 'delete':
            case 'suspend':
                return 'bg-red-600 hover:bg-red-700'
            case 'activate':
                return 'bg-green-600 hover:bg-green-700'
            default:
                return 'bg-blue-600 hover:bg-blue-700'
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${actionType === 'delete' || actionType === 'suspend'
                            ? 'bg-red-100'
                            : 'bg-green-100'
                            }`}>
                            <AlertTriangle className={`w-5 h-5 ${actionType === 'delete' || actionType === 'suspend'
                                ? 'text-red-600'
                                : 'text-green-600'
                                }`} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <p className="text-slate-600">{message}</p>

                    {requiresReason && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Motivo <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                                placeholder="Explica el motivo de esta acción..."
                                required
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
