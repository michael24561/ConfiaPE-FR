'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PublicHeader() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-30 border-b border-slate-200/80">
      <div className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <img 
              src="/images/ConfiaPE.png" 
              alt="ConfiaPE Logo" 
              width="160" 
              height="48" 
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4">
          <Link 
            href="/Login" 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              pathname === '/Login' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/Registro" 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              pathname === '/Registro' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Registrarse
          </Link>
        </nav>
      </div>
    </header>
  )
}