import React, { useState } from 'react';
import { 
  Radio, 
  Play, 
  RotateCw, 
  Smartphone, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Terminal, 
  Send, 
  ExternalLink, 
  Calendar, 
  ShieldCheck, 
  Zap,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { ProcesoJudicial, ConfiguracionAlertas } from '../types/database';
import { runRaceControlSweep, SweepLogItem, SweepExecutionReport } from '../services/raceControlMonitor';
import { buildLegalNotificationTemplate, generateDirectWhatsAppLink } from '../services/whatsappService';
import { formatRadicado } from '../services/ramaJudicialApi';

interface RaceControlMonitorViewProps {
  processes: ProcesoJudicial[];
  alertConfig: ConfiguracionAlertas;
  onUpdateProcesses: (updated: ProcesoJudicial[]) => void;
  onShowToast: (msg: string) => void;
}

export const RaceControlMonitorView: React.FC<RaceControlMonitorViewProps> = ({
  processes,
  alertConfig,
  onUpdateProcesses,
  onShowToast
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentLogList, setCurrentLogList] = useState<SweepLogItem[]>([]);
  const [lastReport, setLastReport] = useState<SweepExecutionReport | null>(null);

  const handleStartSweep = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentLogList([]);

    try {
      const report = await runRaceControlSweep(
        processes,
        alertConfig.destinatario_telefono,
        true,
        (log, pct) => {
          setCurrentLogList(prev => [log, ...prev]);
          setProgress(pct);
        }
      );

      setLastReport(report);
      onUpdateProcesses(report.updatedProcesses);
      setProgress(100);
      onShowToast(`🏁 Barrido completado: ${report.newStatesDetected} nuevas actuaciones detectadas y reportadas.`);
    } catch (err: any) {
      onShowToast(`Error en barrido: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Race Control Banner */}
      <div className="bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 rounded-xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-racing-red/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-racing-red/20 text-racing-red border border-racing-red/40 px-2.5 py-0.5 rounded-full text-xs font-mono-tabular font-bold tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-racing-red animate-ping" />
              <span>RACE CONTROL & VIGILANCIA JUDICIAL</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Centro de Monitoreo & Cron Jobs
            </h1>
            <p className="text-slate-400 text-xs lg:text-sm mt-1 max-w-2xl">
              Motor en segundo plano que revisa automáticamente los expedientes en la Rama Judicial y despacha alertas inmediatas a WhatsApp (<strong className="text-racing-green">{alertConfig.destinatario_telefono}</strong>).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartSweep}
              disabled={isRunning}
              className="px-5 py-3 bg-racing-red hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl font-mono-tabular text-xs transition-all shadow-xl shadow-racing-red/25 flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>EJECUTANDO BARRIDO ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>INICIAR BARRIDO MANUAL (CRON)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Cron Schedule Info */}
        <div className="bg-carbon-900 p-4 rounded-xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-tabular">
            <span className="uppercase font-bold">Horarios de Cron Automático</span>
            <Clock className="w-4 h-4 text-racing-yellow" />
          </div>
          <div className="flex items-center space-x-2 text-white font-mono-tabular font-bold text-lg">
            <span>06:00 AM</span>
            <span className="text-slate-500">&</span>
            <span>05:00 PM</span>
            <span className="text-xs text-racing-green font-normal ml-1">(UTC-5 BOG)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Sincronizado con los horarios de publicación de estados electrónicos en los despachos de Colombia.
          </p>
        </div>

        {/* API Endpoint & Webhook */}
        <div className="bg-carbon-900 p-4 rounded-xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-tabular">
            <span className="uppercase font-bold">API Route / Worker</span>
            <Zap className="w-4 h-4 text-racing-green" />
          </div>
          <div className="text-xs font-mono-tabular font-bold text-racing-green truncate bg-carbon-950 p-1.5 rounded border border-white/5">
            GET/POST /api/cron/check-updates
          </div>
          <p className="text-[11px] text-slate-400">
            Compatible con Vercel Cron, Google Cloud Scheduler y GitHub Actions.
          </p>
        </div>

        {/* Recipient Target */}
        <div className="bg-carbon-900 p-4 rounded-xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-tabular">
            <span className="uppercase font-bold">Destinatario WhatsApp</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-mono-tabular font-extrabold text-white flex items-center gap-1.5">
            <span className="text-racing-green">{alertConfig.destinatario_telefono}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {alertConfig.destinatario_nombre} • Reportes automáticos de término
          </p>
        </div>

      </div>

      {/* Sweep Live Progress Bar */}
      {isRunning && (
        <div className="bg-carbon-900 rounded-xl border border-racing-red/40 p-5 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono-tabular text-slate-300">
            <span className="flex items-center gap-2 font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-racing-red animate-ping" />
              BARRIDO DE EXPEDIENTES EN CURSO...
            </span>
            <span className="text-racing-red font-extrabold">{progress}%</span>
          </div>
          
          <div className="w-full h-2.5 bg-carbon-950 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-racing-yellow to-racing-red transition-all duration-300 rounded-full shadow-lg shadow-racing-red/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Two Columns: Live Telemetry Terminal Logs & WhatsApp Dispatch Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Terminal Console Logs */}
        <div className="bg-carbon-900 rounded-xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-3.5 bg-carbon-850 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono-tabular font-bold text-slate-300">
              <Terminal className="w-4 h-4 text-racing-green" />
              <span>TERMINAL DE TELEMETRÍA (RACE LOGS)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono-tabular">STREAM EN VIVO</span>
          </div>

          <div className="p-4 bg-carbon-950 font-mono text-xs overflow-y-auto flex-1 space-y-2.5">
            {currentLogList.length === 0 && !lastReport ? (
              <div className="text-slate-600 text-center py-20 italic">
                Presiona "INICIAR BARRIDO MANUAL" para ejecutar la inspección de expedientes.
              </div>
            ) : (
              (currentLogList.length > 0 ? currentLogList : lastReport?.logs || []).map((log) => (
                <div 
                  key={log.id}
                  className={`p-2 rounded border text-[11px] leading-relaxed transition-all ${
                    log.status === 'NEW_STATE_FOUND'
                      ? 'bg-racing-red/10 border-racing-red/40 text-red-300 font-bold'
                      : log.status === 'ALERT_SENT'
                      ? 'bg-racing-green/10 border-racing-green/40 text-emerald-300'
                      : log.status === 'UP_TO_DATE'
                      ? 'bg-carbon-900 border-white/5 text-slate-400'
                      : 'bg-carbon-900 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                    <span>[{log.timestamp}] {formatRadicado(log.radicado)}</span>
                    <span className="uppercase font-bold">{log.status}</span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: WhatsApp Dispatch Feed Preview */}
        <div className="bg-carbon-900 rounded-xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-3.5 bg-carbon-850 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono-tabular font-bold text-slate-300">
              <Smartphone className="w-4 h-4 text-racing-green" />
              <span>WHATSAPP DESPACHO DIRECTO ({alertConfig.destinatario_telefono})</span>
            </div>
            <span className="text-[10px] bg-racing-green/20 text-racing-green px-2 py-0.5 rounded font-mono-tabular font-bold">
              PLANTILLA OFICIAL
            </span>
          </div>

          <div className="p-4 bg-[#0b141a] overflow-y-auto flex-1 space-y-4">
            
            {/* Show formatted templates for detected processes */}
            {processes.slice(0, 2).map((proceso, idx) => {
              const lastAct = proceso.actuaciones?.[0];
              if (!lastAct) return null;

              const messageText = buildLegalNotificationTemplate(proceso, lastAct);
              const waLink = generateDirectWhatsAppLink(alertConfig.destinatario_telefono, messageText);

              return (
                <div key={idx} className="space-y-2 bg-[#111b21] p-3.5 rounded-xl border border-emerald-950 shadow-md">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-tabular">
                    <span className="text-white font-bold">{formatRadicado(proceso.radicado)}</span>
                    <span className="text-emerald-400 font-semibold">{lastAct.fecha_actuacion}</span>
                  </div>

                  {/* WhatsApp Message Bubble */}
                  <div className="bg-[#005c4b] text-white p-3 rounded-lg text-xs whitespace-pre-wrap font-sans leading-relaxed shadow">
                    {messageText}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono-tabular">
                      Destino: <strong className="text-slate-200">{alertConfig.destinatario_telefono}</strong>
                    </span>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-racing-green hover:bg-emerald-600 text-black text-xs font-bold font-mono-tabular rounded-md transition-all flex items-center gap-1.5 shadow"
                    >
                      <Send className="w-3 h-3" />
                      <span>Abrir en WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>

    </div>
  );
};
