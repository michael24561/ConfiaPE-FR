'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/auth'
import { CheckCircle, XCircle, Shield, Loader2, AlertTriangle } from 'lucide-react'
import AdminLayout from '@/components/admincomponents/AdminLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Tecnico {
  id: string
  dni: string
  verificado: boolean
  user: {
    nombre: string
    email: string
  }
  oficio: string | null
}

// API helper function
const validateTecnicoApi = async (tecnicoId: string) => {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}/api/tecnicos/${tecnicoId}/validar`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Error al validar el técnico.')
  }
  return await response.json()
}

export default function AdminTecnicosPage() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [validatingId, setValidatingId] = useState<string | null>(null)

  const fetchTecnicos = async () => {
    setLoading(true)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/admin/tecnicos`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTecnicos(data.data)
      }
    } catch (error) {
      console.error('Error fetching tecnicos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTecnicos()
  }, [])

  const handleValidate = async (tecnicoId: string) => {
    setValidatingId(tecnicoId)
    try {
      await validateTecnicoApi(tecnicoId)
      // Update UI on success
      setTecnicos(prev =>
        prev.map(t => (t.id === tecnicoId ? { ...t, verificado: true } : t))
      )
      alert('Técnico verificado exitosamente.')
    } catch (error: any) {
      if (error.message.includes('No se encontraron resultados') || error.message.includes('Los datos no coinciden con RENIEC')) {
        alert(`Verificación fallida: ${error.message}. Por favor, revise el DNI y los nombres. Si los datos son correctos, puede optar por una verificación manual.`)
      } else {
        alert(`Error: ${error.message}`)
      }
    } finally {
      setValidatingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Técnicos</h1>
        <p className="text-slate-500 mt-1">Verifica y administra los perfiles de los técnicos.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3">Oficio</th>
                <th scope="col" className="px-6 py-3">DNI</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : tecnicos.map(tecnico => (
                <tr key={tecnico.id} className="bg-white border-b hover:bg-slate-50">
                  <th scope="row" className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                    {tecnico.user.nombre}
                    <span className="block font-normal text-slate-500">{tecnico.user.email}</span>
                  </th>
                  <td className="px-6 py-4">{tecnico.oficio || 'No especificado'}</td>
                  <td className="px-6 py-4">{tecnico.dni}</td>
                  <td className="px-6 py-4">
                    {tecnico.verificado ? (
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" /> Verificado
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-5 h-5" /> Pendiente
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {!tecnico.verificado ? (
                      <button
                        onClick={() => handleValidate(tecnico.id)}
                        disabled={validatingId === tecnico.id}
                        className="font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 w-36"
                      >
                        {validatingId === tecnico.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <><Shield className="w-5 h-5" /> Verificar DNI</>
                        )}
                      </button>
                    ) : (
                      <span className="font-medium text-slate-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}