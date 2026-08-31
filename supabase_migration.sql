-- ==============================================================================
-- PITSTOP JUDICIAL / LEGAL TELEMETRY COLOMBIA
-- MIGRACIÓN OFICIAL PARA SUPABASE (PostgreSQL 15+)
-- Ejecutar este script en: Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM PERSONALIZADOS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prioridad_proceso') THEN
        CREATE TYPE prioridad_proceso AS ENUM ('Alta/P1', 'Media/P2', 'Baja/P3');
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. TABLA: PROCESOS (Repositorio Central / Watchlist)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.procesos (
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

-- Índices de Alta Velocidad (B-Tree y Full Text Search en Español)
CREATE INDEX IF NOT EXISTS idx_procesos_radicado ON public.procesos USING btree (radicado);
CREATE INDEX IF NOT EXISTS idx_procesos_en_vigilancia ON public.procesos (en_vigilancia);
CREATE INDEX IF NOT EXISTS idx_procesos_prioridad ON public.procesos (prioridad);
CREATE INDEX IF NOT EXISTS idx_procesos_despacho ON public.procesos (despacho);

-- ------------------------------------------------------------------------------
-- 4. TABLA: ACTUACIONES_ESTADOS (Historial Cronológico de Providencias y Términos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.actuaciones_estados (
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
        REFERENCES public.procesos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_actuaciones_proceso_id ON public.actuaciones_estados (proceso_id);
CREATE INDEX IF NOT EXISTS idx_actuaciones_fecha_actuacion ON public.actuaciones_estados (fecha_actuacion DESC);
CREATE INDEX IF NOT EXISTS idx_actuaciones_es_nuevo ON public.actuaciones_estados (es_nuevo) WHERE es_nuevo = TRUE;
CREATE INDEX IF NOT EXISTS idx_actuaciones_fecha_final ON public.actuaciones_estados (fecha_final) WHERE fecha_final IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 5. TABLA: CONFIGURACION_ALERTAS (Pit Wall WhatsApp & Canales de Notificación)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracion_alertas (
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
-- 6. POLÍTICAS DE SEGURIDAD RLS (Row Level Security para Supabase Anon/Auth)
-- ------------------------------------------------------------------------------
ALTER TABLE public.procesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuaciones_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_alertas ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para la clave pública (Anon) de Supabase
CREATE POLICY "Permitir lectura publica de procesos" ON public.procesos FOR SELECT USING (true);
CREATE POLICY "Permitir insercion de procesos" ON public.procesos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion de procesos" ON public.procesos FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminacion de procesos" ON public.procesos FOR DELETE USING (true);

CREATE POLICY "Permitir lectura de actuaciones" ON public.actuaciones_estados FOR SELECT USING (true);
CREATE POLICY "Permitir insercion de actuaciones" ON public.actuaciones_estados FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion de actuaciones" ON public.actuaciones_estados FOR UPDATE USING (true);

CREATE POLICY "Permitir gestion de configuracion alertas" ON public.configuracion_alertas FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 7. VISTA: RESUMEN DE TELEMETRÍA EN TIEMPO REAL
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vista_telemetria_resumen AS
SELECT
    (SELECT COUNT(*) FROM public.procesos WHERE en_vigilancia = TRUE) AS total_en_vigilancia,
    (SELECT COUNT(*) FROM public.actuaciones_estados WHERE fecha_actuacion = CURRENT_DATE) AS actuaciones_hoy,
    (SELECT COUNT(*) FROM public.actuaciones_estados 
     WHERE fecha_final >= CURRENT_DATE 
       AND fecha_final <= (CURRENT_DATE + INTERVAL '3 days')
       AND es_nuevo = TRUE) AS alertas_criticas_terminos,
    (SELECT COUNT(*) FROM public.procesos WHERE prioridad = 'Alta/P1' AND en_vigilancia = TRUE) AS procesos_p1_alta;

-- ------------------------------------------------------------------------------
-- 8. DATOS SEMILLA INICIALES (Configuración + 3 Casos Colombianos con Historial)
-- ------------------------------------------------------------------------------

-- Configuración por defecto con el número oficial
INSERT INTO public.configuracion_alertas (id, destinatario_nombre, destinatario_telefono, notificar_por_whatsapp, notificar_por_sistema)
VALUES ('00000000-0000-0000-0000-000000000001', 'Dr. Abogado Principal - PitStop Legal', '+573196816770', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET destinatario_telefono = '+573196816770';

-- Caso 1: Juzgado 15 Civil del Circuito de Bogotá
INSERT INTO public.procesos (id, radicado, despacho, departamento_ciudad, tipo_proceso, demandante, demandado, en_vigilancia, prioridad, estado_actual, fecha_radicacion)
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
    'Mandamiento Ejecutivo y Medidas Cautelares',
    '2023-05-18'
) ON CONFLICT (radicado) DO NOTHING;

-- Caso 2: Tribunal Superior de Medellín
INSERT INTO public.procesos (id, radicado, despacho, departamento_ciudad, tipo_proceso, demandante, demandado, en_vigilancia, prioridad, estado_actual, fecha_radicacion)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '05001310500320220031801',
    'Tribunal Superior de Medellín - Sala Laboral',
    'Medellín / Antioquia',
    'Ordinario Laboral de Primera Instancia (Apelación)',
    'CARLOS ANDRÉS MONTOYA JARAMILLO (C.C. 71.392.810)',
    'EMPRESAS PÚBLICAS DE MEDELLÍN E.S.P. (EPM)',
    TRUE,
    'Media/P2',
    'Pasa al Despacho del Magistrado Ponente',
    '2022-09-12'
) ON CONFLICT (radicado) DO NOTHING;

-- Caso 3: Juzgado 04 Administrativo de Cali
INSERT INTO public.procesos (id, radicado, despacho, departamento_ciudad, tipo_proceso, demandante, demandado, en_vigilancia, prioridad, estado_actual, fecha_radicacion)
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
    'Traslado de Excepciones Previas y Mixtas',
    '2024-02-04'
) ON CONFLICT (radicado) DO NOTHING;

-- Actuaciones Caso 1
INSERT INTO public.actuaciones_estados (proceso_id, fecha_actuacion, tipo_anotacion, anotacion, fecha_inicial, fecha_final, es_nuevo, es_termino_fatal)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE,
    'Auto de Cúmplase y Medidas Cautelares',
    'Ordena librar mandamiento de pago por $450.000.000 COP y decreta embargo preventivo de cuentas bancarias.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 days',
    TRUE,
    TRUE
),
(
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE - INTERVAL '6 days',
    'Fijación en Estado Electrónico',
    'Estado No. 042. Notificación del memorial de liquidación de crédito aportado por la parte actora.',
    CURRENT_DATE - INTERVAL '6 days',
    CURRENT_DATE - INTERVAL '3 days',
    FALSE,
    FALSE
);

-- Actuaciones Caso 2
INSERT INTO public.actuaciones_estados (proceso_id, fecha_actuacion, tipo_anotacion, anotacion, fecha_inicial, fecha_final, es_nuevo, es_termino_fatal)
VALUES
(
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE - INTERVAL '1 day',
    'Pasa al Despacho para Sentencia',
    'Expediente digital ingresa al despacho del Magistrado Ponente Dr. Restrepo para resolver apelación.',
    NULL,
    NULL,
    TRUE,
    FALSE
);

-- Actuaciones Caso 3
INSERT INTO public.actuaciones_estados (proceso_id, fecha_actuacion, tipo_anotacion, anotacion, fecha_inicial, fecha_final, es_nuevo, es_termino_fatal)
VALUES
(
    '33333333-3333-3333-3333-333333333333',
    CURRENT_DATE,
    'Traslado de Excepciones Previas',
    'Se corre traslado a la parte actora de las excepciones formuladas por la DIAN. Término de 3 días.',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '2 days',
    TRUE,
    TRUE
);
