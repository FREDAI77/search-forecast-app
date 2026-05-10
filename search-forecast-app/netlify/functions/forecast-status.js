/**
 * GET /api/forecast-status?jobId=xxx
 * Polling risultato job
 */

exports.handler = async (event) => {
  const jobId = event.queryStringParameters?.jobId;
  
  if (!jobId) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Missing jobId' }) 
    };
  }

  // TEMPORARY: Mock data per testare il sito
  // TODO: Implementare cache Redis/Database quando pronto
  return { 
    statusCode: 200, 
    body: JSON.stringify({ 
      status: 'completed',
      data: {
        volumes: [1200, 1500, 1800, 2100, 1900, 2200, 2500, 2800, 2600, 2400, 2200, 2000],
        trend: 'up',
        keyword: 'mock-keyword',
        dateRange: {
          start: '2026-05-01',
          end: '2026-05-31'
        }
      }
    }) 
  };
};
