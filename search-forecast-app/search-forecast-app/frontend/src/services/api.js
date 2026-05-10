import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export async function requestForecast({ keyword, startDate, endDate, location = 'IT' }) {
  const res = await api.post('/forecast-request', {
    keyword,
    dateRange: { start: startDate, end: endDate },
    location
  })
  return res.data
}

export async function pollStatus(jobId, maxAttempts = 25, interval = 2500) {
  let attempts = 0
  while (attempts < maxAttempts) {
    const res = await api.get(`/forecast-status?jobId=${jobId}`)
    if (res.status === 200) return res.data
    if (res.status === 500) throw new Error(res.data.error || 'Generazione fallita')
    await new Promise(r => setTimeout(r, interval))
    attempts++
  }
  throw new Error('Timeout: la previsione non è stata completata entro il tempo previsto.')
}