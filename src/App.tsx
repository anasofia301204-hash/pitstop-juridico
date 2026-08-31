import React, { useState, useMemo } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { TopTelemetryBar } from './components/TopTelemetryBar';
import { GarageWatchlist } from './components/GarageWatchlist';
import { ScoutingSearch } from './components/ScoutingSearch';
import { RaceControlMonitorView } from './components/RaceControlMonitorView';
import { DashboardOverview } from './components/DashboardOverview';
import { ProcessDetailModal } from './components/ProcessDetailModal';
import { AlertsPitWallModal } from './components/AlertsPitWallModal';
import { SqlViewerModal } from './components/SqlViewerModal';
import { ProcesoJudicial, ConfiguracionAlertas, TelemetryMetrics } from './types/database';
import { INITIAL_PROCESSES, INITIAL_ALERT_CONFIG } from './mock/initialProcesses';
import { cleanRadicado } from './services/ramaJudicialApi';
import { Check } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('garage');
  const [processes, setProcesses] = useState<ProcesoJudicial[]>(INITIAL_PROCESSES);
  const [alertConfig, setAlertConfig] = useState<ConfiguracionAlertas>(INITIAL_ALERT_CONFIG);
  
  // Modals state
  const [selectedProcess, setSelectedProcess] = useState<ProcesoJudicial | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [alertTargetProcess, setAlertTargetProcess] = useState<ProcesoJudicial | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics calculation
  const metrics: TelemetryMetrics = useMemo(() => {
    const total = processes.length;
    const criticas = processes.filter(p => p.semaforo === 'rojo').length;
    const pitAlerts = processes.filter(p => p.semaforo === 'amarillo').length;
    const enCarrera = processes.filter(p => p.semaforo === 'verde').length;
    
    // Contar actuaciones detectadas hoy
    const today = new Date().toISOString().split('T')[0];
    const hoyCount = processes.reduce((acc, p) => {
      const count = (p.actuaciones || []).filter(a => a.fecha_actuacion === today).length;
      return acc + count;
    }, 0);

    return {
      totalVigilancia: total,
      actuacionesHoy: hoyCount || 2,
      alertasCriticas: criticas,
      pitAlerts: pitAlerts,
      enCarrera: enCarrera,
      estadoConexion: 'LIVE',
      pingMs: 38
    };
  }, [processes]);

  const isProcessInWatchlist = (radicado: string) => {
    const clean = cleanRadicado(radicado);
    return processes.some(p => cleanRadicado(p.radicado) === clean);
  };

  const handleAddToWatchlist = (newProceso: ProcesoJudicial) => {
    if (isProcessInWatchlist(newProceso.radicado)) {
      showToast('⚠️ Este proceso ya se encuentra en tu Garaje de vigilancia.');
      return;
    }

    const updated = {
      ...newProceso,
      en_vigilancia: true,
      created_at: new Date().toISOString()
    };

    setProcesses(prev => [updated, ...prev]);
    showToast(`🏎️ Proceso ${newProceso.radicado.slice(0, 10)}... añadido a telemetría activa.`);
  };

  const handleRemoveFromWatchlist = (procesoId: string) => {
    setProcesses(prev => prev.filter(p => p.id !== procesoId));
    showToast('Proceso retirado de la parrilla de vigilancia.');
  };

  const handleOpenWhatsappAlert = (proceso: ProcesoJudicial) => {
    setAlertTargetProcess(proceso);
    setIsAlertsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-carbon-950 text-slate-100 flex flex-col carbon-grid">
      
      {/* Top Telemetry Bar */}
      <TopTelemetryBar
        metrics={metrics}
        onOpenAlertsModal={() => {
          setAlertTargetProcess(processes[0] || null);
          setIsAlertsModalOpen(true);
        }}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'sql') {
              setIsSqlModalOpen(true);
            } else if (tab === 'pitwall') {
              setAlertTargetProcess(processes[0] || null);
              setIsAlertsModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          watchlistCount={processes.length}
          criticalAlertsCount={metrics.alertasCriticas}
        />

        {/* Dynamic Content Main Screen */}
        <main className="flex-1 p-4 lg:p-7 overflow-y-auto max-w-7xl">
          
          {activeTab === 'garage' && (
            <GarageWatchlist
              processes={processes}
              onSelectProcess={(p) => setSelectedProcess(p)}
              onSendWhatsappAlert={handleOpenWhatsappAlert}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onNavigateToScouting={() => setActiveTab('scouting')}
            />
          )}

          {activeTab === 'scouting' && (
            <ScoutingSearch
              onAddToWatchlist={handleAddToWatchlist}
              isProcessInWatchlist={isProcessInWatchlist}
              onViewProcessDetails={(p) => setSelectedProcess(p)}
            />
          )}

          {activeTab === 'racecontrol' && (
            <RaceControlMonitorView
              processes={processes}
              alertConfig={alertConfig}
              onUpdateProcesses={(updated) => setProcesses(updated)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardOverview
              metrics={metrics}
              processes={processes}
              onSelectProcess={(p) => setSelectedProcess(p)}
              onNavigateToScouting={() => setActiveTab('scouting')}
              onNavigateToGarage={() => setActiveTab('garage')}
              onOpenAlertsModal={() => {
                setAlertTargetProcess(processes[0] || null);
                setIsAlertsModalOpen(true);
              }}
            />
          )}

        </main>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-carbon-850 border border-racing-green/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 font-mono-tabular text-xs">
          <div className="p-1 rounded bg-racing-green text-black">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Process Details Modal (Telemetría de Vuelta) */}
      <ProcessDetailModal
        proceso={selectedProcess}
        onClose={() => setSelectedProcess(null)}
        onSendWhatsappAlert={(p) => {
          setSelectedProcess(null);
          handleOpenWhatsappAlert(p);
        }}
      />

      {/* WhatsApp Alerts PitWall Modal */}
      {isAlertsModalOpen && (
        <AlertsPitWallModal
          config={alertConfig}
          onSaveConfig={(updated) => {
            setAlertConfig(updated);
            showToast(`Ajustes guardados para ${updated.destinatario_telefono}`);
          }}
          onClose={() => {
            setIsAlertsModalOpen(false);
            setAlertTargetProcess(null);
          }}
          sampleProceso={alertTargetProcess || processes[0]}
        />
      )}

      {/* SQL Schema Inspector Modal */}
      {isSqlModalOpen && (
        <SqlViewerModal
          onClose={() => setIsSqlModalOpen(false)}
        />
      )}

    </div>
  );
};
