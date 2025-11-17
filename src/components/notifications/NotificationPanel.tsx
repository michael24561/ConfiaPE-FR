'use client'

import { useNotifications } from '@/context/NotificationContext';
import { Notificacion } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { getStoredUser } from '@/lib/auth';

const NotificationItem = ({ notification }: { notification: Notificacion }) => {
  const { markAsRead } = useNotifications();
  const router = useRouter();

  const getRedirectPath = (notif: Notificacion): string | null => {
    const user = getStoredUser();
    if (!user) return '/Login';

    if (notif.metadata?.trabajoId) {
      return user.rol === 'TECNICO' ? '/tecnico/trabajos' : '/cliente/trabajos';
    }
    if (notif.metadata?.calificacionId) {
      return '/tecnico/calificaciones';
    }
    return null;
  };

  const handleClick = () => {
    markAsRead(notification.id);
    const path = getRedirectPath(notification);
    if (path) {
      router.push(path);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-b border-slate-200 last:border-b-0 cursor-pointer transition-colors ${
        notification.leida ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'
      }`}
    >
      <p className="font-semibold text-slate-800 text-sm">{notification.titulo}</p>
      <p className="text-slate-600 text-sm">{notification.mensaje}</p>
      <p className="text-xs text-slate-400 mt-1">
        {new Date(notification.timestamp).toLocaleString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
};

export default function NotificationPanel() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50">
      <div className="p-4 flex justify-between items-center border-b border-slate-200">
        <h3 className="font-bold text-slate-800">Notificaciones</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No tienes notificaciones</p>
            <p className="text-sm text-slate-400 mt-1">Las alertas sobre tus trabajos aparecerán aquí.</p>
          </div>
        ) : (
          notifications.map(n => <NotificationItem key={n.id} notification={n} />)
        )}
      </div>
    </div>
  );
}