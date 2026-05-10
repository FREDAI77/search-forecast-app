const axios = require('axios');
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

    const jobId = Math.random().toString(36).substr(2, 9);
    
    // Ottieni dati reali da Google Trends via SerpAPI
    const trendsData = await getGoogleTrendsData(keyword, location);
    
    // Genera previsione basata sui dati reali
    const forecast = generateForecastFromTrends(trendsData, dateRange);
    
    // Salva nella cache
    cache.set(jobId, {
      status: 'completed',
      result: {
        forecast,
        explanation: {
          primary_drivers: [
            { feature: 'Interesse attuale', contribution: `${trendsData.current_interest}/100` },
            { feature: 'Trend 12 mesi', contribution: `${trendsData.trend > 0 ? '+' : ''}${trendsData.trend}%` },
            { feature: 'Picco storico', contribution: `Indice ${trendsData.peak}` }
          ]
        }
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        jobId, 
        status: 'completed',
        result: {
          forecast,
          explanation: {
            primary_drivers: [
              { feature: 'Interesse attuale', contribution: `${trendsData.current_interest}/100` },
              { feature: 'Trend 12 mesi', contribution: `${trendsData.trend > 0 ? '+' : ''}${trendsData.trend}%` }
            ]
          }
        }
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        message: 'Impossibile recuperare i dati. Riprova più tardi.'
      })
    };
  }
};

async function getGoogleTrendsData(keyword, location = 'IT') {
  const API_KEY = process.env.SERPAPI_KEY;
  
  // Mappa paesi SerpAPI
  const locationMap = {
    'IT': 'Italy',
    'US': 'United States',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain'
  };
  
  const country = locationMap[location] || 'Italy';

  try {
    // Chiamata a Google Trends via SerpAPI
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
    const interestOverTime = data.interest_over_time?.timeline_data || [];
    
    // Estrai valori degli ultimi 12 mesi
    const timeline = interestOverTime.slice(-12);
    const values = timeline.map(t => parseInt(t.value) || 0);
    
    if (values.length === 0) {
      throw new Error('Nessun dato disponibile per questa keyword');
    }
    
    // Calcola statistiche
    const currentValue = values[values.length - 1];
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const peak = Math.max(...values);
    
    // Calcola trend (confronto prima metà vs seconda metà)
    const firstHalf = values.slice(0, 6);
    const secondHalf = values.slice(6);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1) : 0;

    return {
      timeline,
      values,
      current_interest: currentValue,
      avg_interest: avgValue,
      peak,
      trend: parseFloat(trend),
      keyword
    };
    
  } catch (error) {
    console.error('SerpAPI Error:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i dati da Google Trends');
  }
}

function generateForecastFromTrends(trendsData, dateRange) {
  const { start, end } = dateRange;
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const forecast = [];
  const currentDate = new Date(startDate);
  
  const baseInterest = trendsData.avg_interest;
  const trendFactor = trendsData.trend / 100;
  const volatility = 0.15; // ±15% variabilità

  let dayIndex = 0;
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Applica trend progressivo
    const trendMultiplier = 1 + (trendFactor * (dayIndex / 30));
    const predictedInterest = Math.round(baseInterest * trendMultiplier);
    
    // Calcola intervallo di confidenza
    const lowerBound = Math.max(0, Math.round(predictedInterest * (1 - volatility)));
    const upperBound = Math.round(predictedInterest * (1 + volatility));
    
    forecast.push({
      date: dateStr,
      predicted_volume: predictedInterest,
      confidence_interval: [lowerBound, upperBound]
    });
    
    currentDate.setDate(currentDate.getDate + 1);
    dayIndex++;
  }
  
  return forecast;
}
