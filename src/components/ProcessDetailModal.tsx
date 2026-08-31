import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Scale, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Flame, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  Download
} from 'lucide-react';
import { ProcesoJudicial, ActuacionEstado } from '../types/database';
import { formatRadicado } from '../services/ramaJudicialApi';

interface ProcessDetailModalProps {
  proceso: ProcesoJudicial | null;
  onClose: () => void;
  onSendWhatsappAlert: (proceso: ProcesoJudicial) => void;
}

export const ProcessDetailModal: React.FC<ProcessDetailModalProps> = ({
  proceso,
  onClose,
  onSendWhatsappAlert
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!proceso) return null;

  const handleCopyRadicado = () => {
    navigator.clipboard.writeText(proceso.radicado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRed = proceso.semaforo === 'rojo';
  const isYellow = proceso.semaforo === 'amarillo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-carbon-900 border border-white/15 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Accent Strip */}
        <div className={`h-1.5 w-full ${isRed ? 'bg-racing-red' : isYellow ? 'bg-racing-yellow' : 'bg-racing-green'}`} />

        {/* Modal Header */}
        <div className="p-5 lg:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-carbon-850">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono-tabular font-bold bg-carbon-950 text-white px-3 py-1 rounded-md border border-white/10 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-racing-red" />
                {formatRadicado(proceso.radicado)}
              </span>

              <button
                onClick={handleCopyRadicado}
                className="text-xs text-slate-400 hover:text-white p-1 rounded hover:bg-carbon-800 transition-colors flex items-center gap-1"
                title="Copiar radicado completo"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-racing-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="font-mono-tabular text-[11px]">{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>

              {isRed && (
                <span className="bg-racing-red/20 text-racing-red border border-racing-red/40 px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" /> BANDERA ROJA (TÉRMINO ACTIVO)
                </span>
              )}

              {isYellow && (
                <span className="bg-racing-yellow/20 text-racing-yellow border border-racing-yellow/40 px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> PIT ALERT (NOVEDAD RECIENTE)
                </span>
              )}

              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono-tabular px-2 py-0.5 rounded">
                PRIORIDAD: {proceso.prioridad}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {proceso.tipo_proceso}
            </h2>

            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Building2 className="w-4 h-4 text-racing-yellow shrink-0" />
              <span>{proceso.despacho}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{proceso.departamento_ciudad}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-carbon-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 lg:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Sujetos Procesales Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-carbon-950 p-4 rounded-xl border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-mono-tabular font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-racing-green" /> Parte Demandante / Accionante:
              </div>
              <div className="text-sm font-semibold text-white">
                {proceso.demandante}
              </div>
            </div>

            <div className="bg-carbon-950 p-4 rounded-xl border border-white/5 space-y-1">
              <div className="text-[10px] uppercase font-mono-tabular font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-racing-red" /> Parte Demandada / Accionada:
              </div>
              <div className="text-sm font-semibold text-white">
                {proceso.demandado}
              </div>
            </div>
          </div>

          {/* Notas Estratégicas / Estado Actual */}
          <div className="bg-carbon-850 p-4 rounded-xl border border-white/10 space-y-1.5">
            <div className="text-xs uppercase font-mono-tabular font-bold text-slate-400">
              Estado Actual del Monitoreo:
            </div>
            <div className="text-sm text-slate-200 font-medium">
              {proceso.estado_actual || 'En seguimiento continuo por Legal Telemetry.'}
            </div>
            {proceso.notas_estrategicas && (
              <div className="text-xs text-slate-400 italic pt-1 border-t border-white/5">
                💡 Nota interna: {proceso.notas_estrategicas}
              </div>
            )}
          </div>

          {/* Historial de Actuaciones (Lap by Lap Chronology) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase font-mono-tabular font-bold tracking-wider text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-racing-red" />
                <span>Telemetría de Actuaciones & Estados ({proceso.actuaciones?.length || 0})</span>
              </h3>

              <span className="text-[11px] font-mono-tabular text-slate-400">
                Orden Cronológico Oficial
              </span>
            </div>

            <div className="space-y-3">
              {proceso.actuaciones && proceso.actuaciones.length > 0 ? (
                proceso.actuaciones.map((act, index) => (
                  <div
                    key={act.id || index}
                    className={`bg-carbon-950 rounded-xl p-4 border transition-all ${
                      act.es_nuevo
                        ? 'border-racing-red/40 bg-racing-red/5'
                        : 'border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${act.es_nuevo ? 'bg-racing-red animate-ping' : 'bg-slate-600'}`} />
                        <span className="font-bold text-xs text-white font-mono-tabular">
                          {act.tipo_anotacion}
                        </span>
                        {act.es_nuevo && (
                          <span className="bg-racing-red text-white text-[9px] font-mono-tabular px-1.5 py-0.2 rounded uppercase font-bold">
                            Novedad
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-mono-tabular text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{act.fecha_actuacion}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {act.anotacion}
                    </p>

                    {/* Term Dates (Fijación / Vencimiento) */}
                    {(act.fecha_inicial || act.fecha_final) && (
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular">
                        <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                          {act.fecha_inicial && (
                            <span>Inicia término: <strong className="text-slate-200">{act.fecha_inicial}</strong></span>
                          )}
                          {act.fecha_final && (
                            <span>Vence término: <strong className="text-racing-red">{act.fecha_final}</strong></span>
                          )}
                        </div>

                        {act.enlace_documento && (
                          <a
                            href={act.enlace_documento}
                            target="_blank"
                            rel="noreferrer"
                            className="text-racing-green hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Download className="w-3 h-3" /> Ver Documento PDF
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-carbon-950 rounded-xl">
                  No hay actuaciones reportadas en este expediente.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-carbon-850 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <a
            href={`https://consultaprocesos.ramajudicial.gov.co/Procesos/Index?radicado=${proceso.radicado}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-mono-tabular transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-racing-green" />
            <span>Consultar en Portal Rama Judicial</span>
          </a>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSendWhatsappAlert(proceso)}
              className="px-4 py-2 bg-racing-green hover:bg-emerald-600 text-black font-bold rounded-lg text-xs font-mono-tabular transition-all flex items-center gap-1.5 shadow-lg shadow-racing-green/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Alerta WhatsApp (+573196816770)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
