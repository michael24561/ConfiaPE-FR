'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser, getAccessToken } from '@/lib/auth'
import {
    Search,
    MoreVertical,
    Edit,
    Ban,
    CheckCircle,
    Trash2
} from 'lucide-react'
import UserEditModal from '@/components/admincomponents/UserEditModal'
import ConfirmActionModal from '@/components/admincomponents/ConfirmActionModal'
import DataTable, { Column } from '@/components/admincomponents/DataTable'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface User {
    id: string
    email: string
    nombre: string
    rol: string
    isActive: boolean
    createdAt: string
    cliente?: any
    tecnico?: any
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('ALL')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmAction, setConfirmAction] = useState<{
        type: 'suspend' | 'activate' | 'delete'
        title: string
        message: string
    } | null>(null)
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkUser = () => {
            const storedUser = getStoredUser()
            if (!storedUser || storedUser.rol !== 'ADMIN') {
                router.push('/Login')
                return false
            }
            return true
        }

        if (checkUser()) {
            fetchUsers()
        }
    }, [router, page, roleFilter, statusFilter])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const token = getAccessToken()
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(roleFilter !== 'ALL' && { rol: roleFilter }),
                ...(statusFilter !== 'ALL' && { isActive: statusFilter })
            })

            const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            if (data.success) {
                setUsers(data.data)
                setTotalPages(data.pagination.pages)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadge = (rol: string) => {
        const colors = {
            ADMIN: 'bg-purple-100 text-purple-700',
            TECNICO: 'bg-blue-100 text-blue-700',
            CLIENTE: 'bg-green-100 text-green-700'
        }
        return colors[rol as keyof typeof colors] || 'bg-gray-100 text-gray-700'
    }

    const handleEditUser = (user: User) => {
        setSelectedUser(user)
        setShowEditModal(true)
        setShowActionsMenu(null)
    }

    const handleToggleStatus = (user: User) => {
        setSelectedUser(user)
        setConfirmAction({
            type: user.isActive ? 'suspend' : 'activate',
            title: user.isActive ? 'Suspender Usuario' : 'Activar Usuario',
            message: user.isActive
                ? `¿Estás seguro de que deseas suspender a ${user.nombre}? El usuario no podrá acceder a la plataforma.`
                : `¿Estás seguro de que deseas activar a ${user.nombre}? El usuario podrá acceder nuevamente a la plataforma.`
        })
        setShowConfirmModal(true)
        setShowActionsMenu(null)
    }

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user)
        setConfirmAction({
            type: 'delete',
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de que deseas eliminar a ${user.nombre}? Esta acción desactivará permanentemente la cuenta.`
        })
        setShowConfirmModal(true)
        setShowActionsMenu(null)
    }

    const handleModalSuccess = () => {
        fetchUsers()
    }

    const columns: Column<User>[] = [
        {
            header: 'Usuario',
            cell: (user) => (
                <div>
                    <div className="text-sm font-medium text-slate-900">{user.nombre}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                </div>
            )
        },
        {
            header: 'Rol',
            cell: (user) => (
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.rol)}`}>
                    {user.rol}
                </span>
            )
        },
        {
            header: 'Estado',
            cell: (user) => (
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {user.isActive ? 'Activo' : 'Suspendido'}
                </span>
            )
        },
        {
            header: 'Fecha de Registro',
            cell: (user) => (
                <span className="text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                </span>
            )
        }
    ]

    const renderActions = (user: User) => (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}
                className="text-slate-400 hover:text-slate-600"
            >
                <MoreVertical className="w-5 h-5" />
            </button>
            {showActionsMenu === user.id && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowActionsMenu(null)}
                    />
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1">
                            <button
                                onClick={() => handleEditUser(user)}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Editar información
                            </button>
                            <button
                                onClick={() => handleToggleStatus(user)}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                                {user.isActive ? (
                                    <>
                                        <Ban className="w-4 h-4" />
                                        Suspender usuario
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Activar usuario
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user)}
                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar usuario
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
                <p className="text-slate-600 mt-1">Administra todos los usuarios de la plataforma</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">Todos los roles</option>
                            <option value="CLIENTE">Clientes</option>
                            <option value="TECNICO">Técnicos</option>
                            <option value="ADMIN">Administradores</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">Todos los estados</option>
                            <option value="true">Activos</option>
                            <option value="false">Suspendidos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={filteredUsers}
                loading={loading}
                pagination={{
                    page,
                    totalPages,
                    onPageChange: setPage
                }}
                actions={renderActions}
            />

            {/* Modals */}
            {selectedUser && (
                <>
                    <UserEditModal
                        user={selectedUser}
                        isOpen={showEditModal}
                        onClose={() => {
                            setShowEditModal(false)
                            setSelectedUser(null)
                        }}
                        onSuccess={handleModalSuccess}
                    />

                    {confirmAction && (
                        <ConfirmActionModal
                            isOpen={showConfirmModal}
                            onClose={() => {
                                setShowConfirmModal(false)
                                setSelectedUser(null)
                                setConfirmAction(null)
                            }}
                            onSuccess={handleModalSuccess}
                            title={confirmAction.title}
                            message={confirmAction.message}
                            actionType={confirmAction.type}
                            userId={selectedUser.id}
                            requiresReason={confirmAction.type !== 'activate'}
                        />
                    )}
                </>
            )}
        </div>
    )
}
