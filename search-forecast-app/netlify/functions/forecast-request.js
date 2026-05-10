const axios = require('axios');
const cache = require('./utils/cache');

exports.handler = async (event) => {
  try {
    const { keyword, dateRange, location } = JSON.parse(event.body);
    
    if (!keyword || !dateRange) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing parameters' })
      };
    }

    const jobId = Math.random().toString(36).substr(2, 9);
    
    // CHIAMA SERPAPI - DATI REALI!
    const trendsData = await getGoogleTrends(keyword, location);
    
    const forecast = generateForecast(trendsData, dateRange);
    
    cache.set(jobId, {
      status: 'completed',
      result: { forecast }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        jobId, 
        status: 'completed', 
        result: { forecast } 
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

async function getGoogleTrends(keyword, location = 'IT') {
  const API_KEY = process.env.SERPAPI_KEY;
  
  const locationMap = {
    'IT': 'Italy',
    'US': 'United States',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France'
  };
  
  const country = locationMap[location] || 'Italy';

  const response = await axios.get('https://serpapi.com/search.json', {
    params: {
      engine: 'google_trends',
      q: keyword,
      hl: 'it',
      gl: country.toLowerCase(),
      api_key: API_KEY
    }
  });

  const data = response.data;
  const timeline = data.interest_over_time?.timeline_data || [];
  const values = timeline.map(t => parseInt(t.value) || 0);
  
  if (values.length === 0) {
    throw new Error('Nessun dato trovato');
  }
  
  const current = values[values.length - 1];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  const firstHalf = values.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
  const secondHalf = values.slice(6).reduce((a, b) => a + b, 0) / 6;
  const trend = ((secondHalf - firstHalf) / firstHalf * 100).toFixed(1);

  return { values, current, avg, trend: parseFloat(trend) };
}

function generateForecast(trendsData, dateRange) {
  const { start, end } = dateRange;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const forecast = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const predicted = Math.round(trendsData.avg * (1 + trendsData.trend / 100));
    
    forecast.push({
      date: dateStr,
      predicted_volume: predicted,
      confidence_interval: [
        Math.round(predicted * 0.85),
        Math.round(predicted * 1.15)
      ]
    });
    
    currentDate.setDate(currentDate.getDate + 1);
  }
  
  return forecast;
}
