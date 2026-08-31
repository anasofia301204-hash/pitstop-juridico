import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, Flame, ShieldCheck, Activity, Zap, Clock, ShieldAlert } from 'lucide-react';
import { TelemetryMetrics } from '../types/database';

interface TopTelemetryBarProps {
  metrics: TelemetryMetrics;
  onOpenAlertsModal: () => void;
  onOpenSqlModal: () => void;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({
  metrics,
  onOpenAlertsModal,
  onOpenSqlModal
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-CO', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSafetyCar = metrics.estadoConexion === 'DEGRADED';

  return (
    <header className="sticky top-0 z-40 w-full bg-carbon-900/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-6 py-2.5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-black/60 border border-racing-red/40 px-2.5 py-1 rounded-md shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-racing-red animate-ping inline-block" />
            <span className="font-telemetry font-bold text-xs tracking-wider text-racing-red uppercase">
              PITSTOP TELEMETRY
            </span>
          </div>

          <div className={`hidden sm:flex items-center space-x-2 text-xs font-mono-tabular px-2.5 py-1 rounded border ${
            isSafetyCar
              ? 'bg-racing-yellow/20 border-racing-yellow text-yellow-300 animate-pulse'
              : 'bg-carbon-850 border-white/5 text-slate-400'
          }`}>
            {isSafetyCar ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-racing-yellow animate-bounce" />
                <span className="text-yellow-200 font-bold">SAFETY CAR: RAMA JUDICIAL CONTINGENCIA</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-racing-green animate-pulse" />
                <span>FEED:</span>
                <span className="text-racing-green font-semibold">API V2 RAMA JUDICIAL ONLINE</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">{metrics.pingMs}ms</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Live Telemetry Gauges */}
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto py-0.5">
          
          {/* Total Watchlist */}
          <div className="flex items-center space-x-2 bg-carbon-850 border border-white/10 px-3 py-1 rounded-md">
            <div className="p-1 rounded bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">En Vigilancia</div>
              <div className="text-sm font-mono-tabular font-bold text-white flex items-center gap-1">
                {metrics.totalVigilancia} <span className="text-[10px] text-slate-400 font-normal">CASOS</span>
              </div>
            </div>
          </div>

          {/* Actuaciones Hoy */}
          <div className="flex items-center space-x-2 bg-carbon-850 border border-white/10 px-3 py-1 rounded-md">
            <div className="p-1 rounded bg-racing-green/10 text-racing-green">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Actuaciones Hoy</div>
              <div className="text-sm font-mono-tabular font-bold text-racing-green flex items-center gap-1">
                +{metrics.actuacionesHoy} <span className="text-[10px] text-slate-400 font-normal">ESTADOS</span>
              </div>
            </div>
          </div>

          {/* Bandera Roja (Alertas Críticas) */}
          <div 
            onClick={onOpenAlertsModal}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md cursor-pointer transition-all border ${
              metrics.alertasCriticas > 0 
                ? 'bg-racing-red/15 border-racing-red/60 text-white glow-racing-red' 
                : 'bg-carbon-850 border-white/10 text-slate-400'
            }`}
          >
            <div className={`p-1 rounded ${metrics.alertasCriticas > 0 ? 'bg-racing-red text-white' : 'bg-slate-700/30 text-slate-400'}`}>
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-red-300 flex items-center gap-1">
                Bandera Roja
              </div>
              <div className="text-sm font-mono-tabular font-bold text-white flex items-center gap-1">
                {metrics.alertasCriticas} <span className="text-[10px] text-red-300/80 font-normal">TÉRMINOS</span>
              </div>
            </div>
          </div>

          {/* Pit Alerts (Novedades Recientes) */}
          <div className="hidden md:flex items-center space-x-2 bg-carbon-850 border border-racing-yellow/30 px-3 py-1 rounded-md">
            <div className="p-1 rounded bg-racing-yellow/10 text-racing-yellow">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pit Alerts</div>
              <div className="text-sm font-mono-tabular font-bold text-racing-yellow">
                {metrics.pitAlerts} <span className="text-[10px] text-slate-400 font-normal">≤ 3 DÍAS</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Actions & Live Clock */}
        <div className="flex items-center space-x-2">
          
          <button
            onClick={onOpenSqlModal}
            className="hidden lg:flex items-center space-x-1.5 bg-carbon-800 hover:bg-carbon-700 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-white/10 transition-colors"
            title="Ver Esquema SQL y Supabase DDL"
          >
            <Zap className="w-3.5 h-3.5 text-racing-yellow" />
            <span>SQL Schema</span>
          </button>

          <div className="flex items-center space-x-1.5 bg-black/60 border border-white/10 px-2.5 py-1.5 rounded text-xs font-mono-tabular text-slate-200">
            <Clock className="w-3.5 h-3.5 text-racing-green" />
            <span className="text-white font-bold">{timeStr || '21:50:00'}</span>
            <span className="text-[10px] text-slate-400">BOG</span>
          </div>

        </div>

      </div>
    </header>
  );
};
