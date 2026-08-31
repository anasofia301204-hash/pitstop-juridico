import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Check, 
  Send, 
  Bell, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { ConfiguracionAlertas, ProcesoJudicial } from '../types/database';
import { formatRadicado } from '../services/ramaJudicialApi';

interface AlertsPitWallModalProps {
  config: ConfiguracionAlertas;
  onSaveConfig: (config: ConfiguracionAlertas) => void;
  onClose: () => void;
  sampleProceso?: ProcesoJudicial | null;
}

export const AlertsPitWallModal: React.FC<AlertsPitWallModalProps> = ({
  config,
  onSaveConfig,
  onClose,
  sampleProceso
}) => {
  const [formData, setFormData] = useState<ConfiguracionAlertas>({ ...config });
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  const radicadoDisplay = sampleProceso ? formatRadicado(sampleProceso.radicado) : '11001-31-03-015-2023-00482-00';
  const despachoDisplay = sampleProceso ? sampleProceso.despacho : 'Juzgado 015 Civil del Circuito de Bogotá D.C.';
  const lastActDisplay = sampleProceso?.actuaciones?.[0]?.anotacion || 'Auto de Cúmplase y Medidas Cautelares. Mandamiento de pago y embargo preventivo.';

  const handleSendSimulatedAlert = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3500);
    }, 800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-carbon-900 border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-racing-green via-racing-yellow to-racing-red" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-carbon-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-racing-green/20 border border-racing-green/40 flex items-center justify-center text-racing-green">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                PitWall WhatsApp & Notificaciones
              </h2>
              <p className="text-xs text-slate-400 font-mono-tabular">
                Canal Directo de Telemetría Judicial para Términos y Autos
              </p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Configuration Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="text-xs uppercase font-mono-tabular font-bold tracking-wider text-slate-400 border-b border-white/10 pb-2">
                Parámetros de Envío
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Destinatario / Despacho:
                </label>
                <input
                  type="text"
                  value={formData.destinatario_nombre}
                  onChange={(e) => setFormData({ ...formData, destinatario_nombre: e.target.value })}
                  className="w-full bg-carbon-950 border border-slate-700 focus:border-racing-green rounded-lg px-3.5 py-2 text-xs text-white outline-none"
                  placeholder="Ej: Dr. Abogado Principal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Teléfono WhatsApp (+57 Colombia):
                </label>
                <input
                  type="text"
                  value={formData.destinatario_telefono}
                  onChange={(e) => setFormData({ ...formData, destinatario_telefono: e.target.value })}
                  className="w-full bg-carbon-950 border border-slate-700 focus:border-racing-green rounded-lg px-3.5 py-2 text-xs font-mono-tabular text-white outline-none"
                  placeholder="+573196816770"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificar_por_whatsapp}
                    onChange={(e) => setFormData({ ...formData, notificar_por_whatsapp: e.target.checked })}
                    className="rounded bg-carbon-950 border-slate-700 text-racing-green focus:ring-racing-green"
                  />
                  <span>Activar notificaciones instantáneas WhatsApp</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificar_terminos_por_vencer}
                    onChange={(e) => setFormData({ ...formData, notificar_terminos_por_vencer: e.target.checked })}
                    className="rounded bg-carbon-950 border-slate-700 text-racing-red focus:ring-racing-red"
                  />
                  <span>Alertas prioritarias de Bandera Roja (términos &lt; 72h)</span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2 bg-racing-green hover:bg-emerald-600 text-black font-bold rounded-lg text-xs font-mono-tabular transition-all shadow-md shadow-racing-green/20"
                >
                  GUARDAR AJUSTES DE TELEMETRÍA
                </button>
              </div>
            </form>

            {/* Right: WhatsApp Message Simulator Preview */}
            <div className="space-y-3">
              <div className="text-xs uppercase font-mono-tabular font-bold tracking-wider text-slate-400 border-b border-white/10 pb-2 flex items-center justify-between">
                <span>Simulador de Alerta en WhatsApp</span>
                <span className="text-racing-green text-[10px]">LIVE PREVIEW</span>
              </div>

              {/* Mock WhatsApp Bubble */}
              <div className="bg-[#0b141a] rounded-xl p-4 border border-emerald-950 shadow-2xl relative">
                
                {/* Header in bubble */}
                <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-[#1f2c34] text-xs text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-racing-green" />
                  <span className="font-bold text-white font-mono-tabular">PitStop Judicial Bot</span>
                  <span className="text-[10px] text-slate-500 font-mono-tabular">HOY</span>
                </div>

                {/* Message Body */}
                <div className="bg-[#005c4b] text-white p-3.5 rounded-xl text-xs space-y-2 font-sans shadow-md">
                  <div className="font-bold flex items-center gap-1.5 text-yellow-300">
                    <span>🚨 PITSTOP JUDICIAL - ALERTA ROJA 🏎️⚖️</span>
                  </div>
                  
                  <div className="text-[11px] leading-relaxed space-y-1">
                    <p><strong>Expediente:</strong> {radicadoDisplay}</p>
                    <p><strong>Despacho:</strong> {despachoDisplay}</p>
                    <p><strong>Novedad detectada:</strong> {lastActDisplay}</p>
                    <p className="text-yellow-200"><strong>⚠️ Término corriendo:</strong> 72 horas para interponer recurso / descorrer excepciones.</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[9px] text-emerald-200">
                    <span>Legal Telemetry System</span>
                    <span className="flex items-center gap-1">21:40 <CheckCheck className="w-3 h-3 text-cyan-300" /></span>
                  </div>
                </div>

                {/* Trigger Test Button */}
                <button
                  type="button"
                  onClick={handleSendSimulatedAlert}
                  disabled={sending}
                  className="mt-3 w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs font-mono-tabular transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : sentSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-yellow-300" />
                      <span>¡ALERTA ENVIADA A {formData.destinatario_telefono}!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>PROBAR ENVÍO WHATSAPP INMEDIATO</span>
                    </>
                  )}
                </button>

              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-carbon-850 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono-tabular">
          <span>Servidor Webhook: <strong className="text-slate-200">https://api.pitstop.co/webhook/whatsapp</strong></span>
          <span>SSL 256-bit</span>
        </div>

      </div>
    </div>
  );
};
