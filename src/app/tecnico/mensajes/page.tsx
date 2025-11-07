'use client'

import { useState } from "react"
import HeaderTecnico from "@/components/tecnicocomponents/HeaderTecnico"
import TecnicoSidebar from "@/components/tecnicocomponents/TecnicoSidebar"

// Datos de ejemplo de conversaciones
const conversacionesData = [
  {
    id: 1,
    cliente: {
      nombre: "María López",
      avatar: "ML",
      online: true
    },
    ultimoMensaje: "¿Cuándo podrías venir a revisar el problema?",
    timestamp: "Hace 5 min",
    noLeidos: 2,
    trabajos: 3,
    ultimoTrabajo: "2024-01-15"
  },
  {
    id: 2,
    cliente: {
      nombre: "Jorge Pérez",
      avatar: "JP",
      online: false
    },
    ultimoMensaje: "Perfecto, te veo mañana a las 10 AM",
    timestamp: "Hace 1 hora",
    noLeidos: 0,
    trabajos: 2,
    ultimoTrabajo: "2024-01-14"
  },
  {
    id: 3,
    cliente: {
      nombre: "Ana Torres",
      avatar: "AT",
      online: true
    },
    ultimoMensaje: "Gracias por el excelente trabajo",
    timestamp: "Hace 2 horas",
    noLeidos: 0,
    trabajos: 1,
    ultimoTrabajo: "2024-01-13"
  },
  {
    id: 4,
    cliente: {
      nombre: "Luis Fernández",
      avatar: "LF",
      online: false
    },
    ultimoMensaje: "Necesito una cotización para el tablero",
    timestamp: "Hace 3 horas",
    noLeidos: 1,
    trabajos: 0,
    ultimoTrabajo: null
  },
  {
    id: 5,
    cliente: {
      nombre: "Gloria Ramos",
      avatar: "GR",
      online: false
    },
    ultimoMensaje: "¿Podrías reprogramar la cita?",
    timestamp: "Ayer",
    noLeidos: 0,
    trabajos: 1,
    ultimoTrabajo: "2024-01-11"
  }
]

const mensajesData = [
  {
    id: 1,
    texto: "Hola Carlos, necesito ayuda con un problema eléctrico",
    enviadoPor: 'cliente',
    timestamp: "14:25",
    leido: true
  },
  {
    id: 2,
    texto: "Hola María! Por supuesto, ¿en qué puedo ayudarte?",
    enviadoPor: 'tecnico',
    timestamp: "14:26",
    leido: true
  },
  {
    id: 3,
    texto: "Tengo un cortocircuito en el cuarto principal",
    enviadoPor: 'cliente',
    timestamp: "14:28",
    leido: true
  },
  {
    id: 4,
    texto: "Eso suena como un problema en el circuito. ¿Cuándo comenzó?",
    enviadoPor: 'tecnico',
    timestamp: "14:30",
    leido: true
  },
  {
    id: 5,
    texto: "¿Cuándo podrías venir a revisar el problema?",
    enviadoPor: 'cliente',
    timestamp: "14:32",
    leido: false
  }
]

const notifications = [
  {
    id: 1,
    tipo: "mensaje",
    titulo: "Nuevo mensaje",
    mensaje: "María López te escribió",
    timestamp: "Hace 5 min",
    leida: false
  }
]

export default function MensajesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState(conversacionesData[0])
  const [nuevoMensaje, setNuevoMensaje] = useState('')

  const handleEnviarMensaje = () => {
    if (nuevoMensaje.trim()) {
      console.log('Enviando mensaje:', nuevoMensaje)
      setNuevoMensaje('')
    }
  }

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

        {/* 👇 CAMBIO CLAVE APLICADO AQUÍ */}
        <main className="flex-1 pt-20 px-4 sm:px-8 pb-8 lg:ml-64 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Mensajes
              </h1>
              <p className="text-gray-600 text-lg">
                Comunícate con tus clientes
              </p>
            </div>

            {/* Panel de mensajes */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="flex h-[calc(100vh-250px)]">
                {/* Sidebar de conversaciones */}
                <div className="w-1/3 border-r border-gray-200 bg-gray-50">
                  <div className="p-6 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-black text-gray-900 mb-2">Conversaciones</h2>
                    <p className="text-gray-600 text-sm">
                      {conversacionesData.filter(c => c.noLeidos > 0).length} mensajes sin leer
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {conversacionesData.map((conversacion) => (
                      <div
                        key={conversacion.id}
                        onClick={() => setConversacionSeleccionada(conversacion)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 ${
                          conversacionSeleccionada?.id === conversacion.id ? 'bg-blue-100 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar del cliente */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {conversacion.cliente.avatar}
                            </div>
                            {conversacion.cliente.online && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>

                          {/* Información de la conversación */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-gray-900 text-sm truncate">
                                {conversacion.cliente.nombre}
                              </h3>
                              <span className="text-xs text-gray-500">{conversacion.timestamp}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate max-w-[180px]">
                                {conversacion.ultimoMensaje}
                              </p>
                              {conversacion.noLeidos > 0 && (
                                <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                  {conversacion.noLeidos}
                                </div>
                              )}
                            </div>

                            <div className="text-xs text-blue-600 font-medium mt-1">
                              {conversacion.trabajos} trabajo{conversacion.trabajos !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Área de conversación */}
                <div className="flex-1 bg-white flex flex-col">
                  {/* Header de la conversación */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {conversacionSeleccionada.cliente.avatar}
                          </div>
                          {conversacionSeleccionada.cliente.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-gray-900">{conversacionSeleccionada.cliente.nombre}</h2>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-500">
                              {conversacionSeleccionada.cliente.online ? 'En línea' : 'Desconectado'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-3">
                        <button className="group bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-2xl hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>

                        <button className="group bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-2xl hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Área de mensajes */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="space-y-4">
                      {mensajesData.map((mensaje) => (
                        <div
                          key={mensaje.id}
                          className={`flex ${mensaje.enviadoPor === 'tecnico' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${mensaje.enviadoPor === 'tecnico' ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                mensaje.enviadoPor === 'tecnico'
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                                  : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{mensaje.texto}</p>
                            </div>
                            <div className={`text-xs text-gray-500 mt-1 ${mensaje.enviadoPor === 'tecnico' ? 'text-right' : 'text-left'}`}>
                              {mensaje.timestamp}
                            </div>
                          </div>
                          
                          {mensaje.enviadoPor === 'cliente' && (
                            <div className="order-2 ml-3 flex-shrink-0">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {conversacionSeleccionada.cliente.avatar}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Input de mensaje */}
                  <div className="p-6 border-t border-gray-200 bg-white">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensaje()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleEnviarMensaje}
                        disabled={!nuevoMensaje.trim()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
