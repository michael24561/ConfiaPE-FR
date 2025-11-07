'use client'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: string
  trend?: string
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && <p className="text-sm text-green-600 mt-2">{trend}</p>}
    </div>
  )
}
