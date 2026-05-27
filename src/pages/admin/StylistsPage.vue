<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <p class="text-sm text-beige-400">{{ stylists.length }} stylist(s)</p>
      <Button @click="openCreate">+ Add Stylist</Button>
    </div>

    <div v-if="loading" class="text-center py-12 text-beige-400">Loading...</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="s in stylists" :key="s.id" class="card p-5 flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black text-white font-bold text-lg">
            <img v-if="s.image" :src="s.image" :alt="`${s.name} profile`" class="h-full w-full object-cover" />
            <span v-else>{{ initialsFromName(s.name) }}</span>
          </div>
          <div>
            <h4 class="font-semibold text-salon-dark">{{ s.name }}</h4>
            <p class="text-xs text-beige-400">{{ s.phone || 'No phone' }}</p>
          </div>
          <span :class="['ml-auto text-xs px-2 py-0.5 rounded-full font-medium', s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">
            {{ s.active ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="flex gap-2 pt-3 border-t border-beige-100">
          <Button size="sm" variant="outline" @click="openEdit(s)">Edit</Button>
          <Button size="sm" :variant="s.active ? 'ghost' : 'success'" @click="toggleStylist(s)">
            {{ s.active ? 'Deactivate' : 'Activate' }}
          </Button>
          <Button size="sm" variant="danger" @click="confirmDelete(s)">Delete</Button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Modal v-model="showForm" :title="editTarget ? 'Edit Stylist' : 'Add Stylist'">
      <form @submit.prevent="saveStylist" class="space-y-4">
        <div v-if="formError" class="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {{ formError }}
        </div>

        <div>
          <label class="label">Profile Image</label>
          <div class="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center">
            <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black text-xl font-semibold text-white/75">
              <img v-if="form.image" :src="form.image" alt="Stylist preview" class="h-full w-full object-cover" />
              <span v-else>{{ previewInitials }}</span>
            </div>
            <div class="flex-1 space-y-3">
              <input
                ref="imageInput"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                class="block w-full text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-salon-gold file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-gold-600"
                @change="handleImageChange"
              />
              <div class="flex items-center justify-between gap-3 text-xs text-beige-400">
                <p>Upload JPG, PNG, WEBP, or GIF up to 2MB.</p>
                <button v-if="form.image" type="button" class="font-medium text-salon-gold hover:text-gold-300" @click="removeImage">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="label">Full Name</label>
          <input v-model="form.name" required placeholder="e.g. Nimal Perera" class="input-field" />
        </div>
        <div>
          <label class="label">Phone Number</label>
          <input v-model="form.phone" placeholder="e.g. 0771234567" class="input-field" />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.active" type="checkbox" id="sActive" class="w-4 h-4 accent-salon-gold" />
          <label for="sActive" class="text-sm text-salon-charcoal">Active</label>
        </div>
      </form>
      <template #footer>
        <Button variant="ghost" @click="showForm = false">Cancel</Button>
        <Button :loading="saving" @click="saveStylist">{{ editTarget ? 'Update' : 'Create' }}</Button>
      </template>
    </Modal>

    <!-- Delete Confirm -->
    <Modal v-model="showDelete" title="Delete Stylist" size="sm">
      <p class="text-salon-charcoal">Delete stylist <strong>{{ deleteTarget?.name }}</strong>?</p>
      <template #footer>
        <Button variant="ghost" @click="showDelete = false">Cancel</Button>
        <Button variant="danger" :loading="deleting" @click="doDelete">Delete</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import Button from '../../components/ui/Button.vue'
import Modal  from '../../components/ui/Modal.vue'
import api    from '../../services/api.js'

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

const emptyForm = () => ({ name: '', phone: '', active: true, image: null })

const stylists     = ref([])
const loading      = ref(false)
const saving       = ref(false)
const deleting     = ref(false)
const showForm     = ref(false)
const showDelete   = ref(false)
const editTarget   = ref(null)
const deleteTarget = ref(null)
const formError    = ref('')
const imageInput   = ref(null)
const form         = ref(emptyForm())

const initialsFromName = (name) => {
  const parts = String(name || '')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
  return (parts.map((part) => part[0]).join('').slice(0, 2) || 'ST').toUpperCase()
}

const previewInitials = computed(() => initialsFromName(form.value.name))

const resetImageInput = () => {
  if (imageInput.value) imageInput.value.value = ''
}

const fetchStylists = async () => {
  loading.value = true
  try { const { data } = await api.get('/stylists'); stylists.value = data.data }
  catch { /* ignore */ } finally { loading.value = false }
}

const openCreate = () => {
  editTarget.value = null
  formError.value = ''
  form.value = emptyForm()
  resetImageInput()
  showForm.value = true
}

const openEdit = (s) => {
  editTarget.value = s
  formError.value = ''
  form.value = { name: s.name, phone: s.phone || '', active: s.active, image: s.image || null }
  resetImageInput()
  showForm.value = true
}

const handleImageChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    formError.value = 'Please choose a valid image file'
    resetImageInput()
    return
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    formError.value = 'Profile image must be 2MB or smaller'
    resetImageInput()
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = typeof reader.result === 'string' ? reader.result : null
    formError.value = ''
  }
  reader.onerror = () => {
    formError.value = 'Failed to read the selected image'
    resetImageInput()
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  form.value.image = null
  resetImageInput()
}

const saveStylist = async () => {
  formError.value = ''
  if (!form.value.name.trim()) {
    formError.value = 'Full name is required'
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      active: Boolean(form.value.active),
      image: form.value.image,
    }

    if (editTarget.value) await api.put(`/stylists/${editTarget.value.id}`, payload)
    else await api.post('/stylists', payload)

    await fetchStylists()
    showForm.value = false
    form.value = emptyForm()
    resetImageInput()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Failed to save stylist'
  } finally {
    saving.value = false
  }
}

const toggleStylist = async (s) => {
  try { await api.patch(`/stylists/${s.id}/toggle`); await fetchStylists() } catch { /* ignore */ }
}

const confirmDelete = (s) => { deleteTarget.value = s; showDelete.value = true }
const doDelete = async () => {
  deleting.value = true
  try { await api.delete(`/stylists/${deleteTarget.value.id}`); await fetchStylists(); showDelete.value = false }
  catch { /* ignore */ } finally { deleting.value = false }
}

onMounted(fetchStylists)
</script>
