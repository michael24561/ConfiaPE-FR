'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShieldCheck, MapPin, Heart } from 'lucide-react'
import { getAccessToken } from '@/lib/auth'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface TecnicoCardProps {
  tecnico: {
    id: string
    nombre: string
    oficio: string | null
    descripcion?: string | null
    calificacionPromedio: number
    trabajosCompletados?: number
    imagen?: string | null
    verificado?: boolean
    disponible?: boolean
    esFavorito?: boolean
    ubicacion?: string | null
  }
}

export default function TecnicoCard({ tecnico }: TecnicoCardProps) {
  const [isFavorite, setIsFavorite] = useState(tecnico.esFavorito || false)
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false)

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isProcessingFavorite) return
    setIsProcessingFavorite(true)

    try {
      const token = getAccessToken()
      if (!token) return // Or redirect to login

      const response = await fetch(`${API_URL}/api/favoritos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tecnicoId: tecnico.id }),
      })

      if (response.ok) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsProcessingFavorite(false)
    }
  }

  const rating = Number(tecnico.calificacionPromedio || 0)

  return (
    <Link href={`/cliente/tecnicos/${tecnico.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 h-full flex flex-col overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-blue-500/50">
        <div className={`h-1.5 ${tecnico.disponible ? 'bg-green-500' : 'bg-slate-300'}`}></div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
              {tecnico.imagen ? (
                <Image src={tecnico.imagen} alt={tecnico.nombre} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                  {tecnico.nombre[0]?.toUpperCase() || 'T'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 truncate">{tecnico.nombre}</h3>
              <p className="text-sm text-slate-500">{tecnico.oficio || 'Técnico'}</p>
              {tecnico.verificado && (
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verificado</span>
                </div>
              )}
            </div>
            <button onClick={handleFavoriteToggle} className={`transition-colors duration-200 ${isProcessingFavorite ? 'opacity-50' : ''}`}>
              <Heart className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-slate-400 hover:text-red-500'}`} />
            </button>
          </div>

          {tecnico.descripcion && (
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{tecnico.descripcion}</p>
          )}

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-bold text-slate-700">{rating.toFixed(1)}</span>
                <span className="text-slate-500">({tecnico.trabajosCompletados || 0})</span>
              </div>
              {tecnico.ubicacion && (
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span>{tecnico.ubicacion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
