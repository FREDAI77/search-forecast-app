const crypto = require('crypto');

/**
 * POST /api/forecast-request
 * Avvia job asincrono, restituisce jobId per polling
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { keyword, dateRange, location = 'IT' } = payload;

    if (!keyword || !dateRange?.start || !dateRange?.end) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing keyword or valid dateRange' }) };
    }

    // Recupero dati storici
    const { getHistoricalSearchData } = require('./utils/api-client');
    const historicalData = await getHistoricalSearchData(keyword, dateRange, location);

    // Generazione jobId
    const jobId = crypto.randomUUID();
    const jobState = { status: 'processing', createdAt: Date.now(), keyword, location };
    
    // Salvataggio stato (in-memory per MVP; in prod usare Redis/DB)
    const jobStore = global.__jobStore || (global.__jobStore = new Map());
    jobStore.set(jobId, jobState);

    // Trigger ML service (async, fire-and-forget)
    triggerMLInference(jobId, { keyword, location, historicalData }).catch(console.error);

    return {
      statusCode: 202,
      body: JSON.stringify({ jobId, status: 'processing', message: 'Previsione in elaborazione' })
    };
  } catch (error) {
    console.error('Forecast request error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

async function triggerMLInference(jobId, payload) {
  const mlEndpoint = process.env.ML_SERVICE_ENDPOINT;
  if (!mlEndpoint) {
    // Fallback: completa job localmente con mock per demo
    const jobStore = global.__jobStore || (global.__jobStore = new Map());
    jobStore.set(jobId, {
      status: 'completed',
      result: mockForecast(payload.keyword, payload.historicalData)
    });
    return;
  }

  await fetch(mlEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.ML_API_KEY || ''}` },
    body: JSON.stringify({ jobId, ...payload })
  });
}

function mockForecast(keyword, historical) {
  const base = historical.reduce((a, b) => a + (b.value || 0), 0) / Math.max(historical.length, 1);
  return {
    keyword,
    forecast: Array.from({ length: 30 }, (_, i) => {
      const vol = base * (1.15 + Math.sin(i / 7) * 0.1);
      return {
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        predicted_volume: Math.round(vol * 100) / 100,
        confidence_interval: [Math.round(vol * 0.8 * 100) / 100, Math.round(vol * 1.2 * 100) / 100]
      };
    }),
    explanation: {
      primary_drivers: [
        { feature: 'Stagionalità storica', contribution: '+42%' },
        { feature: 'Pattern settimanale', contribution: '+18%' },
        { feature: 'Trend recente (7d)', contribution: '+9%' }
      ]
    },
    modelVersion: 'mock-v1.0'
  };
}