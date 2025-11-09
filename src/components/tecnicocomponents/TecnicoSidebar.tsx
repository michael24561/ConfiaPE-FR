'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Briefcase,
  ChevronRight,
  Users,
  Star,
  DollarSign,
  CalendarClock,
  User,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react'

interface TecnicoSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onToggle?: () => void
}

export default function TecnicoSidebar({
  isOpen = true,
  onClose,
  onToggle,
}: TecnicoSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { href: '/tecnico', label: 'Dashboard', icon: LayoutGrid },
    { href: '/tecnico/trabajos', label: 'Mis Trabajos', icon: Briefcase },
    { href: '/tecnico/clientes', label: 'Mis Clientes', icon: Users },
    { href: '/tecnico/calificaciones', label: 'Calificaciones', icon: Star },
    { href: '/tecnico/ingresos', label: 'Ingresos', icon: DollarSign },
    { href: '/tecnico/disponibilidad', label: 'Disponibilidad', icon: CalendarClock },
    { href: '/tecnico/perfil', label: 'Mi Perfil', icon: User },
    { href: '/tecnico/chat', label: 'Mensajes', icon: MessageSquare },
  ]

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-72 bg-white border-r border-slate-200/80 h-screen z-40 transition-all duration-300 flex flex-col shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo y Botón de Ocultar */}
        <div className="p-4 border-b border-slate-200/80 flex justify-between items-center">
          <Link href="/tecnico" className="transition-transform hover:scale-105">
            <img 
              src="/images/ConfiaPE.png" 
              alt="ConfiaPE Logo" 
              width="160" 
              height="48" 
            />
          </Link>
          {/* Botón para móvil */}
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
            aria-label="Cerrar menú"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          {/* Botón para desktop */}
          <button 
            onClick={onToggle} 
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors hidden lg:block"
            aria-label="Ocultar menú"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`} 
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80">
          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} ConfiaPE
          </p>
        </div>
      </aside>
    </>
  )
}
