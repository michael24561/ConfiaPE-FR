import { getAccessToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const apiRequest = async (
  endpoint: string,
  method: 'POST' | 'PATCH' | 'GET' | 'DELETE',
  body?: any
) => {
  const token = getAccessToken()
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}/api/trabajos${endpoint}`, config)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || `Error en la petición ${method} ${endpoint}`)
  }

  // Si la respuesta no tiene contenido (ej. 204 No Content), devolver un objeto de éxito
  if (response.status === 204) {
    return { success: true }
  }

  const result = await response.json()
  return result.success ? result.data : result
}

// =================================================================
// ACCIONES DEL TÉCNICO
// =================================================================

export const solicitarVisita = (trabajoId: string) =>
  apiRequest(`/${trabajoId}/solicitar-visita`, 'POST')

export const proponerCotizacion = (trabajoId: string, precio: number) =>
  apiRequest(`/${trabajoId}/cotizar`, 'POST', { precio })

export const rechazarSolicitud = (trabajoId: string) =>
  apiRequest(`/${trabajoId}/rechazar-solicitud`, 'POST')

export const iniciarTrabajo = (trabajoId: string) =>
  apiRequest(`/${trabajoId}/iniciar`, 'POST')

export const completarTrabajo = (trabajoId: string) =>
  apiRequest(`/${trabajoId}/completar`, 'POST')

// =================================================================
// ACCIONES DEL CLIENTE
// =================================================================

export const aceptarCotizacion = (trabajoId: string) =>
  apiRequest(`/${trabajoId}/aceptar-cotizacion`, 'POST')

export const rechazarCotizacion = (trabajoId: string) =>
  apiRequest(`/${trabajoId}/rechazar-cotizacion`, 'POST')

// =================================================================
// ACCIÓN COMPARTIDA
// =================================================================

export const cancelarTrabajo = (trabajoId: string) =>
  apiRequest(`/${trabajoId}/cancelar`, 'PATCH')

export const reportarTrabajo = (trabajoId: string, data: { motivo: string; descripcion: string }) =>
  apiRequest(`/${trabajoId}/reportar`, 'POST', data)

