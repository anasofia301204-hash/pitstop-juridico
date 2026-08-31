import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || 'pitstop_secret_token_2026';
const WHATSAPP_TARGET = process.env.WHATSAPP_TARGET_NUMBER || '+573196816770';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  // 1. Verificación de Seguridad CRON_SECRET
  const authHeader = req.headers['authorization'] || req.headers['x-cron-secret'];
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '').trim() : '';

  // Permitir si el token coincide o si es llamado internamente por Vercel Cron en producción
  if (CRON_SECRET && token !== CRON_SECRET && req.headers['user-agent'] !== 'vercel-cron/1.0') {
    return res.status(401).json({
      error: 'No autorizado. Se requiere token CRON_SECRET válido.',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const supabase = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      : null;

    let processesToCheck: any[] = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('procesos')
        .select('*, actuaciones_estados(*)')
        .eq('en_vigilancia', true);

      if (!error && data) {
        processesToCheck = data;
      }
    }

    // Si no hay conexión a Supabase, retornar status de verificación
    if (processesToCheck.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Barrido ejecutado en modo autónomo.',
        totalChecked: 0,
        detectedUpdates: 0,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    let updatesDetected = 0;
    const sweepLogs: any[] = [];

    for (const proc of processesToCheck) {
      const radicado = proc.radicado;
      
      try {
        // Consultar API v2 de la Rama Judicial
        const ramaUrl = `https://consultaprocesos.ramajudicial.gov.co/api/v2/Proceso/Consulta/NumeroRadicado?numero=${radicado}&SoloActivos=false&pagina=1`;
        const response = await fetch(ramaUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PitStopJudicial/2.0 (VercelCronWorker; Colombia)'
          }
        });

        if (response.ok) {
          const json = await response.json();
          sweepLogs.push({
            radicado,
            status: 'CHECKED_OK',
            source: 'RAMA_JUDICIAL_API_V2'
          });
        } else {
          sweepLogs.push({
            radicado,
            status: 'SAFETY_CAR_APPLIED',
            code: response.status
          });
        }
      } catch (err: any) {
        sweepLogs.push({
          radicado,
          status: 'SAFETY_CAR_FALLBACK',
          error: err.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      sweepId: `cron-${Date.now()}`,
      targetPhone: WHATSAPP_TARGET,
      totalChecked: processesToCheck.length,
      detectedUpdates: updatesDetected,
      executionTimeMs: Date.now() - startTime,
      logs: sweepLogs,
      timestamp: new Date().toISOString()
    });

  } catch (globalError: any) {
    return res.status(500).json({
      success: false,
      error: globalError.message || 'Error en ejecución de cron de telemetría.'
    });
  }
}
