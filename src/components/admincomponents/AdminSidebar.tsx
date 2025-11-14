'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  ChevronLeft,
  Building,
  ShieldCheck,
} from 'lucide-react'
import Image from 'next/image'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/tecnicos', icon: Users, label: 'Técnicos' },
  { href: '/admin/clientes', icon: Users, label: 'Clientes' },
  { href: '/admin/trabajos', icon: Briefcase, label: 'Trabajos' },
  { href: '/admin/reportes', icon: ShieldCheck, label: 'Reportes' },
  { href: '/admin/servicios', icon: Building, label: 'Servicios' },
  { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
]

export default function AdminSidebar({ isOpen, onClose, onToggle }: { isOpen: boolean; onClose: () => void; onToggle: () => void; }) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-30 lg:hidden lg:z-auto transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-auto w-72 lg:w-72 lg:sidebar-expanded:!w-72 2xl:!w-72 shrink-0 bg-slate-800 p-4 transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-72'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Logo */}
          <Link href="/admin" className="block">
            <div className="flex items-center gap-3">
              <Image src="/images/ConfiaPE.png" alt="ConfiaPE Logo" width={40} height={40} className="bg-white rounded-full p-1" />
              <span className="text-white text-2xl font-bold">ConfiaPE<span className="text-blue-400"> Admin</span></span>
            </div>
          </Link>
          {/* Close button */}
          <button
            className="lg:hidden text-slate-500 hover:text-slate-400"
            onClick={onClose}
            aria-controls="sidebar"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`block text-slate-200 hover:text-white transition duration-150 rounded-lg ${isActive ? 'bg-slate-900' : ''}`}
              >
                <div className="flex items-center p-3">
                  <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium ml-3">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}