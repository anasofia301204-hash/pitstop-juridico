-- ==============================================================================
-- PITSTOP JUDICIAL / LEGAL TELEMETRY COLOMBIA
-- Database Schema: PostgreSQL 14+ / Supabase
-- Target System: Rama Judicial de Colombia Case Watchlist & Telemetry Monitoring
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for Process Priority
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prioridad_proceso') THEN
        CREATE TYPE prioridad_proceso AS ENUM ('Alta/P1', 'Media/P2', 'Baja/P3');
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- Table 1: PROCESOS (Watchlist / Master Case Registry)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procesos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    radicado VARCHAR(23) NOT NULL,
    despacho VARCHAR(255) NOT NULL,
    departamento_ciudad VARCHAR(120) NOT NULL,
    tipo_proceso VARCHAR(150) NOT NULL,
    demandante TEXT NOT NULL,
    demandado TEXT NOT NULL,
    en_vigilancia BOOLEAN DEFAULT TRUE NOT NULL,
    prioridad prioridad_proceso DEFAULT 'Media/P2' NOT NULL,
    estado_actual VARCHAR(80) DEFAULT 'En Trámite',
    fecha_radicacion DATE,
    es_favorito BOOLEAN DEFAULT FALSE,
    notas_estrategicas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_procesos_radicado UNIQUE (radicado),
    CONSTRAINT chk_radicado_len CHECK (char_length(radicado) = 23)
);

-- Fast Indexing for Colombian Radicado searches and Telemetry filtering
CREATE INDEX IF NOT EXISTS idx_procesos_radicado ON procesos USING btree (radicado);
CREATE INDEX IF NOT EXISTS idx_procesos_en_vigilancia ON procesos (en_vigilancia);
CREATE INDEX IF NOT EXISTS idx_procesos_prioridad ON procesos (prioridad);
CREATE INDEX IF NOT EXISTS idx_procesos_despacho ON procesos (despacho);
CREATE INDEX IF NOT EXISTS idx_procesos_demandante_trgm ON procesos USING gin (to_tsvector('spanish', demandante));
CREATE INDEX IF NOT EXISTS idx_procesos_demandado_trgm ON procesos USING gin (to_tsvector('spanish', demandado));

-- ------------------------------------------------------------------------------
-- Table 2: ACTUACIONES_ESTADOS (Case Laps / Chronological Legal Events)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS actuaciones_estados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proceso_id UUID NOT NULL,
    fecha_actuacion DATE NOT NULL,
    tipo_anotacion VARCHAR(150) NOT NULL,
    anotacion TEXT NOT NULL,
    fecha_inicial DATE,
    fecha_final DATE,
    es_nuevo BOOLEAN DEFAULT TRUE NOT NULL,
    es_termino_fatal BOOLEAN DEFAULT FALSE,
    enlace_documento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_actuaciones_proceso FOREIGN KEY (proceso_id) 
        REFERENCES procesos(id) ON DELETE CASCADE
);

-- Indexing for fast chronological querying & dashboard telemetry feed
CREATE INDEX IF NOT EXISTS idx_actuaciones_proceso_id ON actuaciones_estados (proceso_id);
CREATE INDEX IF NOT EXISTS idx_actuaciones_fecha_actuacion ON actuaciones_estados (fecha_actuacion DESC);
CREATE INDEX IF NOT EXISTS idx_actuaciones_es_nuevo ON actuaciones_estados (es_nuevo) WHERE es_nuevo = TRUE;
CREATE INDEX IF NOT EXISTS idx_actuaciones_fecha_final ON actuaciones_estados (fecha_final) WHERE fecha_final IS NOT NULL;

