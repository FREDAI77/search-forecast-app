/**
 * Wrapper per acquisizione dati storici con fallback gerarchico.
 * Priorità: Cache → DataForSEO → Generazione fallback locale
 */
async function getHistoricalSearchData(keyword, dateRange, location) {
  const { get, set } = require('./cache');
  const cacheKey = `search:${keyword}:${location}:${dateRange.start}`;
  const cached = get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_trends/explore/live', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Basic ${Buffer.from(`${process.env.DATAFORSEO_USER}:${process.env.DATAFORSEO_PASS}`).toString('base64')}` 
      },
      body: JSON.stringify({
        keywords: [keyword],
        location_code: getLocationCode(location),
        date_from: dateRange.start,
        date_to: dateRange.end,
        type: 'web'
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const formatted = transformResponse(data);
    set(cacheKey, formatted);
    return formatted;
  } catch (err) {
    console.warn('Primary API failed, using fallback:', err.message);
    return generateFallbackData(keyword, dateRange);
  }
}

function getLocationCode(loc) {
  const map = { IT: 2380, US: 2840, GB: 2826, DE: 2276, ES: 2724 };
  return map[loc?.toUpperCase()] || 2380;
}

function transformResponse(apiData) {
  return apiData.tasks?.[0]?.result?.[0]?.items?.map(i => ({
    date: i.date,
    value: i.values?.[0] || 0
  })) || [];
}

function generateFallbackData(keyword, range) {
  const days = Math.floor((new Date(range.end) - new Date(range.start)) / 86400000);
  const start = new Date(range.start).getTime();
  return Array.from({ length: Math.min(days, 365) }, (_, i) => ({
    date: new Date(start + i * 86400000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 60) + 20
  }));
}

module.exports = { getHistoricalSearchData };