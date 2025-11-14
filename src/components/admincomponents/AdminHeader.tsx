'use client'

import { LogOut, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { removeStoredUser } from '@/lib/auth'

export default function AdminHeader({ onMenuClick, user }: { onMenuClick: () => void; user: any }) {
  const router = useRouter()

  const handleLogout = () => {
    removeStoredUser()
    router.push('/Login')
  }

  return (
    <header className="fixed w-full bg-white border-b border-slate-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Hamburger button */}
          <button
            className="text-slate-500 hover:text-slate-600 lg:hidden"
            aria-controls="sidebar"
            onClick={e => { e.stopPropagation(); onMenuClick(); }}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="w-6 h-6" />
          </button>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Header actions */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user?.nombre || 'Administrador'}</p>
              <p className="text-xs text-slate-500">{user?.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}