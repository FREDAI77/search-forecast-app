<template>
  <form @submit.prevent="submit">
    <div>
      <label>Keyword</label>
      <input v-model="form.keyword" required placeholder="es. vacanze al mare Italia" />
    </div>
    <div class="form-row">
      <div>
        <label>Data Inizio</label>
        <input type="date" v-model="form.startDate" :max="today" required />
      </div>
      <div>
        <label>Data Fine</label>
        <input type="date" v-model="form.endDate" :min="form.startDate" required />
      </div>
    </div>
    <div>
      <label>Paese</label>
      <select v-model="form.location">
        <option value="IT">Italia</option>
        <option value="US">Stati Uniti</option>
        <option value="GB">Regno Unito</option>
        <option value="DE">Germania</option>
      </select>
    </div>
    <button type="submit" :disabled="!isValid" style="margin-top: 1rem; width: 100%;">Genera Previsione</button>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { format, startOfDay } from 'date-fns'

const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
const form = reactive({ keyword: '', startDate: '', endDate: '', location: 'IT' })
const isValid = computed(() => form.keyword && form.startDate && form.endDate)

const emit = defineEmits(['submit'])
function submit() {
  if (!isValid.value) return
  emit('submit', { ...form })
}
</script>