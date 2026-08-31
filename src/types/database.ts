export type PrioridadProceso = 'Alta/P1' | 'Media/P2' | 'Baja/P3';

export type EstadoSemaforoF1 = 'rojo' | 'amarillo' | 'verde' | 'cuadros';

export interface ProcesoJudicial {
  id: string;
  radicado: string; // 23 dígitos numéricos
  despacho: string;
  departamento_ciudad: string;
  tipo_proceso: string;
  demandante: string;
  demandado: string;
  en_vigilancia: boolean;
  prioridad: PrioridadProceso;
  estado_actual?: string;
  fecha_radicacion?: string;
  es_favorito?: boolean;
  notas_estrategicas?: string;
  created_at: string;
  updated_at?: string;
  actuaciones?: ActuacionEstado[];
  // Campos calculados para telemetría F1
  semaforo?: EstadoSemaforoF1;
  dias_restantes_termino?: number | null;
  tiene_novedad_hoy?: boolean;
}

export interface ActuacionEstado {
  id: string;
  proceso_id: string;
  fecha_actuacion: string; // ISO date 'YYYY-MM-DD'
  tipo_anotacion: string; // 'Auto', 'Fijación en Estado', 'Sentencia', 'Traslado'
  anotacion: string;
  fecha_inicial?: string | null;
  fecha_final?: string | null;
  es_nuevo: boolean;
  es_termino_fatal?: boolean;
  enlace_documento?: string | null;
  created_at: string;
}

export interface ConfiguracionAlertas {
  id: string;
  destinatario_nombre: string;
  destinatario_telefono: string; // e.g. "+573196816770"
  notificar_por_whatsapp: boolean;
  notificar_por_sistema: boolean;
  notificar_terminos_por_vencer: boolean;
  hora_resumen_diario: string;
}

export interface TelemetryMetrics {
  totalVigilancia: number;
  actuacionesHoy: number;
  alertasCriticas: number; // Bandera Roja (términos venciendo)
  pitAlerts: number; // Bandera Amarilla (movimientos recientes)
  enCarrera: number; // Bandera Verde
  estadoConexion: 'LIVE' | 'DEGRADED' | 'STANDBY';
  pingMs: number;
}
