<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <p class="text-sm text-beige-400">{{ services.length }} service(s) total</p>
      <Button @click="openCreate">+ Add Service</Button>
    </div>

    <div v-if="loading" class="text-center py-12 text-beige-400">Loading...</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="s in services" :key="s.id" class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="font-semibold text-salon-dark">{{ s.name }}</h4>
            <p class="text-xs text-beige-400 mt-0.5">{{ s.duration }} minutes</p>
          </div>
          <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">
            {{ s.active ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="text-xl font-bold text-salon-gold mb-4">Rs. {{ Number(s.price).toLocaleString() }}</p>
        <div class="flex gap-2 pt-3 border-t border-beige-100">
          <Button size="sm" variant="outline" @click="openEdit(s)">Edit</Button>
          <Button size="sm" :variant="s.active ? 'ghost' : 'success'" @click="toggleService(s)">
            {{ s.active ? 'Disable' : 'Enable' }}
          </Button>
          <Button size="sm" variant="danger" @click="confirmDelete(s)">Delete</Button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal v-model="showForm" :title="editTarget ? 'Edit Service' : 'Add Service'">
      <form @submit.prevent="saveService" class="space-y-4">
        <div>
          <label class="label">Service Name</label>
          <input v-model="form.name" required placeholder="e.g. Haircut & Style" class="input-field" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Duration (minutes)</label>
            <input v-model.number="form.duration" type="number" min="1" required class="input-field" />
          </div>
          <div>
            <label class="label">Price (Rs.)</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" required class="input-field" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.active" type="checkbox" id="active" class="w-4 h-4 accent-salon-gold" />
          <label for="active" class="text-sm text-salon-charcoal">Active (visible to customers)</label>
        </div>
      </form>
      <template #footer>
        <Button variant="ghost" @click="showForm = false">Cancel</Button>
        <Button :loading="saving" @click="saveService">{{ editTarget ? 'Update' : 'Create' }}</Button>
      </template>
    </Modal>

    <!-- Delete Confirm -->
    <Modal v-model="showDelete" title="Delete Service" size="sm">
      <p class="text-salon-charcoal">Delete <strong>{{ deleteTarget?.name }}</strong>? This cannot be undone.</p>
      <template #footer>
        <Button variant="ghost" @click="showDelete = false">Cancel</Button>
        <Button variant="danger" :loading="deleting" @click="doDelete">Delete</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from '../../components/ui/Button.vue'
import Modal  from '../../components/ui/Modal.vue'
import api    from '../../services/api.js'

const services     = ref([])
const loading      = ref(false)
const saving       = ref(false)
const deleting     = ref(false)
const showForm     = ref(false)
const showDelete   = ref(false)
const editTarget   = ref(null)
const deleteTarget = ref(null)
const form = ref({ name: '', duration: 30, price: 0, active: true })

const fetchServices = async () => {
  loading.value = true
  try { const { data } = await api.get('/services'); services.value = data.data }
  catch { /* ignore */ } finally { loading.value = false }
}

const openCreate = () => {
  editTarget.value = null
  form.value = { name: '', duration: 30, price: 0, active: true }
  showForm.value = true
}

const openEdit = (s) => {
  editTarget.value = s
  form.value = { name: s.name, duration: s.duration, price: Number(s.price), active: s.active }
  showForm.value = true
}

const saveService = async () => {
  saving.value = true
  try {
    if (editTarget.value) {
      await api.put(`/services/${editTarget.value.id}`, form.value)
    } else {
      await api.post('/services', form.value)
    }
    await fetchServices()
    showForm.value = false
  } catch { /* ignore */ } finally { saving.value = false }
}

const toggleService = async (s) => {
  try { await api.patch(`/services/${s.id}/toggle`); await fetchServices() }
  catch { /* ignore */ }
}

const confirmDelete = (s) => { deleteTarget.value = s; showDelete.value = true }

const doDelete = async () => {
  deleting.value = true
  try { await api.delete(`/services/${deleteTarget.value.id}`); await fetchServices(); showDelete.value = false }
  catch { /* ignore */ } finally { deleting.value = false }
}

onMounted(fetchServices)
</script>
