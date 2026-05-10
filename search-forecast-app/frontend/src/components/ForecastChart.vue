<template>
  <div>
    <Line :data="chartData" :options="chartOptions" />
    <div style="margin-top: 1.5rem; background: #f1f5f9; padding: 1rem; border-radius: 6px;">
      <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">📊 Come è stata calcolata la previsione</h3>
      <ul style="padding-left: 1.2rem; font-size: 0.9rem;">
        <li v-for="(d, i) in forecast.explanation?.primary_drivers || []" :key="i" style="margin-bottom: 0.25rem;">
          <strong>{{ d.feature }}:</strong> {{ d.contribution }}
        </li>
      </ul>
      <p class="note">Intervallo di confidenza al 95%. Le bande grigie indicano la variabilità statistica stimata dal modello.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps({ forecast: Object })

const chartData = computed(() => ({
  labels: props.forecast?.forecast?.map(f => f.date) || [],
  datasets: [
    {
      label: 'Volume previsto',
      data: props.forecast?.forecast?.map(f => f.predicted_volume) || [],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.3
    },
    {
      label: 'Limite superiore (95%)',
      data: props.forecast?.forecast?.map(f => f.confidence_interval?.[1]) || [],
      borderColor: 'transparent',
      backgroundColor: 'rgba(148, 163, 184, 0.25)',
      fill: '-1',
      pointRadius: 0,
      borderWidth: 0
    },
    {
      label: 'Limite inferiore (95%)',
      data: props.forecast?.forecast?.map(f => f.confidence_interval?.[0]) || [],
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      borderWidth: 0
    }
  ]
}))

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: 'Volume di ricerca (indice)' } }
  }
}
</script>
