<template>
  <main class="container">
    <h1 style="margin-bottom: 1.5rem; font-size: 1.5rem;">🔍 Previsione Ricerche Web</h1>
    <div class="card">
      <ForecastForm @submit="handleForecast" />
    </div>

    <div v-if="loading" class="status">⏳ Elaborazione previsione in corso...</div>
    <div v-if="error" class="error">❌ {{ error }}</div>
    
    <div v-if="forecast" class="card" style="margin-top: 1.5rem;">
      <ForecastChart :forecast="forecast" />
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ForecastForm from './components/ForecastForm.vue'
import ForecastChart from './components/ForecastChart.vue'
import { requestForecast, pollStatus } from './services/api'

const forecast = ref(null)
const loading = ref(false)
const error = ref(null)

async function handleForecast(payload) {
  loading.value = true
  error.value = null
  forecast.value = null

  try {
    const { jobId } = await requestForecast(payload)
    const result = await pollStatus(jobId)
    forecast.value = result
  } catch (err) {
    error.value = err.message || 'Errore imprevisto durante la generazione della previsione.'
  } finally {
    loading.value = false
  }
}
</script>
