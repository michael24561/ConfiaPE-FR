'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Excepcion {
    id: string
    fecha: string
    disponible: boolean
    horaInicio?: string
    horaFin?: string
    motivo?: string
}

interface CalendarioProps {
    onUpdate?: () => void
}

export default function CalendarioDisponibilidad({ onUpdate }: CalendarioProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [exceptions, setExceptions] = useState<Excepcion[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [showModal, setShowModal] = useState(false)

    // Form state
    const [isAvailable, setIsAvailable] = useState(false)
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('17:00')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const fetchExceptions = async () => {
        try {
            const token = getAccessToken()
            const response = await fetch(`${API_URL}/api/tecnicos/me/disponibilidad/excepciones`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setExceptions(data.data || [])
            }
        } catch (error) {
            console.error('Error fetching exceptions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchExceptions()
    }, [])

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
        return { days, firstDay: adjustedFirstDay }
    }

    const { days, firstDay } = getDaysInMonth(currentDate)

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const handleDateClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        setSelectedDate(date)

        // Check if exception exists
        const existing = exceptions.find(e => new Date(e.fecha).toDateString() === date.toDateString())
        if (existing) {
            setIsAvailable(existing.disponible)
            setStartTime(existing.horaInicio || '09:00')
            setEndTime(existing.horaFin || '17:00')
            setReason(existing.motivo || '')
        } else {
            setIsAvailable(false) // Default to blocking the day
            setReason('')
        }

        setShowModal(true)
    }

    const handleSave = async () => {
        if (!selectedDate) return
        setSubmitting(true)

        try {
            const token = getAccessToken()
            const response = await fetch(`${API_URL}/api/tecnicos/me/disponibilidad/excepciones`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fecha: selectedDate.toISOString().split('T')[0],
                    disponible: isAvailable,
                    horaInicio: isAvailable ? startTime : undefined,
                    horaFin: isAvailable ? endTime : undefined,
                    motivo: reason
                })
            })

            if (response.ok) {
                await fetchExceptions()
                setShowModal(false)
                if (onUpdate) onUpdate()
            } else {
                alert('Error al guardar')
            }
        } catch (error) {
            console.error('Error saving:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta excepción?')) return
        try {
            const token = getAccessToken()
            await fetch(`${API_URL}/api/tecnicos/me/disponibilidad/excepciones/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            await fetchExceptions()
            setShowModal(false)
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    const renderCalendar = () => {
        const daysArray = []
        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="h-24 bg-slate-50 border border-slate-100"></div>)
        }

        // Days of current month
        for (let i = 1; i <= days; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
            const isToday = new Date().toDateString() === date.toDateString()
            const exception = exceptions.find(e => new Date(e.fecha).toDateString() === date.toDateString())

            daysArray.push(
                <div
                    key={i}
                    onClick={() => handleDateClick(i)}
                    className={`h-24 border border-slate-100 p-2 cursor-pointer transition-colors hover:bg-blue-50 relative ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                    <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{i}</span>

                    {exception && (
                        <div className={`mt-1 text-xs p-1 rounded ${exception.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {exception.disponible ? 'Horario Especial' : 'No Disponible'}
                        </div>
                    )}
                </div>
            )
        }

        return daysArray
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">
                    {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                    <div key={i} className="py-2 text-center text-sm font-semibold text-slate-600">{d}</div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {loading ? (
                    <div className="col-span-7 h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : renderCalendar()}
            </div>

            {/* Modal */}
            {showModal && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-4">
                            Gestionar Fecha: {selectedDate.toLocaleDateString()}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAvailable}
                                        onChange={(e) => setIsAvailable(e.target.checked)}
                                        className="w-5 h-5 rounded text-blue-600"
                                    />
                                    <span className="font-medium">Disponible este día</span>
                                </label>
                            </div>

                            {isAvailable ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Inicio</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Fin</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Motivo (Opcional)</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Ej: Vacaciones, Cita médica..."
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border rounded-lg hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={submitting}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>

                            {exceptions.find(e => new Date(e.fecha).toDateString() === selectedDate.toDateString()) && (
                                <button
                                    onClick={() => handleDelete(exceptions.find(e => new Date(e.fecha).toDateString() === selectedDate.toDateString())!.id)}
                                    className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg mt-2 flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar Excepción
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
