'use client'

import Image from 'next/image'
import { X, ArrowRight, Layers } from 'lucide-react'

interface ComparisonBarProps {
    selectedTechs: {
        id: string
        nombre: string
        imagen: string | null
    }[]
    onRemove: (id: string) => void
    onClear: () => void
    onCompare: () => void
}

export default function ComparisonBar({ selectedTechs, onRemove, onClear, onCompare }: ComparisonBarProps) {
    if (selectedTechs.length === 0) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center justify-between gap-4 border border-slate-700/50 ring-1 ring-white/10">

                <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300 px-2 border-r border-slate-700/50 hidden sm:flex">
                        <Layers className="w-4 h-4" />
                        <span>Comparar</span>
                    </div>

                    <div className="flex items-center -space-x-3">
                        {selectedTechs.map((tech) => (
                            <div key={tech.id} className="relative group">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-slate-800 relative overflow-hidden bg-slate-700 transition-transform group-hover:scale-105 group-hover:z-10">
                                    {tech.imagen ? (
                                        <Image src={tech.imagen} alt={tech.nombre} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                            {tech.nombre[0]}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => onRemove(tech.id)}
                                    className="absolute -top-1 -right-1 bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500 rounded-full p-0.5 border border-slate-600 opacity-0 group-hover:opacity-100 transition-all z-20"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-xs text-slate-400 whitespace-nowrap">
                        <span className="font-bold text-white">{selectedTechs.length}</span> / 3
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={onClear}
                        className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={onCompare}
                        disabled={selectedTechs.length < 2}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                    >
                        Comparar <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    )
}
