'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAccessToken, removeTokens } from '@/lib/auth'
import { useState, useEffect } from 'react'

export default function Header() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    setIsAuthenticated(!!token)
  }, [])

  const handleLogout = () => {
    removeTokens()
    setIsAuthenticated(false)
    router.push('/Login')
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ConfiaPE
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/Tecnicos" className="text-gray-700 hover:text-blue-600 transition-colors">
              Buscar Técnicos
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/cliente/trabajos" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Mis Trabajos
                </Link>
                <Link href="/chat" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Chat
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/Login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/Registro" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
