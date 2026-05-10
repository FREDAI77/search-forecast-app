exports.handler = async (event) => {
  const jobId = event.queryStringParameters?.jobId;
  
  if (!jobId) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Missing jobId' }) 
    };
  }

  // Dati mock nel formato CORRETTO per il componente Vue
  const mockForecast = [
    { date: '2026-05-07', predicted_volume: 1200, confidence_interval: [1000, 1400] },
    { date: '2026-05-08', predicted_volume: 1300, confidence_interval: [1100, 1500] },
    { date: '2026-05-09', predicted_volume: 1400, confidence_interval: [1200, 1600] },
    { date: '2026-05-10', predicted_volume: 1500, confidence_interval: [1300, 1700] },
    { date: '2026-05-11', predicted_volume: 1600, confidence_interval: [1400, 1800] },
    { date: '2026-05-12', predicted_volume: 1700, confidence_interval: [1500, 1900] },
    { date: '2026-05-13', predicted_volume: 1800, confidence_interval: [1600, 2000] },
    { date: '2026-05-14', predicted_volume: 1900, confidence_interval: [1700, 2100] },
    { date: '2026-05-15', predicted_volume: 2000, confidence_interval: [1800, 2200] },
    { date: '2026-05-16', predicted_volume: 2100, confidence_interval: [1900, 2300] }
  ];

  return { 
    statusCode: 200, 
    body: JSON.stringify({
      forecast: mockForecast,
      explanation: {
        primary_drivers: [
          { feature: 'Stagionalità', contribution: '+15%' },
          { feature: 'Trend storico', contribution: '+8%' }
        ]
      }
    })
  };
};
