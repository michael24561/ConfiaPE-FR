
import { getAccessToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Calificacion {
  id: string;
  puntuacion: number;
  comentario: string;
  fechaCreacion: string;
  fotos?: string[];
  user: {
    nombre: string;
    avatarUrl: string | null;
  };
}

export interface PaginatedCalificaciones {
  data: Calificacion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getCalificacionesPorTecnico = async (
  tecnicoId: string,
  page: number = 1,
  limit: number = 5
): Promise<PaginatedCalificaciones> => {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}/api/calificaciones/tecnico/${tecnicoId}?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  const result = await response.json();

  if (!response.ok || (result.success === false)) {
    throw new Error(result.error || 'No se pudieron cargar las calificaciones.');
  }

  return result;
};

export type CreateCalificacionPayload = {
  trabajoId: string;
  puntuacion: number;
  comentario: string;
  fotos?: string[];
  esPublico?: boolean;
};

export const createCalificacion = async (data: CreateCalificacionPayload) => {
  const token = getAccessToken();
  if (!token) throw new Error('No autenticado');

  const response = await fetch(`${API_URL}/api/calificaciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.error || 'Error al crear la calificación.');
  }
  return result.data;
};

export type UpdateCalificacionPayload = {
  puntuacion?: number;
  comentario?: string;
  esPublico?: boolean;
};

export const updateOwnCalificacion = async (
  calificacionId: string,
  data: UpdateCalificacionPayload
) => {
  const token = getAccessToken();
  if (!token) throw new Error('No autenticado');

  const response = await fetch(`${API_URL}/api/calificaciones/${calificacionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.error || 'Error al actualizar la calificación.');
  }
  return result.data;
};

export const deleteOwnCalificacion = async (calificacionId: string) => {
  const token = getAccessToken();
  if (!token) throw new Error('No autenticado');

  const response = await fetch(`${API_URL}/api/calificaciones/${calificacionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.error || 'Error al eliminar la calificación.');
  }
  return result.data;
};
