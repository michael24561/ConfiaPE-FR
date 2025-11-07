'use client'

import { useState } from "react"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"

// Datos de ejemplo de ingresos
const ingresosData = {
  totalMes: 4850,
  totalAnio: 58200,
  promedioTrabajo: 120,
  trabajosMes: 40,
  crecimiento: 15.2
}

const ingresosDetalle = [
  { mes: "Enero", ingreso: 4850, trabajos: 40 },
  { mes: "Diciembre", ingreso: 4200, trabajos: 35 },
  { mes: "Noviembre", ingreso: 5100, trabajos: 42 },
  { mes: "Octubre", ingreso: 4600, trabajos: 38 },
  { mes: "Septiembre", ingreso: 3900, trabajos: 32 },
  { mes: "Agosto", ingreso: 4500, trabajos: 37 }
]

const notifications = [
  {
    id: 1,
    tipo: "ingreso",
    titulo: "Nuevo pago",
    mensaje: "María López realizó el pago de S/ 120",
    timestamp: "Hace 5 min",
    leida: false
  }
]

export default function IngresosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <HeaderTecnico 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notifications={notifications}
      />

      <div className="flex">
        <TecnicoSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

      <main className={`flex-1 pt-20 px-4 sm:px-8 pb-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Ingresos
              </h1>
              <p className="text-gray-600 text-lg">
                Controla tus ingresos y finanzas
              </p>
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Ingresos del Mes</p>
                    <p className="text-3xl font-black text-gray-900">S/ {ingresosData.totalMes.toLocaleString()}</p>
                    <p className="text-sm text-green-600 font-medium">+{ingresosData.crecimiento}% vs mes anterior</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Ingresos del Año</p>
                    <p className="text-3xl font-black text-gray-900">S/ {ingresosData.totalAnio.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Promedio por Trabajo</p>
                    <p className="text-3xl font-black text-gray-900">S/ {ingresosData.promedioTrabajo}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Trabajos del Mes</p>
                    <p className="text-3xl font-black text-gray-900">{ingresosData.trabajosMes}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de ingresos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6">Ingresos por Mes</h3>
                <div className="space-y-4">
                  {ingresosDetalle.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{item.mes}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                            style={{ width: `${(item.ingreso / Math.max(...ingresosDetalle.map(i => i.ingreso))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900 w-20 text-right">S/ {item.ingreso.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6">Resumen Financiero</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-bold">Ingresos Netos</p>
                        <p className="text-2xl font-black text-green-900">S/ {ingresosData.totalMes.toLocaleString()}</p>
                      </div>
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-bold">Meta Mensual</p>
                        <p className="text-2xl font-black text-blue-900">S/ 5,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600">Progreso</p>
                        <p className="text-xl font-bold text-blue-900">
                          {Math.round((ingresosData.totalMes / 5000) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-800 font-bold">Próximo Pago</p>
                        <p className="text-2xl font-black text-yellow-900">S/ 180</p>
                        <p className="text-sm text-yellow-600">Jorge Pérez - Instalación</p>
                      </div>
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-4">
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Reporte
              </button>

              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ver Estadísticas Detalladas
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
