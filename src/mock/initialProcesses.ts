import { ProcesoJudicial, ConfiguracionAlertas } from '../types/database';

const today = new Date().toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
const sixDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
const termEndDateNear = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
const termEndDateCrit = new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0];

export const INITIAL_ALERT_CONFIG: ConfiguracionAlertas = {
  id: '00000000-0000-0000-0000-000000000001',
  destinatario_nombre: 'Dr. Santiago Mendoza / Despacho Central',
  destinatario_telefono: '+573196816770',
  notificar_por_whatsapp: true,
  notificar_por_sistema: true,
  notificar_terminos_por_vencer: true,
  hora_resumen_diario: '07:00'
};

export const INITIAL_PROCESSES: ProcesoJudicial[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    radicado: '11001310301520230048200',
    despacho: 'Juzgado 015 Civil del Circuito de Bogotá D.C.',
    departamento_ciudad: 'Bogotá D.C. / Cundinamarca',
    tipo_proceso: 'Ejecutivo Singular de Mayor Cuantía',
    demandante: 'BANCO DAVIVIENDA S.A. (NIT 860.034.313-7)',
    demandado: 'CONSTRUCCIONES & INVERSIONES ANDINAS S.A.S. Y OTROS',
    en_vigilancia: true,
    prioridad: 'Alta/P1',
    estado_actual: 'Mandamiento Ejecutivo y Medidas Cautelares',
    fecha_radicacion: '2023-05-18',
    es_favorito: true,
    notas_estrategicas: 'Monitorear embargo de remanentes y radicación de títulos de depósito judicial.',
    created_at: '2023-05-18T10:00:00Z',
    semaforo: 'rojo',
    dias_restantes_termino: 1,
    tiene_novedad_hoy: true,
    actuaciones: [
      {
        id: 'act-101',
        proceso_id: '11111111-1111-1111-1111-111111111111',
        fecha_actuacion: today,
        tipo_anotacion: 'Auto de Cúmplase y Medidas Cautelares',
        anotacion: 'Ordena librar mandamiento de pago por la suma de $450.000.000 COP más intereses moratorios. Decreta embargo preventivo de cuentas bancarias en entidades vigiladas por Superfinanciera.',
        fecha_inicial: today,
        fecha_final: termEndDateCrit,
        es_nuevo: true,
        es_termino_fatal: true,
        enlace_documento: 'https://consultaprocesos.ramajudicial.gov.co/doc/auto_mandamiento_11001.pdf',
        created_at: new Date().toISOString()
      },
      {
        id: 'act-102',
        proceso_id: '11111111-1111-1111-1111-111111111111',
        fecha_actuacion: sixDaysAgo,
        tipo_anotacion: 'Fijación en Estado Electrónico',
        anotacion: 'Estado No. 042. Notificación del memorial aportado por apoderado judicial de la entidad bancaria con liquidación de crédito actualizada.',
        fecha_inicial: sixDaysAgo,
        fecha_final: threeDaysAgo,
        es_nuevo: false,
        es_termino_fatal: false,
        created_at: new Date(Date.now() - 6 * 86400000).toISOString()
      },
      {
        id: 'act-103',
        proceso_id: '11111111-1111-1111-1111-111111111111',
        fecha_actuacion: tenDaysAgo,
        tipo_anotacion: 'Recepción de Memorial',
        anotacion: 'Radicación de poder especial y solicitud formal de medidas preventivas de embargo y secuestro.',
        fecha_inicial: null,
        fecha_final: null,
        es_nuevo: false,
        es_termino_fatal: false,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    radicado: '05001310500320220031801',
    despacho: 'Tribunal Superior de Medellín - Sala Laboral',
    departamento_ciudad: 'Medellín / Antioquia',
    tipo_proceso: 'Ordinario Laboral de Primera Instancia (Apelación)',
    demandante: 'CARLOS ANDRÉS MONTOYA JARAMILLO (C.C. 71.392.810)',
    demandado: 'EMPRESAS PÚBLICAS DE MEDELLÍN E.S.P. (EPM)',
    en_vigilancia: true,
    prioridad: 'Media/P2',
    estado_actual: 'Pasa al Despacho del Magistrado Ponente',
    fecha_radicacion: '2022-09-12',
    es_favorito: false,
    notas_estrategicas: 'En espera del proyecto de fallo en segunda instancia sobre reliquidación pensional.',
    created_at: '2022-09-12T14:30:00Z',
    semaforo: 'amarillo',
    dias_restantes_termino: null,
    tiene_novedad_hoy: false,
    actuaciones: [
      {
        id: 'act-201',
        proceso_id: '22222222-2222-2222-2222-222222222222',
        fecha_actuacion: threeDaysAgo,
        tipo_anotacion: 'Pasa al Despacho para Sentencia',
        anotacion: 'Expediente digital ingresa al despacho del Magistrado Ponente Dr. Restrepo para resolver el recurso de apelación interpuesto contra la sentencia proferida por el juzgado de origen.',
        fecha_inicial: null,
        fecha_final: null,
        es_nuevo: true,
        es_termino_fatal: false,
        enlace_documento: 'https://consultaprocesos.ramajudicial.gov.co/doc/pasa_despacho_05001.pdf',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'act-202',
        proceso_id: '22222222-2222-2222-2222-222222222222',
        fecha_actuacion: tenDaysAgo,
        tipo_anotacion: 'Fijación en Lista de Traslado',
        anotacion: 'Traslado a las partes por el término de cinco (5) días hábiles para presentar alegatos de conclusión en segunda instancia según art. 82 CPTSS.',
        fecha_inicial: tenDaysAgo,
        fecha_final: sixDaysAgo,
        es_nuevo: false,
        es_termino_fatal: false,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ]
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    radicado: '76001333300420240011500',
    despacho: 'Juzgado 004 Administrativo Oral de Cali',
    departamento_ciudad: 'Cali / Valle del Cauca',
    tipo_proceso: 'Medio de Control de Nulidad y Restablecimiento',
    demandante: 'LOGÍSTICA DEL PACÍFICO & CIA S.A.',
    demandado: 'DIRECCIÓN DE IMPUESTOS Y ADUANAS NACIONALES (DIAN)',
    en_vigilancia: true,
    prioridad: 'Alta/P1',
    estado_actual: 'Traslado de Excepciones Previas y Mixtas',
    fecha_radicacion: '2024-02-04',
    es_favorito: true,
    notas_estrategicas: 'Preparar memorial descorriendo excepciones sobre caducidad de la acción.',
    created_at: '2024-02-04T08:15:00Z',
    semaforo: 'rojo',
    dias_restantes_termino: 2,
    tiene_novedad_hoy: true,
    actuaciones: [
      {
        id: 'act-301',
        proceso_id: '33333333-3333-3333-3333-333333333333',
        fecha_actuacion: today,
        tipo_anotacion: 'Traslado de Excepciones Previas',
        anotacion: 'Se corre traslado a la parte demandante de las excepciones previas y de mérito formuladas por la DIAN en memorial de contestación. Término de 3 días para pronunciarse.',
        fecha_inicial: today,
        fecha_final: termEndDateNear,
        es_nuevo: true,
        es_termino_fatal: true,
        enlace_documento: 'https://consultaprocesos.ramajudicial.gov.co/doc/traslado_76001.pdf',
        created_at: new Date().toISOString()
      },
      {
        id: 'act-302',
        proceso_id: '33333333-3333-3333-3333-333333333333',
        fecha_actuacion: sixDaysAgo,
        tipo_anotacion: 'Contestación de Demanda',
        anotacion: 'Radicación oportuna del escrito de contestación de demanda presentado por el apoderado judicial de la DIAN.',
        fecha_inicial: null,
        fecha_final: null,
        es_nuevo: false,
        es_termino_fatal: false,
        created_at: new Date(Date.now() - 6 * 86400000).toISOString()
      }
    ]
  }
];

// Base de datos de procesos adicionales para simular búsquedas en vivo de Rama Judicial
export const MOCK_RAMA_JUDICIAL_SEARCH_DATABASE: ProcesoJudicial[] = [
  ...INITIAL_PROCESSES,
  {
    id: '44444444-4444-4444-4444-444444444444',
    radicado: '11001400302220230105000',
    despacho: 'Juzgado 022 Civil Municipal de Bogotá D.C.',
    departamento_ciudad: 'Bogotá D.C. / Cundinamarca',
    tipo_proceso: 'Verbal Sumario - Restitución de Inmueble Arrendado',
    demandante: 'INMOBILIARIA SANTA FE DE BOGOTÁ LTDA.',
    demandado: 'ALBERTO GÓMEZ PINZÓN & CIA',
    en_vigilancia: false,
    prioridad: 'Media/P2',
    estado_actual: 'Fijación Fecha Audiencia Inicial Art. 392 CGP',
    fecha_radicacion: '2023-11-20',
    created_at: '2023-11-20T11:00:00Z',
    semaforo: 'verde',
    actuaciones: [
      {
        id: 'act-401',
        proceso_id: '44444444-4444-4444-4444-444444444444',
        fecha_actuacion: tenDaysAgo,
        tipo_anotacion: 'Auto Fija Fecha de Audiencia',
        anotacion: 'Fija fecha para llevar a cabo la audiencia concentrada de que trata el artículo 392 del CGP para el día 15 de octubre a las 9:00 AM mediante enlace virtual Teams.',
        fecha_inicial: null,
        fecha_final: null,
        es_nuevo: false,
        es_termino_fatal: false,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ]
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    radicado: '08001310300220230089000',
    despacho: 'Juzgado 002 Civil del Circuito de Barranquilla',
    departamento_ciudad: 'Barranquilla / Atlántico',
    tipo_proceso: 'Proceso de Insolvencia Económica de Persona Natural',
    demandante: 'MARÍA FERNANDA ROA VALLEJO (C.C. 52.889.412)',
    demandado: 'ACREEDORES VARIOS (BANCOLOMBIA, FALABELLA, COOPCENTRO)',
    en_vigilancia: false,
    prioridad: 'Alta/P1',
    estado_actual: 'Auto de Admisión y Suspensión de Procesos Ejecutivos',
    fecha_radicacion: '2023-08-14',
    created_at: '2023-08-14T09:00:00Z',
    semaforo: 'amarillo',
    actuaciones: [
      {
        id: 'act-501',
        proceso_id: '55555555-5555-5555-5555-555555555555',
        fecha_actuacion: threeDaysAgo,
        tipo_anotacion: 'Auto Apertura Trámite Liquidación',
        anotacion: 'Declara la apertura del trámite de liquidación patrimonial. Oficia a juzgados de conocimiento para la remisión de procesos ejecutivos en curso.',
        fecha_inicial: threeDaysAgo,
        fecha_final: termEndDateNear,
        es_nuevo: true,
        es_termino_fatal: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ]
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    radicado: '11001333501020240004500',
    despacho: 'Juzgado 010 Administrativo del Circuito de Bogotá D.C.',
    demandante: 'COLPENSIONES - ADMINISTRADORA COLOMBIANA DE PENSIONES',
    demandado: 'HERNANDO SILVA RAMÍREZ',
    departamento_ciudad: 'Bogotá D.C. / Cundinamarca',
    tipo_proceso: 'Acción de Lesividad',
    en_vigilancia: false,
    prioridad: 'Baja/P3',
    estado_actual: 'Admisión de Demanda',
    fecha_radicacion: '2024-01-15',
    created_at: '2024-01-15T15:00:00Z',
    semaforo: 'verde',
    actuaciones: [
      {
        id: 'act-601',
        proceso_id: '66666666-6666-6666-6666-666666666666',
        fecha_actuacion: tenDaysAgo,
        tipo_anotacion: 'Auto Admisorio de la Demanda',
        anotacion: 'Se admite la demanda de lesividad interpuesta por COLPENSIONES contra la Resolución No. 04891 de reliquidación pensional.',
        fecha_inicial: null,
        fecha_final: null,
        es_nuevo: false,
        es_termino_fatal: false,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ]
  }
];
