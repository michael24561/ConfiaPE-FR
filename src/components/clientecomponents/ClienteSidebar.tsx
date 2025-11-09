'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Search,
  Briefcase,
  PanelLeftClose,
  Heart,
  MessageSquare,
  User
} from 'lucide-react'

interface ClienteSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onToggle?: () => void
}

export default function ClienteSidebar({
  isOpen = true,
  onClose,
  onToggle,
}: ClienteSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { href: '/cliente', label: 'Dashboard', icon: LayoutGrid },
    { href: '/cliente/buscar', label: 'Buscar Técnicos', icon: Search },
    { href: '/cliente/trabajos', label: 'Mis Trabajos', icon: Briefcase },
    { href: '/cliente/favoritos', label: 'Favoritos', icon: Heart },
    { href: '/cliente/chat', label: 'Mensajes', icon: MessageSquare },
    { href: '/cliente/perfil', label: 'Mi Perfil', icon: User },
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
        {/* Logo */}
        <div className="p-4 border-b border-slate-200/80 flex justify-center relative">
                  <Link href="/cliente" className="transition-transform hover:scale-105">
                    <img 
                      src="/images/ConfiaPE.png" 
                      alt="ConfiaPE Logo" 
                      width="160" 
                      height="48" 
                    />
                  </Link>
                  <button 
                              onClick={onToggle} 
                              className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-100 transition-colors hidden lg:block"
                              aria-label="Ocultar menú"
                            >
                              <PanelLeftClose className="w-6 h-6 text-slate-600" />
                            </button>                </div>
        
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative overflow-hidden ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'
                        }`}
                      >
                        {/* Indicador lateral para item activo */}
                        {isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300 rounded-r-full" />
                        )}
                        
                        <Icon 
                          className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-500'
                          }`}
                        />
                        <span className="text-sm font-medium">{item.label}</span>
        
                        {/* Efecto hover */}
                        <span 
                          className={`absolute inset-0 bg-gradient-to-r from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity -z-10 ${
                            isActive ? 'hidden' : ''
                          }`}
                        />
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