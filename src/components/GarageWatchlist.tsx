import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Search, 
  Filter, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Flag, 
  Building2, 
  User, 
  Scale, 
  Clock, 
  Copy, 
  Check, 
  Eye, 
  Send, 
  Plus, 
  LayoutGrid, 
  List,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Share2
} from 'lucide-react';
import { ProcesoJudicial, EstadoSemaforoF1 } from '../types/database';
import { formatRadicado } from '../services/ramaJudicialApi';

interface GarageWatchlistProps {
  processes: ProcesoJudicial[];
  onSelectProcess: (proceso: ProcesoJudicial) => void;
  onSendWhatsappAlert: (proceso: ProcesoJudicial) => void;
  onRemoveFromWatchlist: (procesoId: string) => void;
  onNavigateToScouting: () => void;
}

type FilterCategory = 'todos' | 'rojo' | 'amarillo' | 'verde' | 'activos' | 'favoritos';

export const GarageWatchlist: React.FC<GarageWatchlistProps> = ({
  processes,
  onSelectProcess,
  onSendWhatsappAlert,
  onRemoveFromWatchlist,
  onNavigateToScouting
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      // Búsqueda por texto
      const matchesSearch = 
        p.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.demandante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.demandado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.despacho.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tipo_proceso.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filtro por categoría
      if (activeFilter === 'rojo') return p.semaforo === 'rojo';
      if (activeFilter === 'amarillo') return p.semaforo === 'amarillo';
      if (activeFilter === 'verde') return p.semaforo === 'verde';
      if (activeFilter === 'activos') return p.en_vigilancia;
      if (activeFilter === 'favoritos') return p.es_favorito;
      return true;
    });
  }, [processes, searchTerm, activeFilter]);

  // Contadores para badges de filtro
  const counts = useMemo(() => {
    return {
      todos: processes.length,
      rojo: processes.filter(p => p.semaforo === 'rojo').length,
      amarillo: processes.filter(p => p.semaforo === 'amarillo').length,
      verde: processes.filter(p => p.semaforo === 'verde').length,
      activos: processes.filter(p => p.en_vigilancia).length,
      favoritos: processes.filter(p => p.es_favorito).length
    };
  }, [processes]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Repositorio Central */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 p-5 rounded-xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-tabular text-slate-400 mb-1">
            <span className="text-xl">🏁</span>
            <span className="uppercase font-bold tracking-widest text-racing-red">EL GARAJE DE VIGILANCIA</span>
            <span className="text-slate-600">/</span>
            <span>REPOSITORIO CENTRAL</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Parrilla de Procesos en Monitoreo
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Telemetría de términos y trazabilidad de actuaciones en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToScouting}
            className="px-4 py-2.5 bg-racing-red hover:bg-red-600 text-white rounded-lg font-bold font-mono-tabular text-xs transition-all shadow-lg shadow-racing-red/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>VINCULAR NUEVO PROCESO</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Search and View Mode */}
      <div className="bg-carbon-900 p-3.5 rounded-xl border border-white/10 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Category Pills (F1 Semaphore Filters) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'todos'
                ? 'bg-carbon-700 text-white border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-carbon-850'
            }`}
          >
            <span>Todos en Pista</span>
            <span className="bg-carbon-950 px-1.5 py-0.2 rounded text-[10px] text-slate-300">{counts.todos}</span>
          </button>

          <button
            onClick={() => setActiveFilter('rojo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'rojo'
                ? 'bg-racing-red/20 text-racing-red border border-racing-red shadow-lg shadow-racing-red/20'
                : 'text-slate-400 hover:text-racing-red hover:bg-carbon-850'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-racing-red animate-pulse" />
            <span>Bandera Roja</span>
            <span className="bg-carbon-950 px-1.5 py-0.2 rounded text-[10px] text-red-400">{counts.rojo}</span>
          </button>

          <button
            onClick={() => setActiveFilter('amarillo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'amarillo'
                ? 'bg-racing-yellow/20 text-racing-yellow border border-racing-yellow shadow-lg shadow-racing-yellow/20'
                : 'text-slate-400 hover:text-racing-yellow hover:bg-carbon-850'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-racing-yellow" />
            <span>Pit Alerts (≤3d)</span>
            <span className="bg-carbon-950 px-1.5 py-0.2 rounded text-[10px] text-yellow-400">{counts.amarillo}</span>
          </button>

          <button
            onClick={() => setActiveFilter('verde')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'verde'
                ? 'bg-racing-green/20 text-racing-green border border-racing-green shadow-lg shadow-racing-green/20'
                : 'text-slate-400 hover:text-racing-green hover:bg-carbon-850'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-racing-green" />
            <span>En Carrera</span>
            <span className="bg-carbon-950 px-1.5 py-0.2 rounded text-[10px] text-emerald-400">{counts.verde}</span>
          </button>

        </div>

        {/* Search Input & View Toggle */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por radicado, parte, juzgado..."
              className="w-full bg-carbon-950 border border-slate-700 focus:border-racing-red rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div className="bg-carbon-950 p-1 rounded-lg border border-white/10 flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-carbon-800 text-white' : 'text-slate-500 hover:text-white'}`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-carbon-800 text-white' : 'text-slate-500 hover:text-white'}`}
              title="Vista en Tabla Timing Tower"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Process Grid (Monoplaza Cockpit Cards) */}
      {filteredProcesses.length === 0 ? (
        <div className="bg-carbon-900 rounded-xl border border-white/10 p-12 text-center space-y-4">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay expedientes en esta categoría</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Utiliza el módulo de Scouting para buscar y vincular expedientes desde la Rama Judicial.
          </p>
          <button
            onClick={onNavigateToScouting}
            className="px-4 py-2 bg-racing-red hover:bg-red-600 text-white text-xs font-bold rounded-lg font-mono-tabular transition-all inline-flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>IR A BUSCAR PROCESOS</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProcesses.map((proceso) => {
            const lastAct = proceso.actuaciones && proceso.actuaciones[0];
            const isRed = proceso.semaforo === 'rojo';
            const isYellow = proceso.semaforo === 'amarillo';

            return (
              <div
                key={proceso.id}
                onClick={() => onSelectProcess(proceso)}
                className={`bg-carbon-900 rounded-xl border transition-all duration-300 p-5 shadow-xl hover:shadow-2xl cursor-pointer relative group flex flex-col justify-between overflow-hidden ${
                  isRed 
                    ? 'border-racing-red/60 hover:border-racing-red hover:glow-racing-red' 
                    : isYellow 
                    ? 'border-racing-yellow/50 hover:border-racing-yellow' 
                    : 'border-white/10 hover:border-slate-500'
                }`}
              >
                {/* Top Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isRed ? 'bg-racing-red' : isYellow ? 'bg-racing-yellow' : 'bg-racing-green'
                }`} />

                <div>
                  
                  {/* Card Header: Radicado + Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono-tabular font-bold text-sm tracking-wide text-white group-hover:text-racing-red transition-colors">
                          {formatRadicado(proceso.radicado)}
                        </span>
                        <button
                          onClick={(e) => handleCopy(proceso.radicado, proceso.id, e)}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-carbon-800 transition-colors"
                          title="Copiar radicado"
                        >
                          {copiedId === proceso.id ? (
                            <Check className="w-3.5 h-3.5 text-racing-green" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-tabular">
                        {proceso.tipo_proceso}
                      </div>
                    </div>

                    {/* F1 Semaphore Indicator Badge */}
                    <div>
                      {isRed && (
                        <div className="bg-racing-red/15 border border-racing-red/60 text-racing-red px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold flex items-center gap-1 shadow-sm">
                          <Flame className="w-3 h-3 animate-bounce" />
                          <span>BANDERA ROJA</span>
                        </div>
                      )}
                      {isYellow && (
                        <div className="bg-racing-yellow/15 border border-racing-yellow/60 text-racing-yellow px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>PIT ALERT</span>
                        </div>
                      )}
                      {proceso.semaforo === 'verde' && (
                        <div className="bg-racing-green/15 border border-racing-green/60 text-racing-green px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-racing-green" />
                          <span>EN CARRERA</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Despacho Judicial */}
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 bg-carbon-950/80 p-2 rounded-lg border border-white/5 mb-3">
                    <Building2 className="w-3.5 h-3.5 text-racing-yellow shrink-0" />
                    <span className="truncate">{proceso.despacho}</span>
                  </div>

                  {/* Parties: Demandante vs Demandado */}
                  <div className="space-y-1.5 text-xs bg-carbon-850/50 p-2.5 rounded-lg border border-white/5 mb-3">
                    <div className="flex items-start gap-1.5">
                      <span className="text-[10px] font-mono-tabular uppercase font-bold text-slate-500 w-12 shrink-0">DTE:</span>
                      <span className="text-slate-200 font-medium truncate">{proceso.demandante}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-[10px] font-mono-tabular uppercase font-bold text-slate-500 w-12 shrink-0">DDO:</span>
                      <span className="text-slate-200 font-medium truncate">{proceso.demandado}</span>
                    </div>
                  </div>

                  {/* Última Actuación (Highlighted) */}
                  {lastAct ? (
                    <div className="bg-carbon-950 p-3 rounded-lg border border-white/5 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono-tabular text-slate-400">
                        <span className="text-racing-yellow font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lastAct.tipo_anotacion}
                        </span>
                        <span className="text-slate-400">{lastAct.fecha_actuacion}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                        {lastAct.anotacion}
                      </p>
                      
                      {lastAct.fecha_final && (
                        <div className="pt-1 flex items-center justify-between text-[10px] font-mono-tabular text-red-300 border-t border-white/5 mt-1">
                          <span>Vence término:</span>
                          <span className="font-bold bg-red-950/80 px-1.5 py-0.2 rounded border border-red-800">
                            {lastAct.fecha_final}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-2 text-center bg-carbon-950 rounded">
                      Sin actuaciones registradas aún
                    </div>
                  )}

                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono-tabular">
                  
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendWhatsappAlert(proceso);
                      }}
                      className="px-2.5 py-1 rounded bg-carbon-800 hover:bg-carbon-700 text-racing-green border border-racing-green/30 hover:border-racing-green transition-all flex items-center gap-1"
                      title="Enviar alerta WhatsApp inmediata"
                    >
                      <Send className="w-3 h-3" />
                      <span>Alertar</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(proceso.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-racing-red hover:bg-carbon-800 transition-colors"
                      title="Quitar de vigilancia"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-semibold transition-colors">
                    <span>Telemetría</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Timing Tower Table View */
        <div className="bg-carbon-900 rounded-xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-tabular">
              <thead className="bg-carbon-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Semáforo</th>
                  <th className="px-4 py-3">Radicado (23 Dígitos)</th>
                  <th className="px-4 py-3">Despacho / Ciudad</th>
                  <th className="px-4 py-3">Sujetos Procesales</th>
                  <th className="px-4 py-3">Última Actuación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProcesses.map((proceso) => {
                  const lastAct = proceso.actuaciones && proceso.actuaciones[0];
                  return (
                    <tr 
                      key={proceso.id}
                      onClick={() => onSelectProcess(proceso)}
                      className="hover:bg-carbon-850/80 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {proceso.semaforo === 'rojo' && (
                          <span className="w-3 h-3 rounded-full bg-racing-red inline-block animate-ping" />
                        )}
                        {proceso.semaforo === 'amarillo' && (
                          <span className="w-3 h-3 rounded-full bg-racing-yellow inline-block" />
                        )}
                        {proceso.semaforo === 'verde' && (
                          <span className="w-3 h-3 rounded-full bg-racing-green inline-block" />
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-white">
                        {formatRadicado(proceso.radicado)}
                        <div className="text-[10px] text-slate-400 font-normal">{proceso.tipo_proceso}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-200">
                        {proceso.despacho}
                        <div className="text-[10px] text-slate-500">{proceso.departamento_ciudad}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        <div className="truncate max-w-xs"><strong className="text-slate-400">Dte:</strong> {proceso.demandante}</div>
                        <div className="truncate max-w-xs"><strong className="text-slate-400">Ddo:</strong> {proceso.demandado}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {lastAct ? (
                          <div>
                            <span className="text-racing-yellow font-semibold">{lastAct.tipo_anotacion}</span>
                            <span className="text-slate-500 ml-1">({lastAct.fecha_actuacion})</span>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{lastAct.anotacion}</p>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProcess(proceso);
                          }}
                          className="px-2.5 py-1 bg-carbon-800 hover:bg-carbon-700 text-slate-200 rounded border border-white/10 transition-colors mr-1.5"
                        >
                          Ver
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendWhatsappAlert(proceso);
                          }}
                          className="px-2.5 py-1 bg-racing-green/20 hover:bg-racing-green/30 text-racing-green rounded border border-racing-green/40 transition-colors"
                        >
                          Alertar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
