'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import CalendarioDisponibilidad from "@/components/tecnicocomponents/CalendarioDisponibilidad"
import { getStoredUser, getAccessToken } from "@/lib/auth"
import { Save, RotateCcw, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const horarios = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

const TimeSelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
    {horarios.map(h => <option key={h} value={h}>{h}</option>)}
  </select>
)

export default function DisponibilidadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // State for regular schedule
  const [horarioRegular, setHorarioRegular] = useState<any[]>([])

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/Login')
      return
    }
    setUser(storedUser)
    loadDisponibilidad()
  }, [router])

  const loadDisponibilidad = async () => {
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/tecnicos/me/horarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        // Initialize with defaults if empty, or map existing
        const initialHorarios = diasSemana.map(dia => {
          const existing = data.data?.find((h: any) => h.diaSemana === dia.toUpperCase().replace('É', 'E').replace('Á', 'A'))
          return {
            diaSemana: dia,
            disponible: existing ? existing.disponible : true,
            horaInicio: existing ? existing.horaInicio : '09:00',
            horaFin: existing ? existing.horaFin : '17:00'
          }
        })
        setHorarioRegular(initialHorarios)
      }
    } catch (error) {
      console.error('Error loading schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHorarioChange = (index: number, field: string, value: any) => {
    const newHorarios = [...horarioRegular]
    newHorarios[index] = { ...newHorarios[index], [field]: value }
    setHorarioRegular(newHorarios)
  }

  const guardarCambios = async () => {
    setSaving(true)
    try {
      const token = getAccessToken()

      // Format payload as object with day keys
      const payload: any = {}
      horarioRegular.forEach(h => {
        const key = h.diaSemana.toUpperCase().replace('É', 'E').replace('Á', 'A')
        payload[key] = {
          disponible: h.disponible,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin
        }
      })

      const response = await fetch(`${API_URL}/api/tecnicos/me/horarios`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success('Horario actualizado correctamente')
      } else {
        toast.error('Error al actualizar el horario')
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderTecnico onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
      <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`pt-24 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Disponibilidad</h1>
              <p className="text-slate-500">Configura tu horario regular y excepciones</p>
            </div>
            <button
              onClick={guardarCambios}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cambios
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Regular Schedule Column */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                Horario Regular
              </h2>
              <div className="space-y-4">
                {horarioRegular.map((dia, index) => (
                  <div key={dia.diaSemana} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-24">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dia.disponible}
                          onChange={(e) => handleHorarioChange(index, 'disponible', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className={`font-medium ${dia.disponible ? 'text-slate-700' : 'text-slate-400'}`}>
                          {dia.diaSemana}
                        </span>
                      </label>
                    </div>

                    {dia.disponible ? (
                      <div className="flex items-center gap-2 text-black flex-1">
                        <TimeSelector
                          value={dia.horaInicio}
                          onChange={(val) => handleHorarioChange(index, 'horaInicio', val)}
                        />
                        <span className="text-slate-400">-</span>
                        <TimeSelector
                          value={dia.horaFin}
                          onChange={(val) => handleHorarioChange(index, 'horaFin', val)}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-slate-400 italic">
                        No disponible
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Exceptions Column */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Calendario de Excepciones</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Selecciona días específicos para marcar vacaciones, días libres o horarios especiales.
                </p>
                <CalendarioDisponibilidad onUpdate={loadDisponibilidad} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}