-- ------------------------------------------------------------------------------
-- Table 3: CONFIGURACION_ALERTAS (Pit Wall Dispatch & WhatsApp Webhooks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destinatario_nombre VARCHAR(120) DEFAULT 'Jefe / Despacho' NOT NULL,
    destinatario_telefono VARCHAR(30) DEFAULT '+573196816770' NOT NULL,
    notificar_por_whatsapp BOOLEAN DEFAULT TRUE NOT NULL,
    notificar_por_sistema BOOLEAN DEFAULT TRUE NOT NULL,
    notificar_terminos_por_vencer BOOLEAN DEFAULT TRUE NOT NULL,
    hora_resumen_diario TIME DEFAULT '07:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- VIEW: Telemetría en Tiempo Real (Top Metrics Gauge)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW vista_telemetria_resumen AS
SELECT
    (SELECT COUNT(*) FROM procesos WHERE en_vigilancia = TRUE) AS total_en_vigilancia,
    (SELECT COUNT(*) FROM actuaciones_estados WHERE fecha_actuacion = CURRENT_DATE) AS actuaciones_hoy,
    (SELECT COUNT(*) FROM actuaciones_estados 
     WHERE fecha_final >= CURRENT_DATE 
       AND fecha_final <= (CURRENT_DATE + INTERVAL '3 days')
       AND es_nuevo = TRUE) AS alertas_criticas_terminos,
    (SELECT COUNT(*) FROM procesos WHERE prioridad = 'Alta/P1' AND en_vigilancia = TRUE) AS procesos_p1_alta;

-- ------------------------------------------------------------------------------
-- SEED DATA (3 Realistic Colombian Judicial Processes + Historic Actuaciones)
-- ------------------------------------------------------------------------------

-- Seed Configuration
INSERT INTO configuracion_alertas (id, destinatario_nombre, destinatario_telefono, notificar_por_whatsapp, notificar_por_sistema)
VALUES ('00000000-0000-0000-0000-000000000001', 'Dr. Abogado Principal - PitStop Legal', '+573196816770', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Case 1: Juzgado 15 Civil del Circuito de Bogotá (Proceso Ejecutivo)
INSERT INTO procesos (id, radicado, despacho, departamento_ciudad, tipo_proceso, demandante, demandado, en_vigilancia, prioridad, estado_actual, fecha_radicacion)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '11001310301520230048200',
    'Juzgado 015 Civil del Circuito de Bogotá D.C.',
    'Bogotá D.C. / Cundinamarca',
    'Ejecutivo Singular de Mayor Cuantía',
    'BANCO DAVIVIENDA S.A. (NIT 860.034.313-7)',
    'CONSTRUCCIONES & INVERSIONES ANDINAS S.A.S. Y OTROS',
    TRUE,
    'Alta/P1',
    'En Etapa de Notificación y Medidas Cautelares',
    '2023-05-18'
) ON CONFLICT (radicado) DO NOTHING;

-- Seed Case 2: Tribunal Superior de Medellín - Sala Laboral (Ordinario Laboral)
INSERT INTO procesos (id, radicado, despacho, departamento_ciudad, tipo_proceso, demandante, demandado, en_vigilancia, prioridad, estado_actual, fecha_radicacion)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '05001310500320220031801',
    'Tribunal Superior de Medellín - Sala Laboral (M.P. Dr. Restrepo)',
    'Medellín / Antioquia',
    'Ordinario Laboral de Primera Instancia (Apelación)',
    'CARLOS ANDRÉS MONTOYA JARAMILLO (C.C. 71.392.810)',
    'EMPRESAS PÚBLICAS DE MEDELLÍN E.S.P. (EPM)',
    TRUE,
    'Media/P2',
    'Pendiente de Fijación en Lista para Alegatos',
    '2022-09-12'
) ON CONFLICT (radicado) DO NOTHING;

-- Seed Case 3: Juzgado 04 Administrativo de Cali (Nulidad y Restablecimiento)
INSERT INTO procesos (id, radicado, despacho, departamento_ciudad, tipo_proceso, demandante, demandado, en_vigilancia, prioridad, estado_actual, fecha_radicacion)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '76001333300420240011500',
    'Juzgado 004 Administrativo Oral de Cali',
    'Cali / Valle del Cauca',
    'Medio de Control de Nulidad y Restablecimiento del Derecho',
    'LOGÍSTICA DEL PACÍFICO & CIA S.A.',
    'DIRECCIÓN DE IMPUESTOS Y ADUANAS NACIONALES (DIAN)',
    TRUE,
    'Alta/P1',
    'Término de Traslado de Excepciones Previas',
    '2024-02-04'
) ON CONFLICT (radicado) DO NOTHING;

-- Actuaciones Case 1
INSERT INTO actuaciones_estados (proceso_id, fecha_actuacion, tipo_anotacion, anotacion, fecha_inicial, fecha_final, es_nuevo, es_termino_fatal)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE,
    'Auto de Cúmplase y Medidas Cautelares',
    'Ordena librar mandamiento de pago y decreta embargo y secuestro de cuentas bancarias y bienes inmuebles del demandado.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 days',
    TRUE,
    TRUE
),
(
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE - INTERVAL '6 days',
    'Fijación en Estado Electrónico',
    'Estado No. 042. Notificación por estado de memorial aportado por la parte demandante con liquidación de crédito.',
    CURRENT_DATE - INTERVAL '6 days',
    CURRENT_DATE - INTERVAL '3 days',
    FALSE,
    FALSE
),
(
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE - INTERVAL '25 days',
    'Recepción de Memorial',
    'Radicación de poder especial y solicitud de medidas preventivas por apoderado judicial.',
    NULL,
    NULL,
    FALSE,
    FALSE
);

-- Actuaciones Case 2
INSERT INTO actuaciones_estados (proceso_id, fecha_actuacion, tipo_anotacion, anotacion, fecha_inicial, fecha_final, es_nuevo, es_termino_fatal)
VALUES
(
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE - INTERVAL '1 day',
    'Pasa al Despacho para Sentencia',
    'Expediente ingresa al despacho del Magistrado Ponente para resolver recurso de apelación contra sentencia de primer grado.',
    NULL,
    NULL,
    TRUE,
    FALSE
),
(
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE - INTERVAL '14 days',
    'Fijación en Lista de Traslado',
    'Traslado a las partes por el término de 5 días para sustentar alegatos de conclusión en segunda instancia.',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE - INTERVAL '9 days',
    FALSE,
    FALSE
);

-- Actuaciones Case 3
INSERT INTO actuaciones_estados (proceso_id, fecha_actuacion, tipo_anotacion, anotacion, fecha_inicial, fecha_final, es_nuevo, es_termino_fatal)
VALUES
(
    '33333333-3333-3333-3333-333333333333',
    CURRENT_DATE,
    'Traslado de Excepciones Previas',
    'Se corre traslado a la parte actora de las excepciones previas formuladas por la DIAN en contestación de demanda. Término de 3 días.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '2 days',
    TRUE,
    TRUE
),
(
    '33333333-3333-3333-3333-333333333333',
    CURRENT_DATE - INTERVAL '12 days',
    'Contestación de Demanda',
    'Memorial de contestación radicado por apoderado de la Unidad Administrativa Especial DIAN.',
    NULL,
    NULL,
    FALSE,
    FALSE
);
