'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface SmartCalendarProps {
    tecnicoId: string
    onSelect: (date: Date, time: string) => void
}

interface DayAvailability {
    available: boolean
    reason?: string
    horaInicio?: string
    horaFin?: string
    isException?: boolean
}

export default function SmartCalendar({ tecnicoId, onSelect }: SmartCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [availabilityCache, setAvailabilityCache] = useState<Record<string, DayAvailability>>({})
    const [loadingDay, setLoadingDay] = useState(false)
    const [dayAvailability, setDayAvailability] = useState<DayAvailability | null>(null)

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
        return { days, firstDay: adjustedFirstDay }
    }

    const { days, firstDay } = getDaysInMonth(currentDate)

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        if (newDate < new Date(new Date().getFullYear(), new Date().getMonth(), 1)) return // Don't go back past current month
        setCurrentDate(newDate)
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const checkDayAvailability = async (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]
        console.log(`[SmartCalendar] Checking availability for date: ${dateStr}`);

        // Check cache first
        if (availabilityCache[dateStr]) {
            console.log(`[SmartCalendar] Cache hit for ${dateStr}:`, availabilityCache[dateStr]);
            setDayAvailability(availabilityCache[dateStr])
            return
        }

        setLoadingDay(true)
        try {
            const url = `${API_URL}/api/tecnicos/${tecnicoId}/disponibilidad/check?date=${dateStr}`;
            console.log(`[SmartCalendar] Fetching: ${url}`);
            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                console.log(`[SmartCalendar] Response for ${dateStr}:`, data);
                const result = data.data
                setAvailabilityCache(prev => ({ ...prev, [dateStr]: result }))
                setDayAvailability(result)
            } else {
                console.error(`[SmartCalendar] Error response: ${response.status}`);
            }
        } catch (error) {
            console.error('Error checking availability:', error)
        } finally {
            setLoadingDay(false)
        }
    }

    const handleDateClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (date < today) return

        setSelectedDate(date)
        setSelectedTime(null)
        checkDayAvailability(date)
    }

    const generateTimeSlots = (start: string, end: string) => {
        const slots = []
        let current = parseInt(start.split(':')[0])
        const endHour = parseInt(end.split(':')[0])

        while (current < endHour) {
            slots.push(`${current.toString().padStart(2, '0')}:00`)
            current++
        }
        return slots
    }

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time)
        if (selectedDate) {
            onSelect(selectedDate, time)
        }
    }

    const renderCalendar = () => {
        const daysArray = []
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="h-10 sm:h-12"></div>)
        }

        for (let i = 1; i <= days; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isPast = date < today
            const isSelected = selectedDate?.toDateString() === date.toDateString()

            daysArray.push(
                <button
                    type="button"
                    key={i}
                    onClick={() => !isPast && handleDateClick(i)}
                    disabled={isPast}
                    className={`
            h-10 sm:h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all
            ${isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : ''}
            ${!isSelected && !isPast ? 'hover:bg-blue-50 text-slate-700' : ''}
            ${isPast ? 'text-slate-300 cursor-not-allowed' : ''}
          `}
                >
                    {i}
                </button>
            )
        }
        return daysArray
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800">
                    {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-1">
                    <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                    <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-7 mb-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                        <div key={i} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                </div>
            </div>

            {selectedDate && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/30 animate-in slide-in-from-top-2">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Horarios Disponibles
                        <span className="text-xs font-normal text-slate-500 ml-auto">
                            {selectedDate.toLocaleDateString()}
                        </span>
                    </h4>

                    {loadingDay ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : dayAvailability ? (
                        dayAvailability.available ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {generateTimeSlots(dayAvailability.horaInicio || '09:00', dayAvailability.horaFin || '18:00').map(time => (
                                    <button
                                        type="button"
                                        key={time}
                                        onClick={() => handleTimeSelect(time)}
                                        className={`
                      py-2 px-1 rounded-lg text-sm font-medium transition-all border
                      ${selectedTime === time
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}
                    `}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-500 bg-slate-100 rounded-lg border border-slate-200 border-dashed">
                                <p className="text-sm font-medium text-slate-600">No disponible</p>
                                <p className="text-xs mt-1">{dayAvailability.reason}</p>
                            </div>
                        )
                    ) : null}
                </div>
            )}
        </div>
    )
}
