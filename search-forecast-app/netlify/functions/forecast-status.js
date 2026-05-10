exports.handler = async (event) => {
  // GET request - non ha body, solo queryStringParameters
  const jobId = event.queryStringParameters?.jobId;
  
  if (!jobId) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Missing jobId' }) 
    };
  }

  // Dati mock per il grafico
  const mockResult = {
    dates: ['2026-05-07', '2026-05-08', '2026-05-09', '2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15', '2026-05-16'],
    volumes: [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100],
    lowerBound: [1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900],
    upperBound: [1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300]
  };

  return { 
    statusCode: 200, 
    body: JSON.stringify(mockResult)
  };
};
