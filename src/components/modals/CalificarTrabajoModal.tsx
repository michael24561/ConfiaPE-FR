'use client'

import { useState } from 'react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Props {
  isOpen: boolean
  onClose: () => void
  trabajo: {
    id: string
    servicioNombre: string
    tecnico: {
      nombres: string
      apellidos: string
    }
  }
  onSuccess: () => void
}

export default function CalificarTrabajoModal({ isOpen, onClose, trabajo, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [puntuacion, setPuntuacion] = useState(0)
  const [hoverPuntuacion, setHoverPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [esPublico, setEsPublico] = useState(true)
  const [fotosUrls, setFotosUrls] = useState<string[]>([])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const token = getAccessToken()
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch(`${API_URL}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        const data = await response.json()
        if (data.success && data.data.url) {
          uploadedUrls.push(data.data.url)
        }
      }

      setFotosUrls([...fotosUrls, ...uploadedUrls])
    } catch (error) {
      console.error('Error al subir fotos:', error)
      alert('Error al subir algunas fotos')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (puntuacion === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    setLoading(true)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/calificaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trabajoId: trabajo.id,
          puntuacion,
          comentario,
          fotos: fotosUrls,
          esPublico
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Calificación enviada correctamente')
        onSuccess()
        onClose()
      } else {
        alert('❌ Error: ' + (data.error || 'No se pudo enviar la calificación'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al enviar calificación')
    } finally {
      setLoading(false)
    }
  }

  const removeFoto = (index: number) => {
    setFotosUrls(fotosUrls.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Calificar Servicio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-100">
          <p className="text-sm text-gray-600">Servicio:</p>
          <p className="font-bold text-gray-900">{trabajo.servicioNombre}</p>
          <p className="text-sm text-gray-600 mt-2">Técnico:</p>
          <p className="font-bold text-gray-900">
            {trabajo.tecnico.nombres} {trabajo.tecnico.apellidos}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Estrellas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ¿Cómo calificarías el servicio? *
            </label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPuntuacion(star)}
                  onMouseEnter={() => setHoverPuntuacion(star)}
                  onMouseLeave={() => setHoverPuntuacion(0)}
                  className="focus:outline-none transform hover:scale-110 transition-transform"
                >
                  <svg
                    className={`w-12 h-12 ${
                      star <= (hoverPuntuacion || puntuacion)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {puntuacion > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {puntuacion === 1 && '⭐ Muy malo'}
                {puntuacion === 2 && '⭐⭐ Malo'}
                {puntuacion === 3 && '⭐⭐⭐ Regular'}
                {puntuacion === 4 && '⭐⭐⭐⭐ Bueno'}
                {puntuacion === 5 && '⭐⭐⭐⭐⭐ Excelente'}
              </p>
            )}
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cuéntanos tu experiencia *
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={4}
              required
              placeholder="¿Qué te pareció el servicio? ¿El técnico fue puntual? ¿Quedó bien el trabajo?"
            />
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Agregar Fotos (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="fotos"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="fotos" className="cursor-pointer">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-600">Subiendo fotos...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">Clic para subir fotos</p>
                    <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                  </div>
                )}
              </label>
            </div>

            {/* Vista previa de fotos */}
            {fotosUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {fotosUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Público/Privado */}
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
            <input
              type="checkbox"
              id="publico"
              checked={esPublico}
              onChange={(e) => setEsPublico(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="publico" className="text-sm text-gray-700 cursor-pointer">
              Hacer pública mi calificación (otros usuarios podrán verla)
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading || puntuacion === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
