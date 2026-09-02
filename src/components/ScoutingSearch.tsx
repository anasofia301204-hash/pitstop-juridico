import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Building2, 
  User, 
  Scale, 
  ExternalLink, 
  PlusCircle, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock, 
  Compass,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { ProcesoJudicial } from '../types/database';
import { formatRadicado, cleanRadicado } from '../services/ramaJudicialApi';
import { 
  fetchProcesoRealByRadicado, 
  fetchProcesosRealByName,
  RealApiFetchResult 
} from '../services/ramaJudicialRealApi';

interface ScoutingSearchProps {
  onAddToWatchlist: (proceso: ProcesoJudicial) => void;
  isProcessInWatchlist: (radicado: string) => boolean;
  onViewProcessDetails: (proceso: ProcesoJudicial) => void;
}

type SearchMode = 'radicado' | 'nombre';

export const ScoutingSearch: React.FC<ScoutingSearchProps> = ({
  onAddToWatchlist,
  isProcessInWatchlist,
  onViewProcessDetails
}) => {
  const [searchMode, setSearchMode] = useState<SearchMode>('radicado');
  const [radicadoInput, setRadicadoInput] = useState<string>('');
  const [nombreInput, setNombreInput] = useState<string>('');
  const [departamentoInput, setDepartamentoInput] = useState<string>('BOGOTA');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<RealApiFetchResult<ProcesoJudicial[]> | null>(null);
  const [copiedRadicado, setCopiedRadicado] = useState<string | null>(null);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Ejemplos rápidos de prueba
  const quickExamples = [
    { label: 'Ejecutivo Davivienda (Bogotá)', radicado: '11001310301520230048200' },
    { label: 'Ordinario Laboral EPM (Medellín)', radicado: '05001310500320220031801' },
    { label: 'Nulidad DIAN (Cali)', radicado: '76001333300420240011500' },
    { label: 'Insolvencia (Barranquilla)', radicado: '08001310300220230089000' }
  ];

  const handleRadicadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatRadicado(raw);
    setRadicadoInput(formatted);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearchResult(null);

    try {
      if (searchMode === 'radicado') {
        const query = cleanRadicado(radicadoInput) || '11001310301520230048200';
        const res = await fetchProcesoRealByRadicado(query);
        setSearchResult(res);
      } else {
        const query = nombreInput.trim() || 'Bancolombia';
        const res = await fetchProcesosRealByName(query);
        setSearchResult(res);
      }
    } catch (err: any) {
      setSearchResult({
        data: [],
        source: 'RAMA_JUDICIAL_PARSER',
        safetyCarDeployed: false,
        executionMs: 0,
        message: err.message || 'Error al procesar la búsqueda judicial.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyQuickExample = (radicado: string) => {
    setSearchMode('radicado');
    const formatted = formatRadicado(radicado);
    setRadicadoInput(formatted);
    setLoading(true);
    fetchProcesoRealByRadicado(radicado).then(res => {
      setSearchResult(res);
      setLoading(false);
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRadicado(text);
    setTimeout(() => setCopiedRadicado(null), 2000);
  };

  const handleAdd = (proceso: ProcesoJudicial) => {
    setAddedAnimationId(proceso.id);
    onAddToWatchlist(proceso);
    setTimeout(() => setAddedAnimationId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 rounded-xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-racing-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-racing-red/20 text-racing-red border border-racing-red/40 px-2.5 py-0.5 rounded-full text-xs font-mono-tabular font-bold tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>SISTEMA DE VIGILANCIA • RAMA JUDICIAL DE COLOMBIA</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Buscador y Telemetría de Procesos
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Consulta cualquier proceso judicial de Colombia por <span className="text-slate-200 font-semibold">Radicado de 23 dígitos</span> o por <span className="text-slate-200 font-semibold">Nombre / Razón Social</span> y agrégalo a tu garaje de vigilancia activa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a 
              href="https://www.ramajudicial.gov.co/" 
              target="_blank" 
              rel="noreferrer"
              className="bg-carbon-800 hover:bg-carbon-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-white/10 transition-all font-mono-tabular flex items-center gap-1.5 font-bold"
            >
              <Globe className="w-3.5 h-3.5 text-racing-green" />
              <span>Portal RamaJudicial.gov.co</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a 
              href="https://consultaprocesos.ramajudicial.gov.co/Procesos/Index" 
              target="_blank" 
              rel="noreferrer"
              className="bg-racing-red/20 hover:bg-racing-red/30 text-racing-red text-xs px-3 py-2 rounded-lg border border-racing-red/40 transition-all font-mono-tabular flex items-center gap-1.5 font-bold"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Consulta Nacional Unificada</span>
              <ExternalLink className="w-3 h-3 text-racing-red" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-carbon-900 rounded-xl border border-white/10 shadow-2xl p-5 lg:p-7 space-y-6">
        
        {/* Toggle Mode */}
        <div className="flex items-center justify-center">
          <div className="bg-carbon-850 p-1 rounded-xl border border-white/10 flex items-center max-w-md w-full">
            <button
              onClick={() => setSearchMode('radicado')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold font-mono-tabular transition-all flex items-center justify-center gap-2 ${
                searchMode === 'radicado'
                  ? 'bg-racing-red text-white shadow-lg shadow-racing-red/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Por Radicado (23 Dígitos)</span>
            </button>
            <button
              onClick={() => setSearchMode('nombre')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold font-mono-tabular transition-all flex items-center justify-center gap-2 ${
                searchMode === 'nombre'
                  ? 'bg-racing-red text-white shadow-lg shadow-racing-red/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Por Nombre / Razón Social</span>
            </button>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          {searchMode === 'radicado' ? (
            <div className="space-y-2">
              <label className="text-xs uppercase font-mono-tabular tracking-wider text-slate-400 flex items-center justify-between">
                <span>Ingresa el Número de Radicación (23 Dígitos):</span>
                <span className="text-[11px] text-slate-400 font-mono-tabular">
                  {cleanRadicado(radicadoInput).length} / 23 dígitos
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={radicadoInput}
                  onChange={handleRadicadoChange}
                  placeholder="Ej: 11001-31-03-015-2023-00482-00 o pega los 23 dígitos..."
                  maxLength={29}
                  className="w-full bg-carbon-950 border-2 border-slate-700 focus:border-racing-red focus:ring-4 focus:ring-racing-red/20 rounded-xl px-5 py-4 text-base lg:text-xl font-mono-tabular text-white tracking-wider placeholder-slate-600 transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-racing-red hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center gap-2 text-sm shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>CONSULTANDO...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>BUSCAR PROCESO</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs uppercase font-mono-tabular tracking-wider text-slate-400">
                  Nombre, Apellido o Razón Social (Demandante / Demandado):
                </label>
                <input
                  type="text"
                  value={nombreInput}
                  onChange={(e) => setNombreInput(e.target.value)}
                  placeholder="Ej: Bancolombia, Colpensiones, Avianca, Carlos Restrepo, BBVA..."
                  className="w-full bg-carbon-950 border border-slate-700 focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 rounded-xl px-4 py-3.5 text-base font-medium text-white placeholder-slate-600 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-mono-tabular tracking-wider text-slate-400">
                  Departamento / Distrito:
                </label>
                <div className="flex gap-2">
                  <select
                    value={departamentoInput}
                    onChange={(e) => setDepartamentoInput(e.target.value)}
                    className="w-full bg-carbon-950 border border-slate-700 focus:border-racing-red rounded-xl px-3 py-3.5 text-sm text-slate-200 outline-none"
                  >
                    <option value="BOGOTA">Bogotá D.C.</option>
                    <option value="ANTIOQUIA">Antioquia / Medellín</option>
                    <option value="VALLE">Valle / Cali</option>
                    <option value="ATLANTICO">Atlántico / B/quilla</option>
                    <option value="SANTANDER">Santander / B/manga</option>
                  </select>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 bg-racing-red hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center text-sm shadow-md"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Quick Test Bench (Presets) */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono-tabular">
            <Sparkles className="w-3.5 h-3.5 text-racing-yellow" />
            <span>Casos de prueba rápida en 1 clic:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickExamples.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyQuickExample(item.radicado)}
                className="text-xs bg-carbon-850 hover:bg-carbon-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-racing-yellow/40 transition-all font-mono-tabular flex items-center gap-1.5"
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-slate-500">[{item.radicado.slice(0, 5)}...]</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Loading Animation (F1 Wheel / Telemetry Teleport) */}
      {loading && (
        <div className="bg-carbon-900 rounded-xl border border-racing-red/30 p-8 text-center space-y-3 shadow-2xl">
          <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-racing-red/20 border-t-racing-red animate-spin" />
            <span className="text-xl animate-pulse">🏎️</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-telemetry tracking-wide">
              CONSULTANDO EXPEDIENTE JUDICIAL
            </h3>
            <p className="text-xs text-slate-400 font-mono-tabular mt-0.5">
              Verificando despacho, especialidad y actuaciones en la Rama Judicial...
            </p>
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {searchResult && !loading && (
        <div className="space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-2 px-2">
            <div className="flex items-center space-x-2 text-sm text-slate-300 font-mono-tabular">
              <span className="font-bold text-white">{searchResult.data.length}</span>
              <span>expedientes localizados</span>
              <span className="text-racing-green font-semibold">[{searchResult.executionMs}ms]</span>
            </div>

            <div className="text-xs font-mono-tabular flex items-center gap-2">
              <span className="text-slate-400">{searchResult.message}</span>
              <span className="px-2 py-0.5 rounded font-bold bg-racing-green/20 text-racing-green border border-racing-green/40">
                LISTO
              </span>
            </div>
          </div>

          {searchResult.data.length === 0 ? (
            <div className="bg-carbon-900 rounded-xl border border-white/10 p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-racing-yellow mx-auto" />
              <h3 className="text-base font-bold text-white">No se encontraron expedientes con los parámetros indicados</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchResult.message || 'Verifica el radicado de 23 dígitos o realiza una búsqueda por nombre.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {searchResult.data.map((proceso) => {
                const inWatchlist = isProcessInWatchlist(proceso.radicado);
                const justAdded = addedAnimationId === proceso.id;

                return (
                  <div
                    key={proceso.id}
                    className="bg-carbon-900 rounded-xl border border-white/10 hover:border-slate-500 transition-all p-5 shadow-xl relative group overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Case Info */}
                      <div className="space-y-2.5 flex-1">
                        
                        {/* Badges & Radicado */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-carbon-850 text-white text-xs font-mono-tabular font-bold px-3 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-racing-red" />
                            {formatRadicado(proceso.radicado)}
                          </span>

                          <button
                            onClick={() => handleCopy(proceso.radicado)}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-carbon-800 transition-colors"
                            title="Copiar Radicado de 23 dígitos"
                          >
                            {copiedRadicado === proceso.radicado ? (
                              <Check className="w-3.5 h-3.5 text-racing-green" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono-tabular px-2.5 py-0.5 rounded">
                            {proceso.tipo_proceso}
                          </span>

                          <span className="bg-slate-800 text-slate-300 text-[11px] font-mono-tabular px-2 py-0.5 rounded">
                            📍 {proceso.departamento_ciudad}
                          </span>
                        </div>

                        {/* Despacho */}
                        <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                          <Building2 className="w-4 h-4 text-racing-yellow shrink-0" />
                          <span>{proceso.despacho}</span>
                        </div>

                        {/* Partes Procesales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-carbon-950/60 p-3 rounded-lg border border-white/5 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Demandante:</span>
                            <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-racing-green" /> {proceso.demandante}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Demandado:</span>
                            <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                              <Scale className="w-3 h-3 text-racing-red" /> {proceso.demandado}
                            </span>
                          </div>
                        </div>

                        {/* Última Actuación Preview */}
                        {proceso.actuaciones && proceso.actuaciones.length > 0 && (
                          <div className="flex items-start space-x-2 text-xs text-slate-400 pt-1">
                            <Clock className="w-3.5 h-3.5 text-racing-yellow shrink-0 mt-0.5" />
                            <div>
                              <span className="text-slate-300 font-semibold">Última actuación ({proceso.actuaciones[0].fecha_actuacion}): </span>
                              <span>{proceso.actuaciones[0].tipo_anotacion} - {proceso.actuaciones[0].anotacion.slice(0, 120)}...</span>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                        
                        <a
                          href={`https://consultaprocesos.ramajudicial.gov.co/Procesos/Index?radicado=${proceso.radicado}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-lg bg-carbon-800 hover:bg-carbon-700 text-slate-200 text-xs font-semibold font-mono-tabular border border-white/10 transition-colors flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-racing-green" />
                          <span>Portal Rama Judicial</span>
                        </a>

                        <button
                          onClick={() => onViewProcessDetails(proceso)}
                          className="px-3.5 py-2 rounded-lg bg-carbon-800 hover:bg-carbon-700 text-slate-200 text-xs font-semibold font-mono-tabular border border-white/10 transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ver Telemetría</span>
                        </button>

                        {inWatchlist ? (
                          <div className="px-4 py-2 rounded-lg bg-racing-green/10 border border-racing-green/40 text-racing-green text-xs font-bold font-mono-tabular flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>EN TELEMETRÍA</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAdd(proceso)}
                            disabled={justAdded}
                            className="px-4 py-2 rounded-lg bg-racing-red hover:bg-red-600 text-white text-xs font-bold font-mono-tabular shadow-lg shadow-racing-red/20 transition-all flex items-center gap-1.5"
                          >
                            {justAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>¡AÑADIDO AL GARAJE!</span>
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-4 h-4" />
                                <span>➕ Añadir a Telemetría (Vigilar)</span>
                              </>
                            )}
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
