'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    pagination?: {
        page: number
        totalPages: number
        onPageChange: (page: number) => void
    }
    actions?: (item: T) => React.ReactNode
    emptyMessage?: string
}

export default function DataTable<T extends { id: string | number }>({
    columns,
    data,
    loading = false,
    pagination,
    actions,
    emptyMessage = 'No se encontraron resultados'
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.length > 0 ? (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    {columns.map((col, index) => (
                                        <td key={index} className="px-6 py-4 whitespace-nowrap">
                                            {col.cell ? (
                                                col.cell(item)
                                            ) : (
                                                <span className="text-sm text-slate-700">
                                                    {String(item[col.accessorKey as keyof T] || '')}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {actions(item)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="px-6 py-12 text-center text-slate-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200">
                    <div className="text-sm text-slate-500">
                        Página {pagination.page} de {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Anterior
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
