import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  FileCode, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Download
} from 'lucide-react';

interface SqlViewerModalProps {
  onClose: () => void;
}

export const SqlViewerModal: React.FC<SqlViewerModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const sqlSchemaCode = `-- ==============================================================================
-- PITSTOP JUDICIAL / LEGAL TELEMETRY COLOMBIA
-- Database Schema: PostgreSQL 14+ / Supabase
-- Target System: Rama Judicial de Colombia Case Watchlist & Telemetry Monitoring
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE prioridad_proceso AS ENUM ('Alta/P1', 'Media/P2', 'Baja/P3');

-- 1. Tabla: PROCESOS (Master Case Registry / Watchlist)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_procesos_radicado UNIQUE (radicado),
    CONSTRAINT chk_radicado_len CHECK (char_length(radicado) = 23)
);

CREATE INDEX IF NOT EXISTS idx_procesos_radicado ON procesos USING btree (radicado);
CREATE INDEX IF NOT EXISTS idx_procesos_en_vigilancia ON procesos (en_vigilancia);

-- 2. Tabla: ACTUACIONES_ESTADOS (Case Laps / Chronological Legal Events)
CREATE TABLE IF NOT EXISTS actuaciones_estados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proceso_id UUID NOT NULL,
    fecha_actuacion DATE NOT NULL,
    tipo_anotacion VARCHAR(150) NOT NULL,
    anotacion TEXT NOT NULL,
    fecha_inicial DATE,
    fecha_final DATE,
    es_nuevo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_actuaciones_proceso FOREIGN KEY (proceso_id) 
        REFERENCES procesos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_actuaciones_proceso_id ON actuaciones_estados (proceso_id);
CREATE INDEX IF NOT EXISTS idx_actuaciones_fecha_actuacion ON actuaciones_estados (fecha_actuacion DESC);

-- 3. Tabla: CONFIGURACION_ALERTAS (Pit Wall Dispatch & WhatsApp Webhooks)
CREATE TABLE IF NOT EXISTS configuracion_alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destinatario_nombre VARCHAR(120) DEFAULT 'Jefe / Despacho' NOT NULL,
    destinatario_telefono VARCHAR(30) DEFAULT '+573196816770' NOT NULL,
    notificar_por_whatsapp BOOLEAN DEFAULT TRUE NOT NULL,
    notificar_por_sistema BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-carbon-900 border border-white/15 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Strip */}
        <div className="h-1.5 w-full bg-racing-yellow" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-carbon-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-racing-yellow/20 border border-racing-yellow/40 flex items-center justify-center text-racing-yellow">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Esquema de Base de Datos Relacional
              </h2>
              <p className="text-xs text-slate-400 font-mono-tabular">
                PostgreSQL 14+ / Supabase DDL Script (schema.sql)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-racing-yellow hover:bg-yellow-500 text-black font-bold rounded-lg text-xs font-mono-tabular transition-all flex items-center gap-1.5 shadow-md shadow-racing-yellow/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡COPIADO!' : 'COPIAR SQL'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-carbon-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Tables Overview Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-tabular">
            <div className="bg-carbon-950 p-3 rounded-lg border border-white/5 space-y-1">
              <div className="text-racing-red font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> tabla: procesos
              </div>
              <p className="text-[11px] text-slate-400">UUID, radicado(23) UNIQUE + BTree, despacho, partes, prioridad.</p>
            </div>

            <div className="bg-carbon-950 p-3 rounded-lg border border-white/5 space-y-1">
              <div className="text-racing-yellow font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> tabla: actuaciones_estados
              </div>
              <p className="text-[11px] text-slate-400">FK proceso_id, fechas de términos, tipo de auto, novedad.</p>
            </div>

            <div className="bg-carbon-950 p-3 rounded-lg border border-white/5 space-y-1">
              <div className="text-racing-green font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> tabla: configuracion_alertas
              </div>
              <p className="text-[11px] text-slate-400">WhatsApp (+573196816770), canales de despacho y webhook.</p>
            </div>
          </div>

          {/* SQL Code Box */}
          <div className="relative">
            <pre className="bg-carbon-950 p-4 rounded-xl border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed shadow-inner max-h-96">
              <code>{sqlSchemaCode}</code>
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-carbon-850 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono-tabular">
          <span>Archivo: <strong className="text-slate-200">c:/.../schema.sql</strong></span>
          <span className="text-racing-green font-bold">100% Compatible con Supabase & Neon</span>
        </div>

      </div>
    </div>
  );
};
