import React from 'react';
import { 
  Gauge, 
  Search, 
  Car, 
  Bell, 
  Database, 
  ChevronRight,
  Radio,
  Smartphone
} from 'lucide-react';

export type NavigationTab = 'garage' | 'scouting' | 'racecontrol' | 'dashboard' | 'pitwall' | 'sql';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  watchlistCount: number;
  criticalAlertsCount: number;
  onOpenNewCaseModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  watchlistCount,
  criticalAlertsCount
}) => {
  const navItems = [
    {
      id: 'garage' as NavigationTab,
      label: 'El Garaje',
      subtitle: 'Repositorio Central',
      icon: Car,
      badge: watchlistCount > 0 ? `${watchlistCount}` : undefined,
      badgeColor: 'bg-racing-green/20 text-racing-green border-racing-green/40'
    },
    {
      id: 'scouting' as NavigationTab,
      label: 'Scouting / Radar',
      subtitle: 'Buscar Procesos',
      icon: Search,
      badge: '23 DIG',
      badgeColor: 'bg-racing-yellow/20 text-racing-yellow border-racing-yellow/40'
    },
    {
      id: 'racecontrol' as NavigationTab,
      label: 'Race Control',
      subtitle: 'Monitoreo & Cron Jobs',
      icon: Radio,
      badge: '6AM/5PM',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    },
    {
      id: 'dashboard' as NavigationTab,
      label: 'Tablero General',
      subtitle: 'Timing Tower & KPIs',
      icon: Gauge,
    },
    {
      id: 'pitwall' as NavigationTab,
      label: 'PitWall WhatsApp',
      subtitle: 'Alertas & Notificaciones',
      icon: Bell,
      badge: criticalAlertsCount > 0 ? `${criticalAlertsCount} CRIT` : undefined,
      badgeColor: 'bg-racing-red/20 text-racing-red border-racing-red/40 animate-pulse'
    },
    {
      id: 'sql' as NavigationTab,
      label: 'Esquema Base Datos',
      subtitle: 'SQL / PostgreSQL / Supabase',
      icon: Database,
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-carbon-900/95 border-r border-white/10 flex flex-col justify-between p-3 lg:p-4 shrink-0">
      
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-racing-red via-red-700 to-black p-0.5 shadow-lg flex items-center justify-center">
            <span className="text-xl">🏎️</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-telemetry font-bold text-lg tracking-wider text-white">LEGAL</span>
              <span className="font-telemetry font-bold text-lg tracking-wider text-racing-red">POLE</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono-tabular uppercase tracking-widest">
              PitStop Judicial CO
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 py-1 font-mono-tabular">
            Centro de Telemetría
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-racing-red/20 to-carbon-800 text-white border-l-4 border-racing-red shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-carbon-850 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-racing-red' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <div className="text-left">
                    <div className="font-semibold text-xs leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.badge && (
                    <span className={`text-[10px] font-mono-tabular px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-racing-red translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`} />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info Card: WhatsApp Alert Station */}
      <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
        <div className="bg-gradient-to-b from-carbon-850 to-black/80 rounded-lg p-3 border border-white/10 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-mono-tabular text-[10px]">
              <Smartphone className="w-3 h-3 text-racing-green" /> WHATSAPP DIRECT
            </span>
            <span className="text-[10px] bg-racing-green/20 text-racing-green px-1.5 py-0.2 rounded font-mono-tabular">
              ACTIVO
            </span>
          </div>
          <div className="text-xs font-mono-tabular font-bold text-slate-200">
            +57 319 681 6770
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Despacho Judicial & Términos
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono-tabular px-1">
          <span>v2.0-TELEMETRY</span>
          <span className="text-racing-green flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-racing-green animate-pulse" /> 100% ONLINE
          </span>
        </div>
      </div>

    </aside>
  );
};
