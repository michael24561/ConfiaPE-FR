'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AdminTecnicosPage() {
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTecnico, setSelectedTecnico] = useState<any>(null)
  const [reniecData, setReniecData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/admin/tecnicos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.success) {
          setTecnicos(data.data)
        } else {
          setTecnicos([])
        }
      } catch (error) {
        console.error('Error fetching tecnicos:', error)
        setTecnicos([])
      } finally {
        setLoading(false)
      }
    }
    fetchTecnicos()
  }, [])

  // Filtrar técnicos por término de búsqueda
  const filteredTecnicos = tecnicos.filter(tecnico => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (tecnico.user?.nombre?.toLowerCase().includes(searchLower) || '') ||
      (tecnico.user?.email?.toLowerCase().includes(searchLower) || '') ||
      (tecnico.oficio?.toLowerCase().includes(searchLower) || '')
    )
  })

  // Calcular páginas
  const totalPages = Math.ceil(filteredTecnicos.length / itemsPerPage)
  const currentItems = filteredTecnicos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const openValidationModal = async (tecnico: any) => {
    setSelectedTecnico(tecnico)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/tecnicos/${tecnico.id}/reniec`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setReniecData(data.data)
        setModalOpen(true)
      } else {
        setError(data.error || 'Error al obtener datos de RENIEC')
      }
    } catch (error: any) {
      setError(error.message || 'Error al obtener datos de RENIEC')
    }
  }

  const handleValidate = async () => {
    if (!selectedTecnico) return

    try {
      const token = getAccessToken()
      const response = await fetch(`${API_URL}/api/tecnicos/${selectedTecnico.id}/validar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setTecnicos(tecnicos.map(t => t.id === selectedTecnico.id ? { ...t, verificado: true } : t))
        setModalOpen(false)
        setSelectedTecnico(null)
        setReniecData(null)
      } else {
        setError(data.error || 'Error al validar técnico')
      }
    } catch (error: any) {
      setError(error.message || 'Error al validar técnico')
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Técnicos</h1>
          <p className="text-gray-700">Administra los técnicos registrados en la plataforma</p>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="block w-full pl-10 pr-4 py-2.5 border-2 border-blue-100 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 text-gray-800 font-medium transition-all duration-200"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Resetear a la primera página al buscar
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-1 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-blue-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Técnico</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Contacto</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Oficio</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-50">
                {currentItems.length > 0 ? (
                  currentItems.map((tecnico, index) => (
                    <tr 
                      key={tecnico.id} 
                      className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm border border-blue-100">
                            <span className="text-blue-700 font-bold text-lg">
                              {tecnico.user?.nombre?.charAt(0).toUpperCase() || 'T'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-base font-semibold text-gray-800">{tecnico.user?.nombre || 'Sin nombre'}</div>
                            <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                              ID: {tecnico.id?.slice(0, 8) || 'N/A'}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{tecnico.user?.email || 'Sin email'}</div>
                            {tecnico.user?.telefono && (
                              <div className="text-sm text-blue-600 flex items-center mt-1">
                                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {tecnico.user.telefono}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tecnico.oficio || 'Sin especificar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tecnico.verificado ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                          <span className={`flex w-2 h-2 rounded-full mr-2 mt-1.5 ${tecnico.verificado ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          {tecnico.verificado ? 'Verificado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {!tecnico.verificado && (
                          <button 
                            onClick={() => openValidationModal(tecnico)}
                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Verificar
                          </button>
                        )}
                        <button className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900">No se encontraron técnicos</p>
                        <p className="mt-1">No hay técnicos que coincidan con tu búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3 flex items-center justify-between border-t border-blue-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-semibold text-blue-700">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                    <span className="font-semibold text-blue-700">
                      {Math.min(currentPage * itemsPerPage, filteredTecnicos.length)}
                    </span>{' '}
                    de <span className="font-semibold text-blue-700">{filteredTecnicos.length}</span> técnicos
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-blue-200 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'
                      } transition-colors`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
                          } transition-colors`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-blue-200 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'
                      } transition-colors`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Verificación */}
      {modalOpen && selectedTecnico && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Verificar Técnico
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">Datos del Técnico</h4>
                        <p className="text-sm text-gray-500">
                          {selectedTecnico.user?.nombre || 'Sin nombre'} - {selectedTecnico.user?.dni || 'Sin DNI'}
                        </p>
                        
                        {reniecData ? (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <h4 className="font-medium text-gray-900">Datos de RENIEC</h4>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <div className="text-gray-500">Nombres:</div>
                              <div className="font-medium">{reniecData.nombres || 'No disponible'}</div>
                              <div className="text-gray-500">Apellido Paterno:</div>
                              <div className="font-medium">{reniecData.apellidoPaterno || 'No disponible'}</div>
                              <div className="text-gray-500">Apellido Materno:</div>
                              <div className="font-medium">{reniecData.apellidoMaterno || 'No disponible'}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <p className="text-sm text-yellow-600">No se encontraron datos de RENIEC para este DNI.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleValidate}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  disabled={selectedTecnico?.verificado || !reniecData}
                >
                  {selectedTecnico?.verificado ? 'Ya Verificado' : 'Confirmar Verificación'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false)
                    setSelectedTecnico(null)
                    setReniecData(null)
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
