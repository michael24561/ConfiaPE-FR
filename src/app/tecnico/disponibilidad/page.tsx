'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"
import { getStoredUser, getAccessToken } from "@/lib/auth"
import { Save, RotateCcw, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const horarios = Array.from({ length: 18 }, (_, i) => `${i + 6}:00`);

interface ConfigDia {
  inicio: string; fin: string; disponible: boolean;
}
type DisponibilidadState = Record<string, ConfigDia>

const disponibilidadInicial: DisponibilidadState = {
  lunes: { inicio: '08:00', fin: '18:00', disponible: true },
  martes: { inicio: '08:00', fin: '18:00', disponible: true },
  miercoles: { inicio: '08:00', fin: '18:00', disponible: true },
  jueves: { inicio: '08:00', fin: '18:00', disponible: true },
  viernes: { inicio: '08:00', fin: '18:00', disponible: true },
  sabado: { inicio: '09:00', fin: '15:00', disponible: true },
  domingo: { inicio: '09:00', fin: '13:00', disponible: false }
}

import CalendarioDisponibilidad from "@/components/tecnicocomponents/CalendarioDisponibilidad"

export default function DisponibilidadPage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadState>(disponibilidadInicial)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.rol !== 'TECNICO') {
      router.push('/Login'); return
    }
    setUser(storedUser)
  }, [router])

  useEffect(() => {
    const loadDisponibilidad = async () => {
      if (!user) return
      setLoading(true)
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/tecnicos/me/horarios`, { headers: { 'Authorization': `Bearer ${token}` } })
        const data = await response.json()
        if (data.success && data.data.length) {
          const newDisponibilidad: any = { ...disponibilidadInicial }
          data.data.forEach((horario: any) => {
            const diaKey = horario.dia.toLowerCase()
            newDisponibilidad[diaKey] = {
              inicio: horario.horaInicio,
              fin: horario.horaFin,
              disponible: horario.disponible
            }
          })
          setDisponibilidad(newDisponibilidad)
        }
      } catch (error) { console.error('Error cargando disponibilidad:', error) }
      finally { setLoading(false) }
    }
    loadDisponibilidad()
  }, [user])

  const handleCambioDisponibilidad = (dia: string, campo: keyof ConfigDia, valor: string | boolean) => {
    setDisponibilidad(prev => ({ ...prev, [dia]: { ...prev[dia], [campo]: valor } }))
  }

  const guardarCambios = async () => {
    setIsSaving(true)
    try {
      const token = getAccessToken()
      const horariosArray = Object.entries(disponibilidad).map(([dia, config]) => ({
        dia: dia.toUpperCase(),
        horaInicio: config.inicio,
        horaFin: config.fin,
        disponible: config.disponible
      }))
      const response = await fetch(`${API_URL}/api/tecnicos/me/horarios`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ horarios: horariosArray })
      })
      if (response.ok) {
        alert('Horario semanal guardado exitosamente')
      } else { throw new Error('Error al guardar cambios') }
    } catch (error) {
      console.error('Error guardando disponibilidad:', error)
      alert('Error al guardar cambios')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <HeaderTecnico onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
      <div className="flex relative">
        <TecnicoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
          <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Disponibilidad</h1>
              <p className="text-slate-500">Configura tu horario semanal y gestiona excepciones (vacaciones, días libres).</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Columna 1: Horario Semanal */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      📅 Horario Semanal Base
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Define tu horario habitual de trabajo. Este horario se aplicará todas las semanas.</p>

                    <div className="space-y-4">
                      {diasSemana.map((dia) => {
                        const diaKey = dia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        const configDia = disponibilidad[diaKey]
                        return (
                          <div key={dia} className={`p-3 rounded-xl border transition-colors ${configDia.disponible ? 'border-blue-100 bg-blue-50/30' : 'border-slate-100 bg-slate-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-slate-700">{dia}</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={configDia.disponible} onChange={(e) => handleCambioDisponibilidad(diaKey, 'disponible', e.target.checked)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            {configDia.disponible && (
                              <div className="flex gap-2">
                                <TimeSelector value={configDia.inicio} onChange={(val) => handleCambioDisponibilidad(diaKey, 'inicio', val)} />
                                <span className="text-slate-400 self-center">-</span>
                                <TimeSelector value={configDia.fin} onChange={(val) => handleCambioDisponibilidad(diaKey, 'fin', val)} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button onClick={guardarCambios} disabled={isSaving} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Guardando...' : 'Guardar Horario Semanal'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Excepciones y Calendario */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      ✨ Excepciones y Fechas Específicas
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Haz clic en un día para bloquearlo (vacaciones) o cambiar el horario solo para esa fecha.</p>

                    <CalendarioDisponibilidad />
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

const TimeSelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
    {horarios.map(h => <option key={h} value={`${h}:00`}>{h}</option>)}
  </select>
)