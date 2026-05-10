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

  // Dati mock per test - formato corretto per il grafico
  const mockResult = {
    status: 'completed',
    forecast: {
      dates: ['2026-05-01', '2026-05-05', '2026-05-10', '2026-05-15', '2026-05-20', '2026-05-25', '2026-05-31'],
      volumes: [1200, 1500, 1800, 2100, 1900, 2200, 2500],
      lowerBound: [1000, 1300, 1600, 1900, 1700, 2000, 2300],
      upperBound: [1400, 1700, 2000, 2300, 2100, 2400, 2700]
    }
  };

  return { 
    statusCode: 200, 
    body: JSON.stringify(mockResult)
  };
};
