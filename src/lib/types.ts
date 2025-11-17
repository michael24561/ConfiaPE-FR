export interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  timestamp: string;
  metadata: {
    trabajoId?: string;
    calificacionId?: string;
    [key: string]: any;
  };
}
