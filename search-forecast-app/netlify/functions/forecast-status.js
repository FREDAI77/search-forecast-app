const cache = require('./utils/cache');

exports.handler = async (event) => {
  try {
    const { keyword, dateRange, location } = JSON.parse(event.body);
    
    if (!keyword || !dateRange) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Genera jobId
    const jobId = Math.random().toString(36).substr(2, 9);
    
    // Dati mock completi per il grafico
    const mockForecast = {
      dates: ['2026-05-08', '2026-05-09', '2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15'],
      volumes: [1200, 1350, 1500, 1650, 1800, 1950, 2100, 2250],
      lowerBound: [1000, 1150, 1300, 1450, 1600, 1750, 1900, 2050],
      upperBound: [1400, 1550, 1700, 1850, 2000, 2150, 2300, 2450]
    };

    // Salva nella cache (per compatibilità)
    cache.set(jobId, {
      status: 'completed',
      result: mockForecast
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        jobId,
        status: 'completed',
        result: mockForecast
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
