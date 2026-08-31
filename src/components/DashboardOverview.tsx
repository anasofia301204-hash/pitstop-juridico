import React from 'react';
import { 
  Gauge, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  User, 
  Scale, 
  Search, 
  Car, 
  Plus, 
  Radio, 
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { ProcesoJudicial, TelemetryMetrics } from '../types/database';
import { formatRadicado } from '../services/ramaJudicialApi';

interface DashboardOverviewProps {
  metrics: TelemetryMetrics;
  processes: ProcesoJudicial[];
  onSelectProcess: (proceso: ProcesoJudicial) => void;
  onNavigateToScouting: () => void;
  onNavigateToGarage: () => void;
  onOpenAlertsModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  metrics,
  processes,
  onSelectProcess,
  onNavigateToScouting,
  onNavigateToGarage,
  onOpenAlertsModal
}) => {
  const criticalCases = processes.filter(p => p.semaforo === 'rojo');
  const recentActivities = processes.flatMap(p => 
    (p.actuaciones || []).map(act => ({ ...act, proceso: p }))
  ).sort((a, b) => new Date(b.fecha_actuacion).getTime() - new Date(a.fecha_actuacion).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 rounded-xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-racing-red/20 text-racing-red border border-racing-red/40 px-2.5 py-0.5 rounded-full text-xs font-mono-tabular font-bold tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-racing-red animate-ping" />
              <span>LIVE RACING TELEMETRY HUD</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Tablero de Telemetría Judicial
            </h1>
            <p className="text-slate-400 text-xs lg:text-sm mt-1 max-w-2xl">
              Monitoreo continuo y control de términos fatales para despachos de Colombia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToScouting}
              className="px-4 py-2.5 bg-racing-red hover:bg-red-600 text-white font-bold rounded-lg text-xs font-mono-tabular transition-all flex items-center gap-2 shadow-lg shadow-racing-red/20"
            >
              <Search className="w-4 h-4" />
              <span>BUSCAR PROCESO (23 DÍGITOS)</span>
            </button>
            
            <button
              onClick={onNavigateToGarage}
              className="px-4 py-2.5 bg-carbon-800 hover:bg-carbon-700 text-slate-200 font-bold rounded-lg text-xs font-mono-tabular border border-white/10 transition-all flex items-center gap-2"
            >
              <Car className="w-4 h-4 text-racing-green" />
              <span>IR AL GARAJE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Big KPI Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gauge 1: Total Vigilancia */}
        <div className="bg-carbon-900 p-5 rounded-xl border border-white/10 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-tabular">
            <span className="uppercase tracking-wider">Total en Pista</span>
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-mono-tabular font-extrabold text-white">
            {metrics.totalVigilancia} <span className="text-xs text-slate-400 font-normal">CASOS</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono-tabular">
            <span className="text-racing-green font-bold">100%</span> en vigilancia activa
          </div>
        </div>

        {/* Gauge 2: Actuaciones Hoy */}
        <div className="bg-carbon-900 p-5 rounded-xl border border-white/10 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-tabular">
            <span className="uppercase tracking-wider">Actuaciones Hoy</span>
            <Radio className="w-4 h-4 text-racing-green animate-pulse" />
          </div>
          <div className="text-3xl font-mono-tabular font-extrabold text-racing-green">
            +{metrics.actuacionesHoy} <span className="text-xs text-slate-400 font-normal">ESTADOS</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono-tabular">
            Detectadas en último barrido judicial
          </div>
        </div>

        {/* Gauge 3: Alertas Críticas (Bandera Roja) */}
        <div 
          onClick={onOpenAlertsModal}
          className="bg-carbon-900 p-5 rounded-xl border border-racing-red/40 hover:border-racing-red shadow-lg space-y-2 relative overflow-hidden cursor-pointer glow-racing-red transition-all"
        >
          <div className="flex items-center justify-between text-red-300 text-xs font-mono-tabular">
            <span className="uppercase tracking-wider font-bold">Bandera Roja (Fatales)</span>
            <Flame className="w-4 h-4 text-racing-red animate-bounce" />
          </div>
          <div className="text-3xl font-mono-tabular font-extrabold text-white">
            {metrics.alertasCriticas} <span className="text-xs text-red-300 font-normal">TÉRMINOS</span>
          </div>
          <div className="text-[11px] text-red-300 flex items-center gap-1 font-mono-tabular">
            Requieren atención inmediata (&lt;72h)
          </div>
        </div>

        {/* Gauge 4: Pit Alerts */}
        <div className="bg-carbon-900 p-5 rounded-xl border border-racing-yellow/40 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-yellow-300 text-xs font-mono-tabular">
            <span className="uppercase tracking-wider font-bold">Pit Window Alerts</span>
            <AlertTriangle className="w-4 h-4 text-racing-yellow" />
          </div>
          <div className="text-3xl font-mono-tabular font-extrabold text-white">
            {metrics.pitAlerts} <span className="text-xs text-yellow-300 font-normal">RECIENTES</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono-tabular">
            Movimientos en los últimos 3 días
          </div>
        </div>

      </div>

      {/* Two Column Layout: Timing Tower & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: F1 Timing Board (Critical & Active Cases) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono-tabular text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-racing-red animate-ping" />
              <span>TIMING TOWER - CASOS PRIORITARIOS</span>
            </h2>
            <button
              onClick={onNavigateToGarage}
              className="text-xs text-slate-400 hover:text-white font-mono-tabular flex items-center gap-1"
            >
              Ver todos ({processes.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {processes.slice(0, 4).map((proceso, index) => {
              const isRed = proceso.semaforo === 'rojo';
              const lastAct = proceso.actuaciones && proceso.actuaciones[0];

              return (
                <div
                  key={proceso.id}
                  onClick={() => onSelectProcess(proceso)}
                  className={`bg-carbon-900 p-4 rounded-xl border transition-all cursor-pointer hover:bg-carbon-850 shadow-md ${
                    isRed ? 'border-racing-red/50 hover:border-racing-red' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-tabular font-bold text-xs text-slate-500">P{index + 1}</span>
                      <span className="font-mono-tabular font-bold text-xs text-white">
                        {formatRadicado(proceso.radicado)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isRed ? (
                        <span className="bg-racing-red text-white text-[10px] font-mono-tabular font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Flame className="w-3 h-3" /> TÉRMINO ACTIVO
                        </span>
                      ) : (
                        <span className="bg-racing-green/20 text-racing-green text-[10px] font-mono-tabular font-bold px-2 py-0.5 rounded">
                          EN CARRERA
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-semibold mb-1">
                    {proceso.despacho}
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    <strong>Dte:</strong> {proceso.demandante} vs <strong>Ddo:</strong> {proceso.demandado}
                  </div>

                  {lastAct && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="text-racing-yellow font-medium truncate max-w-xs">
                        ⚡ {lastAct.tipo_anotacion}: {lastAct.anotacion.slice(0, 60)}...
                      </span>
                      <span className="text-slate-500 font-mono-tabular shrink-0">{lastAct.fecha_actuacion}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Live Telemetry Pit Lane Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono-tabular text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-racing-green" />
              <span>PIT LANE LIVE FEED</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-mono-tabular">Últimos estados</span>
          </div>

          <div className="bg-carbon-900 rounded-xl border border-white/10 p-4 space-y-4 shadow-xl">
            {recentActivities.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectProcess(item.proceso)}
                className="text-xs space-y-1 pb-3 border-b border-white/5 last:border-0 last:pb-0 cursor-pointer hover:bg-carbon-850 p-2 rounded transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono-tabular">
                  <span className="text-racing-yellow font-bold">{item.tipo_anotacion}</span>
                  <span className="text-slate-500">{item.fecha_actuacion}</span>
                </div>
                <div className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                  {item.anotacion}
                </div>
                <div className="text-[10px] text-slate-500 font-mono-tabular">
                  📍 {item.proceso.despacho.slice(0, 35)}...
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
