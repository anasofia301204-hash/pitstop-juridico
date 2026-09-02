import type { VercelRequest, VercelResponse } from '@vercel/node';

const RAMA_JUDICIAL_BASE_URL = 'https://consultaprocesos.ramajudicial.gov.co/api/v2';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar cabeceras CORS para permitir consumo desde el frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extraer el endpoint solicitado
  const { endpoint } = req.query;

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({
      error: 'Parámetro "endpoint" requerido. Ej: /Proceso/Consulta/NumeroRadicado?numero=11001...',
      timestamp: new Date().toISOString()
    });
  }

  // Construir la URL de destino hacia la Rama Judicial
  const targetUrl = endpoint.startsWith('http')
    ? endpoint
    : `${RAMA_JUDICIAL_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://consultaprocesos.ramajudicial.gov.co/',
        'Origin': 'https://consultaprocesos.ramajudicial.gov.co',
        'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return res.status(502).json({
      error: isTimeout ? 'Timeout al conectar con la Rama Judicial (8s)' : err.message,
      targetUrl,
      executionMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
}
