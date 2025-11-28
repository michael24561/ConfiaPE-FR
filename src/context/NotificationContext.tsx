'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken, getStoredUser, AuthUser } from '@/lib/auth';
import { toast } from 'react-toastify';
import { Notificacion } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface NotificationContextType {
  notifications: Notificacion[];
  unreadCount: number;
  updatedJob: any | null;
  fetchNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [updatedJob, setUpdatedJob] = useState<any | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/notificaciones`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notificacion) => !n.leida).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const socket = io(API_URL, {
        auth: { token: getAccessToken() },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('Socket.io connected');
      });

      socket.on('new_notification', (notification: Notificacion) => {
        toast.info(notification.mensaje);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      socket.on('trabajo:estado_actualizado', (job: any) => {
        toast.success(`El estado del trabajo "${job.servicioNombre}" ha sido actualizado a: ${job.estado}`);
        setUpdatedJob({ ...job, _timestamp: Date.now() }); // Add timestamp to force update
      });

      socket.on('disconnect', () => {
        console.log('Socket.io disconnected');
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && notification.leida) return;

    const token = getAccessToken();
    try {
      await fetch(`${API_URL}/api/notificaciones/${notificationId}/leida`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, leida: true } : n))
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    const token = getAccessToken();
    try {
      await fetch(`${API_URL}/api/notificaciones/leidas`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, updatedJob, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
