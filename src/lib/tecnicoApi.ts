import { getAccessToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const fetchTecnicoApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No estás autenticado.');
  }

  const response = await fetch(`${API_URL}/api/tecnicos/me${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok || (result.success === false)) {
    throw new Error(result.error || 'Ocurrió un error en la operación.');
  }

  return result.data || result;
};

interface ServicioInput {
  nombre: string;
  descripcion?: string;
  precio?: number;
}

export const addServicio = (data: ServicioInput) => {
  return fetchTecnicoApi('/servicios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteServicio = (servicioId: string) => {
  return fetchTecnicoApi(`/servicios/${servicioId}`, {
    method: 'DELETE',
  });
};
