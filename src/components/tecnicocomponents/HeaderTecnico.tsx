'use client'

import { useState, useEffect, useRef } from 'react'
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/context/NotificationContext'
import NotificationPanel from '@/components/notifications/NotificationPanel'
import { PanelLeft, Bell, User, Settings, LogOut, HelpCircle, ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface HeaderTecnicoProps {
  onMenuClick: () => void
  user?: any
}

export default function HeaderTecnico({
  onMenuClick,
  user
}: HeaderTecnicoProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { unreadCount } = useNotifications()

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationsPanelRef.current && !notificationsPanelRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/Login')
  }

  const handleNotificationClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    setShowNotifications(prev => !prev)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-30 border-b border-slate-200/80">
      <div className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            <PanelLeft className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationsPanelRef}>
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="w-6 h-6 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </button>
            {showNotifications && <NotificationPanel />}
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowUserMenu(!showUserMenu)
              }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menú de usuario"
            >
              <div className="w-9 h-9 bg-slate-200 rounded-full">
                {user?.avatarUrl && <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800">
                  {user ? user.nombre : 'Técnico'}
                </p>
                <p className="text-xs text-slate-500">Técnico</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200/80 py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.nombre}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/tecnico/perfil" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <User className="w-4 h-4" /> Mi Perfil
                  </Link>
                  <Link href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings className="w-4 h-4" /> Configuración
                  </Link>
                  <Link href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <HelpCircle className="w-4 h-4" /> Ayuda
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
