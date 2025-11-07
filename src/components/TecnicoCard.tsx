'use client'

import Link from 'next/link'
import Image from 'next/image'

// Interfaz flexible que soporta ambos formatos
interface TecnicoCardProps {
  tecnico: {
    id: string
    oficio: string | null
    calificacionPromedio: number
    precioPorHora?: number | null
    precioMin?: number | null
    precioMax?: number | null
    trabajosCompletados?: number
    descripcion?: string | null
    estrellas?: number
    imagen?: string
    nombre?: string
    user?: {
      nombre?: string
      apellidos?: string
      avatarUrl?: string | null
    }
  }
}

export default function TecnicoCard({ tecnico }: TecnicoCardProps) {
  // Manejar nombre de forma flexible
  const nombre = tecnico.nombre ||
    (tecnico.user ? `${tecnico.user.nombre || ''} ${tecnico.user.apellidos || ''}`.trim() : 'Técnico')

  // Manejar avatar
  const avatarUrl = tecnico.imagen || tecnico.user?.avatarUrl || null

  // Manejar calificación
  const rating = Number(tecnico.estrellas || tecnico.calificacionPromedio || 0)

  // Manejar precio
  const precio = tecnico.precioPorHora || tecnico.precioMin

  return (
    <Link href={`/Tecnicos/${tecnico.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={nombre}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                {nombre[0]?.toUpperCase() || 'T'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{nombre}</h3>
            <p className="text-sm text-gray-600">{tecnico.oficio || 'Técnico'}</p>
          </div>
        </div>

        {tecnico.descripcion && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tecnico.descripcion}</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating.toFixed(1)}
            </span>
          </div>

          {precio && precio > 0 && (
            <span className="text-lg font-bold text-blue-600">
              S/ {Number(precio).toFixed(0)}{tecnico.precioPorHora ? '/h' : '+'}
            </span>
          )}
        </div>

        {tecnico.trabajosCompletados !== undefined && tecnico.trabajosCompletados > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {tecnico.trabajosCompletados} trabajo{tecnico.trabajosCompletados !== 1 ? 's' : ''} completado{tecnico.trabajosCompletados !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Link>
  )
}
