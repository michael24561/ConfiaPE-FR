'use client'

import { useState, useEffect } from 'react'
import AdminHeader from '@/components/admincomponents/AdminHeader'
import AdminSidebar from '@/components/admincomponents/AdminSidebar'
import { getStoredUser } from '@/lib/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null) // Nuevo estado para el usuario

  useEffect(() => {
    // Cargar el usuario solo en el cliente
    const user = getStoredUser()
    setCurrentUser(user)
  }, [])

  // Mostrar un loader o contenido vacío mientras se hidrata y carga el usuario
  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <AdminHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        user={currentUser}
      />
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className={`flex-1 pt-20 transition-all duration-300 lg:pl-72`}> {/* Main content area, always offset on large screens */}
        <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}