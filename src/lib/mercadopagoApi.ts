import { getAccessToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const mpApiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST',
  body?: any
) => {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Error en la petición a ${endpoint}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'La respuesta de la API no fue exitosa');
  }
  
  return result.data;
};

/**
 * Crea una preferencia de pago para un trabajo y obtiene la URL del checkout.
 * @param trabajoId El ID del trabajo a pagar.
 */
export const crearPreferenciaPago = (trabajoId: string) => 
  mpApiRequest('/payments/create-preference', 'POST', { trabajoId });
